pub mod health;

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

    Router::new()
        // Health check (no rate limit)
        .route("/health", get(handlers::health::health_check))
        .merge(auth_routes)
        .merge(protected_routes)
        // Add state
        .with_state(state)
}
