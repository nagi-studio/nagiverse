# Nagi Group

社区驱动的知识图谱。每个人维护自己的笔记，站点自动构建关系网络。

**在线访问**：部署后可通过 Vercel 访问

## 快速开始：贡献内容

### 1. Fork & Clone

```bash
git clone https://github.com/<your-fork>/nagi-group.git
cd nagi-group
```

### 2. 创建你的目录

```
content/users/<your-id>/
├── profile.yaml        # 你的资料
└── notes/              # 你的笔记
    ├── my-first-note.md
    └── another-note.md
```

`<your-id>` 是你的唯一标识，只能用小写字母、数字、连字符，例如 `zhangsan`、`cool-dev`。

### 3. 填写 profile.yaml

```yaml
id: zhangsan               # 必须和目录名一致
name: 张三                  # 显示名称
bio: 全栈工程师，喜欢折腾    # 一句话介绍（可选）
avatar: https://...         # 头像 URL（可选）
links:                      # 你的链接（可选）
  github: https://github.com/zhangsan
  blog: https://zhangsan.dev
tags:                       # 兴趣标签（可选）
  - frontend
  - rust
  - ai
```

只有 `id` 和 `name` 是必填的，其他都可以不写。

### 4. 写笔记

在 `notes/` 下创建 `.md` 文件：

```markdown
---
id: my-note-id
title: 我的笔记标题
---

正文从这里开始。
```

**最简形式就是这样** —— 只需要 `id` 和 `title`。

想加更多信息？可以补充这些可选字段：

```yaml
---
id: rust-async-notes
title: Rust 异步编程笔记
summary: tokio 运行时与 async/await 的核心概念
tags:
  - rust
  - async
source_url: https://tokio.rs/tokio/tutorial
created_at: "2025-12-01"
updated_at: "2026-01-15"
links:
  - https://rust-lang.github.io/async-book/
  - https://tokio.rs/
---
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `id` | 是 | 笔记的唯一 ID，小写字母+数字+连字符 |
| `title` | 是 | 标题 |
| `summary` | 否 | 一句话摘要，会显示在卡片上 |
| `tags` | 否 | 标签列表 |
| `source_url` | 否 | 原文链接 |
| `links` | 否 | 相关外部链接列表 |
| `created_at` | 否 | 创建日期，格式 `"YYYY-MM-DD"` |
| `updated_at` | 否 | 更新日期 |

## 双链语法

正文中用 `[[]]` 语法建立笔记和人之间的关联。这是构建知识图谱的核心。

### 链接到笔记

```markdown
推荐阅读 [[rust-async-notes]]。
```

渲染为链接，自动指向 `/notes/rust-async-notes`。

### 链接到笔记（自定义显示文本）

```markdown
可以参考 [[rust-async-notes|这篇异步笔记]]。
```

显示为「这篇异步笔记」，点击跳转到对应笔记。

### 提及用户

```markdown
这个方案是 [[@zhangsan]] 提出的。
```

渲染为链接，指向 `/users/zhangsan`。

### 组合使用

```markdown
[[@alice]] 写的 [[svelte-reactivity|Svelte 响应式笔记]] 很不错，
配合 [[sigma-graph-intro]] 可以做交互式图谱。
```

**规则**：

- `[[note-id]]` → 链接到笔记
- `[[note-id|显示文本]]` → 链接到笔记，用自定义文本
- `[[@user-id]]` → 提及用户
- 所有 `[[]]` 引用会被 CI 校验，引用不存在的 ID 会报错
- 这些关联会自动出现在知识图谱中

## 提交 PR

```bash
# 确保本地校验通过
bun install
bun run validate

# 提交
git add content/users/<your-id>/
git commit -m "add: <your-id> notes"
git push origin main
```

然后在 GitHub 上发起 Pull Request。CI 会自动检查：

- profile.yaml 格式是否正确
- 笔记 frontmatter 是否合法
- ID 是否有重复
- 所有 `[[]]` 引用是否指向真实存在的笔记或用户

校验全部通过后等待审核合并。合并后站点自动重新部署。

## 本地开发

```bash
bun install
bun run build:content    # 构建图谱数据和搜索索引
bun run dev              # 启动开发服务器
```

其他命令：

```bash
bun run validate         # 只跑校验
bun run build            # 完整构建（校验 + 内容 + Vite）
bun run preview          # 预览生产构建
```

## 目录结构

```
content/users/           # 所有用户内容
  └── <user-id>/
      ├── profile.yaml   # 用户资料
      └── notes/         # 笔记目录
          └── *.md       # Markdown 笔记
schemas/                 # JSON Schema（校验规则）
scripts/                 # 构建脚本
src/                     # SvelteKit 站点
static/generated/        # 构建产物（图谱 JSON）
```

## 技术栈

SvelteKit + TypeScript + D3 Force + Canvas 2D + Bun + Vercel
