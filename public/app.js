(() => {
  const api = {
    base: '/api',
    async register(data){ return http('/auth/register','POST',data); },
    async login(data){ return http('/auth/login','POST',data); },
    async createPost(data){ return http('/posts','POST',data, true); },
    async listPosts(){ return http('/posts','GET'); },
    async addComment(data){ return http('/comments','POST',data, true); },
  };

  let token = localStorage.getItem('token') || '';
  const statusEl = document.getElementById('status');
  const authMsg = document.getElementById('auth-messages');
  const postMsg = document.getElementById('post-messages');
  const logoutBtn = document.getElementById('logout-btn');
  const authCard = document.querySelector('.card.auth');
  const tabs = document.querySelectorAll('.tab');
  const panes = document.querySelectorAll('.pane');
  tabs.forEach(t => t.addEventListener('click', () => switchTab(t.dataset.tab)));
  logoutBtn.addEventListener('click', () => doLogout());
  updateStatus();

  function updateStatus(){
    const authed = Boolean(token);
    statusEl.textContent = authed ? 'Authenticated' : 'Not authenticated';
    logoutBtn.hidden = !authed;
    document.getElementById('post-form').querySelector('button').disabled = !authed;
    authCard.classList.toggle('hidden', authed);
  }

  function showMessage(el, text, type='error'){
    if (!el) return;
    el.textContent = text;
    el.className = `messages ${type}`;
    if (!text) el.className = 'messages';
  }

  function switchTab(name){
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name));
    panes.forEach(p => p.classList.toggle('active', p.id.startsWith(name)));
    showMessage(authMsg, '');
  }

  function doLogout(){
    token = '';
    localStorage.removeItem('token');
    updateStatus();
    alert('Logged out');
  }

  async function http(path, method, body, auth){
    const headers = { 'Content-Type': 'application/json' };
    if (auth && token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${api.base}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    if (!res.ok) {
      const err = await safeJson(res);
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    return safeJson(res);
  }

  async function safeJson(res){
    try{ return await res.json(); } catch{ return {}; }
  }

  // Forms
  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      username: document.getElementById('reg-username').value.trim(),
      email: document.getElementById('reg-email').value.trim(),
      password: document.getElementById('reg-password').value
    };
    try {
      await api.register(payload);
      showMessage(authMsg, 'Registered. You can login now.', 'success');
      e.target.reset();
      switchTab('login');
    } catch (err) {
      showMessage(authMsg, err.message, 'error');
    }
  });

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      email: document.getElementById('login-email').value.trim(),
      password: document.getElementById('login-password').value
    };
    try {
      const r = await api.login(payload);
      token = r.token || '';
      localStorage.setItem('token', token);
      updateStatus();
      e.target.reset();
      showMessage(authMsg, 'Logged in successfully.', 'success');
    } catch (err) {
      showMessage(authMsg, err.message, 'error');
    }
  });

  document.getElementById('post-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      title: document.getElementById('post-title').value.trim(),
      content: document.getElementById('post-content').value
    };
    try {
      await api.createPost(payload);
      e.target.reset();
      showMessage(postMsg, 'Post published.', 'success');
      await renderPosts();
    } catch (err) {
      showMessage(postMsg, err.message, 'error');
    }
  });

  async function renderPosts(){
    const listEl = document.getElementById('posts');
    listEl.innerHTML = 'Loading...';
    try {
      const posts = await api.listPosts();
      listEl.innerHTML = '';
      for (const p of posts){
        const node = renderPost(p);
        listEl.appendChild(node);
      }
      if (posts.length === 0) listEl.textContent = 'No posts yet.';
    } catch (err) {
      listEl.textContent = err.message;
    }
  }

  function renderPost(post){
    const tpl = document.getElementById('post-tpl');
    const node = tpl.content.cloneNode(true);
    node.querySelector('.post-title').textContent = post.title;
    node.querySelector('.post-content').textContent = post.content;
    node.querySelector('.post-meta').textContent = new Date(post.createdAt).toLocaleString();
    const form = node.querySelector('.comment-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const content = form.querySelector('.comment-content').value.trim();
      if (!content) return;
      try {
        await api.addComment({ postId: post._id, content });
        form.reset();
        await renderPosts();
      } catch (err) { alert(err.message); }
    });
    return node;
  }

  renderPosts();
})();


