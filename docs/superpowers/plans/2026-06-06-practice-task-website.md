# 练习任务网站 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 创建一个本地静态练习网站，每天生成“编码任务 + 笔记复习题 + 面试追问”，并记录代码审核复盘。

**Architecture:** 采用静态多文件结构，页面用 `index.html`，样式用 `css/style.css`，核心算法放在可被浏览器和 Node 测试复用的 `js/core.js`，浏览器状态封装在 `js/storage.js`，页面交互放在 `js/app.js`。数据先使用内置 `data/tasks.js` 和 `localStorage`，导入导出支持 JSON 与 Markdown。

**Tech Stack:** HTML、CSS、原生 JavaScript、localStorage、Node.js 内置 `assert` 测试。

---

### Task 1: 核心逻辑测试

**Files:**
- Create: `练习任务网站/tests/app-core.test.js`
- Create: `练习任务网站/js/core.js`

- [x] **Step 1: Write the failing test**

编写 Node 测试，覆盖 Markdown 题库解析、难度建议、学习记录 Markdown 导出。

- [x] **Step 2: Run test to verify it fails**

Run: `node "练习任务网站/tests/app-core.test.js"`
Expected: FAIL because `练习任务网站/js/core.js` does not exist yet.

- [x] **Step 3: Implement core functions**

实现 `parseMarkdownTasks`、`recommendNextLevel`、`exportRecordsMarkdown` 等纯函数。

- [x] **Step 4: Run test to verify it passes**

Run: `node "练习任务网站/tests/app-core.test.js"`
Expected: PASS.

### Task 2: 静态网站骨架

**Files:**
- Create: `练习任务网站/index.html`
- Create: `练习任务网站/css/style.css`
- Create: `练习任务网站/js/storage.js`
- Create: `练习任务网站/js/app.js`
- Create: `练习任务网站/data/tasks.js`

- [x] **Step 1: Create multi-tab page**

实现“今日任务、题库管理、学习记录、统计推荐、导入导出”五个标签页。

- [x] **Step 2: Add built-in task data**

内置约 40 道任务，覆盖 Java 基础、数组方法、面向对象、集合、IO、JDBC、MyBatis、Spring Boot、Redis/RabbitMQ、Vue3、Linux/Docker/Git、LangChain4j。

- [x] **Step 3: Wire browser interactions**

实现生成今日任务、保存记录、编辑自定义题、隐藏内置题、导入导出 JSON/Markdown。

- [x] **Step 4: Verify static page**

Run: open `练习任务网站/index.html` or inspect with browser.
Expected: First open shows built-in tasks; records survive refresh through `localStorage`.

### Task 3: Verification

**Files:**
- Test: `练习任务网站/tests/app-core.test.js`

- [x] **Step 1: Run automated tests**

Run: `node "练习任务网站/tests/app-core.test.js"`
Expected: PASS.

- [ ] **Step 2: Check repository status**

Run: `git status --short --branch`
Expected: Only task-related new files plus pre-existing unrelated `.understand-anything/`.
