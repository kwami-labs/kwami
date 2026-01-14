use kwami_server::{routes, AppState, Config};
use solana_sdk::pubkey::Pubkey;
use std::str::FromStr;

#[tokio::test]
async fn test_health_endpoint() {
    // Create test configuration
    let config = create_test_config();
    
    // Create app state
    let state = AppState::new(
        config.solana_rpc_url,
        config.jwt_secret,
        config.elevenlabs_api_key,
        config.metaplex_program,
        config.kwami_collection_mint,
    );
    
    // Create router
    let app = routes::create_router(state);
    
    // Test health endpoint
    let response = app
        .clone()
        .oneshot(
            axum::http::Request::builder()
                .uri("/health")
                .body(axum::body::Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    
    assert_eq!(response.status(), axum::http::StatusCode::OK);
}

fn create_test_config() -> Config {
    Config {
        solana_rpc_url: "https://api.devnet.solana.com".to_string(),
        jwt_secret: "test-secret-key-32-characters-min".to_string(),
        elevenlabs_api_key: String::new(),
        metaplex_program: Pubkey::from_str("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
            .unwrap(),
        kwami_collection_mint: None,
        port: 3000,
    }
}
