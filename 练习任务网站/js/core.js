(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.PracticeCore = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  const MIN_LEVEL = 1;
  const MAX_LEVEL = 5;

  function clampLevel(level) {
    const value = Number(level) || MIN_LEVEL;
    return Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, value));
  }

  function splitList(value) {
    if (!value) return [];
    return String(value)
      .split(/[,，、]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function linesToList(text) {
    if (!text) return [];
    return text
      .split(/\r?\n/)
      .map((line) => line.replace(/^\s*[-*]\s*/, '').trim())
      .filter(Boolean);
  }

  function createTaskId(title, index) {
    const ascii = String(title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    if (ascii) return `md-${ascii}-${index + 1}`;

    let hash = 0;
    for (const char of String(title)) {
      hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
    }
    return `md-${hash.toString(16)}-${index + 1}`;
  }

  function parseMetadata(text) {
    const metadata = {};
    text.split(/\r?\n/).forEach((line) => {
      const match = line.match(/^\s*([^：:]+)\s*[：:]\s*(.+?)\s*$/);
      if (match) {
        metadata[match[1].trim()] = match[2].trim();
      }
    });
    return metadata;
  }

  function parseSections(text) {
    const sections = {};
    let currentTitle = null;
    let currentLines = [];

    text.split(/\r?\n/).forEach((line) => {
      const match = line.match(/^###\s+(.+?)\s*$/);
      if (match) {
        if (currentTitle) {
          sections[currentTitle] = currentLines.join('\n').trim();
        }
        currentTitle = match[1].trim();
        currentLines = [];
        return;
      }

      if (currentTitle) {
        currentLines.push(line);
      }
    });

    if (currentTitle) {
      sections[currentTitle] = currentLines.join('\n').trim();
    }

    return sections;
  }

  function parseMarkdownTasks(markdown) {
    if (!markdown || !markdown.trim()) return [];

    return markdown
      .split(/(?=^##\s+)/gm)
      .map((block) => block.trim())
      .filter((block) => block.startsWith('## '))
      .map((block, index) => {
        const titleMatch = block.match(/^##\s+(.+?)\s*$/m);
        const title = titleMatch ? titleMatch[1].trim() : `导入题目 ${index + 1}`;
        const firstSectionIndex = block.search(/^###\s+/m);
        const metadataText = firstSectionIndex >= 0 ? block.slice(0, firstSectionIndex) : block;
        const metadata = parseMetadata(metadataText);
        const sections = parseSections(block);

        return {
          id: metadata.ID || createTaskId(title, index),
          custom: true,
          hidden: false,
          type: metadata['类型'] || metadata.type || 'coding',
          title,
          level: clampLevel(metadata['难度'] || metadata.level || 1),
          knowledge: splitList(metadata['知识点'] || metadata.knowledge),
          noteRefs: splitList(metadata['笔记'] || metadata.notes),
          description: sections['题目'] || '',
          requirements: linesToList(sections['要求']),
          reviewQuestions: linesToList(sections['复习问题']),
          interviewQuestion: sections['面试追问'] || '',
          acceptance: linesToList(sections['验收标准']),
        };
      });
  }

  function getLastRecord(records) {
    if (!Array.isArray(records) || records.length === 0) return null;
    return records[records.length - 1];
  }

  function recommendNextLevel(records, currentLevel) {
    const baseLevel = clampLevel(currentLevel);
    const lastRecord = getLastRecord(records);

    if (!lastRecord) return baseLevel;

    const mistakesCount = Array.isArray(lastRecord.mistakes) ? lastRecord.mistakes.length : 0;
    const status = String(lastRecord.status || '').toLowerCase();

    if (status !== 'passed' || mistakesCount >= 4) {
      return clampLevel(baseLevel - 1);
    }

    if (mistakesCount <= 1) {
      return clampLevel(baseLevel + 1);
    }

    return baseLevel;
  }

  function statusText(status) {
    const map = {
      passed: '通过',
      failed: '未通过',
      pending: '待审核',
    };
    return map[status] || status || '未记录';
  }

  function listToMarkdown(items) {
    if (!Array.isArray(items) || items.length === 0) return '- 无';
    return items.map((item) => `- ${item}`).join('\n');
  }

  function indexTasks(tasks) {
    const map = {};
    (tasks || []).forEach((task) => {
      map[task.id] = task;
    });
    return map;
  }

  function exportRecordsMarkdown(records, tasks) {
    const taskMap = indexTasks(tasks);
    const rows = Array.isArray(records) ? records : [];
    const today = new Date().toISOString().slice(0, 10);

    let markdown = `# 练习记录\n\n导出日期：${today}\n`;

    rows.forEach((record, index) => {
      const task = taskMap[record.taskId] || {};
      markdown += `\n## ${index + 1}. ${task.title || record.taskTitle || '未命名任务'}\n\n`;
      markdown += `- 日期：${record.date || ''}\n`;
      markdown += `- 状态：${statusText(record.status)}\n`;
      markdown += `- 难度建议：L${record.nextLevelSuggestion || ''}\n`;
      markdown += `- 知识点：${(task.knowledge || record.knowledge || []).join('、') || '无'}\n`;
      markdown += `- 代码路径：${record.codePath || '未填写'}\n`;
      markdown += `\n### 审核意见\n\n${record.review || '未填写'}\n`;
      markdown += `\n### 错误点\n\n${listToMarkdown(record.mistakes)}\n`;
      markdown += `\n### 复习建议\n\n${listToMarkdown(record.reviewPoints)}\n`;
    });

    return markdown.trim() + '\n';
  }

  function exportTasksMarkdown(tasks) {
    return (tasks || [])
      .map((task) => {
        const lines = [
          `## ${task.title}`,
          '',
          `ID：${task.id}`,
          `类型：${task.type || 'coding'}`,
          `难度：${task.level || 1}`,
          `知识点：${(task.knowledge || []).join(', ')}`,
          `笔记：${(task.noteRefs || []).join(', ')}`,
          '',
          '### 题目',
          task.description || '',
          '',
          '### 要求',
          listToMarkdown(task.requirements),
          '',
          '### 复习问题',
          listToMarkdown(task.reviewQuestions),
          '',
          '### 面试追问',
          task.interviewQuestion || '',
          '',
          '### 验收标准',
          listToMarkdown(task.acceptance),
        ];
        return lines.join('\n');
      })
      .join('\n\n');
  }

  function normalizeRecord(record) {
    return {
      ...record,
      mistakes: Array.isArray(record.mistakes) ? record.mistakes : splitList(record.mistakes),
      reviewPoints: Array.isArray(record.reviewPoints) ? record.reviewPoints : splitList(record.reviewPoints),
    };
  }

  function buildKnowledgeStats(records, tasks) {
    const taskMap = indexTasks(tasks);
    const practiceCount = {};
    const weakPoints = {};

    (records || []).map(normalizeRecord).forEach((record) => {
      const task = taskMap[record.taskId] || {};
      const knowledge = task.knowledge || record.knowledge || [];

      knowledge.forEach((item) => {
        practiceCount[item] = (practiceCount[item] || 0) + 1;
      });

      if (record.mistakes.length > 0) {
        knowledge.forEach((item) => {
          weakPoints[item] = (weakPoints[item] || 0) + 1;
        });
      }
    });

    return { practiceCount, weakPoints };
  }

  function mergeTasks(builtInTasks, customTasks, hiddenTaskIds) {
    const hiddenSet = new Set(hiddenTaskIds || []);
    return [...(builtInTasks || []), ...(customTasks || [])]
      .map((task) => ({ ...task, hidden: hiddenSet.has(task.id) || task.hidden === true }))
      .filter((task) => !task.hidden);
  }

  function buildTodayPack(tasks, records, options) {
    const opts = options || {};
    const recordsList = Array.isArray(records) ? records : [];
    const currentLevel = clampLevel(opts.level || recommendNextLevel(recordsList, 1));
    const knowledgeFilter = opts.knowledge || '';
    const usedIds = new Set(recordsList.map((record) => record.taskId));

    let candidates = (tasks || []).filter((task) => {
      const levelMatch = Number(task.level) === currentLevel;
      const knowledgeMatch = !knowledgeFilter || (task.knowledge || []).includes(knowledgeFilter);
      return !task.hidden && levelMatch && knowledgeMatch;
    });

    if (candidates.length === 0) {
      candidates = (tasks || []).filter((task) => !task.hidden && Number(task.level) === currentLevel);
    }

    if (candidates.length === 0) {
      candidates = (tasks || []).filter((task) => !task.hidden);
    }

    const fresh = candidates.find((task) => !usedIds.has(task.id));
    const task = fresh || candidates[0] || null;

    return {
      task,
      level: currentLevel,
      reason: task
        ? `推荐 L${currentLevel}，优先选择${knowledgeFilter ? `「${knowledgeFilter}」` : '当前难度'}中未练过的任务。`
        : '题库为空，请先新增或导入题目。',
    };
  }

  return {
    MIN_LEVEL,
    MAX_LEVEL,
    clampLevel,
    parseMarkdownTasks,
    recommendNextLevel,
    exportRecordsMarkdown,
    exportTasksMarkdown,
    buildKnowledgeStats,
    mergeTasks,
    buildTodayPack,
  };
});
