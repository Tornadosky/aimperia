# Agora Cloud Recording - AWS S3 Setup Script for Windows
# This script creates an S3 bucket and IAM user with proper permissions for Agora Cloud Recording
# Run this script in PowerShell with Administrator privileges

param(
    [Parameter(Mandatory=$false)]
    [string]$Region = "us-east-2",
    
    [Parameter(Mandatory=$false)]
    [string]$BucketName = "my-agora-recordings-$(Get-Random -Minimum 1000 -Maximum 9999)",
    
    [Parameter(Mandatory=$false)]
    [string]$IAMUserName = "agora-recording-user"
)

# Colors for output
$Red = "`e[31m"
$Green = "`e[32m"
$Yellow = "`e[33m"
$Blue = "`e[34m"
$Reset = "`e[0m"

function Write-Info {
    param([string]$Message)
    Write-Host "$Blue[INFO]$Reset $Message"
}

function Write-Success {
    param([string]$Message)
    Write-Host "$Green[SUCCESS]$Reset $Message"
}

function Write-Warning {
    param([string]$Message)
    Write-Host "$Yellow[WARNING]$Reset $Message"
}

function Write-Error {
    param([string]$Message)
    Write-Host "$Red[ERROR]$Reset $Message"
}

function Test-AWSCLIInstalled {
    try {
        $version = aws --version 2>$null
        if ($version) {
            Write-Success "AWS CLI is installed: $version"
            return $true
        }
    }
    catch {
        Write-Error "AWS CLI is not installed or not in PATH"
        Write-Info "Please install AWS CLI: https://aws.amazon.com/cli/"
        return $false
    }
}

function Test-AWSCredentials {
    try {
        $identity = aws sts get-caller-identity --output json 2>$null | ConvertFrom-Json
        if ($identity) {
            Write-Success "AWS credentials configured for: $($identity.Arn)"
            return $true
        }
    }
    catch {
        Write-Error "AWS credentials not configured"
        Write-Info "Run: aws configure"
        return $false
    }
}

function Test-ResourceExists {
    param([string]$ResourceType, [string]$ResourceName)
    
    switch ($ResourceType) {
        "bucket" {
            try {
                aws s3api head-bucket --bucket $ResourceName 2>$null
                return $?
            }
            catch {
                return $false
            }
        }
        "user" {
            try {
                aws iam get-user --user-name $ResourceName 2>$null | Out-Null
                return $?
            }
            catch {
                return $false
            }
        }
    }
}

# Main execution starts here
Write-Info "=== Agora Cloud Recording - AWS S3 Setup ==="
Write-Info "Region: $Region"
Write-Info "Bucket Name: $BucketName"
Write-Info "IAM User: $IAMUserName"
Write-Info ""

# Step 1: Verify prerequisites
Write-Info "Step 1: Verifying prerequisites..."
if (-not (Test-AWSCLIInstalled)) {
    exit 1
}

if (-not (Test-AWSCredentials)) {
    exit 1
}

# Step 2: Create S3 bucket
Write-Info "Step 2: Creating S3 bucket..."
if (Test-ResourceExists "bucket" $BucketName) {
    Write-Warning "S3 bucket '$BucketName' already exists. Skipping creation."
} else {
    try {
        # Create bucket with proper region configuration
        if ($Region -eq "us-east-1") {
            # us-east-1 doesn't need location constraint
            aws s3api create-bucket --bucket $BucketName --region $Region
        } else {
            # Other regions need location constraint
            aws s3api create-bucket --bucket $BucketName --region $Region --create-bucket-configuration LocationConstraint=$Region
        }
        
        if ($?) {
            Write-Success "S3 bucket '$BucketName' created successfully"
        } else {
            throw "Failed to create bucket"
        }
    }
    catch {
        Write-Error "Failed to create S3 bucket: $_"
        exit 1
    }
}

# Step 3: Configure bucket versioning (best practice)
Write-Info "Step 3: Enabling S3 bucket versioning..."
try {
    aws s3api put-bucket-versioning --bucket $BucketName --versioning-configuration Status=Enabled
    if ($?) {
        Write-Success "Bucket versioning enabled"
    }
}
catch {
    Write-Warning "Failed to enable versioning: $_"
}

# Step 4: Configure bucket encryption (best practice)
Write-Info "Step 4: Enabling S3 bucket encryption..."
try {
    $encryptionConfig = @{
        Rules = @(
            @{
                ApplyServerSideEncryptionByDefault = @{
                    SSEAlgorithm = "AES256"
                }
                BucketKeyEnabled = $true
            }
        )
    } | ConvertTo-Json -Depth 10 -Compress

    $encryptionConfig | aws s3api put-bucket-encryption --bucket $BucketName --server-side-encryption-configuration file://
    if ($?) {
        Write-Success "Bucket encryption enabled"
    }
}
catch {
    Write-Warning "Failed to enable encryption: $_"
}

# Step 4.5: Check bucket ownership settings for ACL compatibility
Write-Info "Step 4.5: Checking bucket ownership settings..."
try {
    $ownership = aws s3api get-bucket-ownership-controls --bucket $BucketName --output json 2>$null | ConvertFrom-Json
    $ownershipType = $ownership.OwnershipControls.Rules[0].ObjectOwnership
    
    if ($ownershipType -eq "BucketOwnerEnforced") {
        Write-Warning "Bucket has ACLs disabled (Object Ownership = BucketOwnerEnforced)"
        Write-Warning "This is FINE for modern S3 usage and Agora compatibility"
        Write-Warning "Note: s3:PutObjectAcl permission may not be needed in this configuration"
    } else {
        Write-Success "Bucket allows ACLs (Object Ownership = $ownershipType)"
    }
}
catch {
    Write-Info "Could not determine bucket ownership settings - this is normal for older buckets"
}

# Step 5: Create IAM user
Write-Info "Step 5: Creating IAM user..."
if (Test-ResourceExists "user" $IAMUserName) {
    Write-Warning "IAM user '$IAMUserName' already exists. Skipping creation."
} else {
    try {
        aws iam create-user --user-name $IAMUserName --path "/agora/"
        if ($?) {
            Write-Success "IAM user '$IAMUserName' created successfully"
        } else {
            throw "Failed to create user"
        }
    }
    catch {
        Write-Error "Failed to create IAM user: $_"
        exit 1
    }
}

# Step 6: Create IAM policy for specific bucket access
Write-Info "Step 6: Creating IAM policy for S3 access..."
Write-Info "Required Agora permissions: ListBucket, GetBucketLocation, PutObject, PutObjectAcl"
$policyName = "AgoraRecordingS3Policy"
$policyDocument = @{
    Version = "2012-10-17"
    Statement = @(
        @{
            Effect = "Allow"
            Action = @(
                "s3:ListBucket",
                "s3:GetBucketLocation",
                "s3:PutObject",
                "s3:PutObjectAcl",
                "s3:GetObject",
                "s3:GetObjectAcl",
                "s3:DeleteObject"
            )
            Resource = @(
                "arn:aws:s3:::$BucketName",
                "arn:aws:s3:::$BucketName/*"
            )
        }
    )
} | ConvertTo-Json -Depth 10

try {
    # Create the policy file temporarily
    $policyFile = "agora-s3-policy.json"
    $policyDocument | Out-File -FilePath $policyFile -Encoding utf8
    
    # Create or update the policy
    $policyArn = "arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):policy/$policyName"
    
    # Check if policy exists
    try {
        aws iam get-policy --policy-arn $policyArn 2>$null | Out-Null
        if ($?) {
            # Policy exists, create a new version
            aws iam create-policy-version --policy-arn $policyArn --policy-document file://$policyFile --set-as-default
            Write-Success "IAM policy updated"
        }
    }
    catch {
        # Policy doesn't exist, create it
        aws iam create-policy --policy-name $policyName --policy-document file://$policyFile --path "/agora/"
        if ($?) {
            Write-Success "IAM policy '$policyName' created successfully"
        } else {
            throw "Failed to create policy"
        }
    }
    
    # Clean up policy file
    Remove-Item $policyFile -Force
}
catch {
    Write-Error "Failed to create IAM policy: $_"
    if (Test-Path $policyFile) {
        Remove-Item $policyFile -Force
    }
    exit 1
}

# Step 7: Attach policy to user
Write-Info "Step 7: Attaching policy to user..."
try {
    $policyArn = "arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):policy/$policyName"
    aws iam attach-user-policy --user-name $IAMUserName --policy-arn $policyArn
    if ($?) {
        Write-Success "Policy attached to user successfully"
    } else {
        throw "Failed to attach policy"
    }
}
catch {
    Write-Error "Failed to attach policy to user: $_"
    exit 1
}

# Step 8: Create access keys
Write-Info "Step 8: Creating access keys..."
try {
    $accessKeyResult = aws iam create-access-key --user-name $IAMUserName --output json | ConvertFrom-Json
    if ($accessKeyResult) {
        $accessKeyId = $accessKeyResult.AccessKey.AccessKeyId
        $secretAccessKey = $accessKeyResult.AccessKey.SecretAccessKey
        
        Write-Success "Access keys created successfully!"
        Write-Info ""
        Write-Info "=== AGORA ENVIRONMENT VARIABLES ==="
        Write-Success "AGORA_STORAGE_VENDOR=1"
        Write-Success "AGORA_STORAGE_REGION=$Region"
        Write-Success "AGORA_STORAGE_BUCKET=$BucketName"
        Write-Success "AGORA_STORAGE_ACCESS_KEY=$accessKeyId"
        Write-Success "AGORA_STORAGE_SECRET_KEY=$secretAccessKey"
        Write-Info ""
        
        # Save to .env file
        $envContent = @"
# Agora Cloud Recording S3 Configuration
AGORA_STORAGE_VENDOR=1
AGORA_STORAGE_REGION=$Region
AGORA_STORAGE_BUCKET=$BucketName
AGORA_STORAGE_ACCESS_KEY=$accessKeyId
AGORA_STORAGE_SECRET_KEY=$secretAccessKey
"@
        
        $envContent | Out-File -FilePath "agora-s3-config.env" -Encoding utf8
        Write-Success "Configuration saved to: agora-s3-config.env"
        
    } else {
        throw "Failed to create access keys"
    }
}
catch {
    Write-Error "Failed to create access keys: $_"
    exit 1
}

# Step 9: Test S3 access
Write-Info "Step 9: Testing S3 access..."
try {
    # Set environment variables for test
    $env:AWS_ACCESS_KEY_ID = $accessKeyId
    $env:AWS_SECRET_ACCESS_KEY = $secretAccessKey
    $env:AWS_DEFAULT_REGION = $Region
    
    # Create a test file
    $testFile = "agora-test-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"
    "This is a test file for Agora Cloud Recording setup" | Out-File -FilePath $testFile -Encoding utf8
    
    # Upload test file
    aws s3 cp $testFile "s3://$BucketName/test/" --region $Region
    if ($?) {
        Write-Success "Test file uploaded successfully!"
        
        # Clean up test file
        aws s3 rm "s3://$BucketName/test/$testFile" --region $Region
        Remove-Item $testFile -Force
        Write-Success "Test completed and cleaned up"
    } else {
        throw "Upload test failed"
    }
}
catch {
    Write-Warning "S3 access test failed: $_"
    Write-Info "Please verify the configuration manually"
}
finally {
    # Reset environment variables
    Remove-Item Env:AWS_ACCESS_KEY_ID -ErrorAction SilentlyContinue
    Remove-Item Env:AWS_SECRET_ACCESS_KEY -ErrorAction SilentlyContinue
    Remove-Item Env:AWS_DEFAULT_REGION -ErrorAction SilentlyContinue
}

Write-Info ""
Write-Success "=== SETUP COMPLETE ==="
Write-Info "Next steps:"
Write-Info "1. Copy the environment variables above to your .env file"
Write-Info "2. Never commit these credentials to version control"
Write-Info "3. Run: .\verify-s3-permissions.ps1 to test your configuration"
Write-Info "4. Test your Agora Cloud Recording integration"
Write-Info ""
Write-Warning "SECURITY REMINDER:"
Write-Warning "- Store credentials securely (use .env files, not code)"
Write-Warning "- Add *.env to your .gitignore file"
Write-Warning "- Consider using AWS IAM roles for production"
Write-Warning "- Regularly rotate access keys" 