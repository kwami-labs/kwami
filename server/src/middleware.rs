use governor::middleware::NoOpMiddleware;
use std::sync::Arc;
use tower_governor::{
    governor::GovernorConfigBuilder, key_extractor::PeerIpKeyExtractor, GovernorLayer,
};

/// Create rate limiting layer for authentication endpoints
/// Limits: 10 requests per minute per IP  
/// Uses PeerIpKeyExtractor which gets IP from connection info
pub fn create_rate_limit_layer() -> GovernorLayer<PeerIpKeyExtractor, NoOpMiddleware> {
    let config = Arc::new(
        GovernorConfigBuilder::default()
            .per_second(60) // Window size: 60 seconds
            .burst_size(10) // Max 10 requests in window
            .finish()
            .unwrap(),
    );

    GovernorLayer { config }
}
