---
id: svelte-reactivity
title: Svelte 5 响应式系统笔记
summary: Svelte 5 runes 响应式原理与实践总结
tags:
  - svelte
  - reactivity
  - frontend
source_url: https://svelte.dev/docs/svelte/$state
created_at: "2025-12-01"
---

# Svelte 5 响应式系统

Svelte 5 引入了 runes（符文）来替代旧的 `$:` 语法。

## 核心概念

- `$state` — 声明响应式状态
- `$derived` — 派生计算值
- `$effect` — 副作用

相关资源可以参考 [[sigma-graph-intro]]，其中用到了响应式状态驱动图谱更新。

也推荐看看 [[@bob]] 整理的 [[graphology-notes|Graphology 笔记]]。
