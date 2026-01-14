#!/bin/bash
# Development database management script for Kwami

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Database directories
DBS=("postgres" "qdrant" "redis")
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
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
    
    if docker-compose up -d; then
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
    
    if docker-compose down; then
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
            echo -e "${BLUE}━━━ $db ━━━${NC}"
            docker-compose ps
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
    docker-compose logs -f
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
    
    if docker-compose down -v; then
        print_success "$db reset (volumes destroyed)"
        print_info "Starting $db..."
        docker-compose up -d
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
${BLUE}Kwami Database Development Manager${NC}

${YELLOW}Usage:${NC}
  ./dev.sh [command] [options]

${YELLOW}Commands:${NC}
  ${GREEN}up${NC}              Start all databases
  ${GREEN}down${NC}            Stop all databases
  ${GREEN}restart${NC}         Restart all databases
  ${GREEN}status${NC}          Show status of all databases
  
  ${GREEN}start [db]${NC}      Start a specific database (postgres, qdrant, redis)
  ${GREEN}stop [db]${NC}       Stop a specific database
  ${GREEN}restart [db]${NC}    Restart a specific database
  ${GREEN}logs [db]${NC}       Show logs for a specific database (follows)
  ${GREEN}reset [db]${NC}      Reset a specific database (destroys all data!)
  
  ${GREEN}help${NC}            Show this help message

${YELLOW}Examples:${NC}
  ./dev.sh up                 # Start all databases
  ./dev.sh start postgres     # Start only PostgreSQL
  ./dev.sh logs redis         # Follow Redis logs
  ./dev.sh status             # Show status of all databases
  ./dev.sh reset qdrant       # Reset Qdrant (WARNING: destroys data)

${YELLOW}Available Databases:${NC}
  • postgres (PostgreSQL)     - Port 5432
  • qdrant (Vector DB)        - Ports 6333, 6334
  • redis (Cache)             - Port 6379

${YELLOW}Notes:${NC}
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
