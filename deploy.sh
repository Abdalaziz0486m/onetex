cat ../onetex/deploy.sh
#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/root/onetex"
COMPOSE_FILE="docker-compose-server.yml"
LOG_FILE="/var/log/onetex-deploy.log"

# Function to log messages
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
    log "INFO: $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
    log "WARNING: $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    log "ERROR: $1"
}

# Start deployment
print_status "Starting deployment process..."

# Check if directory exists
if [ ! -d "$PROJECT_DIR" ]; then
    print_error "Project directory $PROJECT_DIR does not exist!"
    exit 1
fi

# Change to project directory
cd "$PROJECT_DIR" || {
    print_error "Failed to change to project directory"
    exit 1
}

print_status "Changed to directory: $(pwd)"

# Check if it's a git repository
if [ ! -d ".git" ]; then
    print_error "Not a git repository!"
    exit 1
fi

# Fetch latest changes
print_status "Fetching latest changes from remote..."
git fetch origin

# Check if there are new commits
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/master)  # Change 'main' to your branch name if different

if [ "$LOCAL" = "$REMOTE" ]; then
    print_status "No new commits found. Deployment not needed."
    exit 0
fi

print_status "New commits found. Starting deployment..."

# Pull latest changes
print_status "Pulling latest changes..."
if git pull origin master; then  # Change 'main' to your branch name if different
    print_status "Successfully pulled latest changes"
else
    print_error "Failed to pull latest changes"
    exit 1
fi

# Build and start containers
print_status "Building and starting containers..."
if docker compose -f "$COMPOSE_FILE" up --build -d --force-recreate; then
    print_status "Containers started successfully"
else
    print_error "Failed to start containers"
    exit 1
fi

# Wait a moment for containers to start
sleep 10

# Check if containers are running
print_status "Checking container status..."
if docker compose -f "$COMPOSE_FILE" ps; then
    print_status "Deployment completed successfully!"
else
    print_error "Some containers may not be running properly"
    exit 1
fi

print_status "Deployment process completed!"
