# OSS Healthcheck

OSS Healthcheck 是一个**零运行时依赖**的命令行工具与 GitHub Action，用透明的 100 分规则检查开源仓库的维护健康度。它覆盖文档、社区、安全、自动化、质量和发布流程，每个失败项都会给出证据与修复建议。

[English](README.md)

## 快速开始

在首个 npm 版本发布前，可直接运行已验证的源码提交：

```bash
npm exec --yes --package=github:vegetable6308/oss-healthcheck#17f37153ef8aefceac5989da5442ce0a507788ad -- oss-healthcheck .
```

npm 包目前尚未发布。完成首次发布后，可改用更短的命令：

```bash
npx oss-healthcheck@latest .
npm install --global oss-healthcheck
```

扫描当前仓库，并要求至少 90 分：

```bash
oss-healthcheck . --min-score 90
```

退出码 `0` 表示通过，`1` 表示低于阈值，`2` 表示参数、配置或运行错误。

## 主要能力

- 19 项规则总计 100 分，权重公开且可解释；
- 支持人类可读文本、JSON 和 SARIF 2.1.0；
- 原生 GitHub Action，可在 Pull Request 中阻断健康度退化；
- `init` 命令安全生成贡献、安全、支持、PR 和 Issue 模板；
- 支持 `.oss-healthcheck.json` 设置阈值和禁用不适用的规则；
- Node.js 20+，运行时无第三方依赖，降低供应链风险。

## 使用方法

```bash
oss-healthcheck [scan] [路径] [选项]
oss-healthcheck init [路径]
oss-healthcheck rules
```

常用示例：

```bash
# 生成 JSON 报告
oss-healthcheck . --format json --output reports/health.json

# 生成 SARIF 报告
oss-healthcheck . --format sarif --output reports/health.sarif

# 只生成缺失的社区文件，不覆盖现有内容
oss-healthcheck init .
```

`--output` 只能写入被扫描仓库内部，避免误写其他路径。初始化不会替你选择许可证，也不会猜测 CODEOWNERS，因为这两项需要维护者本人决定。

## 配置

在仓库根目录创建 `.oss-healthcheck.json`：

```json
{
  "threshold": 85,
  "disabledRules": ["quality.lockfile"]
}
```

被禁用规则会从分母中移除，其余规则重新归一化为 100 分。未知规则或非法阈值会直接报错。建议在治理文档中说明禁用理由。

## GitHub Action

```yaml
- uses: actions/checkout@v7
# 发布 v1 标签后可将此 SHA 替换为 v1。
- uses: vegetable6308/oss-healthcheck@17f37153ef8aefceac5989da5442ce0a507788ad
  with:
    min-score: "90"
```

Action 输出 `score` 和 `passed`。对供应链安全要求较高时，请固定到完整 commit SHA。

## 本地开发

```bash
npm ci
npm run check
```

完整检查包括格式、Lint、类型、覆盖率、构建和 CLI 端到端测试。详细贡献流程见 [CONTRIBUTING.md](CONTRIBUTING.md)，漏洞报告方式见 [SECURITY.md](SECURITY.md)。

## 评分边界

100 分表示仓库具备基础维护机制，不代表代码绝对正确，也不是安全认证。真实项目价值仍取决于实际用户、持续维护、Issue/PR 处理和可靠发布。

## 许可证

MIT © 2026 OSS Healthcheck contributors.
