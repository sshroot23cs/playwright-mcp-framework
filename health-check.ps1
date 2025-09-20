# Health Check Script for Local Docker Environment
# PowerShell version

param(
    [switch]$Detailed,
    [switch]$Wait,
    [int]$Timeout = 300
)

# Colors for output
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"
$Cyan = "Cyan"

function Write-Status {
    param([string]$Message)
    Write-Host "[HEALTH] $Message" -ForegroundColor $Green
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
    Write-Host "[INFO] $Message" -ForegroundColor $Cyan
}

function Test-ServiceHealth {
    param(
        [string]$ServiceName,
        [string]$Url,
        [string]$ExpectedContent = "",
        [int]$TimeoutSeconds = 10
    )
    
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec $TimeoutSeconds -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            if ($ExpectedContent -and $response.Content -notmatch $ExpectedContent) {
                Write-Warning "$ServiceName is responding but content doesn't match expected pattern"
                return $false
            }
            Write-Status "$ServiceName is healthy ✓"
            return $true
        }
        else {
            Write-Error "$ServiceName returned status code: $($response.StatusCode)"
            return $false
        }
    }
    catch {
        Write-Error "$ServiceName is not responding: $($_.Exception.Message)"
        return $false
    }
}

function Test-ContainerHealth {
    Write-Info "Checking container health..."
    
    $containers = docker ps --format "{{.Names}};{{.Status}}" | ForEach-Object {
        $parts = $_ -split ";"
        [PSCustomObject]@{
            Name = $parts[0]
            Status = $parts[1]
        }
    }
    
    $healthyContainers = 0
    $totalContainers = $containers.Count
    
    foreach ($container in $containers) {
        if ($container.Status -match "Up|healthy") {
            Write-Status "Container $($container.Name): $($container.Status) ✓"
            $healthyContainers++
        }
        else {
            Write-Error "Container $($container.Name): $($container.Status) ✗"
        }
    }
    
    Write-Info "Container Health: $healthyContainers/$totalContainers healthy"
    return ($healthyContainers -eq $totalContainers)
}

function Test-NetworkConnectivity {
    Write-Info "Testing network connectivity..."
    
    $services = @(
        @{ Name = "Playwright Runner"; Url = "http://localhost:8080"; Content = "" },
        @{ Name = "File Server"; Url = "http://localhost:8080"; Content = "" },
        @{ Name = "Allure Server"; Url = "http://localhost:5050"; Content = "" },
        @{ Name = "Prometheus"; Url = "http://localhost:9090/-/healthy"; Content = "" },
        @{ Name = "Grafana"; Url = "http://localhost:3000/api/health"; Content = "" },
        @{ Name = "Local Registry"; Url = "http://localhost:5000/v2/"; Content = "" }
    )
    
    $healthyServices = 0
    
    foreach ($service in $services) {
        if (Test-ServiceHealth -ServiceName $service.Name -Url $service.Url -ExpectedContent $service.Content) {
            $healthyServices++
        }
    }
    
    Write-Info "Service Health: $healthyServices/$($services.Count) services healthy"
    return ($healthyServices -eq $services.Count)
}

function Test-PlaywrightRunner {
    Write-Info "Testing Selenium Grid configuration..."
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:4444/wd/hub/status" -TimeoutSec 10
        
        if ($response.value.ready) {
            Write-Status "Playwright Runner is ready ✓"
            
            # Check for available nodes
            $nodesResponse = Invoke-RestMethod -Uri "http://localhost:4444/grid/api/hub" -TimeoutSec 10
            $nodeCount = $nodesResponse.slotCounts.total
            
            Write-Status "Available browser slots: $nodeCount ✓"
            
            if ($Detailed) {
                Write-Info "Grid Details:"
                Write-Host "  - Total Slots: $($nodesResponse.slotCounts.total)"
                Write-Host "  - Used Slots: $($nodesResponse.slotCounts.used)"
                Write-Host "  - Free Slots: $($nodesResponse.slotCounts.free)"
            }
            
            return $true
        }
        else {
            Write-Error "Playwright Runner is not ready"
            return $false
        }
    }
    catch {
        Write-Error "Failed to connect to Playwright Runner: $($_.Exception.Message)"
        return $false
    }
}

function Test-MonitoringStack {
    Write-Info "Testing monitoring stack..."
    
    $monitoringHealthy = $true
    
    # Test Prometheus
    try {
        $promResponse = Invoke-RestMethod -Uri "http://localhost:9090/api/v1/query?query=up" -TimeoutSec 10
        if ($promResponse.status -eq "success") {
            Write-Status "Prometheus is collecting metrics ✓"
            
            if ($Detailed) {
                $upTargets = ($promResponse.data.result | Where-Object { $_.value[1] -eq "1" }).Count
                $totalTargets = $promResponse.data.result.Count
                Write-Info "Prometheus targets: $upTargets/$totalTargets up"
            }
        }
        else {
            Write-Error "Prometheus query failed"
            $monitoringHealthy = $false
        }
    }
    catch {
        Write-Error "Prometheus health check failed: $($_.Exception.Message)"
        $monitoringHealthy = $false
    }
    
    # Test Grafana
    try {
        $grafanaResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -TimeoutSec 10
        if ($grafanaResponse.database -eq "ok") {
            Write-Status "Grafana is healthy ✓"
        }
        else {
            Write-Error "Grafana database check failed"
            $monitoringHealthy = $false
        }
    }
    catch {
        Write-Error "Grafana health check failed: $($_.Exception.Message)"
        $monitoringHealthy = $false
    }
    
    return $monitoringHealthy
}

function Show-EnvironmentSummary {
    Write-Info "Environment Summary:"
    
    try {
        $compose = docker-compose ps --format json | ConvertFrom-Json
        $runningServices = ($compose | Where-Object { $_.State -eq "running" }).Count
        $totalServices = $compose.Count
        
        Write-Host "  Services: $runningServices/$totalServices running"
        
        # Disk usage
        $reports = Get-ChildItem -Path "reports" -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum
        $reportSize = if ($reports.Sum) { [math]::Round($reports.Sum / 1MB, 2) } else { 0 }
        Write-Host "  Reports size: $reportSize MB"
        
        # Last test run
        $lastReport = Get-ChildItem -Path "reports" -Filter "*.html" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
        if ($lastReport) {
            Write-Host "  Last test run: $($lastReport.LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss'))"
        }
        
    }
    catch {
        Write-Warning "Could not gather complete environment summary"
    }
}

function Wait-ForHealthy {
    param([int]$TimeoutSeconds)
    
    Write-Info "Waiting for environment to become healthy (timeout: ${TimeoutSeconds}s)..."
    
    $startTime = Get-Date
    $attempt = 0
    
    do {
        $attempt++
        Write-Host "Health check attempt $attempt..." -NoNewline
        
        $containerHealth = Test-ContainerHealth
        $networkHealth = Test-NetworkConnectivity
        $seleniumHealth = Test-PlaywrightRunner
        
        if ($containerHealth -and $networkHealth -and $seleniumHealth) {
            Write-Host " SUCCESS" -ForegroundColor Green
            Write-Status "Environment is healthy!"
            return $true
        }
        else {
            Write-Host " WAITING" -ForegroundColor Yellow
            Start-Sleep -Seconds 5
        }
        
        $elapsed = (Get-Date) - $startTime
    } while ($elapsed.TotalSeconds -lt $TimeoutSeconds)
    
    Write-Error "Environment failed to become healthy within $TimeoutSeconds seconds"
    return $false
}

function Main {
    Write-Status "Starting health check for local Docker environment..."
    
    if ($Wait) {
        $result = Wait-ForHealthy -TimeoutSeconds $Timeout
        if (-not $result) { exit 1 }
    }
    else {
        # Quick health check
        $containerHealth = Test-ContainerHealth
        $networkHealth = Test-NetworkConnectivity
        $seleniumHealth = Test-PlaywrightRunner
        
        if ($Detailed) {
            $monitoringHealth = Test-MonitoringStack
            Show-EnvironmentSummary
        }
        
        $overallHealth = $containerHealth -and $networkHealth -and $seleniumHealth
        
        if ($overallHealth) {
            Write-Status "Overall environment health: HEALTHY ✓"
            exit 0
        }
        else {
            Write-Error "Overall environment health: UNHEALTHY ✗"
            exit 1
        }
    }
}

# Run main function
Main
