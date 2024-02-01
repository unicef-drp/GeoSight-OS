# Set the base URL and playwright path
. .\base-url.ps1
. .\playwright-path.ps1

Write-Host "This script will write a new test to tests/deleteme.spec.ts"
Write-Host "then delete it, leaving only the auth config."
Write-Host ""
Write-Host "When the playwright browser opens, log in to the site then close the browser."

# Run playwright codegen to generate the test
& npx playwright codegen `
    --target playwright-test `
    --save-storage=auth.json `
    -o tests/deleteme.spec.ts `
    $BASE_URL

# Remove the test leaving only auth.json
Remove-Item tests/deleteme.spec.ts

Write-Host "Auth file creation completed."
Write-Host "You can then run your tests by doing e.g.:"
Write-Host "playwright test --project chromium"
