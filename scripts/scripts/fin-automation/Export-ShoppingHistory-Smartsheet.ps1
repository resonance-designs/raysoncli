param(
    [Parameter(Mandatory = $false)]
    [string]$InputPath = 'C:\Temp\Shopping_History.md',

    [Parameter(Mandatory = $false)]
    [string]$SmartsheetOutputPath = 'C:\Temp\Shopping_History_Smartsheet.csv'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath 'Export-ShoppingHistory.ps1'

if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Required script not found: $scriptPath"
}

& $scriptPath `
    -InputPath $InputPath `
    -SmartsheetOutputPath $SmartsheetOutputPath
