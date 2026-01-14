use anyhow::{Context, Result};
use qdrant_client::client::QdrantClient;
use redis::aio::ConnectionManager;
use sqlx::postgres::PgPoolOptions;
use sqlx::{Pool, Postgres};
use std::time::Duration;
use tracing::info;

pub mod models;
pub mod repositories;

/// Database connection pools
#[derive(Clone)]
pub struct DatabasePools {
    /// PostgreSQL connection pool
    pub postgres: Pool<Postgres>,
    /// Redis connection manager
    pub redis: ConnectionManager,
    /// Qdrant vector database client
    pub qdrant: QdrantClient,
}

impl DatabasePools {
    /// Initialize all database connections
    pub async fn new(
        database_url: &str,
        redis_url: &str,
        qdrant_url: &str,
    ) -> Result<Self> {
        // Initialize PostgreSQL pool
        info!("🔌 Connecting to PostgreSQL...");
        let postgres = PgPoolOptions::new()
            .max_connections(20)
            .min_connections(5)
            .acquire_timeout(Duration::from_secs(30))
            .idle_timeout(Duration::from_secs(600))
            .max_lifetime(Duration::from_secs(1800))
            .connect(database_url)
            .await
            .context("Failed to connect to PostgreSQL")?;

        // Run pending migrations
        info!("🔄 Running database migrations...");
        sqlx::migrate!("./migrations")
            .run(&postgres)
            .await
            .context("Failed to run migrations")?;

        info!("✅ PostgreSQL connected");

        // Initialize Redis connection
        info!("🔌 Connecting to Redis...");
        let redis_client = redis::Client::open(redis_url)
            .context("Failed to create Redis client")?;
        let redis = ConnectionManager::new(redis_client)
            .await
            .context("Failed to connect to Redis")?;

        info!("✅ Redis connected");

        // Initialize Qdrant client
        info!("🔌 Connecting to Qdrant...");
        let qdrant = QdrantClient::from_url(qdrant_url)
            .build()
            .context("Failed to create Qdrant client")?;

        // Test Qdrant connection
        qdrant
            .health_check()
            .await
            .context("Failed to connect to Qdrant")?;

        info!("✅ Qdrant connected");

        Ok(Self {
            postgres,
            redis,
            qdrant,
        })
    }

    /// Health check for all databases
    pub async fn health_check(&self) -> Result<()> {
        // Check PostgreSQL
        sqlx::query("SELECT 1")
            .execute(&self.postgres)
            .await
            .context("PostgreSQL health check failed")?;

        // Check Redis
        redis::cmd("PING")
            .query_async(&mut self.redis.clone())
            .await
            .context("Redis health check failed")?;

        // Check Qdrant
        self.qdrant
            .health_check()
            .await
            .context("Qdrant health check failed")?;

        Ok(())
    }
}
