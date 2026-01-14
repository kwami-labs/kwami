# PostgreSQL Database Setup

PostgreSQL database instance for Kwami project with Docker support for development and production environments.

## Features

- PostgreSQL 16 (Alpine-based for smaller image size)
- Automatic initialization scripts
- Health checks
- Persistent data volumes
- Backup directory support
- Production-optimized configuration
- Audit logging schema

## Quick Start

### Development

1. Copy environment file:
```bash
cp .env.sample .env
```

2. Edit `.env` and set your credentials

3. Start the database:
```bash
docker-compose up -d
```

4. Check status:
```bash
docker-compose ps
docker-compose logs -f postgres
```

5. Connect to database:
```bash
docker-compose exec postgres psql -U kwami_user -d kwami
```

### Production

1. Set production environment variables in `.env`

2. Start with production configuration:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_DB` | Database name | `kwami` |
| `POSTGRES_USER` | Database user | `kwami_user` |
| `POSTGRES_PASSWORD` | Database password | (required) |
| `POSTGRES_PORT` | Exposed port | `5432` |
| `DATABASE_URL` | Connection string | (auto-generated) |

## Directory Structure

```
postgres/
├── docker-compose.yml          # Development configuration
├── docker-compose.prod.yml     # Production overrides
├── .env.sample                 # Environment template
├── init/                       # Initialization scripts
│   └── 01-init.sql            # Database setup
├── backups/                    # Backup directory (created on first run)
└── README.md                   # This file
```

## Database Schemas

- `kwami`: Main application schema
- `audit`: Audit logging schema
- `public`: Default PostgreSQL schema

## Initialization

The `init/` directory contains SQL scripts that run automatically when the database is first created. Scripts are executed in alphabetical order.

## Backups

### Create Backup

```bash
docker-compose exec postgres pg_dump -U kwami_user -d kwami -F c -f /backups/kwami_$(date +%Y%m%d_%H%M%S).dump
```

### Restore Backup

```bash
docker-compose exec postgres pg_restore -U kwami_user -d kwami -v /backups/kwami_backup.dump
```

### Backup to SQL

```bash
docker-compose exec postgres pg_dump -U kwami_user -d kwami > backups/kwami_$(date +%Y%m%d_%H%M%S).sql
```

## Maintenance

### Stop Database

```bash
docker-compose down
```

### Reset Database (⚠️ Destroys all data)

```bash
docker-compose down -v
docker-compose up -d
```

### View Logs

```bash
docker-compose logs -f postgres
```

### Database Shell

```bash
docker-compose exec postgres psql -U kwami_user -d kwami
```

## Production Optimizations

The production configuration includes:
- Resource limits (2 CPU cores, 4GB RAM)
- Optimized PostgreSQL parameters for performance
- Connection pooling configuration
- Enhanced logging
- Log rotation

## Health Checks

The container includes health checks that verify:
- PostgreSQL is running
- Database is accepting connections
- User authentication works

## Troubleshooting

### Cannot connect to database

1. Check if container is running:
```bash
docker-compose ps
```

2. Check logs:
```bash
docker-compose logs postgres
```

3. Verify environment variables are set correctly

### Permission denied errors

Ensure the `POSTGRES_PASSWORD` is set in your `.env` file.

### Port already in use

Change `POSTGRES_PORT` in `.env` to a different port.

## Security Notes

- Never commit `.env` files to version control
- Use strong passwords in production
- Restrict network access to the database
- Regularly backup your data
- Keep PostgreSQL image updated
