use serde::{Deserialize, Serialize};

// ============================================================================
// Token Generation
// ============================================================================

/// Request to generate a LiveKit access token
#[derive(Debug, Deserialize)]
pub struct CreateTokenRequest {
    /// Room name
    pub room: String,
    /// Participant identity
    pub identity: String,
    /// Optional participant name
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    /// Optional metadata
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<String>,
    /// Token validity in seconds (default: 6 hours)
    #[serde(default = "default_ttl")]
    pub ttl_seconds: i64,
}

fn default_ttl() -> i64 {
    21600 // 6 hours
}

/// Response containing the access token
#[derive(Debug, Serialize)]
pub struct CreateTokenResponse {
    pub token: String,
    pub room: String,
    pub identity: String,
}

// ============================================================================
// Room Management
// ============================================================================

/// Request to create a room
#[derive(Debug, Deserialize)]
pub struct CreateRoomRequest {
    /// Room name (must be unique)
    pub name: String,
    /// Empty timeout in seconds (room closes after last participant leaves)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub empty_timeout: Option<u32>,
    /// Max number of participants (0 = unlimited)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_participants: Option<u32>,
    /// Optional metadata
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<String>,
}

/// Room information
#[derive(Debug, Serialize, Deserialize)]
pub struct RoomInfo {
    pub sid: String,
    pub name: String,
    pub empty_timeout: u32,
    pub max_participants: u32,
    pub creation_time: i64,
    pub num_participants: u32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<String>,
}

/// Response containing list of rooms
#[derive(Debug, Serialize)]
pub struct ListRoomsResponse {
    pub rooms: Vec<RoomInfo>,
}

// ============================================================================
// Participant Management
// ============================================================================

/// Participant information
#[derive(Debug, Serialize, Deserialize)]
pub struct ParticipantInfo {
    pub sid: String,
    pub identity: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    pub state: String,
    pub joined_at: i64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<String>,
}

/// Response containing list of participants
#[derive(Debug, Serialize)]
pub struct ListParticipantsResponse {
    pub participants: Vec<ParticipantInfo>,
}

/// Request to update participant
#[derive(Debug, Deserialize)]
pub struct UpdateParticipantRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
}

/// Request to remove participant
#[derive(Debug, Deserialize)]
pub struct RemoveParticipantRequest {
    pub room: String,
    pub identity: String,
}

// ============================================================================
// Egress (Recording/Streaming)
// ============================================================================

/// Request to start room composite egress
#[derive(Debug, Deserialize)]
pub struct StartRoomCompositeEgressRequest {
    pub room_name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub layout: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub audio_only: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub video_only: Option<bool>,
}

/// Egress information
#[derive(Debug, Serialize, Deserialize)]
pub struct EgressInfo {
    pub egress_id: String,
    pub room_id: String,
    pub status: String,
    pub started_at: i64,
}

// ============================================================================
// Ingress (RTMP/WHIP)
// ============================================================================

/// Request to create ingress
#[derive(Debug, Deserialize)]
pub struct CreateIngressRequest {
    pub input_type: String, // "RTMP_INPUT" or "WHIP_INPUT"
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub room_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub participant_identity: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub participant_name: Option<String>,
}

/// Ingress information
#[derive(Debug, Serialize, Deserialize)]
pub struct IngressInfo {
    pub ingress_id: String,
    pub name: String,
    pub stream_key: String,
    pub url: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub room_name: Option<String>,
}

// ============================================================================
// Generic Responses
// ============================================================================

/// Success message
#[derive(Debug, Serialize)]
pub struct SuccessResponse {
    pub message: String,
}
