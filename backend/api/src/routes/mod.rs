pub mod health;
pub mod livekit;

use crate::handlers;
use crate::middleware;
use crate::state::AppState;
use axum::{routing::{get, post}, Router};

/// Build the application router with all routes
pub fn create_router(state: AppState) -> Router {
    // Auth routes with rate limiting
    let auth_routes = Router::new()
        .route("/auth/nonce", post(handlers::auth::generate_nonce))
        .route("/auth/login", post(handlers::auth::login))
        .layer(middleware::create_rate_limit_layer());

    // Protected routes
    let protected_routes = Router::new()
        .route("/me/owned-kwamis", get(handlers::auth::get_owned_kwamis))
        .route("/auth/select-kwami", post(handlers::auth::select_kwami));

    // LiveKit routes (protected)
    let livekit_routes = livekit::create_livekit_routes();

    Router::new()
        // Health check (no rate limit)
        .route("/health", get(handlers::health::health_check))
        // Scalar docs and OpenAPI spec
        .route("/docs", get(handlers::docs::docs_ui))
        .route("/openapi.json", get(handlers::docs::openapi_spec))
        .merge(auth_routes)
        .merge(protected_routes)
        // LiveKit routes under /livekit prefix
        .nest("/livekit", livekit_routes)
        // Add state
        .with_state(state)
}
