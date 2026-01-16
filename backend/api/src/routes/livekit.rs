use crate::handlers::livekit;
use crate::state::AppState;
use axum::{
    routing::{delete, get, post, put},
    Router,
};

/// Create LiveKit routes
pub fn create_livekit_routes() -> Router<AppState> {
    Router::new()
        // Token generation
        .route("/token", post(livekit::create_token))
        // Room management
        .route("/rooms", post(livekit::create_room))
        .route("/rooms", get(livekit::list_rooms))
        .route("/rooms/:room_name", get(livekit::get_room))
        .route("/rooms/:room_name", delete(livekit::delete_room))
        // Participant management
        .route(
            "/rooms/:room_name/participants",
            get(livekit::list_participants),
        )
        .route(
            "/rooms/:room_name/participants/:identity",
            get(livekit::get_participant),
        )
        .route(
            "/rooms/:room_name/participants/:identity",
            delete(livekit::remove_participant),
        )
        .route(
            "/rooms/:room_name/participants/:identity/mute",
            put(livekit::mute_participant),
        )
}
