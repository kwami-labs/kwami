use crate::error::ApiError;
use crate::models::livekit::*;
use crate::services::livekit_service::LiveKitService;
use crate::state::AppState;
use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde::Deserialize;
use serde_json::json;
use tracing::info;

// ============================================================================
// Token Handlers
// ============================================================================

/// Generate an access token for a participant
pub async fn create_token(
    State(state): State<AppState>,
    Json(request): Json<CreateTokenRequest>,
) -> Result<Json<CreateTokenResponse>, ApiError> {
    info!("Creating token for identity: {}", request.identity);

    let service = LiveKitService::new(
        state.livekit_api_key.clone(),
        state.livekit_api_secret.clone(),
        state.livekit_url.clone(),
    );

    let response = service.create_token(request)?;

    Ok(Json(response))
}

// ============================================================================
// Room Handlers
// ============================================================================

/// Create a new room
pub async fn create_room(
    State(state): State<AppState>,
    Json(request): Json<CreateRoomRequest>,
) -> Result<Json<RoomInfo>, ApiError> {
    info!("Creating room: {}", request.name);

    let service = LiveKitService::new(
        state.livekit_api_key.clone(),
        state.livekit_api_secret.clone(),
        state.livekit_url.clone(),
    );

    let room = service.create_room(request).await?;

    Ok(Json(room))
}

/// List all rooms
pub async fn list_rooms(
    State(state): State<AppState>,
) -> Result<Json<ListRoomsResponse>, ApiError> {
    info!("Listing all rooms");

    let service = LiveKitService::new(
        state.livekit_api_key.clone(),
        state.livekit_api_secret.clone(),
        state.livekit_url.clone(),
    );

    let response = service.list_rooms().await?;

    Ok(Json(response))
}

/// Get a specific room
pub async fn get_room(
    State(state): State<AppState>,
    Path(room_name): Path<String>,
) -> Result<Json<RoomInfo>, ApiError> {
    info!("Getting room: {}", room_name);

    let service = LiveKitService::new(
        state.livekit_api_key.clone(),
        state.livekit_api_secret.clone(),
        state.livekit_url.clone(),
    );

    let room = service.get_room(&room_name).await?;

    Ok(Json(room))
}

/// Delete a room
pub async fn delete_room(
    State(state): State<AppState>,
    Path(room_name): Path<String>,
) -> Result<impl IntoResponse, ApiError> {
    info!("Deleting room: {}", room_name);

    let service = LiveKitService::new(
        state.livekit_api_key.clone(),
        state.livekit_api_secret.clone(),
        state.livekit_url.clone(),
    );

    service.delete_room(&room_name).await?;

    Ok((
        StatusCode::OK,
        Json(json!({
            "message": format!("Room {} deleted successfully", room_name)
        })),
    ))
}

// ============================================================================
// Participant Handlers
// ============================================================================

/// List participants in a room
pub async fn list_participants(
    State(state): State<AppState>,
    Path(room_name): Path<String>,
) -> Result<Json<ListParticipantsResponse>, ApiError> {
    info!("Listing participants in room: {}", room_name);

    let service = LiveKitService::new(
        state.livekit_api_key.clone(),
        state.livekit_api_secret.clone(),
        state.livekit_url.clone(),
    );

    let response = service.list_participants(&room_name).await?;

    Ok(Json(response))
}

/// Get a specific participant
pub async fn get_participant(
    State(state): State<AppState>,
    Path((room_name, identity)): Path<(String, String)>,
) -> Result<Json<ParticipantInfo>, ApiError> {
    info!("Getting participant {} in room {}", identity, room_name);

    let service = LiveKitService::new(
        state.livekit_api_key.clone(),
        state.livekit_api_secret.clone(),
        state.livekit_url.clone(),
    );

    let participant = service.get_participant(&room_name, &identity).await?;

    Ok(Json(participant))
}

/// Remove a participant from a room
pub async fn remove_participant(
    State(state): State<AppState>,
    Path((room_name, identity)): Path<(String, String)>,
) -> Result<impl IntoResponse, ApiError> {
    info!(
        "Removing participant {} from room {}",
        identity, room_name
    );

    let service = LiveKitService::new(
        state.livekit_api_key.clone(),
        state.livekit_api_secret.clone(),
        state.livekit_url.clone(),
    );

    let request = RemoveParticipantRequest {
        room: room_name.clone(),
        identity: identity.clone(),
    };

    service.remove_participant(request).await?;

    Ok((
        StatusCode::OK,
        Json(json!({
            "message": format!("Participant {} removed from room {}", identity, room_name)
        })),
    ))
}

#[derive(Deserialize)]
pub struct MuteQuery {
    pub track_sid: String,
    pub muted: bool,
}

/// Mute/unmute a participant's track
pub async fn mute_participant(
    State(state): State<AppState>,
    Path((room_name, identity)): Path<(String, String)>,
    Query(query): Query<MuteQuery>,
) -> Result<impl IntoResponse, ApiError> {
    info!(
        "Setting mute={} for participant {} in room {}",
        query.muted, identity, room_name
    );

    let service = LiveKitService::new(
        state.livekit_api_key.clone(),
        state.livekit_api_secret.clone(),
        state.livekit_url.clone(),
    );

    service
        .mute_participant(&room_name, &identity, &query.track_sid, query.muted)
        .await?;

    Ok((
        StatusCode::OK,
        Json(json!({
            "message": format!("Thave configurack {} muted={}", query.track_sid, query.muted)
        })),
    ))
}
