# Redis Cache Setup

Redis in-memory data store for Kwami project with Docker support for development and production environments.

## Features

- Redis 7 (Alpine-based for smaller image size)
- Persistent data with RDB and AOF
- Memory management with LRU eviction
- Health checks
- Custom configuration
- Production-optimized settings
- Password authentication
- Automatic backups

## Quick Start

### Development

1. Copy environment file:
```bash
cp .env.sample .env
```

2. Edit `.env` and set your password

3. Start Redis:
```bash
docker-compose up -d
```

4. Check status:
```bash
docker-compose ps
docker-compose logs -f redis
```

5. Connect to Redis:
```bash
docker-compose exec redis redis-cli
```

6. Test connection:
```bash
docker-compose exec redis redis-cli ping
# Should return: PONG
```

### Production

1. Set production environment variables in `.env` (especially `REDIS_PASSWORD`)

2. Start with production configuration:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REDIS_PORT` | Redis port | `6379` |
| `REDIS_PASSWORD` | Redis password | (required) |
| `REDIS_URL` | Connection URL | `redis://:password@localhost:6379/0` |

## Directory Structure

```
redis/
├── docker-compose.yml          # Development configuration
├── docker-compose.prod.yml     # Production overrides
├── .env.sample                 # Environment template
├── config/                     # Configuration files
│   └── redis.conf             # Redis settings
└── README.md                   # This file
```

## Configuration Highlights

### Persistence
- **RDB**: Snapshots every 15 minutes (if 1+ keys changed)
- **AOF**: Append-only file with fsync every second
- Both enabled for maximum durability

### Memory Management
- Max memory: 1GB (configurable)
- Eviction policy: `allkeys-lru` (least recently used)
- Automatic memory optimization

### Performance
- TCP keepalive enabled
- Lazy freeing for better performance
- Active rehashing for memory efficiency

## Basic Operations

### Using Redis CLI

```bash
# Connect to Redis
docker-compose exec redis redis-cli

# Authenticate (if password is set)
AUTH your_password

# Set a key
SET mykey "Hello World"

# Get a key
GET mykey

# Set with expiration (10 seconds)
SETEX tempkey 10 "temporary value"

# Check if key exists
EXISTS mykey

# Delete a key
DEL mykey

# List all keys
KEYS *

# Get database info
INFO

# Monitor commands in real-time
MONITOR
```

### Common Commands

```bash
# String operations
SET key value
GET key
INCR counter
DECR counter
APPEND key value

# Hash operations
HSET user:1 name "John"
HGET user:1 name
HGETALL user:1

# List operations
LPUSH mylist "first"
RPUSH mylist "last"
LRANGE mylist 0 -1

# Set operations
SADD myset "member1"
SMEMBERS myset

# Sorted set operations
ZADD leaderboard 100 "player1"
ZRANGE leaderboard 0 -1 WITHSCORES

# Expiration
EXPIRE key 60
TTL key
```

## Using Python Client

Install the client:
```bash
pip install redis
```

Basic usage:
```python
import redis

# Connect to Redis
r = redis.Redis(
    host='localhost',
    port=6379,
    password='your_password',
    decode_responses=True
)

# Basic operations
r.set('key', 'value')
value = r.get('key')

# With expiration
r.setex('temp_key', 300, 'expires in 5 minutes')

# Hash operations
r.hset('user:1', mapping={'name': 'John', 'age': 30})
user = r.hgetall('user:1')

# List operations
r.lpush('mylist', 'item1', 'item2')
items = r.lrange('mylist', 0, -1)

# Pub/Sub
pubsub = r.pubsub()
pubsub.subscribe('channel')
for message in pubsub.listen():
    print(message)
```

## Using Node.js Client

Install the client:
```bash
npm install redis
```

Basic usage:
```javascript
import { createClient } from 'redis';

// Connect to Redis
const client = createClient({
  url: 'redis://:your_password@localhost:6379'
});

await client.connect();

// Basic operations
await client.set('key', 'value');
const value = await client.get('key');

// With expiration
await client.setEx('temp_key', 300, 'expires in 5 minutes');

// Hash operations
await client.hSet('user:1', { name: 'John', age: '30' });
const user = await client.hGetAll('user:1');

// List operations
await client.lPush('mylist', ['item1', 'item2']);
const items = await client.lRange('mylist', 0, -1);

// Pub/Sub
const subscriber = client.duplicate();
await subscriber.connect();
await subscriber.subscribe('channel', (message) => {
  console.log(message);
});

await client.disconnect();
```

## Backups

### Manual Backup

```bash
# Create RDB snapshot
docker-compose exec redis redis-cli BGSAVE

# Check backup status
docker-compose exec redis redis-cli LASTSAVE

# Copy backup file
docker cp kwami-redis:/data/dump.rdb ./backups/dump_$(date +%Y%m%d_%H%M%S).rdb
```

### Restore from Backup

```bash
# Stop Redis
docker-compose down

# Replace data file
docker cp ./backups/dump.rdb kwami-redis:/data/dump.rdb

# Start Redis
docker-compose up -d
```

### Automated Backups

RDB snapshots are automatically created based on the configuration:
- Every 15 minutes if at least 1 key changed
- Every 5 minutes if at least 10 keys changed
- Every 1 minute if at least 10,000 keys changed

## Monitoring

### Check Memory Usage

```bash
docker-compose exec redis redis-cli INFO memory
```

### Check Stats

```bash
docker-compose exec redis redis-cli INFO stats
```

### Monitor Commands

```bash
docker-compose exec redis redis-cli MONITOR
```

### Slow Log

```bash
# Get slow queries
docker-compose exec redis redis-cli SLOWLOG GET 10

# Get slow log length
docker-compose exec redis redis-cli SLOWLOG LEN

# Reset slow log
docker-compose exec redis redis-cli SLOWLOG RESET
```

## Maintenance

### Stop Redis

```bash
docker-compose down
```

### Restart Redis

```bash
docker-compose restart
```

### Reset Database (⚠️ Destroys all data)

```bash
docker-compose down -v
docker-compose up -d
```

### View Logs

```bash
docker-compose logs -f redis
```

### Flush All Data (⚠️ Destroys all data)

```bash
docker-compose exec redis redis-cli FLUSHALL
```

## Production Optimizations

The production configuration includes:
- Resource limits (1 CPU core, 2GB RAM)
- Password authentication required
- Log rotation
- Enhanced logging
- Optimized memory settings

## Performance Tuning

Key configuration parameters in `config/redis.conf`:

- `maxmemory`: Maximum memory usage (1GB default)
- `maxmemory-policy`: Eviction policy (allkeys-lru)
- `appendfsync`: AOF sync frequency (everysec for balance)
- `save`: RDB snapshot intervals
- `tcp-keepalive`: Connection health checks (300s)

## Health Checks

The container includes health checks that verify:
- Redis is running
- Server is responding to PING
- Service is healthy

## Common Use Cases

### Caching
```bash
# Set cache with TTL
SETEX cache:user:123 3600 '{"name":"John","email":"john@example.com"}'

# Get cache
GET cache:user:123
```

### Session Storage
```bash
# Store session
HSET session:abc123 user_id 456 email "user@example.com"
EXPIRE session:abc123 1800

# Get session
HGETALL session:abc123
```

### Rate Limiting
```bash
# Increment request count
INCR rate:user:123
EXPIRE rate:user:123 60

# Check count
GET rate:user:123
```

### Pub/Sub Messaging
```bash
# Publish message
PUBLISH notifications '{"type":"alert","message":"Hello"}'

# Subscribe to channel
SUBSCRIBE notifications
```

### Leaderboards
```bash
# Add score
ZADD leaderboard 1000 "player1"

# Get top 10
ZREVRANGE leaderboard 0 9 WITHSCORES

# Get player rank
ZREVRANK leaderboard "player1"
```

## Troubleshooting

### Cannot connect to Redis

1. Check if container is running:
```bash
docker-compose ps
```

2. Check logs:
```bash
docker-compose logs redis
```

3. Verify password is set correctly in `.env`

### Out of memory errors

- Increase `maxmemory` in `config/redis.conf`
- Review eviction policy
- Check memory usage: `docker-compose exec redis redis-cli INFO memory`

### Slow performance

- Check slow log: `docker-compose exec redis redis-cli SLOWLOG GET 10`
- Monitor operations: `docker-compose exec redis redis-cli MONITOR`
- Review key patterns and expiration

### Connection timeout

- Check TCP keepalive settings
- Verify network connectivity
- Review client timeout settings

## Security Notes

- Always set `REDIS_PASSWORD` in production
- Never expose Redis directly to the internet
- Use firewall rules to restrict access
- Regularly update Redis image
- Monitor for suspicious activity
- Consider using Redis ACLs for fine-grained permissions

## Resources

- [Redis Documentation](https://redis.io/documentation)
- [Redis Commands](https://redis.io/commands)
- [Redis Best Practices](https://redis.io/topics/best-practices)
- [Python Redis Client](https://github.com/redis/redis-py)
- [Node.js Redis Client](https://github.com/redis/node-redis)
