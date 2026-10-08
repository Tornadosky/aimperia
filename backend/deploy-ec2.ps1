# AimperiaEd Backend EC2 Deployment Script
# Usage: .\deploy-ec2.ps1
# Note: Requires EC2 instance with Docker installed and SSM agent

param(
    [switch]$SkipBuild,    # Skip Docker build (if image already built)
    [string]$ImageTag = "latest",
    [string]$InstanceId,   # EC2 Instance ID (optional, will read from env if not provided)
    [string]$ContainerName = "aimperiaed-backend",
    [int]$Port = 4000
)

Write-Host "🚀 Starting AimperiaEd Backend EC2 Deployment..." -ForegroundColor Cyan

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

# Use provided InstanceId or get from environment
if (-not $InstanceId) {
    $InstanceId = $env:EC2_INSTANCE_ID
}

# Validate required environment variables
$requiredVars = @("AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "ECR_URI", "EC2_INSTANCE_ID")
foreach ($var in $requiredVars) {
    if (-not (Get-Item "env:$var" -ErrorAction SilentlyContinue)) {
        Write-Host "❌ Required environment variable $var is missing!" -ForegroundColor Red
        exit 1
    }
}

if (-not $InstanceId) {
    Write-Host "❌ EC2_INSTANCE_ID not provided via parameter or environment variable!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Environment configuration loaded successfully" -ForegroundColor Green
Write-Host "🎯 Target EC2 Instance: $InstanceId" -ForegroundColor Cyan

try {
    # Step 1: Docker Build (unless skipped)
    if (-not $SkipBuild) {
        Write-Host "`n🔨 Step 1: Building Docker image..." -ForegroundColor Cyan
        $buildCommand = "docker build -t $env:ECR_URI`:$ImageTag ."
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

    # Step 4: Check EC2 Instance Status
    Write-Host "`n🔍 Step 4: Checking EC2 instance status..." -ForegroundColor Cyan
    $instanceStatus = aws ec2 describe-instances --instance-ids $InstanceId --region $env:AWS_DEFAULT_REGION --query "Reservations[0].Instances[0].State.Name" --output text
    if ($LASTEXITCODE -ne 0) { throw "Failed to check EC2 instance status" }
    
    if ($instanceStatus -ne "running") {
        Write-Host "❌ EC2 instance is not running (current state: $instanceStatus)" -ForegroundColor Red
        throw "EC2 instance must be in 'running' state"
    }
    Write-Host "✅ EC2 instance is running" -ForegroundColor Green

    # Step 5: Deploy to EC2
    Write-Host "`n🚀 Step 5: Deploying to EC2..." -ForegroundColor Cyan
    
    # Create deployment script commands as array to avoid JSON encoding issues
    $deployCommands = @(
        "#!/bin/bash",
        "set -e",
        "echo 'Logging into ECR...'",
        "aws ecr get-login-password --region $env:AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $env:ECR_URI",
        "echo 'Pulling latest image...'",
        "docker pull $env:ECR_URI`:$ImageTag",
        "echo 'Stopping existing container (if running)...'",
        "docker stop $ContainerName || true",
        "docker rm $ContainerName || true",
        "echo 'Starting new container...'",
        "docker run -d --name $ContainerName --restart unless-stopped -p $Port`:4000 --env-file /opt/aimperiaed/.env $env:ECR_URI`:$ImageTag",
        "echo 'Container started successfully'",
        "sleep 5",
        "if docker ps | grep -q $ContainerName; then",
        "  echo 'Container is running'",
        "  exit 0",
        "else",
        "  echo 'Container failed to start'",
        "  docker logs $ContainerName --tail 50",
        "  exit 1",
        "fi"
    )
    
    $deployScript = $deployCommands -join "`n"

    # Save deployment script to temp file
    $tempScript = [System.IO.Path]::GetTempFileName()
    $deployScript | Out-File -FilePath $tempScript -Encoding UTF8
    
    # Script generation completed
    
    # Execute deployment script on EC2 via SSM
    Write-Host "📤 Uploading and executing deployment script..." -ForegroundColor Gray
    
    # Create JSON input file for SSM using commands array directly
    $tempParamsFile = [System.IO.Path]::GetTempFileName()
    $ssmInput = @{
        InstanceIds = @($InstanceId)
        DocumentName = "AWS-RunShellScript"
        Parameters = @{
            commands = $deployCommands
        }
    } | ConvertTo-Json -Depth 3
    
    $ssmInput | Out-File -FilePath $tempParamsFile -Encoding UTF8
    
    $commandId = aws ssm send-command `
        --region $env:AWS_DEFAULT_REGION `
        --cli-input-json "file://$tempParamsFile" `
        --query "Command.CommandId" `
        --output text

    if ($LASTEXITCODE -ne 0) { throw "Failed to send deployment command to EC2" }
    Write-Host "✅ Deployment command sent (Command ID: $commandId)" -ForegroundColor Green

    # Clean up temp files
    Remove-Item $tempScript -Force
    Remove-Item $tempParamsFile -Force

    # Step 6: Monitor Deployment
    Write-Host "`n⏳ Step 6: Monitoring deployment..." -ForegroundColor Cyan
    $maxWaitTime = 180  # 3 minutes
    $waitTime = 0
    $checkInterval = 10

    do {
        Start-Sleep -Seconds $checkInterval
        $waitTime += $checkInterval
        
        $commandStatus = aws ssm get-command-invocation --command-id $commandId --instance-id $InstanceId --region $env:AWS_DEFAULT_REGION --query "Status" --output text
        Write-Host "  Command Status: $commandStatus (waited $waitTime seconds)" -ForegroundColor Yellow
        
        if ($commandStatus -eq "Success") {
            Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
            break
        } elseif ($commandStatus -eq "Failed") {
            # Get the error output
            $errorOutput = aws ssm get-command-invocation --command-id $commandId --instance-id $InstanceId --region $env:AWS_DEFAULT_REGION --query "StandardErrorContent" --output text
            Write-Host "❌ Deployment failed:" -ForegroundColor Red
            Write-Host $errorOutput -ForegroundColor Red
            throw "Deployment failed on EC2 instance"
        } elseif ($waitTime -ge $maxWaitTime) {
            Write-Host "⚠️ Deployment is taking longer than expected..." -ForegroundColor Yellow
            break
        }
    } while ($commandStatus -eq "InProgress")

    # Get deployment output
    $deployOutput = aws ssm get-command-invocation --command-id $commandId --instance-id $InstanceId --region $env:AWS_DEFAULT_REGION --query "StandardOutputContent" --output text
    Write-Host "`n📄 Deployment Output:" -ForegroundColor Cyan
    Write-Host $deployOutput -ForegroundColor White

    # Step 7: Health Check
    Write-Host "`n🏥 Step 7: Running health check..." -ForegroundColor Cyan
    
    # Get EC2 public IP for health check
    $publicIp = aws ec2 describe-instances --instance-ids $InstanceId --region $env:AWS_DEFAULT_REGION --query "Reservations[0].Instances[0].PublicIpAddress" --output text
    
    if ($publicIp -and $publicIp -ne "None") {
        Start-Sleep -Seconds 10  # Give service time to fully start
        
        try {
            $healthUrl = "http://$publicIp`:$Port/health"
            Write-Host "Testing: $healthUrl" -ForegroundColor Gray
            $healthCheck = Invoke-RestMethod -Uri $healthUrl -Method GET -TimeoutSec 10
            if ($healthCheck.status -eq "healthy") {
                Write-Host "✅ Health check passed! Service is healthy" -ForegroundColor Green
            } else {
                Write-Host "⚠️ Health check returned unexpected response" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "⚠️ Health check failed: $($_.Exception.Message)" -ForegroundColor Yellow
            Write-Host "💡 The service may still be starting up..." -ForegroundColor Cyan
        }
    } else {
        Write-Host "⚠️ No public IP found, skipping external health check" -ForegroundColor Yellow
    }

    # Final Summary
    Write-Host "`n🎉 EC2 DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    Write-Host "📋 Deployment Summary:" -ForegroundColor Cyan
    Write-Host "  🎯 EC2 Instance ID: $InstanceId" -ForegroundColor White
    Write-Host "  🌐 Public IP: $publicIp" -ForegroundColor White
    Write-Host "  🔌 Port: $Port" -ForegroundColor White
    Write-Host "  🐳 Container: $ContainerName" -ForegroundColor White
    Write-Host "  📦 Image: $env:ECR_URI`:$ImageTag" -ForegroundColor White
    
    if ($publicIp -and $publicIp -ne "None") {
        Write-Host "  🏥 Health Check: http://$publicIp`:$Port/health" -ForegroundColor White
        Write-Host "  🔌 WebSocket: ws://$publicIp`:$Port/connect/{roomId}" -ForegroundColor White
    }
    
    Write-Host "`n💡 To view logs: aws ssm start-session --target $InstanceId" -ForegroundColor Cyan
    Write-Host "💡 Then run: docker logs $ContainerName -f" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green

} catch {
    Write-Host "`n❌ EC2 DEPLOYMENT FAILED!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n🔍 Troubleshooting tips:" -ForegroundColor Yellow
    Write-Host "  1. Check EC2 instance has Docker installed and running" -ForegroundColor White
    Write-Host "  2. Verify SSM agent is installed and instance has proper IAM role" -ForegroundColor White
    Write-Host "  3. Ensure security group allows inbound traffic on port $Port" -ForegroundColor White
    Write-Host "  4. Check /opt/aimperiaed/.env file exists on EC2 with proper environment variables" -ForegroundColor White
    Write-Host "  5. Verify ECR permissions for the EC2 instance" -ForegroundColor White
    exit 1
}