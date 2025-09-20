# Local Docker Deployment Script for Pytest UI Framework
# PowerShell version for Windows

param(
    [switch]$Build,
    [switch]$Up,
    [switch]$Down,
    [switch]$Logs,
    [switch]$Status,
    [switch]$Clean,
    [switch]$Test,
    [string]$Service = "",
    [string]$TestPath = "tests/",
    [switch]$Parallel
)

# Colors for output
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"
$Cyan = "Cyan"

function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "[DOCKER] $Message" -ForegroundColor $Cyan
}

function Test-DockerRunning {
    try {
        docker info | Out-Null
        Write-Status "Docker is running"
        return $true
    }
    catch {
        Write-Error "Docker is not running. Please start Docker Desktop."
        return $false
    }
}

function Test-DockerCompose {
    try {
        docker-compose --version | Out-Null
        Write-Status "Docker Compose found"
        return $true
    }
    catch {
        Write-Error "Docker Compose not found. Please install Docker Desktop with Compose."
        return $false
    }
}

function Build-Images {
    Write-Status "Building Docker images..."
    
    # Create necessary directories
    New-Item -ItemType Directory -Force -Path "reports", "screenshots", "logs", "downloads", "docker-registry" | Out-Null
    
    # Build the main pytest image
    Write-Info "Building playwright-mcp-framework image..."
    docker build -f Dockerfile.playwright -t playwright-mcp-framework:local .
    
    if ($LASTEXITCODE -eq 0) {
        Write-Status "Images built successfully"
    }
    else {
        Write-Error "Failed to build images"
        exit 1
    }
}

function Start-Services {
    Write-Status "Starting Docker services..."
    
    # Create directories if they don't exist
    $directories = @("reports", "screenshots", "logs", "downloads", "docker-registry", "monitoring")
    foreach ($dir in $directories) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
    }
    
    Write-Info "Starting services with docker-compose..."
    docker-compose up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Status "Services started successfully"
        Show-ServiceStatus
        Show-AccessUrls
    }
    else {
        Write-Error "Failed to start services"
        exit 1
    }
}

function Stop-Services {
    Write-Status "Stopping Docker services..."
    docker-compose down
    
    if ($LASTEXITCODE -eq 0) {
        Write-Status "Services stopped successfully"
    }
    else {
        Write-Error "Failed to stop services"
    }
}

function Show-Logs {
    if ($Service) {
        Write-Info "Showing logs for service: $Service"
        docker-compose logs -f $Service
    }
    else {
        Write-Info "Showing logs for all services..."
        docker-compose logs -f
    }
}

function Show-ServiceStatus {
    Write-Status "Service Status:"
    docker-compose ps
    
    Write-Status "Container Health:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

function Show-AccessUrls {
    Write-Status "Access URLs:"
    Write-Host "  🌐 Selenium Grid Hub: " -NoNewline
    Write-Host "http://localhost:4444" -ForegroundColor Cyan
    
    Write-Host "  📊 Allure Reports: " -NoNewline
    Write-Host "http://localhost:5050" -ForegroundColor Cyan
    
    Write-Host "  📁 File Server: " -NoNewline
    Write-Host "http://localhost:8080" -ForegroundColor Cyan
    
    Write-Host "  📈 Grafana Dashboard: " -NoNewline
    Write-Host "http://localhost:3000 (admin/admin123)" -ForegroundColor Cyan
    
    Write-Host "  📊 Prometheus: " -NoNewline
    Write-Host "http://localhost:9090" -ForegroundColor Cyan
    
    Write-Host "  🐳 Local Registry: " -NoNewline
    Write-Host "http://localhost:5000" -ForegroundColor Cyan
}

function Run-Tests {
    Write-Status "Running tests in Docker container..."
    
    $testCommand = "npx playwright test --reporter=html"
    
    if ($Parallel) {
        $testCommand += " --workers=auto"
        Write-Info "Running tests in parallel mode"
    }
    
    Write-Info "Test command: $testCommand"
    
    docker-compose exec playwright-runner sh -c $testCommand
    
    if ($LASTEXITCODE -eq 0) {
        Write-Status "Tests completed successfully"
        Write-Info "View reports at: http://localhost:8080/reports/"
        Write-Info "View Allure reports at: http://localhost:5050"
    }
    else {
        Write-Warning "Tests completed with failures. Check logs and reports."
    }
}

function Clean-Environment {
    Write-Status "Cleaning up Docker environment..."
    
    # Stop and remove containers
    docker-compose down --volumes --remove-orphans
    
    # Remove custom images
    Write-Info "Removing custom images..."
    docker rmi playwright-mcp-framework:local -f 2>$null
    
    # Clean up directories (optional)
    $cleanup = Read-Host "Do you want to remove local data directories (reports, logs, etc.)? (y/N)"
    if ($cleanup -eq 'y' -or $cleanup -eq 'Y') {
        Remove-Item -Recurse -Force -Path "reports", "screenshots", "logs", "downloads", "docker-registry" -ErrorAction SilentlyContinue
        Write-Status "Local data directories cleaned"
    }
    
    Write-Status "Environment cleaned successfully"
}

function Wait-ForServices {
    Write-Status "Waiting for services to be ready..."
    
    $maxAttempts = 30
    $attempt = 0
    
    do {
        $attempt++
        Start-Sleep -Seconds 2
        
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:4444/wd/hub/status" -UseBasicParsing -TimeoutSec 5
            if ($response.StatusCode -eq 200) {
                Write-Status "Selenium Hub is ready!"
                return $true
            }
        }
        catch {
            Write-Host "." -NoNewline
        }
    } while ($attempt -lt $maxAttempts)
    
    Write-Error "Services failed to start within expected time"
    return $false
}

function Show-Help {
    Write-Host @"
Local Docker Deployment Script for Pytest UI Framework

Usage: .\deploy-local.ps1 [OPTIONS]

Options:
  -Build          Build Docker images
  -Up             Start all services
  -Down           Stop all services
  -Logs           Show logs (use -Service to specify service)
  -Status         Show service status
  -Test           Run tests (use -TestPath to specify path)
  -Parallel       Run tests in parallel mode
  -Clean          Clean up environment and images
  -Service <name> Specify service for logs/operations

Examples:
  .\deploy-local.ps1 -Build -Up          # Build and start services
  .\deploy-local.ps1 -Test               # Run all tests
  .\deploy-local.ps1 -Test -TestPath "tests/e2e/finance-e2e.spec.js"  # Run specific test
  .\deploy-local.ps1 -Logs -Service playwright-runner             # Show playwright logs
  .\deploy-local.ps1 -Status             # Show service status
  .\deploy-local.ps1 -Down -Clean        # Stop and clean everything

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
"@
}

# Main execution logic
function Main {
    if (-not $Build -and -not $Up -and -not $Down -and -not $Logs -and -not $Status -and -not $Clean -and -not $Test) {
        Show-Help
        return
    }
    
    # Pre-flight checks
    if (-not (Test-DockerRunning)) { return }
    if (-not (Test-DockerCompose)) { return }
    
    # Execute requested operations
    if ($Build) { Build-Images }
    if ($Up) { Start-Services; Wait-ForServices }
    if ($Test) { Run-Tests }
    if ($Logs) { Show-Logs }
    if ($Status) { Show-ServiceStatus; Show-AccessUrls }
    if ($Down) { Stop-Services }
    if ($Clean) { Clean-Environment }
}

# Run main function
Main
