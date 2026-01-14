-- Initialize Kwami Database
-- This script runs automatically on first container startup

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS kwami;
CREATE SCHEMA IF NOT EXISTS audit;

-- Set default search path
ALTER DATABASE kwami SET search_path TO kwami, public;

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit.activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(255) NOT NULL,
    action VARCHAR(50) NOT NULL,
    old_data JSONB,
    new_data JSONB,
    user_id VARCHAR(255),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on audit log
CREATE INDEX IF NOT EXISTS idx_activity_log_timestamp ON audit.activity_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_activity_log_table ON audit.activity_log(table_name);

-- Grant permissions
GRANT USAGE ON SCHEMA kwami TO kwami_user;
GRANT USAGE ON SCHEMA audit TO kwami_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA kwami TO kwami_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA audit TO kwami_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA kwami TO kwami_user;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA kwami GRANT ALL ON TABLES TO kwami_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA kwami GRANT ALL ON SEQUENCES TO kwami_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA audit GRANT ALL ON TABLES TO kwami_user;
