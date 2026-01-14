// Library exports for integration tests and modular access

pub mod config;
pub mod error;
pub mod handlers;
pub mod middleware;
pub mod models;
pub mod routes;
pub mod services;
pub mod state;

// Re-export commonly used types
pub use config::Config;
pub use error::ApiError;
pub use state::AppState;
