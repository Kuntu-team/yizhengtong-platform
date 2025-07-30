# 页面性能测试脚本
param(
    [int]$Concurrency = 100,
    [int]$Duration = 60
)

Write-Host "开始页面性能测试..." -ForegroundColor Green
Write-Host "并发数: $Concurrency" -ForegroundColor Yellow
Write-Host "持续时间: $Duration 秒" -ForegroundColor Yellow

$startTime = Get-Date
$successCount = 0
$errorCount = 0
$totalResponseTime = 0

# 创建并发任务
$jobs = @()
for ($i = 1; $i -le $Concurrency; $i++) {
    $jobs += Start-Job -ScriptBlock {
        param($url)
        try {
            $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 10
            return @{
                StatusCode = $response.StatusCode
                ResponseTime = $response.BaseResponse.ResponseTime
                Success = $true
            }
        }
        catch {
            return @{
                StatusCode = $_.Exception.Response.StatusCode
                ResponseTime = 0
                Success = $false
                Error = $_.Exception.Message
            }
        }
    } -ArgumentList "http://localhost:3002/"
}

Write-Host "等待测试完成..." -ForegroundColor Cyan
Start-Sleep -Seconds $Duration

# 收集结果
$results = @()
foreach ($job in $jobs) {
    if ($job.State -eq "Completed") {
        $result = Receive-Job -Job $job
        $results += $result
        if ($result.Success) {
            $successCount++
            $totalResponseTime += $result.ResponseTime
        } else {
            $errorCount++
        }
    }
    Remove-Job -Job $job
}

$endTime = Get-Date
$duration = ($endTime - $startTime).TotalSeconds

# 计算统计信息
$avgResponseTime = if ($successCount -gt 0) { $totalResponseTime / $successCount } else { 0 }
$successRate = if (($successCount + $errorCount) -gt 0) { ($successCount / ($successCount + $errorCount)) * 100 } else { 0 }
$tps = if ($duration -gt 0) { $successCount / $duration } else { 0 }

# 输出结果
Write-Host "`n测试结果:" -ForegroundColor Green
Write-Host "总请求数: $($successCount + $errorCount)" -ForegroundColor White
Write-Host "成功请求: $successCount" -ForegroundColor Green
Write-Host "失败请求: $errorCount" -ForegroundColor Red
Write-Host "成功率: $([math]::Round($successRate, 2))%" -ForegroundColor Yellow
Write-Host "平均响应时间: $([math]::Round($avgResponseTime, 2))ms" -ForegroundColor Yellow
Write-Host "吞吐量: $([math]::Round($tps, 2)) TPS" -ForegroundColor Yellow
Write-Host "测试持续时间: $([math]::Round($duration, 2)) 秒" -ForegroundColor Cyan

# 性能评估
Write-Host "`n性能评估:" -ForegroundColor Magenta
if ($successRate -ge 95) {
    Write-Host "✅ 成功率优秀" -ForegroundColor Green
} elseif ($successRate -ge 90) {
    Write-Host "⚠️ 成功率良好" -ForegroundColor Yellow
} else {
    Write-Host "❌ 成功率需要改进" -ForegroundColor Red
}

if ($avgResponseTime -le 1000) {
    Write-Host "✅ 响应时间优秀" -ForegroundColor Green
} elseif ($avgResponseTime -le 2000) {
    Write-Host "⚠️ 响应时间良好" -ForegroundColor Yellow
} else {
    Write-Host "❌ 响应时间需要改进" -ForegroundColor Red
}

if ($tps -ge 100) {
    Write-Host "✅ 吞吐量优秀" -ForegroundColor Green
} elseif ($tps -ge 50) {
    Write-Host "⚠️ 吞吐量良好" -ForegroundColor Yellow
} else {
    Write-Host "❌ 吞吐量需要改进" -ForegroundColor Red
} 