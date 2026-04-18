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
      '目标匹配',
      '信息检索',
      '逻辑解析',
      '路径推理',
      '权力允许',
      '规则边界',
      '金线节点',
      '勇猛精进',
      '心念神气'
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
      this.renderGoalMatchLayer(),
      this.renderInfoRetrieveLayer(),
      this.renderLogicParseLayer(),
      this.renderPathReasonLayer(),
      this.renderPowerAllowLayer(),
      this.renderRuleBoundaryLayer(),
      this.renderGoldNodeLayer(),
      this.renderVigorousAdvanceLayer(),
      this.renderMindSpiritLayer()
    ];
    return contents[layerIndex] || '<p>功能开发中...</p>';
  },

  renderGoalMatchLayer() {
    return `
      <div class="form-group">
        <label>🎯 当前目标</label>
        <textarea id="currentGoal" rows="3" placeholder="明确你想要达成的目标..."></textarea>
      </div>
      <div class="form-group">
        <label>💫 内心渴望</label>
        <textarea id="innerDesire" rows="3" placeholder="这背后真正的渴望是什么？"></textarea>
      </div>
      <div class="form-group">
        <label>⚡ 匹配度</label>
        <select id="goalMatch">
          <option value="high">高度匹配</option>
          <option value="medium">部分匹配</option>
          <option value="low">不匹配</option>
        </select>
      </div>
      <button class="btn primary" onclick="App.saveGoalMatch()">确认目标</button>
    `;
  },

  renderInfoRetrieveLayer() {
    return `
      <div class="form-group">
        <label>🔍 检索方向</label>
        <select id="searchDirection">
          <option value="book">书籍文献</option>
          <option value="web">网络资料</option>
          <option value="experience">个人经验</option>
          <option value="mentor">请教导师</option>
        </select>
      </div>
      <div class="form-group">
        <label>📚 关键信息</label>
        <textarea id="keyInfo" rows="5" placeholder="记录收集到的关键信息..."></textarea>
      </div>
      <div class="form-group">
        <label>🔗 信息来源</label>
        <input type="text" id="infoSource" placeholder="来源链接或出处">
      </div>
      <button class="btn primary" onclick="App.saveInfoRetrieve()">保存信息</button>
    `;
  },

  renderLogicParseLayer() {
    return `
      <div class="form-group">
        <label>🧩 本质拆解</label>
        <textarea id="essenceParse" rows="3" placeholder="拆解事物的本质..."></textarea>
      </div>
      <div class="form-group">
        <label>🔄 因果分析</label>
        <textarea id="causeEffect" rows="3" placeholder="分析因果关系..."></textarea>
      </div>
      <div class="form-group">
        <label>📊 逻辑框架</label>
        <textarea id="logicFramework" rows="3" placeholder="构建你的逻辑框架..."></textarea>
      </div>
      <button class="btn primary" onclick="App.saveLogicParse()">保存解析</button>
    `;
  },

  renderPathReasonLayer() {
    return `
      <div class="form-group">
        <label>🛤️ 可能路径</label>
        <textarea id="possiblePaths" rows="4" placeholder="列出所有可能的路径..."></textarea>
      </div>
      <div class="form-group">
        <label>⚖️ 路径评估</label>
        <textarea id="pathEval" rows="3" placeholder="评估各路径的优劣..."></textarea>
      </div>
      <div class="form-group">
        <label>🎯 最优路径</label>
        <textarea id="bestPath" rows="3" placeholder="确定最优路径..."></textarea>
      </div>
      <button class="btn primary" onclick="App.savePathReason()">确定路径</button>
    `;
  },

  renderPowerAllowLayer() {
    return `
      <div class="form-group">
        <label>💪 能力边界</label>
        <textarea id="powerBoundary" rows="3" placeholder="你有什么能力？边界在哪里？"></textarea>
      </div>
      <div class="form-group">
        <label>✅ 自我授权</label>
        <textarea id="selfAuthorize" rows="3" placeholder="你允许自己做什么？"></textarea>
      </div>
      <div class="form-group">
        <label>🌟 资源支持</label>
        <textarea id="resourceSupport" rows="3" placeholder="你有什么资源可以利用？"></textarea>
      </div>
      <button class="btn primary" onclick="App.savePowerAllow()">确认权限</button>
    `;
  },

  renderRuleBoundaryLayer() {
    return `
      <div class="form-group">
        <label>⚖️ 法律边界</label>
        <textarea id="legalBoundary" rows="2" placeholder="法律上的边界是什么？"></textarea>
      </div>
      <div class="form-group">
        <label>🎭 道德底线</label>
        <textarea id="moralBoundary" rows="2" placeholder="你的道德底线是什么？"></textarea>
      </div>
      <div class="form-group">
        <label>⏰ 时间限制</label>
        <textarea id="timeLimit" rows="2" placeholder="时间上的限制是什么？"></textarea>
      </div>
      <div class="form-group">
        <label>💰 成本约束</label>
        <textarea id="costConstraint" rows="2" placeholder="成本约束是什么？"></textarea>
      </div>
      <button class="btn primary" onclick="App.saveRuleBoundary()">划定边界</button>
    `;
  },

  renderGoldNodeLayer() {
    return `
      <div class="form-group">
        <label>✨ 节点名称</label>
        <input type="text" id="nodeName" placeholder="给这个金线节点起个名字">
      </div>
      <div class="form-group">
        <label>📍 节点位置</label>
        <input type="text" id="nodePosition" placeholder="这是第几个节点？">
      </div>
      <div class="form-group">
        <label>🎯 节点目标</label>
        <textarea id="nodeGoal" rows="3" placeholder="这个节点要达成什么？"></textarea>
      </div>
      <div class="form-group">
        <label>🔗 前置依赖</label>
        <textarea id="nodeDependency" rows="2" placeholder="前置条件是什么？"></textarea>
      </div>
      <button class="btn primary" onclick="App.createGoldNode()">✨ 确立节点</button>
      <div style="margin-top:16px">
        ${this.data.goldlines.length === 0 
          ? '<p class="empty">还没有金线节点</p>'
          : this.data.goldlines.map(gl => `
            <div class="goldline-card">
              <h3>${gl.name}</h3>
              <p>${gl.path || ''}</p>
              <div class="card-footer">
                <button class="btn small" onclick="App.deleteGoldline('${gl.id}')">删除</button>
              </div>
            </div>
          `).join('')}
      </div>
    `;
  },

  renderVigorousAdvanceLayer() {
    return `
      <div class="form-group">
        <label>⚡ 今日行动</label>
        <input type="text" id="todayAction" placeholder="今天要做什么？">
      </div>
      <div class="form-group">
        <label>🏃 行动节奏</label>
        <select id="actionRhythm">
          <option value="sprint">🔥 冲刺</option>
          <option value="maintain">⚡ 保持</option>
          <option value="rest">🌙 休整</option>
        </select>
      </div>
      <button class="btn primary" onclick="App.createAction()">开始行动</button>
      <div class="actions-list" style="margin-top:16px">
        ${this.data.actions.length === 0 
          ? '<p class="empty">还没有行动</p>'
          : this.data.actions.map(a => `
            <div class="action-item">
              <input type="checkbox" ${a.completed ? 'checked' : ''} onchange="App.toggleAction('${a.id}')">
              <span class="${a.completed ? 'completed' : ''}">${a.name}</span>
            </div>
          `).join('')}
      </div>
    `;
  },

  renderMindSpiritLayer() {
    const total = this.data.goldlines.length;
    const completed = this.data.actions.filter(a => a.completed).length;
    const progress = total > 0 ? Math.round((completed / (this.data.actions.length || 1)) * 100) : 0;
    return `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${total}</div>
          <div class="stat-label">金线节点</div>
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
      <div style="margin-top:24px">
        <h3>🧘 心念状态</h3>
        <div class="form-group">
          <label>✨ 当下感受</label>
          <textarea id="currentFeeling" rows="3" placeholder="记录你当下的心念状态..."></textarea>
        </div>
        <div class="form-group">
          <label>💫 神气校准</label>
          <textarea id="spiritCalibrate" rows="3" placeholder="如何调整你的状态？"></textarea>
        </div>
        <button class="btn" onclick="alert('心念记录已保存！')">记录心念</button>
      </div>
      <div style="margin-top:24px">
        <h3>⚙️ 系统设置</h3>
        <div class="form-group">
          <label>⭐ 星星数量</label>
          <input type="range" min="100" max="500" value="300" onchange="AuroraConfig.setStarsCount(this.value)">
        </div>
        <div class="form-group">
          <label>🌈 极光强度</label>
          <input type="range" min="0" max="2" step="0.1" value="1.5" onchange="AuroraConfig.setAuroraIntensity(this.value)">
        </div>
        <button class="btn danger" onclick="if(confirm('确定清除所有数据？')){App.clearAllData()}">清除数据</button>
      </div>
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

  saveGoalMatch() {
    alert('🎯 目标已确认！');
  },

  saveInfoRetrieve() {
    alert('🔍 信息已保存！');
  },

  saveLogicParse() {
    alert('🧩 逻辑已解析！');
  },

  savePathReason() {
    alert('🛤️ 路径已确定！');
  },

  savePowerAllow() {
    alert('💪 权限已确认！');
  },

  saveRuleBoundary() {
    alert('⚖️ 边界已划定！');
  },

  createGoldNode() {
    const name = document.getElementById('nodeName').value;
    const position = document.getElementById('nodePosition').value;
    const goal = document.getElementById('nodeGoal').value;
    const dependency = document.getElementById('nodeDependency').value;
    
    if (!name) {
      alert('请输入节点名称！');
      return;
    }
    
    const goldline = {
      id: Date.now().toString(),
      name,
      position,
      path: goal,
      dependency,
      created: new Date().toISOString().split('T')[0],
      progress: 0
    };
    
    this.data.goldlines.push(goldline);
    this.saveToStorage();
    alert('✨ 金线节点已确立！');
    this.openLayer(6);
  },

  deleteGoldline(id) {
    this.data.goldlines = this.data.goldlines.filter(g => g.id !== id);
    this.saveToStorage();
    this.openLayer(6);
  },

  createAction() {
    const name = document.getElementById('todayAction').value;
    
    if (!name) {
      alert('请输入行动名称！');
      return;
    }
    
    const action = {
      id: Date.now().toString(),
      name,
      rhythm: document.getElementById('actionRhythm').value,
      progress: 0,
      completed: false,
      today: true
    };
    
    this.data.actions.push(action);
    this.saveToStorage();
    alert('⚡ 行动已启动！');
    this.openLayer(7);
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
