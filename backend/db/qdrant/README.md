# Qdrant Vector Database Setup

Qdrant vector database instance for Kwami project with Docker support for development and production environments.

## Features

- Qdrant latest version
- HTTP and gRPC API support
- Persistent storage volumes
- Snapshot support for backups
- Health checks
- Production-optimized configuration
- CORS enabled for web applications
- Custom configuration support

## Quick Start

### Development

1. Copy environment file:
```bash
cp .env.sample .env
```

2. Edit `.env` if needed (defaults work for local dev)

3. Start the vector database:
```bash
docker-compose up -d
```

4. Check status:
```bash
docker-compose ps
docker-compose logs -f qdrant
```

5. Access the Web UI:
```
http://localhost:6333/dashboard
```

6. Test the API:
```bash
curl http://localhost:6333/healthz
```

### Production

1. Set production environment variables in `.env` (especially `QDRANT_API_KEY`)

2. Start with production configuration:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `QDRANT_HTTP_PORT` | HTTP API port | `6333` |
| `QDRANT_GRPC_PORT` | gRPC API port | `6334` |
| `QDRANT_LOG_LEVEL` | Log level (INFO, WARN, ERROR) | `INFO` |
| `QDRANT_API_KEY` | API key for authentication | (empty in dev) |
| `QDRANT_URL` | HTTP connection URL | `http://localhost:6333` |
| `QDRANT_GRPC_URL` | gRPC connection URL | `http://localhost:6334` |

## Directory Structure

```
qdrant/
├── docker-compose.yml          # Development configuration
├── docker-compose.prod.yml     # Production overrides
├── .env.sample                 # Environment template
├── config/                     # Configuration files
│   └── config.yaml            # Qdrant settings
└── README.md                   # This file
```

## API Endpoints

### HTTP API (Default: 6333)

- Dashboard: `http://localhost:6333/dashboard`
- Health check: `http://localhost:6333/healthz`
- Collections: `http://localhost:6333/collections`
- API docs: `http://localhost:6333/swagger-ui`

### gRPC API (Default: 6334)

Used for high-performance operations. Use official Qdrant client libraries for gRPC access.

## Basic Operations

### Create a Collection

```bash
curl -X PUT 'http://localhost:6333/collections/my_collection' \
  -H 'Content-Type: application/json' \
  -d '{
    "vectors": {
      "size": 384,
      "distance": "Cosine"
    }
  }'
```

### Insert Vectors

```bash
curl -X PUT 'http://localhost:6333/collections/my_collection/points' \
  -H 'Content-Type: application/json' \
  -d '{
    "points": [
      {
        "id": 1,
        "vector": [0.1, 0.2, 0.3, ...],
        "payload": {"key": "value"}
      }
    ]
  }'
```

### Search Vectors

```bash
curl -X POST 'http://localhost:6333/collections/my_collection/points/search' \
  -H 'Content-Type: application/json' \
  -d '{
    "vector": [0.1, 0.2, 0.3, ...],
    "limit": 10
  }'
```

## Snapshots and Backups

### Create Snapshot

```bash
curl -X POST 'http://localhost:6333/collections/my_collection/snapshots'
```

### List Snapshots

```bash
curl 'http://localhost:6333/collections/my_collection/snapshots'
```

### Download Snapshot

```bash
curl 'http://localhost:6333/collections/my_collection/snapshots/snapshot_name' \
  --output snapshot.snapshot
```

### Restore from Snapshot

```bash
curl -X PUT 'http://localhost:6333/collections/my_collection/snapshots/upload' \
  -H 'Content-Type: multipart/form-data' \
  -F 'snapshot=@snapshot.snapshot'
```

## Using Python Client

Install the client:
```bash
pip install qdrant-client
```

Basic usage:
```python
from qdrant_client import QdrantClient

# Connect to Qdrant
client = QdrantClient(url="http://localhost:6333")

# Create collection
client.create_collection(
    collection_name="my_collection",
    vectors_config={"size": 384, "distance": "Cosine"}
)

# Insert vectors
client.upsert(
    collection_name="my_collection",
    points=[
        {
            "id": 1,
            "vector": [0.1, 0.2, ...],
            "payload": {"key": "value"}
        }
    ]
)

# Search
results = client.search(
    collection_name="my_collection",
    query_vector=[0.1, 0.2, ...],
    limit=10
)
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
docker-compose logs -f qdrant
```

### Check Storage Size

```bash
docker-compose exec qdrant du -sh /qdrant/storage
```

## Production Optimizations

The production configuration includes:
- Resource limits (2 CPU cores, 4GB RAM)
- Optimized search thread configuration
- Memory-mapped file thresholds for large datasets
- API key authentication
- Enhanced logging with rotation
- Reduced log level (WARN)

## Performance Tuning

Key configuration parameters in `config/config.yaml`:

- `max_search_threads`: Number of parallel search workers
- `memmap_threshold_kb`: Threshold for memory-mapping large segments
- `indexing_threshold_kb`: Threshold for creating vector indices
- `on_disk_payload`: Store payloads on disk to save RAM

## Health Checks

The container includes health checks that verify:
- Qdrant is running
- HTTP API is responding
- Service is healthy

## Troubleshooting

### Cannot connect to Qdrant

1. Check if container is running:
```bash
docker-compose ps
```

2. Check logs:
```bash
docker-compose logs qdrant
```

3. Verify ports are not in use:
```bash
netstat -tuln | grep -E '6333|6334'
```

### Out of memory errors

- Increase Docker memory limits
- Enable `on_disk_payload` in config
- Adjust `memmap_threshold_kb` to use more disk-based storage

### Slow search performance

- Increase `max_search_threads` in production config
- Ensure vectors are properly indexed
- Check if optimization is needed

## Security Notes

- Set `QDRANT_API_KEY` in production
- Restrict network access to Qdrant ports
- Never expose Qdrant directly to the internet without authentication
- Regularly backup snapshots
- Keep Qdrant image updated

## Resources

- [Qdrant Documentation](https://qdrant.tech/documentation/)
- [Python Client](https://github.com/qdrant/qdrant-client)
- [REST API Reference](https://qdrant.github.io/qdrant/redoc/index.html)
