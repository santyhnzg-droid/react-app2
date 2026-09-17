$ErrorActionPreference = "Stop"

$files = @(
    "frontend\src\pages\admin\ProductosAdmin.jsx",
    "frontend\src\pages\ProductoDetalle.jsx",
    "frontend\src\pages\empleado\Dashboard.jsx"
)

foreach ($file in $files) {
    if (-not (Test-Path $file)) {
        Write-Host "No existe: $file (se omite)"
        continue
    }

    $content = Get-Content $file -Raw

    $content = $content.Replace(
        "http://localhost:3000",
        "http://127.0.0.1:8000"
    )

    Set-Content `
        -Path $file `
        -Value $content `
        -Encoding UTF8

    Write-Host "URL corregida en: $file"
}

Write-Host "Listo."
