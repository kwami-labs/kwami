# Database Setup Guide

This guide explains how to set up and use the databases for the KWAMI API.

## Overview

The KWAMI API uses three databases:

1. **PostgreSQL** - Relational database for users, auth nonces, sessions, and KWAMI ownership cache
2. **Redis** - In-memory cache for fast data access and session management  
3. **Qdrant** - Vector database for embeddings and semantic search (future use)

## Prerequisites

- Docker and Docker Compose installed
- Rust and Cargo installed
- Access to the database setup in `../db/`

## Quick Start

### 1. Start the Databases

From the `backend/db/` directory:

```bash
cd ../db
./dev.sh up
```

This will start all three databases with default configurations.

### 2. Configure Environment Variables

Copy the sample environment file:

```bash
cp .env.sample .env
```

Edit `.env` and update the database credentials to match your setup:

```env
# Database Configuration
DATABASE_URL=postgresql://kwami_user:your_password@localhost:5432/kwami
REDIS_URL=redis://:your_redis_password@localhost:6379/0
QDRANT_URL=http://localhost:6333
```

**Important**: Make sure these credentials match the ones you set in `../db/postgres/.env` and `../db/redis/.env`

### 3. Run Migrations

Migrations are automatically run when the API starts. The database schema will be created on first launch.

You can also run migrations manually using `sqlx-cli`:

```bash
# Install sqlx-cli if you haven't
cargo install sqlx-cli --no-default-features --features postgres

# Run migrations
sqlx migrate run
```

### 4. Start the API

```bash
cargo run
```

The API will:
- Connect to all three databases
- Run pending migrations
- Start the server on the configured port (default: 3000)

## Database Schema

### Users Table

Stores wallet-based user accounts:

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    wallet_address VARCHAR(44) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    last_login TIMESTAMPTZ
);
```

### Auth Nonces Table

Stores temporary nonces for wallet signature verification:

```sql
CREATE TABLE auth_nonces (
    id UUID PRIMARY KEY,
    wallet_address VARCHAR(44) NOT NULL,
    nonce UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE
);
```

### Sessions Table

Tracks JWT tokens and session state:

```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    token_jti VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE
);
```

### KWAMI Ownership Cache Table

Caches NFT ownership to reduce blockchain queries:

```sql
CREATE TABLE kwami_ownership (
    id UUID PRIMARY KEY,
    wallet_address VARCHAR(44) NOT NULL,
    mint_address VARCHAR(44) NOT NULL,
    metadata_url TEXT,
    cached_at TIMESTAMPTZ NOT NULL,
    verified_at TIMESTAMPTZ NOT NULL,
    UNIQUE(wallet_address, mint_address)
);
```

## Development Workflow

### Viewing Database Data

**PostgreSQL:**
```bash
cd ../db/postgres
docker-compose exec postgres psql -U kwami_user -d kwami

# View users
SELECT * FROM users;

# View active sessions
SELECT * FROM sessions WHERE revoked = false AND expires_at > NOW();
```

**Redis:**
```bash
cd ../db/redis
docker-compose exec redis redis-cli

# View all keys
KEYS *

# Get specific key
GET key_name
```

**Qdrant:**
Open your browser to http://localhost:6333/dashboard

### Creating New Migrations

```bash
# Create a new migration
sqlx migrate add <migration_name>

# This creates a new file in migrations/
# Edit the file and add your SQL

# Run the migration
sqlx migrate run
```

### Resetting Databases

**Reset everything (⚠️ destroys all data):**
```bash
cd ../db
./dev.sh reset postgres
./dev.sh reset redis
./dev.sh reset qdrant
```

## Database Architecture

```
backend/api/
├── src/
│   ├── db/
│   │   ├── mod.rs              # Connection pools and initialization
│   │   ├── models.rs           # Database model structs
│   │   └── repositories.rs     # CRUD operations
│   ├── state.rs                # AppState with database pools
│   └── main.rs                 # Database initialization on startup
│
└── migrations/
    └── *.sql                   # SQL migration files
```

## Connection Pooling

The API uses connection pooling for optimal performance:

- **PostgreSQL**: 5-20 connections (configurable)
- **Redis**: Connection manager with auto-reconnect
- **Qdrant**: Single client instance with connection pooling

## Health Checks

The databases include health checks:

```rust
// Check all databases
state.db.health_check().await?;
```

Individual checks:
- PostgreSQL: `SELECT 1` query
- Redis: `PING` command
- Qdrant: `/health` endpoint

## Background Tasks

The API runs background cleanup tasks:

- **Nonce cleanup**: Every 5 minutes, removes expired nonces
- **Session cleanup**: Removes expired sessions (future implementation)

## Troubleshooting

### Connection Refused

1. Check if databases are running:
```bash
cd ../db
./dev.sh status
```

2. Verify connection strings in `.env`

3. Check database logs:
```bash
./dev.sh logs postgres
./dev.sh logs redis
```

### Migration Errors

If migrations fail:

1. Check if the database is accessible
2. Verify the DATABASE_URL is correct
3. Manually inspect the migration files
4. Check sqlx version compatibility

### Performance Issues

1. Monitor database connections:
```rust
// Check pool status
println!("Active connections: {}", state.db.postgres.size());
```

2. Review query performance using `EXPLAIN ANALYZE` in PostgreSQL

3. Monitor Redis memory usage:
```bash
docker-compose exec redis redis-cli INFO memory
```

## Production Considerations

### Security

- ✅ Use strong passwords for all databases
- ✅ Enable SSL/TLS for PostgreSQL connections
- ✅ Set up proper firewall rules
- ✅ Use separate credentials for each environment
- ✅ Enable Redis authentication
- ✅ Restrict Qdrant API access

### Backup Strategy

**PostgreSQL:**
```bash
# Automated backups
0 2 * * * cd /path/to/backend/db/postgres && docker-compose exec postgres pg_dump -U kwami_user kwami > backup_$(date +\%Y\%m\%d).sql
```

**Redis:**
```bash
# RDB snapshots (automatic with config)
# AOF persistence enabled for durability
```

### Monitoring

Recommended tools:
- PostgreSQL: pgAdmin, Datadog, New Relic
- Redis: RedisInsight, redis-cli INFO
- Qdrant: Built-in dashboard at /dashboard

### Scaling

- **PostgreSQL**: Use read replicas for heavy read workloads
- **Redis**: Use Redis Cluster for horizontal scaling
- **Qdrant**: Use distributed collections for large datasets

## API Usage Examples

### User Authentication Flow

1. Client requests nonce:
```
POST /auth/nonce
{ "pubkey": "ABC..." }
```

2. Nonce stored in `auth_nonces` table

3. Client signs message and logs in:
```
POST /auth/login
{
  "pubkey": "ABC...",
  "signature": "XYZ...",
  "nonce": "uuid",
  "message": "Login to KWAMI...",
  "kwami_mint": "DEF..."
}
```

4. User created/updated in `users` table
5. Session tracked in `sessions` table (future)
6. JWT token returned to client

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)
- [Qdrant Documentation](https://qdrant.tech/documentation/)
- [sqlx Documentation](https://docs.rs/sqlx/)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review database logs
3. Consult the main README.md
