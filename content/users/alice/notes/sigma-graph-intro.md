---
id: sigma-graph-intro
title: Sigma.js 入门指南
summary: 使用 Sigma.js 和 Graphology 实现交互式图谱可视化
tags:
  - visualization
  - sigma
  - graphology
links:
  - https://www.sigmajs.org/
  - https://graphology.github.io/
created_at: "2025-12-10"
---

# Sigma.js 入门

Sigma.js 是一个轻量级的图可视化库，配合 [[graphology-notes]] 使用效果很好。

## 基本用法

1. 创建 Graphology 图实例
2. 添加节点和边
3. 用 Sigma 渲染到 canvas

推荐先了解 [[svelte-reactivity|Svelte 响应式]] 中的方案来驱动图谱更新。
