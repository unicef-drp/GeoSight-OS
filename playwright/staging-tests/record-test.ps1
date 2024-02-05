# Set the base URL and playwright path
. .\base-url.ps1
. .\playwright-path.ps1

if (-not $args) {
    Write-Host "Usage: $([System.IO.Path]::GetFileNameWithoutExtension($MyInvocation.MyCommand.Path)) TESTNAME"
    Write-Host "e.g. $([System.IO.Path]::GetFileNameWithoutExtension($MyInvocation.MyCommand.Path)) mytest"
    Write-Host "will write a new test to tests\mytest.spec.ts"
    Write-Host "Do not use spaces in your test name."
    Write-Host ""
    Write-Host "After recording your test, close the test browser."
    Write-Host "You can then run your test by doing:"
    Write-Host "npx playwright test tests\mytest.spec.py"
    exit
} else {
    Write-Host "Recording test to tests\$($args[0])"
}

$testName = $args[0]

if (Test-Path "tests\$testName.spec.ts" -PathType Leaf) {
    # File exists and write permission granted to user
    # show prompt
    $answer = Read-Host "File tests\$testName.spec.ts exists. Overwrite? (y/n)"
    switch ($answer) {
        'y' { Write-Host "Writing recorded test to tests\$testName.spec.ts" }
        'n' { Write-Host "Cancelled."; exit }
        default { Write-Host "Invalid input. Cancelled."; exit }
    }
}

& npx playwright codegen `
    --target playwright-test `
    --load-storage=auth.json `
    -o "tests\$($testName).spec.ts" `
    $BASE_URL

Write-Host "Test recording completed."
Write-Host "You can then run your test by doing:"
Write-Host ".\run-tests.ps1"
