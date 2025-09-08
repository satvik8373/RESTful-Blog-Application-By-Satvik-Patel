(() => {
  const api = {
    base: '',
    async register(data){ return http('/auth/register','POST',data); },
    async login(data){ return http('/auth/login','POST',data); },
    async createPost(data){ return http('/posts','POST',data, true); },
    async listPosts(){ return http('/posts','GET'); },
    async addComment(data){ return http('/comments','POST',data, true); },
  };

  let token = localStorage.getItem('token') || '';
  const statusEl = document.getElementById('status');
  updateStatus();

  function updateStatus(){
    statusEl.textContent = token ? 'Authenticated' : 'Not authenticated';
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
      alert('Registered. You can login now.');
      e.target.reset();
    } catch (err) {
      alert(err.message);
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
      alert('Logged in');
    } catch (err) {
      alert(err.message);
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
      await renderPosts();
    } catch (err) { alert(err.message); }
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


