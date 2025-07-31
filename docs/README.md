# 测试文档和配置

这个文件夹包含了所有的JMeter测试文件、文档和配置。

## 📁 文件结构

### 🧪 JMeter测试文件
- **`jmeter-working-test.jmx`** - 工作测试计划（推荐使用）
- **`page-test-plan.jmx`** - 页面测试计划
- **`jmeter-page-test-fixed.jmx`** - 修复版页面测试
- **`jmeter-simple-test.jmx`** - 简化测试计划
- **`jmeter-multi-user-compatible.jmx`** - 多用户兼容测试（备选）

### 📚 文档文件
- **`jmeter-working-test-guide.md`** - 工作测试计划使用指南
- **`manual-jmeter-setup-guide.md`** - 手动配置指南
- **`jmeter-test-status-summary.md`** - 测试状态总结
- **`jmeter-page-test-config.md`** - 页面测试配置说明
- **`5000-concurrent-test-config.md`** - 5000并发测试配置
- **`system-optimization-guide.md`** - 系统优化指南

### 📊 数据文件
- **`test-users.csv`** - 测试用户数据

### 🔧 测试脚本和配置
- **`test-page-performance.ps1`** - PowerShell页面性能测试脚本
- **`jmeter-test-plan.json`** - JMeter测试计划配置

## 🚀 快速开始

### 1. 推荐测试计划
使用 `jmeter-working-test.jmx` 进行测试：
1. 在JMeter中加载 `jmeter-working-test.jmx`
2. 手动配置登录请求体（参考 `jmeter-working-test-guide.md`）
3. 确认CSV文件路径指向 `docs/test-users.csv`
4. 开始测试

### 2. 手动配置
如果遇到XML兼容性问题，参考 `manual-jmeter-setup-guide.md` 进行手动配置。

### 3. 快速性能测试
使用PowerShell脚本进行快速测试：
```powershell
.\docs\test-page-performance.ps1
```

## 📋 注意事项

1. **文件路径**：所有JMeter配置文件中的CSV文件路径已更新为 `docs/test-users.csv`
2. **兼容性**：优先使用 `jmeter-working-test.jmx`，避免XML兼容性问题
3. **文档更新**：所有文档中的文件路径已更新为新的目录结构

## 🔧 维护

- 新增测试文件时，请更新此README
- 修改文件路径时，请同步更新所有相关文档
- 保持文档与代码的一致性 