# Azure Container Deployment Guide for Pytest UI Framework

## Overview
This guide demonstrates how to deploy your pytest UI automation framework to Azure Container Instances using MCP server integration. The deployment includes:

- Containerized test execution environment
- Azure Container Registry for image storage
- Azure Storage for test results and reports
- Log Analytics for monitoring
- Automated deployment scripts

## Prerequisites

### Local Requirements
- Docker Desktop installed and running
- Azure CLI installed (`az --version`)
- Valid Azure subscription
- PowerShell (Windows) or Bash (Linux/macOS)

### Azure Requirements
- Azure subscription with Contributor access
- Resource group creation permissions
- Container Registry and Container Instance permissions

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Azure Resource Group                     │
│                                                             │
│  ┌─────────────────┐  ┌──────────────────┐                │
│  │ Container       │  │ Container        │                │
│  │ Registry (ACR)  │  │ Instance (ACI)   │                │
│  │                 │  │                  │                │
│  │ • Docker Images │  │ • Pytest Runner │                │
│  │ • Version Tags  │  │ • Selenium Grid  │                │
│  └─────────────────┘  │ • Chrome/Firefox │                │
│                       └──────────────────┘                │
│                                                             │
│  ┌─────────────────┐  ┌──────────────────┐                │
│  │ Storage Account │  │ Log Analytics    │                │
│  │                 │  │ Workspace        │                │
│  │ • Test Reports  │  │                  │                │
│  │ • Screenshots   │  │ • Container Logs │                │
│  │ • Allure Data   │  │ • Metrics        │                │
│  └─────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

## Step-by-Step Deployment

### 1. Prepare Your Environment

```powershell
# Clone or navigate to your pytest framework
cd c:\Users\Sushrut\gitrepos\pytest_ui_framework

# Ensure Docker is running
docker --version

# Login to Azure
az login

# Set your subscription (optional)
az account set --subscription "your-subscription-id"
```

### 2. Configure Deployment Parameters

Edit `infra/main.parameters.json`:

```json
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentParameters.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "namePrefix": {
      "value": "pytest-ui"
    },
    "location": {
      "value": "East US"
    },
    "environment": {
      "value": "dev"
    }
  }
}
```

### 3. Run Deployment Script

#### Windows (PowerShell):
```powershell
# Run deployment with preview
.\deploy-azure.ps1 -Preview

# Run full deployment
.\deploy-azure.ps1

# Run deployment with custom parameters
.\deploy-azure.ps1 -ResourceGroupName "my-test-rg" -Location "westus2"
```

#### Linux/macOS (Bash):
```bash
# Make script executable
chmod +x deploy-azure.sh

# Run deployment
./deploy-azure.sh
```

### 4. Monitor Deployment

The script will:
1. ✅ Validate your Azure login
2. ✅ Create resource group
3. ✅ Validate Bicep template
4. ✅ Show deployment preview (if requested)
5. ✅ Deploy infrastructure
6. ✅ Build and push Docker image
7. ✅ Trigger test execution
8. ✅ Display results URL

### 5. Monitor Test Execution

```bash
# View container logs
az container logs \
  --resource-group pytest-ui-framework-rg \
  --name pytest-ui-dev-container-group \
  --follow

# Check container status
az container show \
  --resource-group pytest-ui-framework-rg \
  --name pytest-ui-dev-container-group \
  --query instanceView.state
```

## Azure Resources Created

| Resource Type | Purpose | Configuration |
|--------------|---------|---------------|
| **Container Registry** | Store Docker images | Basic SKU, Admin enabled |
| **Container Instance** | Run pytest tests | 2 CPU, 4GB RAM, Linux |
| **Storage Account** | Store test results | Standard_LRS, Hot tier |
| **Log Analytics** | Monitor containers | 30-day retention |
| **File Share** | Persistent storage | 100GB quota |
| **Blob Container** | Public test reports | Public blob access |

## Environment Variables

The container runs with these environment variables:

```bash
AZURE_STORAGE_ACCOUNT=<storage-account-name>
AZURE_STORAGE_KEY=<storage-key>
ENVIRONMENT=dev
HEADLESS=true
CHROME_ARGS=--no-sandbox --disable-dev-shm-usage --disable-gpu
```

## Test Execution Options

### Run Specific Tests
```bash
# Restart container with custom command
az container exec \
  --resource-group pytest-ui-framework-rg \
  --name pytest-ui-dev-container-group \
  --container-name pytest-ui-framework \
  --exec-command "python -m pytest tests/test_e2e_search.py -v"
```

### Upload Results to Azure Storage
```bash
# Enable Azure upload in container
az container exec \
  --resource-group pytest-ui-framework-rg \
  --name pytest-ui-dev-container-group \
  --container-name pytest-ui-framework \
  --exec-command "python -m pytest tests/ --azure-upload"
```

## Accessing Test Results

### 1. Azure Storage Explorer
- Navigate to your storage account
- Open `test-reports` container
- Download test results and screenshots

### 2. Direct Blob URL
```
https://<storage-account>.blob.core.windows.net/test-reports/
```

### 3. Azure Portal
- Go to Container Instances
- Select your container group
- View logs and metrics

## Cost Optimization

### Container Instance Pricing
- **Development**: 2 CPU, 4GB RAM ≈ $0.10/hour
- **Testing**: Scale up during test runs only
- **Production**: Use Azure Container Apps for better scaling

### Storage Costs
- **Blob Storage**: ~$0.02/GB/month
- **File Share**: ~$0.15/GB/month
- **Log Analytics**: ~$2.76/GB ingested

## Troubleshooting

### Common Issues

#### Docker Build Fails
```bash
# Check Docker service
docker info

# Build locally first
docker build -t pytest-ui-framework:latest .
```

#### Container Startup Fails
```bash
# Check container logs
az container logs --resource-group pytest-ui-framework-rg --name <container-group>

# Common causes:
# - Chrome not installed correctly
# - Missing dependencies
# - Incorrect environment variables
```

#### Tests Fail in Container
```bash
# Common Chrome issues in containers:
# Add to Dockerfile:
ENV CHROME_ARGS="--no-sandbox --disable-dev-shm-usage --disable-gpu"
```

### Debug Commands

```bash
# List all resources
az resource list --resource-group pytest-ui-framework-rg --output table

# Get container details
az container show --resource-group pytest-ui-framework-rg --name <container-group>

# Stream logs
az container logs --resource-group pytest-ui-framework-rg --name <container-group> --follow
```

## Cleanup

### Remove All Resources
```powershell
# PowerShell
.\deploy-azure.ps1 -Cleanup

# Or manually
az group delete --name pytest-ui-framework-rg --yes
```

### Remove Specific Resources
```bash
# Delete container instance only
az container delete --resource-group pytest-ui-framework-rg --name <container-group>

# Delete storage account only
az storage account delete --name <storage-account> --resource-group pytest-ui-framework-rg
```

## Next Steps

1. **CI/CD Integration**: Integrate with Azure DevOps or GitHub Actions
2. **Scaling**: Move to Azure Container Apps for auto-scaling
3. **Monitoring**: Set up Azure Monitor alerts and dashboards
4. **Security**: Implement Azure Key Vault for secrets management
5. **Multi-Environment**: Deploy to staging/production environments

## Support

For issues with:
- **Azure resources**: Check Azure Portal diagnostic settings
- **Container execution**: Review container logs
- **Test framework**: Check pytest and Selenium logs
- **Deployment scripts**: Verify Azure CLI version and permissions

---

**Azure MCP Integration Complete!** 🎉

Your pytest UI framework is now running in the cloud with full Azure integration for scalable, automated testing.