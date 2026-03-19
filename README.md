# Nagiverse

社区驱动的知识图谱。每个人维护自己的笔记，站点自动构建关系网络。

## 贡献内容

### 1. Fork → Clone → 创建你的目录

```bash
git clone https://github.com/<your-fork>/nagiverse.git
cd nagiverse
mkdir -p content/users/<your-id>/notes
```

`<your-id>` 只能用小写字母、数字、连字符，例如 `zhangsan`。

### 2. 写 profile.yaml

```yaml
id: zhangsan          # 必填，和目录名一致
name: 张三             # 必填
bio: 全栈工程师        # 可选
tags:                  # 可选
  - frontend
  - rust
```

### 3. 写笔记

在 `notes/` 下创建 `.md` 文件，最简只需要 `id` 和 `title`：

```markdown
---
id: rust-async-notes
title: Rust 异步编程笔记
summary: tokio 运行时与 async/await 的核心概念    # 可选
tags: [rust, async]                                # 可选
created_at: "2025-12-01"                           # 可选
---

正文从这里开始。
```

### 4. 双链语法

在正文中用 `[[]]` 建立关联，这是知识图谱的核心：

```markdown
推荐阅读 [[rust-async-notes]]。                   # 链接到笔记
可以参考 [[rust-async-notes|这篇异步笔记]]。       # 自定义显示文本
这个方案是 [[@zhangsan]] 提出的。                  # 提及用户
```

所有 `[[]]` 引用会被 CI 校验，引用不存在的 ID 会报错。

### 5. 本地检查 → 提交 PR

```bash
bun install
bun run validate                    # 校验格式和引用
bun run build:content && bun run dev  # 本地跑起来，检查页面渲染是否正常
```

确认无误后提交 PR：

```bash
git add content/users/<your-id>/
git commit -m "add: <your-id>"
git push && gh pr create
```

CI 通过 + 审核合并后自动部署。

## 内容要求

- **禁止 AI 生成内容。** 笔记必须是你自己写的，可以用 AI 辅助查资料，但最终内容必须经过你的理解和组织。
- **确保内容正确。** 技术细节请自行核对，不要传播错误知识。如果不确定，标注出来。
- **提交前本地预览。** 跑 `bun run dev` 看看你的笔记渲染是否正常、链接是否能跳转。
- **注明来源。** 引用他人观点或资料请用 `source_url` 或在正文中标注出处。

## 协议

内容采用 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) 协议。转载或引用请注明来源。
