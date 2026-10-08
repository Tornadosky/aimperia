# AimperiaEd Backend Deployment Script
# Usage: .\deploy.ps1

param(
    [switch]$SkipBuild,    # Skip Docker build (if image already built)
    [switch]$AutoDeploy,   # Enable auto-deployment on App Runner
    [string]$ImageTag = "latest"
)

Write-Host "🚀 Starting AimperiaEd Backend Deployment..." -ForegroundColor Cyan

# Load environment variables from deploy.env
if (Test-Path "deploy.env") {
    Write-Host "📋 Loading deployment configuration..." -ForegroundColor Yellow
    Get-Content "deploy.env" | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            Set-Item -Path "env:$($Matches[1])" -Value $Matches[2]
            Write-Host "  ✓ $($Matches[1])" -ForegroundColor Green
        }
    }
} else {
    Write-Host "❌ deploy.env file not found!" -ForegroundColor Red
    exit 1
}

# Validate required environment variables
$requiredVars = @("AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "ECR_URI", "SERVICE_ARN")
foreach ($var in $requiredVars) {
    if (-not (Get-Item "env:$var" -ErrorAction SilentlyContinue)) {
        Write-Host "❌ Required environment variable $var is missing!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Environment configuration loaded successfully" -ForegroundColor Green

try {
    # Step 1: Docker Build (unless skipped)
    if (-not $SkipBuild) {
        Write-Host "`n🔨 Step 1: Building Docker image..." -ForegroundColor Cyan
        $buildCommand = "docker build --no-cache -t $env:ECR_URI`:$ImageTag ."
        Write-Host "Running: $buildCommand" -ForegroundColor Gray
        Invoke-Expression $buildCommand
        if ($LASTEXITCODE -ne 0) { throw "Docker build failed" }
        Write-Host "✅ Docker image built successfully" -ForegroundColor Green
    } else {
        Write-Host "`n⏩ Step 1: Skipping Docker build (using existing image)" -ForegroundColor Yellow
    }

    # Step 2: ECR Login
    Write-Host "`n🔐 Step 2: Logging into ECR..." -ForegroundColor Cyan
    $password = aws ecr get-login-password --region $env:AWS_DEFAULT_REGION
    if ($LASTEXITCODE -ne 0) { throw "Failed to get ECR login password" }
    
    $loginCommand = "echo `"$password`" | docker login --username AWS --password-stdin $env:ECR_URI"
    Invoke-Expression $loginCommand
    if ($LASTEXITCODE -ne 0) { throw "ECR login failed" }
    Write-Host "✅ ECR login successful" -ForegroundColor Green

    # Step 3: Push to ECR
    Write-Host "`n📤 Step 3: Pushing image to ECR..." -ForegroundColor Cyan
    $pushCommand = "docker push $env:ECR_URI`:$ImageTag"
    Write-Host "Running: $pushCommand" -ForegroundColor Gray
    Invoke-Expression $pushCommand
    if ($LASTEXITCODE -ne 0) { throw "Docker push failed" }
    Write-Host "✅ Image pushed to ECR successfully" -ForegroundColor Green

    # Step 4: Deploy to App Runner
    Write-Host "`n🚀 Step 4: Deploying to App Runner..." -ForegroundColor Cyan
    $deployCommand = "aws apprunner start-deployment --service-arn `"$env:SERVICE_ARN`" --region $env:AWS_DEFAULT_REGION"
    Write-Host "Running: $deployCommand" -ForegroundColor Gray
    $deployResult = Invoke-Expression $deployCommand | ConvertFrom-Json
    if ($LASTEXITCODE -ne 0) { throw "App Runner deployment trigger failed" }
    
    $operationId = $deployResult.OperationId
    Write-Host "✅ Deployment triggered successfully (Operation ID: $operationId)" -ForegroundColor Green

    # Step 5: Monitor Deployment
    Write-Host "`n⏳ Step 5: Monitoring deployment status..." -ForegroundColor Cyan
    $maxWaitTime = 300  # 5 minutes
    $waitTime = 0
    $checkInterval = 10

    do {
        Start-Sleep -Seconds $checkInterval
        $waitTime += $checkInterval
        
        $status = aws apprunner describe-service --service-arn "$env:SERVICE_ARN" --region "$env:AWS_DEFAULT_REGION" --query "Service.Status" --output text
        Write-Host "  Status: $status (waited $waitTime seconds)" -ForegroundColor Yellow
        
        if ($status -eq "RUNNING") {
            Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
            break
        } elseif ($status -eq "CREATE_FAILED" -or $status -eq "UPDATE_FAILED") {
            throw "Deployment failed with status: $status"
        } elseif ($waitTime -ge $maxWaitTime) {
            Write-Host "⚠️  Deployment is taking longer than expected, but continuing..." -ForegroundColor Yellow
            break
        }
    } while ($true)

    # Step 6: Health Check
    Write-Host "`n🏥 Step 6: Running health check..." -ForegroundColor Cyan
    Start-Sleep -Seconds 5  # Give service a moment to fully start
    
    try {
        $healthCheck = curl -s -o /dev/null -w "%{http_code}" "https://$env:SERVICE_URL/health"
        if ($healthCheck -eq "200") {
            Write-Host "✅ Health check passed! Service is healthy" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Health check returned: $healthCheck" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️  Health check failed, but deployment may still be starting..." -ForegroundColor Yellow
    }

    # Step 7: Enable Auto-Deploy (if requested)
    if ($AutoDeploy) {
        Write-Host "`n🔄 Step 7: Enabling auto-deployment..." -ForegroundColor Cyan
        $autoDeployCommand = "aws apprunner update-service --service-arn `"$env:SERVICE_ARN`" --source-configuration `"{\`"AutoDeploymentsEnabled\`": true}`" --region $env:AWS_DEFAULT_REGION"
        Invoke-Expression $autoDeployCommand | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Auto-deployment enabled" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Failed to enable auto-deployment (non-critical)" -ForegroundColor Yellow
        }
    }

    # Final Summary
    Write-Host "`n🎉 DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    Write-Host "📋 Deployment Summary:" -ForegroundColor Cyan
    Write-Host "  🎯 Service ARN: $env:SERVICE_ARN" -ForegroundColor White
    Write-Host "  🌐 Service URL: https://$env:SERVICE_URL" -ForegroundColor White
    Write-Host "  🔗 Custom Domain: https://$env:DOMAIN_NAME" -ForegroundColor White
    Write-Host "  🔗 WWW Domain: https://$env:WWW_DOMAIN_NAME" -ForegroundColor White
    Write-Host "  🏥 Health Check: https://$env:SERVICE_URL/health" -ForegroundColor White
    Write-Host "  📦 Image: $env:ECR_URI`:$ImageTag" -ForegroundColor White
    
    if ($AutoDeploy) {
        Write-Host "  🔄 Auto-deployment: ENABLED" -ForegroundColor Green
    } else {
        Write-Host "  🔄 Auto-deployment: DISABLED (use -AutoDeploy to enable)" -ForegroundColor Yellow
    }
    
    Write-Host "`n💡 Next time, just run: .\deploy.ps1" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green

} catch {
    Write-Host "`n❌ DEPLOYMENT FAILED!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n🔍 Troubleshooting tips:" -ForegroundColor Yellow
    Write-Host "  1. Check your AWS credentials are valid" -ForegroundColor White
    Write-Host "  2. Ensure Docker Desktop is running" -ForegroundColor White
    Write-Host "  3. Verify deploy.env file contains correct values" -ForegroundColor White
    Write-Host "  4. Check AWS CloudWatch logs for App Runner service" -ForegroundColor White
    exit 1
} 