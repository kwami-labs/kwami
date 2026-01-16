use crate::error::ApiError;
use crate::models::livekit::*;
use livekit_api::access_token::{AccessToken, VideoGrants};
use livekit_api::services::room::{CreateRoomOptions, RoomClient};
use std::time::Duration;
use tracing::{debug, info};

/// LiveKit service for managing rooms, participants, and tokens
pub struct LiveKitService {
    api_key: String,
    api_secret: String,
    url: String,
}

impl LiveKitService {
    /// Create a new LiveKit service
    pub fn new(api_key: String, api_secret: String, url: String) -> Self {
        Self {
            api_key,
            api_secret,
            url,
        }
    }

    /// Get a room client
    fn get_room_client(&self) -> RoomClient {
        RoomClient::with_api_key(&self.url, &self.api_key, &self.api_secret)
    }

    // ========================================================================
    // Token Generation
    // ========================================================================

    /// Generate an access token for a participant
    pub fn create_token(&self, request: CreateTokenRequest) -> Result<CreateTokenResponse, ApiError> {
        debug!(
            "Creating token for identity: {} in room: {}",
            request.identity, request.room
        );

        let token = AccessToken::with_api_key(&self.api_key, &self.api_secret);

        // Set grants
        let grants = VideoGrants {
            room_join: true,
            room: request.room.clone(),
            can_publish: true,
            can_subscribe: true,
            can_publish_data: true,
            ..Default::default()
        };

        let mut token = token
            .with_grants(grants)
            .with_identity(&request.identity)
            .with_name(&request.name.unwrap_or_else(|| request.identity.clone()))
            .with_ttl(Duration::from_secs(request.ttl_seconds as u64));

        if let Some(metadata) = &request.metadata {
            token = token.with_metadata(metadata);
        }

        let jwt = token
            .to_jwt()
            .map_err(|e| ApiError::LiveKitError(format!("Failed to generate JWT: {}", e)))?;

        info!(
            "Generated token for {} in room {}",
            request.identity, request.room
        );

        Ok(CreateTokenResponse {
            token: jwt,
            room: request.room,
            identity: request.identity,
        })
    }

    // ========================================================================
    // Room Management
    // ========================================================================

    /// Create a new room
    pub async fn create_room(&self, request: CreateRoomRequest) -> Result<RoomInfo, ApiError> {
        debug!("Creating room: {}", request.name);

        let client = self.get_room_client();

        let options = CreateRoomOptions {
            empty_timeout: request.empty_timeout.unwrap_or(300),
            max_participants: request.max_participants.unwrap_or(0),
            metadata: request.metadata.unwrap_or_default(),
            ..Default::default()
        };

        let room = client
            .create_room(&request.name, options)
            .await
            .map_err(|e| ApiError::LiveKitError(format!("Failed to create room: {}", e)))?;

        info!("Created room: {} (sid: {})", room.name, room.sid);

        Ok(RoomInfo {
            sid: room.sid,
            name: room.name,
            empty_timeout: room.empty_timeout,
            max_participants: room.max_participants,
            creation_time: room.creation_time,
            num_participants: room.num_participants,
            metadata: if room.metadata.is_empty() {
                None
            } else {
                Some(room.metadata)
            },
        })
    }

    /// List all rooms
    pub async fn list_rooms(&self) -> Result<ListRoomsResponse, ApiError> {
        debug!("Listing all rooms");

        let client = self.get_room_client();

        let rooms = client
            .list_rooms(vec![])
            .await
            .map_err(|e| ApiError::LiveKitError(format!("Failed to list rooms: {}", e)))?;

        let room_infos = rooms
            .into_iter()
            .map(|room| RoomInfo {
                sid: room.sid,
                name: room.name,
                empty_timeout: room.empty_timeout,
                max_participants: room.max_participants,
                creation_time: room.creation_time,
                num_participants: room.num_participants,
                metadata: if room.metadata.is_empty() {
                    None
                } else {
                    Some(room.metadata)
                },
            })
            .collect();

        Ok(ListRoomsResponse { rooms: room_infos })
    }

    /// Get a specific room
    pub async fn get_room(&self, room_name: &str) -> Result<RoomInfo, ApiError> {
        debug!("Getting room: {}", room_name);

        let client = self.get_room_client();

        let rooms = client
            .list_rooms(vec![room_name.to_string()])
            .await
            .map_err(|e| ApiError::LiveKitError(format!("Failed to get room: {}", e)))?;

        let room = rooms
            .into_iter()
            .next()
            .ok_or_else(|| ApiError::LiveKitError(format!("Room not found: {}", room_name)))?;

        Ok(RoomInfo {
            sid: room.sid,
            name: room.name,
            empty_timeout: room.empty_timeout,
            max_participants: room.max_participants,
            creation_time: room.creation_time,
            num_participants: room.num_participants,
            metadata: if room.metadata.is_empty() {
                None
            } else {
                Some(room.metadata)
            },
        })
    }

    /// Delete a room
    pub async fn delete_room(&self, room_name: &str) -> Result<(), ApiError> {
        debug!("Deleting room: {}", room_name);

        let client = self.get_room_client();

        client
            .delete_room(room_name)
            .await
            .map_err(|e| ApiError::LiveKitError(format!("Failed to delete room: {}", e)))?;

        info!("Deleted room: {}", room_name);

        Ok(())
    }

    // ========================================================================
    // Participant Management
    // ========================================================================

    /// List participants in a room
    pub async fn list_participants(&self, room_name: &str) -> Result<ListParticipantsResponse, ApiError> {
        debug!("Listing participants in room: {}", room_name);

        let client = self.get_room_client();

        let participants = client
            .list_participants(room_name)
            .await
            .map_err(|e| ApiError::LiveKitError(format!("Failed to list participants: {}", e)))?;

        let participant_infos = participants
            .into_iter()
            .map(|p| ParticipantInfo {
                sid: p.sid,
                identity: p.identity,
                name: if p.name.is_empty() {
                    None
                } else {
                    Some(p.name)
                },
                state: format!("{:?}", p.state),
                joined_at: p.joined_at,
                metadata: if p.metadata.is_empty() {
                    None
                } else {
                    Some(p.metadata)
                },
            })
            .collect();

        Ok(ListParticipantsResponse {
            participants: participant_infos,
        })
    }

    /// Get a specific participant
    pub async fn get_participant(
        &self,
        room_name: &str,
        identity: &str,
    ) -> Result<ParticipantInfo, ApiError> {
        debug!("Getting participant {} in room {}", identity, room_name);

        let client = self.get_room_client();

        let participant = client
            .get_participant(room_name, identity)
            .await
            .map_err(|e| ApiError::LiveKitError(format!("Failed to get participant: {}", e)))?;

        Ok(ParticipantInfo {
            sid: participant.sid,
            identity: participant.identity,
            name: if participant.name.is_empty() {
                None
            } else {
                Some(participant.name)
            },
            state: format!("{:?}", participant.state),
            joined_at: participant.joined_at,
            metadata: if participant.metadata.is_empty() {
                None
            } else {
                Some(participant.metadata)
            },
        })
    }

    /// Remove a participant from a room
    pub async fn remove_participant(&self, request: RemoveParticipantRequest) -> Result<(), ApiError> {
        debug!(
            "Removing participant {} from room {}",
            request.identity, request.room
        );

        let client = self.get_room_client();

        client
            .remove_participant(&request.room, &request.identity)
            .await
            .map_err(|e| ApiError::LiveKitError(format!("Failed to remove participant: {}", e)))?;

        info!(
            "Removed participant {} from room {}",
            request.identity, request.room
        );

        Ok(())
    }

    /// Mute a participant's track
    pub async fn mute_participant(
        &self,
        room_name: &str,
        identity: &str,
        track_sid: &str,
        muted: bool,
    ) -> Result<(), ApiError> {
        debug!(
            "Setting mute={} for participant {} track {} in room {}",
            muted, identity, track_sid, room_name
        );

        let client = self.get_room_client();

        client
            .mute_published_track(room_name, identity, track_sid, muted)
            .await
            .map_err(|e| ApiError::LiveKitError(format!("Failed to mute participant: {}", e)))?;

        info!(
            "Set mute={} for {} in room {}",
            muted, identity, room_name
        );

        Ok(())
    }
}
