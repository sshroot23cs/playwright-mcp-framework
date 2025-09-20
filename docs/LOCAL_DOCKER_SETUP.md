# Local Docker Environment - Quick Start Guide

## Overview
This local Docker setup provides a complete testing environment that mirrors our Azure cloud deployment. It includes Selenium Grid, monitoring, reporting, and all the tools needed for comprehensive UI testing.

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed and running
- PowerShell (Windows) or Bash (Linux/macOS)
- At least 4GB RAM available for containers

### 1. One-Command Setup
```powershell
# Windows PowerShell
.\deploy-local.ps1 -Build -Up

# Linux/macOS
./deploy-local.sh --build --up
```

### 2. Run Tests
```powershell
# Run all tests
.\deploy-local.ps1 -Test

# Run specific test file
.\deploy-local.ps1 -Test -TestPath "tests/test_e2e_search.py"

# Run tests in parallel
.\deploy-local.ps1 -Test -Parallel
```

### 3. Access Services
After startup, access these URLs:
- 🌐 **Selenium Grid**: http://localhost:4444
- 📊 **Test Reports**: http://localhost:8080/reports/
- 📈 **Allure Reports**: http://localhost:5050
- 📊 **Grafana Dashboard**: http://localhost:3000 (admin/admin123)
- 🔍 **Prometheus**: http://localhost:9090

## 📋 Available Commands

### Windows PowerShell Commands
```powershell
# Build and start everything
.\deploy-local.ps1 -Build -Up

# Run tests
.\deploy-local.ps1 -Test
.\deploy-local.ps1 -Test -TestPath "tests/test_sample_01.py"
.\deploy-local.ps1 -Test -Parallel

# Monitor services
.\deploy-local.ps1 -Status
.\deploy-local.ps1 -Logs
.\deploy-local.ps1 -Logs -Service pytest-runner

# Health check
.\health-check.ps1
.\health-check.ps1 -Detailed
.\health-check.ps1 -Wait -Timeout 300

# Cleanup
.\deploy-local.ps1 -Down
.\deploy-local.ps1 -Clean
```

### Linux/macOS Commands
```bash
# Build and start everything
./deploy-local.sh --build --up

# Run tests
./deploy-local.sh --test
./deploy-local.sh --test --test-path "tests/test_sample_01.py"
./deploy-local.sh --test --parallel

# Monitor services
./deploy-local.sh --status
./deploy-local.sh --logs
./deploy-local.sh --logs --service pytest-runner

# Cleanup
./deploy-local.sh --down
./deploy-local.sh --clean
```

## 🏗️ Architecture

### Services Overview
| Service | Purpose | Port | Health Check |
|---------|---------|------|--------------|
| **pytest-runner** | Main test execution | - | Container status |
| **selenium-hub** | Selenium Grid hub | 4444 | http://localhost:4444/wd/hub/status |
| **selenium-chrome-1** | Chrome browser node | - | Grid registration |
| **selenium-chrome-2** | Chrome browser node | - | Grid registration |
| **selenium-firefox** | Firefox browser node | - | Grid registration |
| **file-server** | Reports and files | 8080 | http://localhost:8080 |
| **allure-server** | Allure reporting | 5050 | http://localhost:5050 |
| **local-registry** | Container registry | 5000 | http://localhost:5000/v2/ |
| **prometheus** | Metrics collection | 9090 | http://localhost:9090/-/healthy |
| **grafana** | Monitoring dashboard | 3000 | http://localhost:3000/api/health |

### Volume Mounts
- `./reports` → Container reports directory
- `./screenshots` → Test screenshots
- `./logs` → Container logs
- `./monitoring` → Grafana/Prometheus configs

## 🔧 Configuration

### Environment Variables
Key environment variables in `docker-compose.yml`:
- `SELENIUM_HUB_HOST=selenium-hub`
- `ALLURE_RESULTS_PATH=/app/reports/allure-results`
- `PYTEST_WORKERS=auto` (for parallel execution)

### Resource Limits
Default resource limits per service:
- **pytest-runner**: 2GB RAM, 2 CPUs
- **selenium nodes**: 1GB RAM, 1 CPU each
- **monitoring**: 512MB RAM, 0.5 CPU each

## 📊 Monitoring and Reporting

### Test Reports
1. **HTML Reports**: http://localhost:8080/reports/html/
2. **Allure Reports**: http://localhost:5050
3. **JUnit XML**: `./reports/junit-report.xml`
4. **Screenshots**: `./screenshots/`

### Monitoring Dashboard
Access Grafana at http://localhost:3000:
- **Username**: admin
- **Password**: admin123

Dashboard includes:
- Container resource usage
- Selenium Grid status
- Test execution metrics
- Network and disk I/O

### Log Management
```powershell
# View all logs
.\deploy-local.ps1 -Logs

# View specific service logs
.\deploy-local.ps1 -Logs -Service pytest-runner
.\deploy-local.ps1 -Logs -Service selenium-hub

# Follow logs in real-time
docker-compose logs -f pytest-runner
```

## 🚨 Troubleshooting

### Common Issues

1. **Services not starting**
   ```powershell
   # Check Docker is running
   docker info
   
   # Check logs
   .\deploy-local.ps1 -Logs
   ```

2. **Tests failing to connect to Selenium**
   ```powershell
   # Check Selenium Grid status
   .\health-check.ps1 -Detailed
   
   # Restart Selenium services
   docker-compose restart selenium-hub selenium-chrome-1
   ```

3. **Out of memory errors**
   ```powershell
   # Check resource usage
   docker stats
   
   # Reduce parallel workers in pytest.ini
   # addopts = -n 2  # Instead of -n auto
   ```

4. **Port conflicts**
   ```powershell
   # Check what's using ports
   netstat -an | findstr "4444"
   netstat -an | findstr "8080"
   
   # Stop conflicting services or change ports in docker-compose.yml
   ```

### Health Checks
```powershell
# Quick health check
.\health-check.ps1

# Detailed health check
.\health-check.ps1 -Detailed

# Wait for services to be ready
.\health-check.ps1 -Wait -Timeout 300
```

### Recovery Commands
```powershell
# Complete reset
.\deploy-local.ps1 -Down -Clean
.\deploy-local.ps1 -Build -Up

# Restart specific service
docker-compose restart selenium-hub

# Rebuild single service
docker-compose build pytest-runner
docker-compose up -d pytest-runner
```

## 🔄 Development Workflow

### Typical Testing Session
1. **Start environment**: `.\deploy-local.ps1 -Build -Up`
2. **Wait for ready**: `.\health-check.ps1 -Wait`
3. **Run tests**: `.\deploy-local.ps1 -Test`
4. **View results**: http://localhost:8080/reports/
5. **Monitor**: http://localhost:3000
6. **Debug**: `.\deploy-local.ps1 -Logs -Service pytest-runner`
7. **Cleanup**: `.\deploy-local.ps1 -Down`

### Code Changes
When you modify test code:
```powershell
# Rebuild and restart pytest container
docker-compose build pytest-runner
docker-compose up -d pytest-runner

# Or restart entire stack
.\deploy-local.ps1 -Down
.\deploy-local.ps1 -Up
```

### Adding New Tests
1. Add test files to `tests/` directory
2. Update test paths in commands:
   ```powershell
   .\deploy-local.ps1 -Test -TestPath "tests/test_new_feature.py"
   ```

## 📁 File Structure
```
pytest_ui_framework/
├── deploy-local.ps1          # Windows deployment script
├── deploy-local.sh           # Linux/macOS deployment script
├── health-check.ps1          # Health monitoring script
├── docker-compose.yml        # Service definitions
├── Dockerfile.local          # Local development container
├── reports/                  # Test reports output
├── screenshots/              # Test screenshots
├── logs/                     # Container logs
├── monitoring/               # Grafana/Prometheus configs
└── src/                      # Test framework source
```

## 🌟 Best Practices

### Performance
- Use `-Parallel` flag for faster test execution
- Monitor resource usage with `docker stats`
- Clean up old reports periodically

### Debugging
- Use `.\health-check.ps1 -Detailed` for comprehensive status
- Check individual service logs for specific issues
- Access Selenium Grid UI for browser session monitoring

### Maintenance
- Run `.\deploy-local.ps1 -Clean` periodically to free disk space
- Update Docker images regularly
- Monitor log file sizes in `./logs/` directory

## 🔗 Related Documentation
- [Azure Deployment Guide](docs/AZURE_DEPLOYMENT.md)
- [Framework README](README.md)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Selenium Grid Documentation](https://selenium-python.readthedocs.io/)