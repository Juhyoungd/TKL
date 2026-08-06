$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$previewPath = Join-Path $projectRoot "outputs\danyeoom-prototype.html"
$cssPath = Join-Path $projectRoot "app\globals.css"
$distPath = Join-Path $projectRoot "dist"
$serverPath = Join-Path $distPath "server"

if (Test-Path -LiteralPath $distPath) {
  Remove-Item -LiteralPath $distPath -Recurse -Force
}
New-Item -ItemType Directory -Path $serverPath -Force | Out-Null

$html = Get-Content -LiteralPath $previewPath -Raw -Encoding utf8
$css = Get-Content -LiteralPath $cssPath -Raw -Encoding utf8
$css = $css -replace '(?m)^@import "tailwindcss";\s*', ''
$html = $html.Replace('<link rel="stylesheet" href="../app/globals.css" />', "<style>`n$css`n</style>")
$htmlJson = $html | ConvertTo-Json -Compress

$worker = @"
const html = $htmlJson;

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/healthz") {
      return new Response("ok", { headers: { "content-type": "text/plain; charset=utf-8" } });
    }
    return new Response(html, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=300",
        "x-content-type-options": "nosniff",
        "referrer-policy": "strict-origin-when-cross-origin"
      }
    });
  }
};
"@

Set-Content -LiteralPath (Join-Path $serverPath "index.js") -Value $worker -Encoding utf8
Write-Output (Join-Path $serverPath "index.js")
