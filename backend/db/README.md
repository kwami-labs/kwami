# Kwami Database Infrastructure

This directory contains Docker-based database setups for the Kwami project.

## Available Databases

### 1. PostgreSQL (`postgres/`)
Relational database for structured data, user accounts, transactions, and application state.

- **Port**: 5432 (default)
- **Use cases**: User data, transactions, relational data
- **Documentation**: [postgres/README.md](postgres/README.md)

### 2. Qdrant (`qdrant/`)
Vector database for embeddings, semantic search, and AI-powered features.

- **HTTP Port**: 6333 (default)
- **gRPC Port**: 6334 (default)
- **Use cases**: Vector embeddings, semantic search, similarity matching
- **Documentation**: [qdrant/README.md](qdrant/README.md)

### 3. Redis (`redis/`)
In-memory data store for caching, sessions, and real-time features.

- **Port**: 6379 (default)
- **Use cases**: Caching, session storage, rate limiting, pub/sub messaging, leaderboards
- **Documentation**: [redis/README.md](redis/README.md)

## Quick Start

### Start All Databases (Development)

```bash
# PostgreSQL
cd postgres
cp .env.sample .env
# Edit .env with your credentials
docker-compose up -d
cd ..

# Qdrant
cd qdrant
cp .env.sample .env
docker-compose up -d
cd ..

# Redis
cd redis
cp .env.sample .env
docker-compose up -d
cd ..
```

### Start All Databases (Production)

```bash
# PostgreSQL
cd postgres
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
cd ..

# Qdrant
cd qdrant
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
cd ..

# Redis
cd redis
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
cd ..
```

### Stop All Databases

```bash
cd postgres && docker-compose down && cd ..
cd qdrant && docker-compose down && cd ..
cd redis && docker-compose down && cd ..
```

## Connection Information

### PostgreSQL
- **Host**: localhost
- **Port**: 5432
- **Database**: kwami
- **User**: kwami_user
- **Connection String**: `postgresql://kwami_user:password@localhost:5432/kwami`

### Qdrant
- **HTTP URL**: http://localhost:6333
- **gRPC URL**: http://localhost:6334
- **Dashboard**: http://localhost:6333/dashboard
- **API Docs**: http://localhost:6333/swagger-ui

### Redis
- **Host**: localhost
- **Port**: 6379
- **Connection URL**: `redis://:password@localhost:6379/0`

## Environment Variables

Each database has its own `.env` file. Copy the `.env.sample` template and configure:

```bash
# In postgres/
cp .env.sample .env

# In qdrant/
cp .env.sample .env

# In redis/
cp .env.sample .env
```

## Architecture

```
backend/db/
├── postgres/              # PostgreSQL setup
│   ├── docker-compose.yml
│   ├── docker-compose.prod.yml
│   ├── .env.sample
│   ├── init/             # SQL initialization scripts
│   └── backups/          # Backup directory
│
├── qdrant/               # Qdrant setup
│   ├── docker-compose.yml
│   ├── docker-compose.prod.yml
│   ├── .env.sample
│   └── config/           # Qdrant configuration
│
├── redis/                # Redis setup
│   ├── docker-compose.yml
│   ├── docker-compose.prod.yml
│   ├── .env.sample
│   └── config/           # Redis configuration
│
└── README.md             # This file
```

## Development Workflow

1. **Initial Setup**: Copy `.env.sample` to `.env` in each database directory
2. **Start Databases**: Run `docker-compose up -d` in each directory
3. **Check Status**: Use `docker-compose ps` and `docker-compose logs`
4. **Development**: Connect your application using the connection strings
5. **Maintenance**: Use provided scripts for backups and maintenance

## Production Deployment

For production, use the production compose files:

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

Production configurations include:
- Resource limits (CPU and memory)
- Performance optimizations
- Enhanced security settings
- Log rotation
- Health checks

## Backup Strategy

### PostgreSQL
```bash
cd postgres
docker-compose exec postgres pg_dump -U kwami_user -d kwami -F c -f /backups/backup.dump
```

### Qdrant
```bash
cd qdrant
curl -X POST 'http://localhost:6333/collections/collection_name/snapshots'
```

### Redis
```bash
cd redis
docker-compose exec redis redis-cli BGSAVE
docker cp kwami-redis:/data/dump.rdb ./backups/backup.rdb
```

## Monitoring

Check health status:

```bash
# PostgreSQL
docker-compose -f postgres/docker-compose.yml ps
docker-compose -f postgres/docker-compose.yml exec postgres pg_isready

# Qdrant
curl http://localhost:6333/healthz

# Redis
docker-compose -f redis/docker-compose.yml ps
docker-compose -f redis/docker-compose.yml exec redis redis-cli ping
```

## Troubleshooting

### Ports Already in Use

If ports are already in use, modify the port mappings in `.env` files:

```bash
# PostgreSQL
POSTGRES_PORT=5433

# Qdrant
QDRANT_HTTP_PORT=6334
QDRANT_GRPC_PORT=6335

# Redis
REDIS_PORT=6380
```

### Connection Refused

1. Verify containers are running: `docker-compose ps`
2. Check logs: `docker-compose logs`
3. Ensure `.env` files are properly configured
4. Check firewall settings

### Data Persistence

Data is persisted in Docker volumes. To view volumes:

```bash
docker volume ls | grep kwami
```

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use strong passwords** in production
3. **Enable API keys** for Qdrant in production
4. **Restrict network access** using firewall rules
5. **Regular backups** of both databases
6. **Keep images updated** with `docker-compose pull`

## Next Steps

- Configure your application to connect to these databases
- Set up backup automation
- Configure monitoring and alerting
- Review and adjust resource limits for your use case
- Implement connection pooling in your application

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Qdrant Documentation](https://qdrant.tech/documentation/)
- [Redis Documentation](https://redis.io/documentation)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
