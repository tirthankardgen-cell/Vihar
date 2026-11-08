$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
# Use the available project runtimes without changing the machine's PATH.
$playgroundNode = Join-Path $PSScriptRoot 'output\node-runtime\node-v26.13.0-win-x64'
$playgroundJava = Join-Path $PSScriptRoot 'output\vihar-id\java21\jdk-21.0.13+9-jre\bin'
if (Test-Path -LiteralPath (Join-Path $playgroundNode 'node.exe')) { $env:PATH = $playgroundNode + ';' + $env:PATH }
if (Test-Path -LiteralPath (Join-Path $playgroundJava 'java.exe')) { $env:PATH = $playgroundJava + ';' + $env:PATH }
& node (Join-Path $PSScriptRoot 'scripts\dev-vihar-playground.mjs')
exit $LASTEXITCODE
