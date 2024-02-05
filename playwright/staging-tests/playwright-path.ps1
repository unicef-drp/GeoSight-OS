Write-Host "This script will discover the path to your playwright install"
Write-Host ""
Write-Host "At the end of calling this script, you should have a PLAYWRIGHT"
Write-Host ""

# Check if Playwright is installed
$PLAYWRIGHT = Get-Command playwright -ErrorAction SilentlyContinue
if (-not $PLAYWRIGHT) {
    $PLAYWRIGHT = "npx playwright"
    
    # Check if npm is present
    $NPM = Get-Command npm -ErrorAction SilentlyContinue
    if ($NPM) {
        # Install Playwright
        $playwrightInstalled = npm ls --depth 1 playwright | Select-String -Pattern "@playwright/test" -Quiet
        if (-not $playwrightInstalled) {
            npm install -D @playwright/test@latest
            npx playwright install
        }
    } else {
        Write-Host "npm is not installed. Please install npm to proceed with Playwright installation."
    }
}

Write-Host "Done."
Write-Host ""
