mod auth;
mod errors;
mod models;
mod state;

use axum::{
    http::{header, Method, StatusCode},
    routing::{get, post},
    Router,
};
use solana_sdk::pubkey::Pubkey;
use state::AppState;
use std::env;
use std::net::SocketAddr;
use std::str::FromStr;
use std::time::Duration;
use tokio::time;
use tower_http::{
    cors::CorsLayer,
    trace::{DefaultMakeSpan, TraceLayer},
};
use tracing::{error, info};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() {
    // Load environment variables from .env file
    dotenvy::dotenv().ok();

    // Initialize tracing subscriber for logging
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "kwami_server=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    info!("🚀 Starting KWAMI Authentication Server");

    // Load configuration from environment
    let config = load_config();

    // Create shared application state
    let state = AppState::new(
        config.solana_rpc_url.clone(),
        config.jwt_secret.clone(),
        config.elevenlabs_api_key.clone(),
        config.metaplex_program,
        config.kwami_collection_mint,
    );

    // Spawn background task for cleanup
    let cleanup_state = state.clone();
    tokio::spawn(async move {
        let mut interval = time::interval(Duration::from_secs(60));
        loop {
            interval.tick().await;
            cleanup_state.cleanup_expired_nonces();
            cleanup_state.cleanup_expired_cache();
        }
    });

    // Build router with routes
    let app = Router::new()
        // Health check
        .route("/health", get(health_check))
        
        // Auth routes (public)
        .route("/auth/nonce", post(auth::generate_nonce))
        .route("/auth/login", post(auth::login))
        
        // Protected routes (require JWT)
        .route("/me/owned-kwamis", get(auth::get_owned_kwamis))
        .route("/auth/select-kwami", post(auth::select_kwami))
        
        // Add state
        .with_state(state)
        
        // Add CORS middleware
        .layer(
            CorsLayer::new()
                .allow_origin(tower_http::cors::Any)
                .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
                .allow_headers([header::CONTENT_TYPE, header::AUTHORIZATION])
                .max_age(Duration::from_secs(3600)),
        )
        // Add logging middleware
        .layer(
            TraceLayer::new_for_http()
                .make_span_with(DefaultMakeSpan::default().include_headers(true)),
        );

    // Bind to address
    let addr = SocketAddr::from(([0, 0, 0, 0], config.port));
    info!("🎧 Listening on {}", addr);
    info!("📡 Solana RPC: {}", config.solana_rpc_url);
    info!("🖼️  KWAMI Collection: {:?}", config.kwami_collection_mint);

    // Start server
    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("Failed to bind to address");
    
    info!("✅ Server ready to accept connections");
    
    axum::serve(listener, app)
        .await
        .expect("Server error");
}

/// Health check endpoint
async fn health_check() -> (StatusCode, &'static str) {
    (StatusCode::OK, "OK")
}

/// Server configuration
struct Config {
    solana_rpc_url: String,
    jwt_secret: String,
    elevenlabs_api_key: String,
    metaplex_program: Pubkey,
    kwami_collection_mint: Option<Pubkey>,
    port: u16,
}

/// Load configuration from environment variables
fn load_config() -> Config {
    let solana_rpc_url = env::var("SOLANA_RPC_URL")
        .unwrap_or_else(|_| "https://api.mainnet-beta.solana.com".to_string());

    let jwt_secret = env::var("JWT_SECRET")
        .expect("JWT_SECRET must be set in environment");

    if jwt_secret.len() < 32 {
        error!("⚠️  WARNING: JWT_SECRET should be at least 32 characters for security");
    }

    let elevenlabs_api_key = env::var("ELEVENLABS_API_KEY")
        .unwrap_or_else(|_| {
            info!("⚠️  ELEVENLABS_API_KEY not set - proxy functionality will be limited");
            String::new()
        });

    let metaplex_program = Pubkey::from_str(
        &env::var("METAPLEX_METADATA_PROGRAM")
            .unwrap_or_else(|_| "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s".to_string()),
    )
    .expect("Invalid METAPLEX_METADATA_PROGRAM");

    let kwami_collection_mint = env::var("KWAMI_COLLECTION_MINT")
        .ok()
        .and_then(|s| Pubkey::from_str(&s).ok());

    let port = env::var("PORT")
        .ok()
        .and_then(|p| p.parse().ok())
        .unwrap_or(3000);

    Config {
        solana_rpc_url,
        jwt_secret,
        elevenlabs_api_key,
        metaplex_program,
        kwami_collection_mint,
        port,
    }
}
