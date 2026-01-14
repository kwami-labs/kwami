pub mod health;

use crate::handlers;
use crate::state::AppState;
use axum::{routing::{get, post}, Router};

/// Build the application router with all routes
pub fn create_router(state: AppState) -> Router {
    Router::new()
        // Health check
        .route("/health", get(handlers::health::health_check))
        // Auth routes (public)
        .route("/auth/nonce", post(handlers::auth::generate_nonce))
        .route("/auth/login", post(handlers::auth::login))
        // Protected routes (require JWT)
        .route("/me/owned-kwamis", get(handlers::auth::get_owned_kwamis))
        .route("/auth/select-kwami", post(handlers::auth::select_kwami))
        // Add state
        .with_state(state)
}
