const App = {
  data: {
    goldlines: [],
    actions: [],
    currentView: 'dashboard',
    currentLayer: null
  },

  init() {
    this.loadFromStorage();
    this.bindEvents();
    this.render();
  },

  loadFromStorage() {
    try {
      const stored = localStorage.getItem('pureMindData');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.data.goldlines = parsed.goldlines || [];
        this.data.actions = parsed.actions || [];
      }
    } catch (e) {
      console.log('No data found, starting fresh');
    }
  },

  saveToStorage() {
    localStorage.setItem('pureMindData', JSON.stringify({
      goldlines: this.data.goldlines,
      actions: this.data.actions
    }));
  },

  bindEvents() {
    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('layer-btn')) {
        this.openLayer(e.target.dataset.layer);
      }
      if (e.target.id === 'settingsBtn') {
        openSettings();
      }
      if (e.target.id === 'chatBtn') {
        this.openChat();
      }
    });

    document.getElementById('settingsModal').addEventListener('click', (e) => {
      if (e.target.id === 'settingsModal') {
        closeSettings();
      }
    });

    document.getElementById('chatModal').addEventListener('click', (e) => {
      if (e.target.id === 'chatModal') {
        this.closeChat();
      }
    });

    document.getElementById('chatInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
  },

  openLayer(layerIndex) {
    this.data.currentLayer = parseInt(layerIndex);
    this.showLayerModal(layerIndex);
    this.highlightPagodaLayer(layerIndex);
  },

  showLayerModal(layerIndex) {
    const layerNames = [
      '信息输入',
      '逻辑推理',
      '规则边界',
      '确立金线',
      '金线库',
      '行动节奏',
      '进度追踪',
      '模块进化',
      '系统设置'
    ];
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h2>第${layerIndex + 1}层 - ${layerNames[layerIndex]}</h2>
          <button class="close-btn" onclick="this.closest('.modal-overlay').remove(); Pagoda.resetLayer(${layerIndex});">×</button>
        </div>
        <div class="modal-body">
          ${this.getLayerContent(layerIndex)}
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
        Pagoda.resetLayer(layerIndex);
      }
    });
  },

  getLayerContent(layerIndex) {
    const contents = [
      this.renderInputLayer(),
      this.renderReasoningLayer(),
      this.renderRulesLayer(),
      this.renderConfirmLayer(),
      this.renderGoldlinesLayer(),
      this.renderActionsLayer(),
      this.renderProgressLayer(),
      this.renderEvolutionLayer(),
      this.renderSettingsLayer()
    ];
    return contents[layerIndex] || '<p>功能开发中...</p>';
  },

  renderInputLayer() {
    return `
      <div class="form-group">
        <label>来源类型</label>
        <select id="inputType">
          <option value="article">文章</option>
          <option value="book">书籍</option>
          <option value="video">视频</option>
          <option value="thought">想法</option>
        </select>
      </div>
      <div class="form-group">
        <label>信息内容</label>
        <textarea id="inputContent" rows="6" placeholder="输入你想蒸馏的信息..."></textarea>
      </div>
      <div class="form-group">
        <label>来源链接（可选）</label>
        <input type="text" id="inputUrl" placeholder="https://...">
      </div>
      <button class="btn primary" onclick="App.saveInput()">保存信息</button>
    `;
  },

  renderReasoningLayer() {
    return `
      <div class="form-group">
        <label>这是什么？（本质定义）</label>
        <textarea id="reasonWhat" rows="3" placeholder="用一句话定义本质"></textarea>
      </div>
      <div class="form-group">
        <label>为什么重要？（价值判断）</label>
        <textarea id="reasonWhy" rows="3" placeholder="为什么这对你重要吗？"></textarea>
      </div>
      <div class="form-group">
        <label>如何实现？（路径设计）</label>
        <textarea id="reasonHow" rows="3" placeholder="具体如何做到呢？"></textarea>
      </div>
      <button class="btn primary" onclick="App.saveReasoning()">保存推理</button>
    `;
  },

  renderRulesLayer() {
    return `
      <div class="form-group">
        <label>⚖️ 法律风险</label>
        <textarea id="ruleLegal" rows="2" placeholder="有什么法律风险？"></textarea>
      </div>
      <div class="form-group">
        <label>🎯 道德底线</label>
        <textarea id="ruleMoral" rows="2" placeholder="你的道德底线是什么？"></textarea>
      </div>
      <div class="form-group">
        <label>✅ 自我允许</label>
        <textarea id="ruleAllow" rows="2" placeholder="你允许自己做什么？"></textarea>
      </div>
      <button class="btn primary" onclick="App.saveRules()">保存规则</button>
    `;
  },

  renderConfirmLayer() {
    return `
      <div class="form-group">
        <label>金线名称</label>
        <input type="text" id="goldlineName" placeholder="给这条金线起个名字">
      </div>
      <div class="form-group">
        <label>核心路径</label>
        <textarea id="goldlinePath" rows="4" placeholder="描述核心路径..."></textarea>
      </div>
      <div class="form-group">
        <label>行动节奏</label>
        <select id="goldlineRhythm">
          <option value="sprint">冲刺</option>
          <option value="maintain">保持</option>
          <option value="rest">休整</option>
        </select>
      </div>
      <button class="btn primary" onclick="App.createGoldline()">✨ 确立金线</button>
    `;
  },

  renderGoldlinesLayer() {
    let list = this.data.goldlines.length === 0 
      ? '<p class="empty">还没有金线，快去确立吧！</p>'
      : this.data.goldlines.map(gl => `
        <div class="goldline-card">
          <h3>${gl.name}</h3>
          <p>${gl.path}</p>
          <div class="card-footer">
            <span class="tag ${gl.rhythm}">${gl.rhythm}</span>
            <button class="btn small" onclick="App.deleteGoldline('${gl.id}')">删除</button>
          </div>
        </div>
      `).join('');
    return list;
  },

  renderActionsLayer() {
    return `
      <div class="form-group">
        <label>关联金线</label>
        <select id="actionGoldline">
          <option value="">选择金线...</option>
          ${this.data.goldlines.map(gl => `<option value="${gl.id}">${gl.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>行动名称</label>
        <input type="text" id="actionName" placeholder="做什么？">
      </div>
      <button class="btn primary" onclick="App.createAction()">添加行动</button>
      <div class="actions-list">
        ${this.data.actions.map(a => `
          <div class="action-item">
            <input type="checkbox" ${a.completed ? 'checked' : ''} onchange="App.toggleAction('${a.id}')">
            <span class="${a.completed ? 'completed' : ''}">${a.name}</span>
          </div>
        `).join('')}
      </div>
    `;
  },

  renderProgressLayer() {
    const total = this.data.goldlines.length;
    const completed = this.data.actions.filter(a => a.completed).length;
    const progress = total > 0 ? Math.round((completed / (this.data.actions.length || 1)) * 100) : 0;
    return `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${total}</div>
          <div class="stat-label">金线数量</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${this.data.actions.length}</div>
          <div class="stat-label">行动总数</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${completed}</div>
          <div class="stat-label">已完成</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${progress}%</div>
          <div class="stat-label">完成率</div>
        </div>
      </div>
    `;
  },

  renderEvolutionLayer() {
    return `
      <h3>🔄 模块进化</h3>
      <p>这里记录你的系统版本和优化历史</p>
      <div class="evolution-log">
        <div class="log-item">
          <span class="version">v1.0</span>
          <span>初始版本 - 九层佛塔架构</span>
        </div>
      </div>
      <button class="btn" onclick="alert('进化功能开发中...')">检查更新</button>
    `;
  },

  renderSettingsLayer() {
    return `
      <div class="form-group">
        <label>🌙 主题</label>
        <select>
          <option>深色科技</option>
        </select>
      </div>
      <div class="form-group">
        <label>⭐ 星星数量</label>
        <input type="range" min="100" max="500" value="300" onchange="AuroraConfig.setStarsCount(this.value)">
      </div>
      <div class="form-group">
        <label>🌈 极光强度</label>
        <input type="range" min="0" max="2" step="0.1" value="1.5" onchange="AuroraConfig.setAuroraIntensity(this.value)">
      </div>
      <button class="btn danger" onclick="if(confirm('确定清除所有数据？')){App.clearAllData()}">清除数据</button>
    `;
  },

  highlightPagodaLayer(layerIndex) {
    for (let i = 0; i < 9; i++) {
      if (i === layerIndex) {
        Pagoda.highlightLayer(i);
      } else {
        Pagoda.resetLayer(i);
      }
    }
  },

  saveInput() {
    alert('信息已保存！');
  },

  saveReasoning() {
    alert('推理已保存！');
  },

  saveRules() {
    alert('规则已保存！');
  },

  createGoldline() {
    const name = document.getElementById('goldlineName').value;
    const path = document.getElementById('goldlinePath').value;
    const rhythm = document.getElementById('goldlineRhythm').value;
    
    if (!name) {
      alert('请输入金线名称！');
      return;
    }
    
    const goldline = {
      id: Date.now().toString(),
      name,
      path,
      rhythm,
      info: {},
      reasoning: {},
      rules: {},
      actions: [],
      created: new Date().toISOString().split('T')[0],
      progress: 0
    };
    
    this.data.goldlines.push(goldline);
    this.saveToStorage();
    alert('✨ 金线已确立！');
    this.openLayer(3);
  },

  deleteGoldline(id) {
    this.data.goldlines = this.data.goldlines.filter(g => g.id !== id);
    this.saveToStorage();
    this.openLayer(4);
  },

  createAction() {
    const goldlineId = document.getElementById('actionGoldline').value;
    const name = document.getElementById('actionName').value;
    
    if (!name) {
      alert('请输入行动名称！');
      return;
    }
    
    const action = {
      id: Date.now().toString(),
      goldline_id: goldlineId,
      name,
      rhythm: 'maintain',
      progress: 0,
      completed: false,
      today: true
    };
    
    this.data.actions.push(action);
    this.saveToStorage();
    alert('行动已添加！');
    this.openLayer(5);
  },

  toggleAction(id) {
    const action = this.data.actions.find(a => a.id === id);
    if (action) {
      action.completed = !action.completed;
      this.saveToStorage();
    }
  },

  clearAllData() {
    this.data.goldlines = [];
    this.data.actions = [];
    this.saveToStorage();
    alert('数据已清除！');
  },

  loadApiSettings() {
    try {
      const stored = localStorage.getItem('apiSettings');
      if (stored) {
        const settings = JSON.parse(stored);
        document.getElementById('minimaxKey').value = settings.minimaxKey || '';
        document.getElementById('deepseekKey').value = settings.deepseekKey || '';
        document.getElementById('openaiUrl').value = settings.openaiUrl || '';
        document.getElementById('openaiKey').value = settings.openaiKey || '';
        document.getElementById('minimaxModel').value = settings.minimaxModel || '';
        document.getElementById('deepseekModel').value = settings.deepseekModel || '';
        document.getElementById('openaiModel').value = settings.openaiModel || '';
        const radios = document.querySelectorAll('input[name="provider"]');
        radios.forEach(r => r.checked = r.value === settings.activeProvider);
      }
    } catch (e) {
      console.log('No API settings found');
    }
  },

  saveApiSettings() {
    const settings = {
      minimaxKey: document.getElementById('minimaxKey').value.trim(),
      deepseekKey: document.getElementById('deepseekKey').value.trim(),
      openaiUrl: document.getElementById('openaiUrl').value.trim(),
      openaiKey: document.getElementById('openaiKey').value.trim(),
      minimaxModel: document.getElementById('minimaxModel').value,
      deepseekModel: document.getElementById('deepseekModel').value,
      openaiModel: document.getElementById('openaiModel').value,
      activeProvider: document.querySelector('input[name="provider"]:checked')?.value || 'minimax'
    };
    localStorage.setItem('apiSettings', JSON.stringify(settings));
    alert('设置已保存！');
    closeSettings();
  },

  render() {
  },

  chatHistory: [],

  openChat() {
    document.getElementById('chatModal').classList.add('show');
    document.getElementById('chatInput').focus();
  },

  closeChat() {
    document.getElementById('chatModal').classList.remove('show');
  },

  addChatMessage(role, content) {
    const body = document.getElementById('chatBody');
    const div = document.createElement('div');
    div.className = `chat-message ${role}`;
    div.innerHTML = `<div class="msg-content">${content.replace(/\n/g, '<br>')}</div>`;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  },

  async sendMessage() {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if (!msg) return;
    input.value = '';
    this.addChatMessage('user', msg);
    this.addChatMessage('loading', '思考中...');

    const settings = JSON.parse(localStorage.getItem('apiSettings') || '{}');
    const provider = settings.activeProvider || 'minimax';
    let endpoint = '', body = {}, headers = { 'Content-Type': 'application/json' };

    if (provider === 'minimax') {
      endpoint = 'https://api.minimax.chat/v1/text/chatcompletion_pro';
      body = { model: settings.minimaxModel || 'minimax', messages: [{ role: 'user', content: msg }] };
      if (settings.minimaxKey) headers['Authorization'] = 'Bearer ' + settings.minimaxKey;
    } else if (provider === 'deepseek') {
      endpoint = 'https://api.deepseek.com/chat/completions';
      body = { model: settings.deepseekModel || 'deepseek-chat', messages: [{ role: 'user', content: msg }] };
      if (settings.deepseekKey) headers['Authorization'] = 'Bearer ' + settings.deepseekKey;
    } else {
      const baseUrl = settings.openaiUrl || 'https://api.openai.com';
      endpoint = baseUrl + '/v1/chat/completions';
      body = { model: settings.openaiModel || 'gpt-4', messages: [{ role: 'user', content: msg }] };
      if (settings.openaiKey) headers['Authorization'] = 'Bearer ' + settings.openaiKey;
    }

    try {
      const resp = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(body) });
      const data = await resp.json();
      const msgs = document.querySelectorAll('.chat-message.loading');
      msgs.forEach(m => m.remove());
      if (data.choices?.[0]?.message?.content) {
        this.addChatMessage('assistant', data.choices[0].message.content);
        document.getElementById('statusDot').className = 'status-dot connected';
        document.getElementById('statusText').textContent = '已连接';
      } else {
        this.addChatMessage('error', JSON.stringify(data));
        document.getElementById('statusDot').className = 'status-dot error';
        document.getElementById('statusText').textContent = '错误';
      }
    } catch (e) {
      const msgs = document.querySelectorAll('.chat-message.loading');
      msgs.forEach(m => m.remove());
      this.addChatMessage('error', '请求失败: ' + e.message);
      document.getElementById('statusDot').className = 'status-dot error';
      document.getElementById('statusText').textContent = '错误';
    }
  },

  async fetchModels(provider) {
    const settings = JSON.parse(localStorage.getItem('apiSettings') || '{}');
    let endpoint = '', headers = { 'Content-Type': 'application/json' };
    if (provider === 'minimax') {
      endpoint = 'https://api.minimax.chat/v1/models';
      if (settings.minimaxKey) headers['Authorization'] = 'Bearer ' + settings.minimaxKey;
    } else if (provider === 'deepseek') {
      endpoint = 'https://api.deepseek.com/v1/models';
      if (settings.deepseekKey) headers['Authorization'] = 'Bearer ' + settings.deepseekKey;
    } else {
      const baseUrl = settings.openaiUrl || 'https://api.openai.com';
      endpoint = baseUrl + '/v1/models';
      if (settings.openaiKey) headers['Authorization'] = 'Bearer ' + settings.openaiKey;
    }
    try {
      const resp = await fetch(endpoint, { headers });
      const data = await resp.json();
      const selectId = provider + 'Model';
      const select = document.getElementById(selectId);
      if (data.data) {
        const models = data.data.map(m => m.id);
        select.innerHTML = models.map(m => `<option value="${m}">${m}</option>`).join('');
        if (settings[selectId]) select.value = settings[selectId];
      } else if (data.models) {
        select.innerHTML = data.models.map(m => `<option value="${m.id}">${m.id}</option>`).join('');
      } else {
        select.innerHTML = '<option value="">无法加载</option>';
      }
    } catch (e) {
      const select = document.getElementById(provider + 'Model');
      select.innerHTML = '<option value="">加载失败</option>';
    }
  }
};

function openSettings() {
  App.loadApiSettings();
  document.getElementById('settingsModal').classList.add('show');
  App.fetchModels('minimax');
  App.fetchModels('deepseek');
  App.fetchModels('openai');
}

function closeSettings() {
  document.getElementById('settingsModal').classList.remove('show');
}

function saveSettings() {
  App.saveApiSettings();
}

function openChat() {
  App.openChat();
}

function closeChat() {
  App.closeChat();
}

function sendMessage() {
  App.sendMessage();
}
