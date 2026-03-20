param(
    [Parameter(Mandatory = $false)]
    [string]$InputPath = 'C:\Temp\Shopping_History.md',

    [Parameter(Mandatory = $false)]
    [string]$OrderOutputPath = 'C:\Temp\Shopping_History_Orders.csv',

    [Parameter(Mandatory = $false)]
    [string]$ItemOutputPath = 'C:\Temp\Shopping_History_Items.csv',

    [Parameter(Mandatory = $false)]
    [string]$SmartsheetOutputPath = 'C:\Temp\Shopping_History_Smartsheet.csv'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function ConvertTo-DecimalOrNull {
    param(
        [Parameter(Mandatory = $false)]
        [AllowNull()]
        [string]$Value
    )

    if ([string]::IsNullOrWhiteSpace($Value)) {
        return $null
    }

    $normalized = $Value.Trim() -replace '[\$,]', ''
    return [decimal]::Parse($normalized, [System.Globalization.CultureInfo]::InvariantCulture)
}

function New-OrderRecord {
    param(
        [string]$Store,
        [string]$SourceFile
    )

    [ordered]@{
        Store         = $Store
        OrderId       = $null
        OrderIdType   = $null
        InvoiceNumber = $null
        Items         = New-Object System.Collections.Generic.List[object]
        Shipping      = $null
        Tax           = $null
        Discount      = $null
        Total         = $null
        Payments      = New-Object System.Collections.Generic.List[decimal]
        Balance       = $null
        Status        = $null
        Carrier       = $null
        Tracking      = $null
        Estimate      = $null
        SourceFile    = $SourceFile
    }
}

function Add-OrderIfComplete {
    param(
        [System.Collections.Generic.List[object]]$Orders,
        [hashtable]$Order
    )

    if ($null -ne $Order -and -not [string]::IsNullOrWhiteSpace($Order.OrderId)) {
        $Orders.Add([pscustomobject]$Order)
    }
}

if (-not (Test-Path -LiteralPath $InputPath)) {
    throw "Input file not found: $InputPath"
}

$inputFile = Get-Item -LiteralPath $InputPath
$lines = Get-Content -LiteralPath $InputPath

$orders = New-Object System.Collections.Generic.List[object]
$currentStore = $null
$currentOrder = $null

foreach ($rawLine in $lines) {
    $line = $rawLine.TrimEnd()

    if ([string]::IsNullOrWhiteSpace($line)) {
        continue
    }

    if ($line -match '^##\s+(?<store>.+)$' -and $line -notmatch '^###\s+') {
        Add-OrderIfComplete -Orders $orders -Order $currentOrder
        $currentOrder = $null
        $currentStore = $Matches.store.Trim()
        continue
    }

    if ($line -match '^###\s+(?<label>Order\s*(?:#|ID)):\s*(?<value>.+)$') {
        Add-OrderIfComplete -Orders $orders -Order $currentOrder
        $currentOrder = New-OrderRecord -Store $currentStore -SourceFile $inputFile.FullName
        $currentOrder.OrderId = $Matches.value.Trim()
        $currentOrder.OrderIdType = $Matches.label.Trim()
        continue
    }

    if ($line -match '^###\s+Invoice\s*#:\s*(?<value>.+)$') {
        if ($null -eq $currentOrder) {
            $currentOrder = New-OrderRecord -Store $currentStore -SourceFile $inputFile.FullName
        }

        $currentOrder.InvoiceNumber = $Matches.value.Trim()
        continue
    }

    if ($null -eq $currentOrder) {
        continue
    }

    $itemMatch = [regex]::Match($line, '^- (?<item>.+?)\s+-\s+(?:Price:\s+)?(?<price>\$[\d,]+(?:\.\d{1,2})?)\s*(?:-\s+(?<status>.+))?$')
    if ($itemMatch.Success) {
        $itemStatus = $null
        if ($itemMatch.Groups['status'].Success) {
            $itemStatus = $itemMatch.Groups['status'].Value.Trim()
        }

        $currentOrder.Items.Add(
            [pscustomobject]@{
                Name   = $itemMatch.Groups['item'].Value.Trim()
                Price  = ConvertTo-DecimalOrNull $itemMatch.Groups['price'].Value
                Status = $itemStatus
            }
        )
        continue
    }

    if ($line -match '^(?<key>Shipping|Tax|Discount|Total|Payment|Balance|Status|Carrier|Tracking|Estimate):\s*(?<value>.+)$') {
        $key = $Matches.key
        $value = $Matches.value.Trim()

        switch ($key) {
            'Shipping' { $currentOrder.Shipping = ConvertTo-DecimalOrNull $value }
            'Tax'      { $currentOrder.Tax = ConvertTo-DecimalOrNull $value }
            'Discount' { $currentOrder.Discount = ConvertTo-DecimalOrNull $value }
            'Total'    { $currentOrder.Total = ConvertTo-DecimalOrNull $value }
            'Payment'  { $currentOrder.Payments.Add((ConvertTo-DecimalOrNull $value)) }
            'Balance'  { $currentOrder.Balance = ConvertTo-DecimalOrNull $value }
            'Status'   { $currentOrder.Status = $value }
            'Carrier'  { $currentOrder.Carrier = $value }
            'Tracking' { $currentOrder.Tracking = $value }
            'Estimate' { $currentOrder.Estimate = $value }
        }

        continue
    }
}

Add-OrderIfComplete -Orders $orders -Order $currentOrder

$orderRows = foreach ($order in $orders) {
    $paymentTotal = if ($order.Payments.Count -gt 0) {
        ($order.Payments | Measure-Object -Sum).Sum
    }
    else {
        $null
    }

    [pscustomobject]@{
        Store            = $order.Store
        OrderId          = $order.OrderId
        OrderIdType      = $order.OrderIdType
        InvoiceNumber    = $order.InvoiceNumber
        ItemCount        = $order.Items.Count
        Items            = ($order.Items | ForEach-Object { $_.Name }) -join ' | '
        ItemPrices       = ($order.Items | ForEach-Object { $_.Price }) -join ' | '
        ItemStatuses     = ($order.Items | ForEach-Object { $_.Status }) -join ' | '
        Shipping         = $order.Shipping
        Tax              = $order.Tax
        Discount         = $order.Discount
        Total            = $order.Total
        Payments         = ($order.Payments) -join ' | '
        PaymentTotal     = $paymentTotal
        Balance          = $order.Balance
        OrderStatus      = $order.Status
        Carrier          = $order.Carrier
        Tracking         = $order.Tracking
        Estimate         = $order.Estimate
        SourceFile       = $order.SourceFile
    }
}

$itemRows = foreach ($order in $orders) {
    $paymentTotal = if ($order.Payments.Count -gt 0) {
        ($order.Payments | Measure-Object -Sum).Sum
    }
    else {
        $null
    }

    foreach ($item in $order.Items) {
        [pscustomobject]@{
            Store            = $order.Store
            OrderId          = $order.OrderId
            OrderIdType      = $order.OrderIdType
            InvoiceNumber    = $order.InvoiceNumber
            ItemName         = $item.Name
            ItemPrice        = $item.Price
            ItemStatus       = if ($item.Status) { $item.Status } else { $order.Status }
            Shipping         = $order.Shipping
            Tax              = $order.Tax
            Discount         = $order.Discount
            Total            = $order.Total
            Payments         = ($order.Payments) -join ' | '
            PaymentTotal     = $paymentTotal
            Balance          = $order.Balance
            OrderStatus      = $order.Status
            Carrier          = $order.Carrier
            Tracking         = $order.Tracking
            Estimate         = $order.Estimate
            SourceFile       = $order.SourceFile
        }
    }
}

$smartsheetRows = foreach ($order in $orders) {
    $paymentTotal = if ($order.Payments.Count -gt 0) {
        ($order.Payments | Measure-Object -Sum).Sum
    }
    else {
        $null
    }

    $itemNames = ($order.Items | ForEach-Object { $_.Name }) -join ' | '

    foreach ($item in $order.Items) {
        $itemStatus = if ($item.Status) { $item.Status } else { $order.Status }
        $deliveryStatus = if ($order.Tracking) {
            'Tracking Available'
        }
        elseif ($itemStatus -match 'RECEIVED') {
            'Delivered'
        }
        elseif ($itemStatus -match 'SHIPPED') {
            'In Transit'
        }
        else {
            $itemStatus
        }

        [pscustomobject]@{
            Primary           = $item.Name
            Store             = $order.Store
            OrderId           = $order.OrderId
            OrderIdType       = $order.OrderIdType
            InvoiceNumber     = $order.InvoiceNumber
            ItemName          = $item.Name
            ItemPrice         = $item.Price
            ItemStatus        = $itemStatus
            OrderStatus       = $order.Status
            DeliveryStatus    = $deliveryStatus
            Shipping          = $order.Shipping
            Tax               = $order.Tax
            Discount          = $order.Discount
            OrderTotal        = $order.Total
            PaymentTotal      = $paymentTotal
            Balance           = $order.Balance
            Carrier           = $order.Carrier
            Tracking          = $order.Tracking
            EstimatedDelivery = $order.Estimate
            HasTracking       = if ($order.Tracking) { 'Yes' } else { 'No' }
            SourceFile        = $order.SourceFile
            OrderItems        = $itemNames
            ImportNotes       = if ($order.Items.Count -gt 1) { 'Multi-item order' } else { $null }
        }
    }
}

$orderDir = Split-Path -Parent $OrderOutputPath
$itemDir = Split-Path -Parent $ItemOutputPath
$smartsheetDir = Split-Path -Parent $SmartsheetOutputPath

if ($orderDir) {
    New-Item -ItemType Directory -Path $orderDir -Force | Out-Null
}

if ($itemDir) {
    New-Item -ItemType Directory -Path $itemDir -Force | Out-Null
}

if ($smartsheetDir) {
    New-Item -ItemType Directory -Path $smartsheetDir -Force | Out-Null
}

$orderRows | Export-Csv -LiteralPath $OrderOutputPath -NoTypeInformation -Encoding UTF8
$itemRows | Export-Csv -LiteralPath $ItemOutputPath -NoTypeInformation -Encoding UTF8
$smartsheetRows | Export-Csv -LiteralPath $SmartsheetOutputPath -NoTypeInformation -Encoding UTF8

Write-Host "Export complete."
Write-Host "Orders CSV: $OrderOutputPath"
Write-Host "Items CSV:  $ItemOutputPath"
Write-Host "Smartsheet CSV: $SmartsheetOutputPath"
Write-Host "Orders exported: $($orderRows.Count)"
Write-Host "Items exported:  $($itemRows.Count)"
Write-Host "Smartsheet rows exported: $($smartsheetRows.Count)"
