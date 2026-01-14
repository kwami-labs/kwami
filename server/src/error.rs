use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use thiserror::Error;

/// Custom error types for the API
#[derive(Debug, Error)]
pub enum ApiError {
    #[error("Invalid public key: {0}")]
    InvalidPublicKey(String),

    #[error("Invalid signature: {0}")]
    InvalidSignature(String),

    #[error("Nonce not found or expired")]
    NonceNotFound,

    #[error("Nonce already used")]
    #[allow(dead_code)]
    NonceAlreadyUsed,

    #[error("Invalid nonce in message")]
    InvalidNonce,

    #[error("Unauthorized: {0}")]
    #[allow(dead_code)]
    Unauthorized(String),

    #[error("Invalid JWT token: {0}")]
    InvalidToken(String),

    #[error("KWAMI not owned by user")]
    KwamiNotOwned,

    #[error("No KWAMIs found for this wallet")]
    NoKwamisFound,

    #[error("Solana RPC error: {0}")]
    SolanaRpcError(String),

    #[error("Metadata parsing error: {0}")]
    MetadataParseError(String),

    #[error("Internal server error: {0}")]
    InternalError(String),

    #[error("Bad request: {0}")]
    #[allow(dead_code)]
    BadRequest(String),

    #[error("Rate limit exceeded")]
    #[allow(dead_code)]
    RateLimitExceeded,

    #[error("Missing authorization header")]
    MissingAuthHeader,
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let (status, error_message) = match self {
            ApiError::InvalidPublicKey(msg) => (StatusCode::BAD_REQUEST, msg),
            ApiError::InvalidSignature(msg) => (StatusCode::UNAUTHORIZED, msg),
            ApiError::NonceNotFound => (StatusCode::UNAUTHORIZED, self.to_string()),
            ApiError::NonceAlreadyUsed => (StatusCode::UNAUTHORIZED, self.to_string()),
            ApiError::InvalidNonce => (StatusCode::BAD_REQUEST, self.to_string()),
            ApiError::Unauthorized(msg) => (StatusCode::UNAUTHORIZED, msg),
            ApiError::InvalidToken(msg) => (StatusCode::UNAUTHORIZED, msg),
            ApiError::KwamiNotOwned => (StatusCode::FORBIDDEN, self.to_string()),
            ApiError::NoKwamisFound => (StatusCode::NOT_FOUND, self.to_string()),
            ApiError::SolanaRpcError(msg) => (StatusCode::BAD_GATEWAY, msg),
            ApiError::MetadataParseError(msg) => (StatusCode::INTERNAL_SERVER_ERROR, msg),
            ApiError::InternalError(msg) => (StatusCode::INTERNAL_SERVER_ERROR, msg),
            ApiError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg),
            ApiError::RateLimitExceeded => (StatusCode::TOO_MANY_REQUESTS, self.to_string()),
            ApiError::MissingAuthHeader => (StatusCode::UNAUTHORIZED, self.to_string()),
        };

        let body = Json(json!({
            "error": error_message,
            "code": status.as_u16()
        }));

        (status, body).into_response()
    }
}

/// Convert anyhow errors to ApiError
impl From<anyhow::Error> for ApiError {
    fn from(err: anyhow::Error) -> Self {
        ApiError::InternalError(err.to_string())
    }
}
