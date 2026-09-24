param(
  [Parameter(Mandatory = $true)][string]$IgnoredShellScript,
  [Parameter(Mandatory = $true)][string]$Project,
  [Parameter(Mandatory = $true)][string]$Archive
)

$ErrorActionPreference = 'Stop'
$pluginRoot = 'C:\Users\Administrator\.codex\plugins\cache\openai-curated-remote\sites\0.1.71'
$stage = Join-Path ([System.IO.Path]::GetTempPath()) ('chex-package-' + [guid]::NewGuid().ToString('N'))
try {
  New-Item -ItemType Directory -Path (Join-Path $stage 'dist\.openai') -Force | Out-Null
  & node (Join-Path $pluginRoot 'skills\sites-hosting\scripts\prepare-site-build.cjs') $Project (Join-Path $stage 'dist') | Out-Null
  Copy-Item -LiteralPath (Join-Path $Project '.openai\hosting.json') -Destination (Join-Path $stage 'dist\.openai\hosting.json') -Force
  $archiveParent = Split-Path -Parent $Archive
  New-Item -ItemType Directory -Path $archiveParent -Force | Out-Null
  & tar -C $stage -czf $Archive dist
  if ($LASTEXITCODE -ne 0) { throw 'Archive creation failed.' }
  $entries = & tar -tzf $Archive
  if ($entries -notcontains 'dist/.openai/hosting.json') { throw 'Archive manifest is missing.' }
  Write-Output $Archive
} finally {
  if (Test-Path -LiteralPath $stage) { Remove-Item -LiteralPath $stage -Recurse -Force }
}
