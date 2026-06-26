const assert = require('assert');
const {
  parseMarkdownTasks,
  recommendNextLevel,
  exportRecordsMarkdown,
  buildKnowledgeStats,
} = require('../js/core');

function testParseMarkdownTasks() {
  const markdown = `## Java 数组练习

类型：coding
难度：2
知识点：数组, 循环, 方法
笔记：复习.md#数组, 复习.md#循环结构

### 题目
使用数组保存 5 个学生成绩，输出最高分、最低分、平均分。

### 要求
- 使用 int[] 保存成绩
- 输入必须校验 0~100
- 至少拆分 2 个方法

### 复习问题
- 数组为什么查询快？
- 标准 for 和增强 for 有什么区别？
- 方法参数和返回值分别解决什么问题？

### 面试追问
数组和 ArrayList 的区别是什么？

### 验收标准
- 能处理非法输入
- 能输出统计结果
`;

  const tasks = parseMarkdownTasks(markdown);

  assert.strictEqual(tasks.length, 1);
  assert.strictEqual(tasks[0].title, 'Java 数组练习');
  assert.strictEqual(tasks[0].type, 'coding');
  assert.strictEqual(tasks[0].level, 2);
  assert.deepStrictEqual(tasks[0].knowledge, ['数组', '循环', '方法']);
  assert.strictEqual(tasks[0].requirements.length, 3);
  assert.strictEqual(tasks[0].reviewQuestions.length, 3);
  assert.strictEqual(tasks[0].acceptance.length, 2);
  assert.ok(tasks[0].interviewQuestion.includes('ArrayList'));
}

function testRecommendNextLevel() {
  assert.strictEqual(recommendNextLevel([], 2), 2);
  assert.strictEqual(recommendNextLevel([{ status: 'passed', mistakes: ['命名'] }], 2), 3);
  assert.strictEqual(recommendNextLevel([{ status: 'passed', mistakes: ['命名', '菜单'] }], 3), 3);
  assert.strictEqual(recommendNextLevel([{ status: 'failed', mistakes: ['输入', '循环'] }], 3), 2);
  assert.strictEqual(recommendNextLevel([{ status: 'passed', mistakes: ['a', 'b', 'c', 'd'] }], 1), 1);
}

function testExportRecordsMarkdown() {
  const tasks = [
    {
      id: 'java-array-001',
      title: '学生成绩统计',
      knowledge: ['数组', '循环'],
    },
  ];
  const records = [
    {
      date: '2026-06-06',
      taskId: 'java-array-001',
      codePath: 'E:\\qfc\\practice\\Jun\\src\\day6\\ScoreManager.java',
      status: 'passed',
      review: '输入校验正确，方法拆分清楚。',
      mistakes: ['菜单没有重复显示', '异常堆栈不应展示给用户'],
      reviewPoints: ['Scanner', '数组'],
      nextLevelSuggestion: 3,
    },
  ];

  const markdown = exportRecordsMarkdown(records, tasks);

  assert.ok(markdown.includes('# 练习记录'));
  assert.ok(markdown.includes('学生成绩统计'));
  assert.ok(markdown.includes('ScoreManager.java'));
  assert.ok(markdown.includes('菜单没有重复显示'));
  assert.ok(markdown.includes('Scanner'));
}

function testBuildKnowledgeStats() {
  const tasks = [
    { id: 'a', knowledge: ['数组', '循环'] },
    { id: 'b', knowledge: ['集合'] },
  ];
  const records = [
    { taskId: 'a', mistakes: ['数组下标错误'], reviewPoints: ['数组'] },
    { taskId: 'a', mistakes: ['循环边界错误'], reviewPoints: ['循环'] },
    { taskId: 'b', mistakes: [], reviewPoints: ['集合'] },
  ];

  const stats = buildKnowledgeStats(records, tasks);

  assert.strictEqual(stats.practiceCount['数组'], 2);
  assert.strictEqual(stats.practiceCount['循环'], 2);
  assert.strictEqual(stats.practiceCount['集合'], 1);
  assert.strictEqual(stats.weakPoints['数组'], 2);
  assert.strictEqual(stats.weakPoints['循环'], 2);
}

testParseMarkdownTasks();
testRecommendNextLevel();
testExportRecordsMarkdown();
testBuildKnowledgeStats();

console.log('app-core tests passed');
