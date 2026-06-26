(function () {
  const Core = window.PracticeCore;
  const Store = window.PracticeStorage;
  const BUILTIN_TASKS = window.BUILTIN_TASKS || [];

  const state = {
    customTasks: Store.getCustomTasks(),
    records: Store.getRecords(),
    hiddenTaskIds: Store.getHiddenTaskIds(),
    settings: Store.getSettings(),
    currentTask: null,
    editingRecordId: '',
  };

  const $ = (id) => document.getElementById(id);

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function lines(value) {
    return String(value || '')
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function splitComma(value) {
    return String(value || '')
      .split(/[,，、]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function joinLines(items) {
    return Array.isArray(items) ? items.join('\n') : '';
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function allTasks(includeHidden) {
    const merged = [...BUILTIN_TASKS, ...state.customTasks].map((task) => ({
      ...task,
      hidden: state.hiddenTaskIds.includes(task.id) || task.hidden === true,
    }));
    return includeHidden ? merged : merged.filter((task) => !task.hidden);
  }

  function taskById(taskId) {
    return allTasks(true).find((task) => task.id === taskId);
  }

  function isBuiltIn(taskId) {
    return BUILTIN_TASKS.some((task) => task.id === taskId);
  }

  function setNotice(message) {
    $('notice').textContent = message || '';
    if (message) {
      window.clearTimeout(setNotice.timer);
      setNotice.timer = window.setTimeout(() => {
        $('notice').textContent = '';
      }, 3500);
    }
  }

  function saveState() {
    Store.setCustomTasks(state.customTasks);
    Store.setRecords(state.records);
    Store.setHiddenTaskIds(state.hiddenTaskIds);
    Store.setSettings(state.settings);
  }

  function getKnowledgeOptions() {
    const options = new Set();
    allTasks(false).forEach((task) => {
      (task.knowledge || []).forEach((item) => options.add(item));
    });
    return [...options].sort((a, b) => a.localeCompare(b, 'zh-CN'));
  }

  function fillSelect(select, values, placeholder) {
    const current = select.value;
    select.innerHTML = `<option value="">${placeholder}</option>` + values
      .map((item) => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`)
      .join('');
    if (values.includes(current)) select.value = current;
  }

  function refreshKnowledgeSelects() {
    const values = getKnowledgeOptions();
    fillSelect($('todayKnowledge'), values, '不限');
    fillSelect($('libraryKnowledge'), values, '全部知识点');
  }

  function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach((button) => {
      button.classList.toggle('active', button.dataset.tab === tabName);
    });
    document.querySelectorAll('.tab-panel').forEach((panel) => {
      panel.classList.toggle('active', panel.id === `tab-${tabName}`);
    });
  }

  function renderTaskDetail(task) {
    if (!task) {
      $('todayTask').className = 'task-empty';
      $('todayTask').innerHTML = '暂无任务';
      return;
    }

    $('todayTask').className = 'task-detail';
    $('todayTask').innerHTML = `
      <div class="task-title-row">
        <div>
          <h3>${escapeHtml(task.title)}</h3>
          <div class="tag-row">
            <span class="tag level">L${escapeHtml(task.level)}</span>
            ${(task.knowledge || []).map((item) => `<span class="tag">${escapeHtml(item)}</span>`).join('')}
          </div>
        </div>
        <button type="button" data-action="copy-task">复制 Markdown</button>
      </div>
      <div class="task-section">
        <h4>编码任务</h4>
        <p>${escapeHtml(task.description)}</p>
      </div>
      <div class="task-section">
        <h4>要求</h4>
        ${renderList(task.requirements)}
      </div>
      <div class="task-section">
        <h4>笔记复习题</h4>
        ${renderList(task.reviewQuestions)}
      </div>
      <div class="task-section">
        <h4>面试追问</h4>
        <p>${escapeHtml(task.interviewQuestion || '无')}</p>
      </div>
      <div class="task-section">
        <h4>相关笔记</h4>
        ${renderList(task.noteRefs)}
      </div>
      <div class="task-section">
        <h4>验收标准</h4>
        ${renderList(task.acceptance)}
      </div>
    `;
  }

  function renderList(items) {
    const values = Array.isArray(items) ? items : [];
    if (values.length === 0) return '<p>无</p>';
    return `<ul>${values.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
  }

  function generateTask() {
    const selectedLevel = $('todayLevel').value;
    const recommendedLevel = Core.recommendNextLevel(state.records, state.settings.preferredLevel || 1);
    const level = selectedLevel ? Number(selectedLevel) : recommendedLevel;
    const knowledge = $('todayKnowledge').value;
    const pack = Core.buildTodayPack(allTasks(false), state.records, { level, knowledge });

    state.currentTask = pack.task;
    state.settings.currentTaskId = pack.task ? pack.task.id : '';
    state.settings.preferredLevel = pack.level;
    saveState();

    $('levelBadge').textContent = `L${pack.level}`;
    $('recommendReason').textContent = pack.reason;
    renderTaskDetail(pack.task);
    renderStats();
  }

  function clearRecordForm() {
    state.editingRecordId = '';
    $('recordMode').textContent = '新记录';
    $('codePath').value = '';
    $('recordStatus').value = 'passed';
    $('reviewText').value = '';
    $('mistakesText').value = '';
    $('reviewPointsText').value = '';
  }

  function saveRecord() {
    if (!state.currentTask && !state.editingRecordId) {
      setNotice('请先生成今日任务');
      return;
    }

    const taskId = state.editingRecordId
      ? (state.records.find((record) => record.id === state.editingRecordId) || {}).taskId
      : state.currentTask.id;
    const task = taskById(taskId) || state.currentTask;
    const record = {
      id: state.editingRecordId || `record-${Date.now()}`,
      date: today(),
      taskId,
      codePath: $('codePath').value.trim(),
      status: $('recordStatus').value,
      review: $('reviewText').value.trim(),
      mistakes: lines($('mistakesText').value),
      reviewPoints: lines($('reviewPointsText').value),
      nextLevelSuggestion: Core.recommendNextLevel([
        {
          status: $('recordStatus').value,
          mistakes: lines($('mistakesText').value),
        },
      ], task ? task.level : state.settings.preferredLevel || 1),
    };

    const oldIndex = state.records.findIndex((item) => item.id === record.id);
    if (oldIndex >= 0) {
      state.records.splice(oldIndex, 1, record);
    } else {
      state.records.push(record);
    }

    state.settings.preferredLevel = record.nextLevelSuggestion;
    saveState();
    clearRecordForm();
    renderAll();
    setNotice('学习记录已保存');
  }

  function taskToMarkdown(task) {
    return Core.exportTasksMarkdown([task]);
  }

  function copyTaskMarkdown() {
    if (!state.currentTask) return;
    const markdown = taskToMarkdown(state.currentTask);
    navigator.clipboard.writeText(markdown)
      .then(() => setNotice('任务 Markdown 已复制'))
      .catch(() => {
        setNotice('浏览器不允许直接复制，可从导出功能获取 Markdown');
      });
  }

  function renderTaskList() {
    const level = $('libraryLevel').value;
    const knowledge = $('libraryKnowledge').value;
    const keyword = $('librarySearch').value.trim().toLowerCase();
    const tasks = allTasks(false).filter((task) => {
      const levelMatch = !level || Number(task.level) === Number(level);
      const knowledgeMatch = !knowledge || (task.knowledge || []).includes(knowledge);
      const keywordMatch = !keyword || `${task.title} ${task.description}`.toLowerCase().includes(keyword);
      return levelMatch && knowledgeMatch && keywordMatch;
    });

    $('taskCount').textContent = `${tasks.length} 题`;
    $('taskList').innerHTML = tasks.length === 0
      ? '<div class="empty-line">没有匹配题目</div>'
      : tasks.map((task) => `
        <article class="list-item">
          <div class="list-item-header">
            <div class="list-item-title">
              <strong>${escapeHtml(task.title)}</strong>
              <div class="tag-row">
                <span class="tag level">L${escapeHtml(task.level)}</span>
                ${(task.knowledge || []).map((item) => `<span class="tag">${escapeHtml(item)}</span>`).join('')}
                <span class="tag">${isBuiltIn(task.id) ? '内置' : '自定义'}</span>
              </div>
            </div>
            <div class="item-actions">
              <button type="button" data-action="use-task" data-id="${escapeHtml(task.id)}">作为今日任务</button>
              <button type="button" data-action="edit-task" data-id="${escapeHtml(task.id)}">${isBuiltIn(task.id) ? '复制编辑' : '编辑'}</button>
              <button type="button" data-action="${isBuiltIn(task.id) ? 'hide-task' : 'delete-task'}" data-id="${escapeHtml(task.id)}">${isBuiltIn(task.id) ? '隐藏' : '删除'}</button>
            </div>
          </div>
          <p>${escapeHtml(task.description)}</p>
        </article>
      `).join('');
  }

  function resetTaskForm() {
    $('taskFormMode').textContent = '新增';
    $('taskId').value = '';
    $('taskTitle').value = '';
    $('taskType').value = 'coding';
    $('taskLevel').value = '1';
    $('taskKnowledge').value = '';
    $('taskNotes').value = '';
    $('taskDescription').value = '';
    $('taskRequirements').value = '';
    $('taskReviewQuestions').value = '';
    $('taskInterview').value = '';
    $('taskAcceptance').value = '';
  }

  function fillTaskForm(task) {
    const builtIn = isBuiltIn(task.id);
    $('taskFormMode').textContent = builtIn ? '复制内置题' : '编辑自定义题';
    $('taskId').value = builtIn ? '' : task.id;
    $('taskTitle').value = task.title || '';
    $('taskType').value = task.type || 'coding';
    $('taskLevel').value = task.level || 1;
    $('taskKnowledge').value = (task.knowledge || []).join(', ');
    $('taskNotes').value = (task.noteRefs || []).join(', ');
    $('taskDescription').value = task.description || '';
    $('taskRequirements').value = joinLines(task.requirements);
    $('taskReviewQuestions').value = joinLines(task.reviewQuestions);
    $('taskInterview').value = task.interviewQuestion || '';
    $('taskAcceptance').value = joinLines(task.acceptance);
    switchTab('library');
  }

  function saveTask() {
    const title = $('taskTitle').value.trim();
    if (!title) {
      setNotice('题目标题不能为空');
      return;
    }

    const existingId = $('taskId').value;
    const task = {
      id: existingId || `custom-${Date.now()}`,
      custom: true,
      type: $('taskType').value,
      title,
      level: Number($('taskLevel').value),
      knowledge: splitComma($('taskKnowledge').value),
      noteRefs: splitComma($('taskNotes').value),
      description: $('taskDescription').value.trim(),
      requirements: lines($('taskRequirements').value),
      reviewQuestions: lines($('taskReviewQuestions').value),
      interviewQuestion: $('taskInterview').value.trim(),
      acceptance: lines($('taskAcceptance').value),
    };

    const oldIndex = state.customTasks.findIndex((item) => item.id === task.id);
    if (oldIndex >= 0) {
      state.customTasks.splice(oldIndex, 1, task);
    } else {
      state.customTasks.push(task);
    }

    saveState();
    resetTaskForm();
    renderAll();
    setNotice('题目已保存');
  }

  function hideTask(taskId) {
    if (!state.hiddenTaskIds.includes(taskId)) {
      state.hiddenTaskIds.push(taskId);
    }
    saveState();
    renderAll();
    setNotice('内置题已隐藏');
  }

  function deleteTask(taskId) {
    state.customTasks = state.customTasks.filter((task) => task.id !== taskId);
    saveState();
    renderAll();
    setNotice('自定义题已删除');
  }

  function useTask(taskId) {
    const task = taskById(taskId);
    if (!task) return;
    state.currentTask = task;
    state.settings.currentTaskId = task.id;
    state.settings.preferredLevel = task.level;
    saveState();
    $('levelBadge').textContent = `L${task.level}`;
    $('recommendReason').textContent = '已从题库手动选择。';
    renderTaskDetail(task);
    switchTab('today');
  }

  function renderRecords() {
    const tasks = allTasks(true);
    const records = [...state.records].reverse();
    $('recordCount').textContent = `${records.length} 条`;
    $('recordList').innerHTML = records.length === 0
      ? '<div class="empty-line">还没有学习记录</div>'
      : records.map((record) => {
        const task = tasks.find((item) => item.id === record.taskId) || {};
        return `
          <article class="list-item">
            <div class="list-item-header">
              <div class="list-item-title">
                <strong>${escapeHtml(task.title || '未知任务')}</strong>
                <div class="tag-row">
                  <span class="tag">${escapeHtml(record.date || '')}</span>
                  <span class="tag level">${statusLabel(record.status)}</span>
                  <span class="tag">建议 L${escapeHtml(record.nextLevelSuggestion || '')}</span>
                </div>
              </div>
              <div class="item-actions">
                <button type="button" data-action="edit-record" data-id="${escapeHtml(record.id)}">编辑</button>
                <button type="button" data-action="export-record-md" data-id="${escapeHtml(record.id)}">导出 MD</button>
                <button type="button" data-action="delete-record" data-id="${escapeHtml(record.id)}">删除</button>
              </div>
            </div>
            <p>代码路径：${escapeHtml(record.codePath || '未填写')}</p>
            <p>审核意见：${escapeHtml(record.review || '未填写')}</p>
            <p>错误点：${escapeHtml((record.mistakes || []).join('；') || '无')}</p>
            <p>复习建议：${escapeHtml((record.reviewPoints || []).join('；') || '无')}</p>
          </article>
        `;
      }).join('');
  }

  function statusLabel(status) {
    if (status === 'passed') return '通过';
    if (status === 'failed') return '未通过';
    return '待审核';
  }

  function editRecord(recordId) {
    const record = state.records.find((item) => item.id === recordId);
    if (!record) return;
    state.editingRecordId = record.id;
    state.currentTask = taskById(record.taskId) || null;
    $('recordMode').textContent = '编辑记录';
    $('codePath').value = record.codePath || '';
    $('recordStatus').value = record.status || 'pending';
    $('reviewText').value = record.review || '';
    $('mistakesText').value = joinLines(record.mistakes);
    $('reviewPointsText').value = joinLines(record.reviewPoints);
    renderTaskDetail(state.currentTask);
    switchTab('today');
  }

  function deleteRecord(recordId) {
    state.records = state.records.filter((record) => record.id !== recordId);
    saveState();
    renderAll();
    setNotice('学习记录已删除');
  }

  function renderStats() {
    const records = state.records;
    const passed = records.filter((record) => record.status === 'passed').length;
    const recent = records.filter((record) => {
      const time = new Date(record.date).getTime();
      return Number.isFinite(time) && Date.now() - time <= 7 * 24 * 60 * 60 * 1000;
    }).length;
    const nextLevel = Core.recommendNextLevel(records, state.settings.preferredLevel || 1);
    const stats = Core.buildKnowledgeStats(records, allTasks(true));
    const weakEntries = Object.entries(stats.weakPoints).sort((a, b) => b[1] - a[1]);

    $('metricGrid').innerHTML = `
      <div class="metric"><strong>${records.length}</strong><span>练习总次数</span></div>
      <div class="metric"><strong>${passed}</strong><span>通过次数</span></div>
      <div class="metric"><strong>${recent}</strong><span>最近 7 天</span></div>
      <div class="metric"><strong>L${nextLevel}</strong><span>下次建议难度</span></div>
    `;

    $('nextSuggestion').innerHTML = `
      <p>建议下次从 <strong>L${nextLevel}</strong> 开始。</p>
      <p>${weakEntries.length > 0
        ? `优先复习：${weakEntries.slice(0, 3).map(([name]) => escapeHtml(name)).join('、')}`
        : '暂无明显薄弱知识点，可以按学习顺序继续推进。'}</p>
    `;

    const practiceEntries = Object.entries(stats.practiceCount).sort((a, b) => b[1] - a[1]);
    $('knowledgeStats').innerHTML = practiceEntries.length === 0
      ? '<div class="empty-line">保存记录后会生成知识点统计</div>'
      : practiceEntries.map(([name, count]) => `
        <div class="knowledge-item">
          <strong>${escapeHtml(name)}</strong>
          <span>练习 ${count} 次，错误 ${stats.weakPoints[name] || 0} 次</span>
        </div>
      `).join('');

    $('levelBadge').textContent = `L${nextLevel}`;
  }

  function renderAll() {
    refreshKnowledgeSelects();
    renderTaskList();
    renderRecords();
    renderStats();
  }

  function downloadFile(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function exportJson(filename, data) {
    downloadFile(filename, JSON.stringify(data, null, 2), 'application/json;charset=utf-8');
  }

  function exportMarkdown(filename, markdown) {
    downloadFile(filename, markdown, 'text/markdown;charset=utf-8');
  }

  function readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file, 'utf-8');
    });
  }

  async function importMarkdown(input) {
    const file = input.files && input.files[0];
    if (!file) return;
    const text = await readFileAsText(file);
    const tasks = Core.parseMarkdownTasks(text).map((task) => ({
      ...task,
      id: task.id.startsWith('md-') ? `custom-${Date.now()}-${task.id}` : task.id,
      custom: true,
    }));
    state.customTasks.push(...tasks);
    saveState();
    input.value = '';
    renderAll();
    setNotice(`已导入 ${tasks.length} 道 Markdown 题目`);
  }

  async function importJson(input) {
    const file = input.files && input.files[0];
    if (!file) return;
    const text = await readFileAsText(file);
    const data = JSON.parse(text);
    Store.importAll(data);
    state.customTasks = Store.getCustomTasks();
    state.records = Store.getRecords();
    state.hiddenTaskIds = Store.getHiddenTaskIds();
    state.settings = Store.getSettings();
    input.value = '';
    renderAll();
    setNotice('JSON 备份已导入');
  }

  function bindEvents() {
    document.querySelectorAll('.tab').forEach((button) => {
      button.addEventListener('click', () => switchTab(button.dataset.tab));
    });

    $('quickGenerateBtn').addEventListener('click', generateTask);
    $('generateTaskBtn').addEventListener('click', generateTask);
    $('saveRecordBtn').addEventListener('click', saveRecord);
    $('clearRecordFormBtn').addEventListener('click', clearRecordForm);
    $('saveTaskBtn').addEventListener('click', saveTask);
    $('resetTaskFormBtn').addEventListener('click', resetTaskForm);

    ['libraryLevel', 'libraryKnowledge', 'librarySearch'].forEach((id) => {
      $(id).addEventListener('input', renderTaskList);
    });

    document.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-action]');
      if (!button) return;
      const action = button.dataset.action;
      const id = button.dataset.id;

      if (action === 'copy-task') copyTaskMarkdown();
      if (action === 'use-task') useTask(id);
      if (action === 'edit-task') {
        const task = taskById(id);
        if (task) fillTaskForm(task);
      }
      if (action === 'hide-task') hideTask(id);
      if (action === 'delete-task') deleteTask(id);
      if (action === 'edit-record') editRecord(id);
      if (action === 'delete-record') deleteRecord(id);
      if (action === 'export-record-md') {
        const record = state.records.find((item) => item.id === id);
        if (record) exportMarkdown(`练习记录-${record.date || today()}.md`, Core.exportRecordsMarkdown([record], allTasks(true)));
      }
    });

    $('exportAllJsonBtn').addEventListener('click', () => exportJson(`练习任务网站-完整备份-${today()}.json`, Store.exportAll()));
    $('exportTasksJsonBtn').addEventListener('click', () => exportJson(`练习题库-${today()}.json`, allTasks(true)));
    $('exportTasksMarkdownBtn').addEventListener('click', () => exportMarkdown(`练习题库-${today()}.md`, Core.exportTasksMarkdown(allTasks(false))));
    $('exportRecordsJsonBtn').addEventListener('click', () => exportJson(`练习记录-${today()}.json`, state.records));
    $('exportRecordsMarkdownBtn').addEventListener('click', () => exportMarkdown(`练习记录-${today()}.md`, Core.exportRecordsMarkdown(state.records, allTasks(true))));
    $('importMarkdownInput').addEventListener('change', (event) => importMarkdown(event.target).catch((error) => setNotice(error.message)));
    $('importJsonInput').addEventListener('change', (event) => importJson(event.target).catch((error) => setNotice(error.message)));
    $('clearLocalDataBtn').addEventListener('click', () => {
      const confirmed = window.confirm('确认清空本地自定义题、学习记录和隐藏设置？');
      if (!confirmed) return;
      Store.clearAll();
      state.customTasks = [];
      state.records = [];
      state.hiddenTaskIds = [];
      state.settings = Store.getSettings();
      state.currentTask = null;
      clearRecordForm();
      renderTaskDetail(null);
      renderAll();
      setNotice('本地数据已清空');
    });
  }

  function restoreCurrentTask() {
    if (state.settings.currentTaskId) {
      state.currentTask = taskById(state.settings.currentTaskId) || null;
      if (state.currentTask) {
        renderTaskDetail(state.currentTask);
        $('recommendReason').textContent = '已恢复上次任务。';
        return;
      }
    }
    renderTaskDetail(null);
  }

  function init() {
    $('todayMeta').textContent = `今日训练 · ${today()}`;
    bindEvents();
    refreshKnowledgeSelects();
    restoreCurrentTask();
    renderAll();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
