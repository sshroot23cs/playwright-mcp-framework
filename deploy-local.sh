#!/bin/bash

# Local Docker Deployment Script for Pytest UI Framework
# Bash version for Linux/macOS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default values
BUILD=false
UP=false
DOWN=false
LOGS=false
STATUS=false
CLEAN=false
TEST=false
SERVICE=""
TEST_PATH="tests/"
PARALLEL=false

function print_status() {
    echo -e "${GREEN}[INFO] $1${NC}"
}

function print_warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

function print_error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

function print_info() {
    echo -e "${CYAN}[DOCKER] $1${NC}"
}

function check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker."
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker."
        exit 1
    fi
    
    print_status "Docker is running"
}

function check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose."
        exit 1
    fi
    
    print_status "Docker Compose found"
}

function build_images() {
    print_status "Building Docker images..."
    
    # Create necessary directories
    mkdir -p reports screenshots logs downloads docker-registry monitoring
    
    # Build the main pytest image
    print_info "Building playwright-mcp-framework image..."
    docker build -f Dockerfile.local -t playwright-mcp-framework:local .
    
    print_status "Images built successfully"
}

function start_services() {
    print_status "Starting Docker services..."
    
    # Create directories if they don't exist
    mkdir -p reports screenshots logs downloads docker-registry monitoring
    
    print_info "Starting services with docker-compose..."
    docker-compose up -d
    
    print_status "Services started successfully"
    show_service_status
    show_access_urls
}

function stop_services() {
    print_status "Stopping Docker services..."
    docker-compose down
    
    print_status "Services stopped successfully"
}

function show_logs() {
    if [ -n "$SERVICE" ]; then
        print_info "Showing logs for service: $SERVICE"
        docker-compose logs -f "$SERVICE"
    else
        print_info "Showing logs for all services..."
        docker-compose logs -f
    fi
}

function show_service_status() {
    print_status "Service Status:"
    docker-compose ps
    
    print_status "Container Health:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

function show_access_urls() {
    print_status "Access URLs:"
    echo -e "  🌐 Selenium Grid Hub: ${CYAN}http://localhost:4444${NC}"
    echo -e "  📊 Allure Reports: ${CYAN}http://localhost:5050${NC}"
    echo -e "  📁 File Server: ${CYAN}http://localhost:8080${NC}"
    echo -e "  📈 Grafana Dashboard: ${CYAN}http://localhost:3000${NC} (admin/admin123)"
    echo -e "  📊 Prometheus: ${CYAN}http://localhost:9090${NC}"
    echo -e "  🐳 Local Registry: ${CYAN}http://localhost:5000${NC}"
}

function run_tests() {
    print_status "Running tests in Docker container..."
    
    local test_command="npx playwright test --reporter=html"
    
    if [ "$PARALLEL" = true ]; then
        test_command="$test_command --workers=auto"
        print_info "Running tests in parallel mode"
    fi
    
    print_info "Test command: $test_command"
    
    if docker-compose exec playwright-runner sh -c "$test_command"; then
        print_status "Tests completed successfully"
        print_info "View reports at: http://localhost:8080/reports/"
        print_info "View Allure reports at: http://localhost:5050"
    else
        print_warning "Tests completed with failures. Check logs and reports."
    fi
}

function clean_environment() {
    print_status "Cleaning up Docker environment..."
    
    # Stop and remove containers
    docker-compose down --volumes --remove-orphans
    
    # Remove custom images
    print_info "Removing custom images..."
    docker rmi playwright-mcp-framework:local -f 2>/dev/null || true
    
    # Clean up directories (optional)
    read -p "Do you want to remove local data directories (reports, logs, etc.)? (y/N): " cleanup
    if [[ $cleanup == "y" || $cleanup == "Y" ]]; then
        rm -rf reports screenshots logs downloads docker-registry
        print_status "Local data directories cleaned"
    fi
    
    print_status "Environment cleaned successfully"
}

function wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        attempt=$((attempt + 1))
        sleep 2
        
        if curl -s http://localhost:4444/wd/hub/status > /dev/null 2>&1; then
            print_status "Selenium Hub is ready!"
            return 0
        fi
        
        echo -n "."
    done
    
    echo ""
    print_error "Services failed to start within expected time"
    return 1
}

function show_help() {
    cat << EOF
Local Docker Deployment Script for Pytest UI Framework

Usage: ./deploy-local.sh [OPTIONS]

Options:
  --build          Build Docker images
  --up             Start all services
  --down           Stop all services
  --logs           Show logs (use --service to specify service)
  --status         Show service status
  --test           Run tests (use --test-path to specify path)
  --parallel       Run tests in parallel mode
  --clean          Clean up environment and images
  --service <name> Specify service for logs/operations
  --test-path <path> Specify test path (default: tests/)

Examples:
  ./deploy-local.sh --build --up          # Build and start services
  ./deploy-local.sh --test                # Run all tests
  ./deploy-local.sh --test --test-path "tests/e2e/finance-e2e.spec.js"  # Run specific test
  ./deploy-local.sh --logs --service playwright-runner             # Show playwright logs
  ./deploy-local.sh --status              # Show service status
  ./deploy-local.sh --down --clean        # Stop and clean everything

Services:
  - playwright-runner     : Main test execution container
  - selenium-hub      : Selenium Grid hub
  - selenium-chrome-1 : Chrome browser node 1
  - selenium-chrome-2 : Chrome browser node 2
  - selenium-firefox  : Firefox browser node
  - local-registry    : Local container registry
  - file-server       : File server for reports
  - allure-server     : Allure report server
  - prometheus        : Metrics collection
  - grafana          : Monitoring dashboard
EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --build)
            BUILD=true
            shift
            ;;
        --up)
            UP=true
            shift
            ;;
        --down)
            DOWN=true
            shift
            ;;
        --logs)
            LOGS=true
            shift
            ;;
        --status)
            STATUS=true
            shift
            ;;
        --test)
            TEST=true
            shift
            ;;
        --parallel)
            PARALLEL=true
            shift
            ;;
        --clean)
            CLEAN=true
            shift
            ;;
        --service)
            SERVICE="$2"
            shift 2
            ;;
        --test-path)
            TEST_PATH="$2"
            shift 2
            ;;
        --help|-h)
            show_help
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Main execution logic
function main() {
    if [ "$BUILD" = false ] && [ "$UP" = false ] && [ "$DOWN" = false ] && \
       [ "$LOGS" = false ] && [ "$STATUS" = false ] && [ "$CLEAN" = false ] && \
       [ "$TEST" = false ]; then
        show_help
        exit 0
    fi
    
    # Pre-flight checks
    check_docker
    check_docker_compose
    
    # Execute requested operations
    if [ "$BUILD" = true ]; then build_images; fi
    if [ "$UP" = true ]; then start_services && wait_for_services; fi
    if [ "$TEST" = true ]; then run_tests; fi
    if [ "$LOGS" = true ]; then show_logs; fi
    if [ "$STATUS" = true ]; then show_service_status && show_access_urls; fi
    if [ "$DOWN" = true ]; then stop_services; fi
    if [ "$CLEAN" = true ]; then clean_environment; fi
}

# Run main function
main
