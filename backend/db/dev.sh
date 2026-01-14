#!/bin/bash
# Development database management script for Kwami

set -e

# Database directories
DBS=("postgres" "qdrant" "redis")
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Detect docker compose command (v1 vs v2)
if command -v docker-compose >/dev/null 2>&1; then
    DOCKER_COMPOSE="docker-compose"
elif command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    DOCKER_COMPOSE="docker compose"
else
    echo "[ERROR] Docker Compose not found. Please install Docker and Docker Compose."
    exit 1
fi

# Function to print output
print_info() {
    echo "[INFO] $1"
}

print_success() {
    echo "[✓] $1"
}

print_warning() {
    echo "[WARNING] $1"
}

print_error() {
    echo "[ERROR] $1"
}

# Function to check if .env exists, if not copy from .env.sample
setup_env() {
    local db=$1
    if [ ! -f "$SCRIPT_DIR/$db/.env" ]; then
        if [ -f "$SCRIPT_DIR/$db/.env.sample" ]; then
            print_warning "$db: .env not found, copying from .env.sample"
            cp "$SCRIPT_DIR/$db/.env.sample" "$SCRIPT_DIR/$db/.env"
            print_info "$db: Please edit $db/.env with your credentials"
        else
            print_error "$db: .env.sample not found"
            return 1
        fi
    fi
}

# Function to start a database
start_db() {
    local db=$1
    print_info "Starting $db..."
    
    if [ ! -d "$SCRIPT_DIR/$db" ]; then
        print_error "$db directory not found"
        return 1
    fi
    
    cd "$SCRIPT_DIR/$db"
    setup_env "$db"
    
    if $DOCKER_COMPOSE up -d; then
        print_success "$db started successfully"
    else
        print_error "Failed to start $db"
        return 1
    fi
    
    cd "$SCRIPT_DIR"
}

# Function to stop a database
stop_db() {
    local db=$1
    print_info "Stopping $db..."
    
    if [ ! -d "$SCRIPT_DIR/$db" ]; then
        print_error "$db directory not found"
        return 1
    fi
    
    cd "$SCRIPT_DIR/$db"
    
    if $DOCKER_COMPOSE down; then
        print_success "$db stopped successfully"
    else
        print_error "Failed to stop $db"
        return 1
    fi
    
    cd "$SCRIPT_DIR"
}

# Function to restart a database
restart_db() {
    local db=$1
    stop_db "$db"
    start_db "$db"
}

# Function to show status of databases
status() {
    print_info "Database Status:"
    echo ""
    
    for db in "${DBS[@]}"; do
        if [ -d "$SCRIPT_DIR/$db" ]; then
            cd "$SCRIPT_DIR/$db"
            echo "━━━ $db ━━━"
            $DOCKER_COMPOSE ps
            echo ""
            cd "$SCRIPT_DIR"
        fi
    done
}

# Function to show logs
logs() {
    local db=$1
    
    if [ -z "$db" ]; then
        print_error "Please specify a database: postgres, qdrant, or redis"
        return 1
    fi
    
    if [ ! -d "$SCRIPT_DIR/$db" ]; then
        print_error "$db directory not found"
        return 1
    fi
    
    cd "$SCRIPT_DIR/$db"
    $DOCKER_COMPOSE logs -f
}

# Function to start all databases
start_all() {
    print_info "Starting all databases..."
    echo ""
    
    for db in "${DBS[@]}"; do
        start_db "$db"
        echo ""
    done
    
    echo ""
    print_success "All databases started!"
    echo ""
    status
}

# Function to stop all databases
stop_all() {
    print_info "Stopping all databases..."
    echo ""
    
    for db in "${DBS[@]}"; do
        stop_db "$db"
        echo ""
    done
    
    print_success "All databases stopped!"
}

# Function to restart all databases
restart_all() {
    stop_all
    echo ""
    start_all
}

# Function to reset a database (destroys all data)
reset_db() {
    local db=$1
    
    if [ -z "$db" ]; then
        print_error "Please specify a database: postgres, qdrant, or redis"
        return 1
    fi
    
    print_warning "This will DESTROY all data in $db!"
    read -p "Are you sure? (yes/no): " confirm
    
    if [ "$confirm" != "yes" ]; then
        print_info "Reset cancelled"
        return 0
    fi
    
    if [ ! -d "$SCRIPT_DIR/$db" ]; then
        print_error "$db directory not found"
        return 1
    fi
    
    cd "$SCRIPT_DIR/$db"
    print_info "Resetting $db..."
    
    if $DOCKER_COMPOSE down -v; then
        print_success "$db reset (volumes destroyed)"
        print_info "Starting $db..."
        $DOCKER_COMPOSE up -d
        print_success "$db started with fresh data"
    else
        print_error "Failed to reset $db"
        return 1
    fi
    
    cd "$SCRIPT_DIR"
}

# Function to show help
show_help() {
    cat << EOF
Kwami Database Development Manager

Usage:
  ./dev.sh [command] [options]

Commands:
  up              Start all databases
  down            Stop all databases
  restart         Restart all databases
  status          Show status of all databases
  
  start [db]      Start a specific database (postgres, qdrant, redis)
  stop [db]       Stop a specific database
  restart [db]    Restart a specific database
  logs [db]       Show logs for a specific database (follows)
  reset [db]      Reset a specific database (destroys all data!)
  
  help            Show this help message

Examples:
  ./dev.sh up                 # Start all databases
  ./dev.sh start postgres     # Start only PostgreSQL
  ./dev.sh logs redis         # Follow Redis logs
  ./dev.sh status             # Show status of all databases
  ./dev.sh reset qdrant       # Reset Qdrant (WARNING: destroys data)

Available Databases:
  • postgres (PostgreSQL)     - Port 5432
  • qdrant (Vector DB)        - Ports 6333, 6334
  • redis (Cache)             - Port 6379

Notes:
  - First run will copy .env.sample to .env for each database
  - Edit .env files in each database directory with your credentials
  - Use 'reset' command carefully as it destroys all data!

EOF
}

# Main script logic
case "${1:-help}" in
    up|start-all)
        start_all
        ;;
    down|stop-all)
        stop_all
        ;;
    restart|restart-all)
        restart_all
        ;;
    status|ps)
        status
        ;;
    start)
        if [ -z "$2" ]; then
            print_error "Please specify a database: postgres, qdrant, or redis"
            exit 1
        fi
        start_db "$2"
        ;;
    stop)
        if [ -z "$2" ]; then
            print_error "Please specify a database: postgres, qdrant, or redis"
            exit 1
        fi
        stop_db "$2"
        ;;
    restart)
        if [ -z "$2" ]; then
            print_error "Please specify a database: postgres, qdrant, or redis"
            exit 1
        fi
        restart_db "$2"
        ;;
    logs)
        logs "$2"
        ;;
    reset)
        reset_db "$2"
        ;;
    help|-h|--help)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
