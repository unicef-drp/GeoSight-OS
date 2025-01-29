# Set the playwright path
. .\playwright-path.ps1

Write-Host "This script will run the tests defined in tests/"
Write-Host "Before running the tests you need to create the auth config"
Write-Host ""

& npx playwright test `
    --ui `
    --project chromium

Write-Host "--done--"
