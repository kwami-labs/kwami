use axum::http::{header, Method};
use kwami_server::{db::DatabasePools, routes, AppState, Config};
use std::net::SocketAddr;
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
    let config = Config::from_env();

    // Initialize database connections
    info!("📊 Initializing database connections...");
    let db = match DatabasePools::new(
        &config.database_url,
        &config.redis_url,
        &config.qdrant_url,
    )
    .await
    {
        Ok(db) => {
            info!("✅ All databases connected successfully");
            db
        }
        Err(e) => {
            error!("❌ Failed to initialize databases: {}", e);
            std::process::exit(1);
        }
    };

    // Create shared application state
    let state = AppState::new(
        db,
        config.solana_rpc_url.clone(),
        config.jwt_secret.clone(),
        config.elevenlabs_api_key.clone(),
        config.metaplex_program,
        config.kwami_collection_mint,
    );

    // Spawn background task for database cleanup
    let cleanup_db = state.db.clone();
    tokio::spawn(async move {
        use kwami_server::db::repositories::NonceRepository;
        let mut interval = time::interval(Duration::from_secs(300)); // Every 5 minutes
        loop {
            interval.tick().await;
            let nonce_repo = NonceRepository::new(cleanup_db.postgres.clone());
            if let Err(e) = nonce_repo.cleanup_expired().await {
                error!("Failed to cleanup expired nonces: {}", e);
            }
        }
    });

    // Build router with routes
    let app = routes::create_router(state)
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

    axum::serve(
        listener,
        app.into_make_service_with_connect_info::<SocketAddr>(),
    )
    .await
    .expect("Server error");
}
