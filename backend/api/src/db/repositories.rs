use anyhow::{Context, Result};
use chrono::{Duration, Utc};
use redis::AsyncCommands;
use solana_sdk::pubkey::Pubkey;
use sqlx::{Pool, Postgres};
use uuid::Uuid;

use super::models::{AuthNonce, KwamiOwnership, Session, User};

/// User repository for database operations
pub struct UserRepository {
    pool: Pool<Postgres>,
}

impl UserRepository {
    pub fn new(pool: Pool<Postgres>) -> Self {
        Self { pool }
    }

    /// Get or create user by wallet address
    pub async fn get_or_create(&self, wallet_address: &Pubkey) -> Result<User> {
        let wallet_str = wallet_address.to_string();

        // Try to get existing user
        let user = sqlx::query_as::<_, User>(
            "SELECT * FROM users WHERE wallet_address = $1"
        )
        .bind(&wallet_str)
        .fetch_optional(&self.pool)
        .await
        .context("Failed to query user")?;

        if let Some(user) = user {
            return Ok(user);
        }

        // Create new user
        let user = sqlx::query_as::<_, User>(
            "INSERT INTO users (wallet_address) VALUES ($1) RETURNING *"
        )
        .bind(&wallet_str)
        .fetch_one(&self.pool)
        .await
        .context("Failed to create user")?;

        Ok(user)
    }

    /// Update user's last login time
    pub async fn update_last_login(&self, user_id: Uuid) -> Result<()> {
        sqlx::query("UPDATE users SET last_login = NOW() WHERE id = $1")
            .bind(user_id)
            .execute(&self.pool)
            .await
            .context("Failed to update last login")?;

        Ok(())
    }
}

/// Nonce repository for authentication
pub struct NonceRepository {
    pool: Pool<Postgres>,
}

impl NonceRepository {
    pub fn new(pool: Pool<Postgres>) -> Self {
        Self { pool }
    }

    /// Create a new nonce for wallet
    pub async fn create(&self, wallet_address: &Pubkey) -> Result<AuthNonce> {
        let wallet_str = wallet_address.to_string();
        let nonce = Uuid::new_v4();
        let expires_at = Utc::now() + Duration::minutes(5);

        let auth_nonce = sqlx::query_as::<_, AuthNonce>(
            "INSERT INTO auth_nonces (wallet_address, nonce, expires_at) 
             VALUES ($1, $2, $3) RETURNING *"
        )
        .bind(&wallet_str)
        .bind(nonce)
        .bind(expires_at)
        .fetch_one(&self.pool)
        .await
        .context("Failed to create nonce")?;

        Ok(auth_nonce)
    }

    /// Verify and consume nonce
    pub async fn verify_and_consume(&self, wallet_address: &Pubkey, nonce: Uuid) -> Result<bool> {
        let wallet_str = wallet_address.to_string();

        let result = sqlx::query_as::<_, AuthNonce>(
            "UPDATE auth_nonces 
             SET used = true 
             WHERE wallet_address = $1 
             AND nonce = $2 
             AND used = false 
             AND expires_at > NOW() 
             RETURNING *"
        )
        .bind(&wallet_str)
        .bind(nonce)
        .fetch_optional(&self.pool)
        .await
        .context("Failed to verify nonce")?;

        Ok(result.is_some())
    }

    /// Clean up expired nonces
    pub async fn cleanup_expired(&self) -> Result<u64> {
        let result = sqlx::query("DELETE FROM auth_nonces WHERE expires_at < NOW()")
            .execute(&self.pool)
            .await
            .context("Failed to cleanup expired nonces")?;

        Ok(result.rows_affected())
    }
}

/// Session repository for JWT token tracking
pub struct SessionRepository {
    pool: Pool<Postgres>,
}

impl SessionRepository {
    pub fn new(pool: Pool<Postgres>) -> Self {
        Self { pool }
    }

    /// Create new session
    pub async fn create(&self, user_id: Uuid, token_jti: String, expires_at: chrono::DateTime<Utc>) -> Result<Session> {
        let session = sqlx::query_as::<_, Session>(
            "INSERT INTO sessions (user_id, token_jti, expires_at) 
             VALUES ($1, $2, $3) RETURNING *"
        )
        .bind(user_id)
        .bind(&token_jti)
        .bind(expires_at)
        .fetch_one(&self.pool)
        .await
        .context("Failed to create session")?;

        Ok(session)
    }

    /// Check if session is valid
    pub async fn is_valid(&self, token_jti: &str) -> Result<bool> {
        let result = sqlx::query_as::<_, Session>(
            "SELECT * FROM sessions 
             WHERE token_jti = $1 
             AND revoked = false 
             AND expires_at > NOW()"
        )
        .bind(token_jti)
        .fetch_optional(&self.pool)
        .await
        .context("Failed to check session")?;

        Ok(result.is_some())
    }

    /// Revoke session
    pub async fn revoke(&self, token_jti: &str) -> Result<()> {
        sqlx::query("UPDATE sessions SET revoked = true WHERE token_jti = $1")
            .bind(token_jti)
            .execute(&self.pool)
            .await
            .context("Failed to revoke session")?;

        Ok(())
    }
}

/// KWAMI ownership cache repository
pub struct KwamiRepository {
    pool: Pool<Postgres>,
}

impl KwamiRepository {
    pub fn new(pool: Pool<Postgres>) -> Self {
        Self { pool }
    }

    /// Cache KWAMI ownership
    pub async fn cache_ownership(
        &self,
        wallet_address: &Pubkey,
        mint_addresses: Vec<String>,
    ) -> Result<()> {
        let wallet_str = wallet_address.to_string();

        // Delete old cache entries
        sqlx::query("DELETE FROM kwami_ownership WHERE wallet_address = $1")
            .bind(&wallet_str)
            .execute(&self.pool)
            .await
            .context("Failed to delete old cache")?;

        // Insert new cache entries
        for mint in mint_addresses {
            sqlx::query(
                "INSERT INTO kwami_ownership (wallet_address, mint_address) 
                 VALUES ($1, $2)"
            )
            .bind(&wallet_str)
            .bind(&mint)
            .execute(&self.pool)
            .await
            .context("Failed to cache ownership")?;
        }

        Ok(())
    }

    /// Get cached KWAMI ownership
    pub async fn get_cached(&self, wallet_address: &Pubkey) -> Result<Option<Vec<KwamiOwnership>>> {
        let wallet_str = wallet_address.to_string();

        // Check if cache is fresh (within last hour)
        let cached = sqlx::query_as::<_, KwamiOwnership>(
            "SELECT * FROM kwami_ownership 
             WHERE wallet_address = $1 
             AND cached_at > NOW() - INTERVAL '1 hour'"
        )
        .bind(&wallet_str)
        .fetch_all(&self.pool)
        .await
        .context("Failed to get cached ownership")?;

        if cached.is_empty() {
            Ok(None)
        } else {
            Ok(Some(cached))
        }
    }
}

/// Redis cache helper
pub struct RedisCache {
    manager: redis::aio::ConnectionManager,
}

impl RedisCache {
    pub fn new(manager: redis::aio::ConnectionManager) -> Self {
        Self { manager }
    }

    /// Set value with expiration
    pub async fn set_ex(&mut self, key: &str, value: &str, seconds: usize) -> Result<()> {
        self.manager
            .set_ex::<_, _, ()>(key, value, seconds as u64)
            .await
            .context("Failed to set Redis key")?;
        Ok(())
    }

    /// Get value
    pub async fn get(&mut self, key: &str) -> Result<Option<String>> {
        let value: Option<String> = self.manager
            .get(key)
            .await
            .context("Failed to get Redis key")?;
        Ok(value)
    }

    /// Delete key
    pub async fn del(&mut self, key: &str) -> Result<()> {
        self.manager
            .del::<_, ()>(key)
            .await
            .context("Failed to delete Redis key")?;
        Ok(())
    }

    /// Check if key exists
    pub async fn exists(&mut self, key: &str) -> Result<bool> {
        let exists: bool = self.manager
            .exists(key)
            .await
            .context("Failed to check Redis key")?;
        Ok(exists)
    }
}
