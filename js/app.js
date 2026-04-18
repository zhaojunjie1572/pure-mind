const App = {
  data: {
    goldlines: [],
    actions: [],
    currentView: 'dashboard',
    currentLayer: null,
    agents: {}
  },

  layerConfigs: [
    { name: '目标匹配', icon: '🎯' },
    { name: '信息检索', icon: '🔍' },
    { name: '逻辑解析', icon: '🧩' },
    { name: '路径推理', icon: '🛤️' },
    { name: '权力允许', icon: '💪' },
    { name: '规则边界', icon: '⚖️' },
    { name: '金线节点', icon: '✨' },
    { name: '勇猛精进', icon: '⚡' },
    { name: '心念神气', icon: '🧘' }
  ],

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
        this.data.agents = parsed.agents || {};
      }
    } catch (e) {
      console.log('No data found, starting fresh');
    }
  },

  saveToStorage() {
    localStorage.setItem('pureMindData', JSON.stringify({
      goldlines: this.data.goldlines,
      actions: this.data.actions,
      agents: this.data.agents
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
    const config = this.layerConfigs[layerIndex];
    const agent = this.data.agents[layerIndex] || this.getDefaultAgent(layerIndex);
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay show';
    modal.innerHTML = `
      <div class="modal" style="max-width: 700px;">
        <div class="modal-header">
          <h2>${config.icon} 第${layerIndex + 1}层 - ${config.name}</h2>
          <button class="close-btn" onclick="this.closest('.modal-overlay').remove(); Pagoda.resetLayer(${layerIndex});">×</button>
        </div>
        <div class="modal-body">
          <div class="tabs">
            <button class="tab active" onclick="App.switchTab(this, 'content', ${layerIndex})">内容</button>
            <button class="tab" onclick="App.switchTab(this, 'agent', ${layerIndex})">Agent配置</button>
            <button class="tab" onclick="App.switchTab(this, 'chat', ${layerIndex})">对话</button>
          </div>
          
          <div id="tab-content-${layerIndex}" class="tab-content">
            ${this.getLayerContent(layerIndex)}
          </div>
          
          <div id="tab-agent-${layerIndex}" class="tab-content" style="display: none;">
            ${this.renderAgentConfig(layerIndex, agent)}
          </div>
          
          <div id="tab-chat-${layerIndex}" class="tab-content" style="display: none;">
            ${this.renderLayerChat(layerIndex, agent)}
          </div>
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

  switchTab(btn, tabName, layerIndex) {
    btn.parentElement.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    btn.parentElement.parentElement.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
    document.getElementById(`tab-${tabName}-${layerIndex}`).style.display = 'block';
  },

  getDefaultAgent(layerIndex) {
    const prompts = {
      0: '你是一个目标匹配专家。帮助用户明确目标，分析内心渴望，评估匹配度。',
      1: '你是一个信息检索专家。帮助用户搜索、收集、整理关键信息。',
      2: '你是一个逻辑解析专家。帮助用户拆解本质，分析因果，构建逻辑框架。',
      3: '你是一个路径推理专家。帮助用户探索可能性，评估路径，确定最优方案。',
      4: '你是一个权力允许专家。帮助用户认识能力边界，自我授权，利用资源。',
      5: '你是一个规则边界专家。帮助用户识别法律边界、道德底线、时间和成本限制。',
      6: '你是一个金线节点专家。帮助用户规划节点，设定目标，确定依赖关系。',
      7: '你是一个勇猛精进专家。帮助用户制定行动计划，保持节奏，持续推进。',
      8: '你是一个心念神气专家。帮助用户调整状态，记录感受，保持内心平衡。'
    };
    
    return {
      name: this.layerConfigs[layerIndex].name + ' Agent',
      systemPrompt: prompts[layerIndex],
      provider: 'deepseek',
      model: 'deepseek-chat',
      apiKey: '',
      apiUrl: '',
      temperature: 0.7,
      maxTokens: 2000,
      chatHistory: []
    };
  },

  renderAgentConfig(layerIndex, agent) {
    return `
      <div class="form-group">
        <label>Agent名称</label>
        <input type="text" id="agent-name-${layerIndex}" value="${agent.name || ''}" placeholder="Agent名称">
      </div>
      
      <div class="form-group">
        <label>System Prompt</label>
        <textarea id="agent-prompt-${layerIndex}" rows="4" placeholder="系统提示词">${agent.systemPrompt || ''}</textarea>
      </div>
      
      <div class="form-group">
        <label>Provider</label>
        <div class="provider-radios">
          <label><input type="radio" name="agent-provider-${layerIndex}" value="deepseek" ${agent.provider === 'deepseek' ? 'checked' : ''}> DeepSeek</label>
          <label><input type="radio" name="agent-provider-${layerIndex}" value="minimax" ${agent.provider === 'minimax' ? 'checked' : ''}> MiniMax</label>
          <label><input type="radio" name="agent-provider-${layerIndex}" value="openai" ${agent.provider === 'openai' ? 'checked' : ''}> OpenAI兼容</label>
        </div>
      </div>
      
      <div class="form-group">
        <label>Model</label>
        <input type="text" id="agent-model-${layerIndex}" value="${agent.model || ''}" placeholder="模型名称">
      </div>
      
      <div class="form-group">
        <label>API Key</label>
        <input type="password" id="agent-key-${layerIndex}" value="${agent.apiKey || ''}" placeholder="API密钥">
      </div>
      
      <div class="form-group">
        <label>API URL (可选)</label>
        <input type="text" id="agent-url-${layerIndex}" value="${agent.apiUrl || ''}" placeholder="API地址">
      </div>
      
      <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div>
          <label>Temperature</label>
          <input type="number" id="agent-temp-${layerIndex}" value="${agent.temperature || 0.7}" step="0.1" min="0" max="2" style="width: 100%;">
        </div>
        <div>
          <label>Max Tokens</label>
          <input type="number" id="agent-maxtokens-${layerIndex}" value="${agent.maxTokens || 2000}" step="100" min="100" style="width: 100%;">
        </div>
      </div>
      
      <div style="display: flex; gap: 10px; margin-top: 16px;">
        <button class="btn primary" onclick="App.saveAgentConfig(${layerIndex})">保存配置</button>
        <button class="btn" onclick="App.exportAgentConfig(${layerIndex})">导出JSON</button>
        <label class="btn" style="cursor: pointer;"><input type="file" accept=".json" onchange="App.importAgentConfig(event, ${layerIndex})" style="display: none;">导入JSON</label>
      </div>
    `;
  },

  renderLayerChat(layerIndex, agent) {
    const history = agent.chatHistory || [];
    return `
      <div class="chat-body" id="layer-chat-${layerIndex}" style="height: 400px; border: 1px solid rgba(100, 100, 200, 0.3); border-radius: 8px; margin-bottom: 12px;">
        ${history.length === 0 ? '<div class="empty">开始与Agent对话吧</div>' : history.map(msg => `
          <div class="chat-message ${msg.role}">
            <div class="msg-content">${msg.content.replace(/\n/g, '<br>')}</div>
          </div>
        `).join('')}
      </div>
      <div class="chat-input-area" style="padding: 0;">
        <textarea id="layer-chat-input-${layerIndex}" rows="2" placeholder="输入你的问题..." style="flex: 1;"></textarea>
        <button class="btn primary" onclick="App.sendLayerMessage(${layerIndex})">发送</button>
      </div>
    `;
  },

  saveAgentConfig(layerIndex) {
    const provider = document.querySelector(`input[name="agent-provider-${layerIndex}"]:checked`)?.value || 'deepseek';
    const agent = {
      name: document.getElementById(`agent-name-${layerIndex}`).value,
      systemPrompt: document.getElementById(`agent-prompt-${layerIndex}`).value,
      provider,
      model: document.getElementById(`agent-model-${layerIndex}`).value,
      apiKey: document.getElementById(`agent-key-${layerIndex}`).value,
      apiUrl: document.getElementById(`agent-url-${layerIndex}`).value,
      temperature: parseFloat(document.getElementById(`agent-temp-${layerIndex}`).value),
      maxTokens: parseInt(document.getElementById(`agent-maxtokens-${layerIndex}`).value),
      chatHistory: this.data.agents[layerIndex]?.chatHistory || []
    };
    
    this.data.agents[layerIndex] = agent;
    this.saveToStorage();
    alert('Agent配置已保存！');
  },

  exportAgentConfig(layerIndex) {
    const agent = this.data.agents[layerIndex] || this.getDefaultAgent(layerIndex);
    const dataStr = JSON.stringify(agent, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-layer-${layerIndex + 1}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importAgentConfig(event, layerIndex) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const agent = JSON.parse(e.target.result);
        this.data.agents[layerIndex] = agent;
        this.saveToStorage();
        alert('Agent配置已导入！');
        this.openLayer(layerIndex);
        const modal = document.querySelector('.modal-overlay.show');
        if (modal && modal !== document.getElementById('settingsModal') && modal !== document.getElementById('chatModal')) {
          modal.remove();
        }
      } catch (err) {
        alert('JSON文件格式错误！');
      }
    };
    reader.readAsText(file);
  },

  async sendLayerMessage(layerIndex) {
    const input = document.getElementById(`layer-chat-input-${layerIndex}`);
    const content = input.value.trim();
    if (!content) return;
    input.value = '';
    
    const chatBody = document.getElementById(`layer-chat-${layerIndex}`);
    this.addChatMessageToElement(chatBody, 'user', content);
    
    const agent = this.data.agents[layerIndex] || this.getDefaultAgent(layerIndex);
    if (!agent.chatHistory) agent.chatHistory = [];
    agent.chatHistory.push({ role: 'user', content });
    
    this.addChatMessageToElement(chatBody, 'loading', '思考中...');
    
    try {
      const response = await this.callAgentAPI(agent, agent.chatHistory);
      
      const loadingMsgs = chatBody.querySelectorAll('.chat-message.loading');
      loadingMsgs.forEach(m => m.remove());
      
      if (response) {
        this.addChatMessageToElement(chatBody, 'assistant', response);
        agent.chatHistory.push({ role: 'assistant', content: response });
        this.data.agents[layerIndex] = agent;
        this.saveToStorage();
      } else {
        this.addChatMessageToElement(chatBody, 'error', '请求失败');
      }
    } catch (err) {
      const loadingMsgs = chatBody.querySelectorAll('.chat-message.loading');
      loadingMsgs.forEach(m => m.remove());
      this.addChatMessageToElement(chatBody, 'error', '请求失败: ' + err.message);
    }
  },

  addChatMessageToElement(element, role, content) {
    const div = document.createElement('div');
    div.className = `chat-message ${role}`;
    div.innerHTML = `<div class="msg-content">${content.replace(/\n/g, '<br>')}</div>`;
    const empty = element.querySelector('.empty');
    if (empty) empty.remove();
    element.appendChild(div);
    element.scrollTop = element.scrollHeight;
  },

  async callAgentAPI(agent, messages) {
    let endpoint, body, headers;
    
    if (agent.provider === 'minimax') {
      endpoint = agent.apiUrl || 'https://api.minimax.chat/v1/text/chatcompletion_pro';
      body = {
        model: agent.model || 'abab6.5s-chat',
        messages: messages,
        temperature: agent.temperature || 0.7,
        tokens_to_generate: agent.maxTokens || 2000
      };
      headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + agent.apiKey
      };
    } else if (agent.provider === 'deepseek') {
      endpoint = agent.apiUrl || 'https://api.deepseek.com/chat/completions';
      body = {
        model: agent.model || 'deepseek-chat',
        messages: agent.systemPrompt ? [{ role: 'system', content: agent.systemPrompt }, ...messages] : messages,
        temperature: agent.temperature || 0.7,
        max_tokens: agent.maxTokens || 2000
      };
      headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + agent.apiKey
      };
    } else {
      endpoint = agent.apiUrl || 'https://api.openai.com/v1/chat/completions';
      body = {
        model: agent.model || 'gpt-4',
        messages: agent.systemPrompt ? [{ role: 'system', content: agent.systemPrompt }, ...messages] : messages,
        temperature: agent.temperature || 0.7,
        max_tokens: agent.maxTokens || 2000
      };
      headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + agent.apiKey
      };
    }
    
    const resp = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(body) });
    const data = await resp.json();
    
    if (data.choices?.[0]?.message?.content) {
      return data.choices[0].message.content;
    } else if (data.reply) {
      return data.reply;
    }
    return null;
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
      <button class="btn primary" onclick="App.saveGoalMatch()">保存</button>
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
      <button class="btn primary" onclick="App.saveInfoRetrieve()">保存</button>
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
      <button class="btn primary" onclick="App.saveLogicParse()">保存</button>
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
      <button class="btn primary" onclick="App.savePathReason()">保存</button>
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
      <button class="btn primary" onclick="App.savePowerAllow()">保存</button>
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
      <button class="btn primary" onclick="App.saveRuleBoundary()">保存</button>
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

  saveGoalMatch() { alert('🎯 目标已确认！'); },
  saveInfoRetrieve() { alert('🔍 信息已保存！'); },
  saveLogicParse() { alert('🧩 逻辑已解析！'); },
  savePathReason() { alert('🛤️ 路径已确定！'); },
  savePowerAllow() { alert('💪 权限已确认！'); },
  saveRuleBoundary() { alert('⚖️ 边界已划定！'); },

  createGoldNode() {
    const name = document.getElementById('nodeName').value;
    if (!name) { alert('请输入节点名称！'); return; }
    
    const goldline = {
      id: Date.now().toString(),
      name,
      position: document.getElementById('nodePosition')?.value,
      path: document.getElementById('nodeGoal')?.value,
      dependency: document.getElementById('nodeDependency')?.value,
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
    if (!name) { alert('请输入行动名称！'); return; }
    
    const action = {
      id: Date.now().toString(),
      name,
      rhythm: document.getElementById('actionRhythm')?.value || 'maintain',
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

  render() {},

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
      body = { model: settings.minimaxModel || 'abab6.5s-chat', messages: [{ role: 'user', content: msg }] };
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
