use axum::http::StatusCode;
use std::num::NonZeroU32;
use tower_governor::{
    governor::GovernorConfigBuilder, key_extractor::SmartIpKeyExtractor, GovernorLayer,
};

/// Create rate limiting layer for authentication endpoints
/// Limits: 10 requests per minute per IP
pub fn create_rate_limit_layer() -> GovernorLayer<'static, SmartIpKeyExtractor> {
    let config = Box::new(
        GovernorConfigBuilder::default()
            .per_second(60) // Window size: 60 seconds
            .burst_size(NonZeroU32::new(10).unwrap()) // Max 10 requests in window
            .error_handler(|error| {
                tracing::warn!("Rate limit hit: {:?}", error);
                (
                    StatusCode::TOO_MANY_REQUESTS,
                    "Too many requests. Please try again later.",
                )
            })
            .finish()
            .unwrap(),
    );

    GovernorLayer {
        config: Box::leak(config),
    }
}
