(() => {
  const api = {
    base: '/api',
    async register(data){ return http('/auth/register','POST',data); },
    async login(data){ return http('/auth/login','POST',data); },
    async createPost(data){ return http('/posts','POST',data, true); },
    async listPosts(){ return http('/posts','GET'); },
    async addComment(data){ return http('/comments','POST',data, true); },
    async listComments(postId){ return http(`/comments?post_id=${postId}`,'GET'); },
    async updatePost(id, data){ return http(`/posts/${id}`,'PUT',data, true); },
    async deletePost(id){ return http(`/posts/${id}`,'DELETE',null, true); },
    async updateComment(id, data){ return http(`/comments/${id}`,'PUT',data, true); },
    async deleteComment(id){ return http(`/comments/${id}`,'DELETE',null, true); },
  };

  let token = localStorage.getItem('token') || '';
  const authMsg = document.getElementById('auth-messages');
  const postMsg = document.getElementById('post-messages');
  const logoutBtn = document.getElementById('logout-btn');
  const welcomeText = document.getElementById('welcome-text');
  const authSection = document.getElementById('auth-section');
  const blogSection = document.getElementById('blog-section');
  const tabs = document.querySelectorAll('.tab');
  const panes = document.querySelectorAll('.pane');
  tabs.forEach(t => t.addEventListener('click', () => switchTab(t.dataset.tab)));
  logoutBtn.addEventListener('click', () => doLogout());
  updateStatus();

  function updateStatus(){
    const authed = Boolean(token);
    
    // Show/hide header elements
    welcomeText.classList.toggle('hidden', !authed);
    logoutBtn.classList.toggle('hidden', !authed);
    
    // Show/hide sections based on auth status
    if (authed) {
      authSection.classList.add('hidden');
      blogSection.classList.remove('hidden');
    } else {
      authSection.classList.remove('hidden');
      blogSection.classList.add('hidden');
    }
    
    // Load posts when authenticated
    if (authed) {
      renderPosts();
    }
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
    showMessage(authMsg, 'Logged out successfully.', 'success');
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
    const countEl = document.getElementById('post-count');
    listEl.innerHTML = '<div class="loading">Loading posts...</div>';
    try {
      const posts = await api.listPosts();
      listEl.innerHTML = '';
      countEl.textContent = `${posts.length} post${posts.length !== 1 ? 's' : ''}`;
      
      if (posts.length === 0) {
        listEl.innerHTML = '<div class="no-posts"><p>No posts yet. Be the first to share something!</p></div>';
        return;
      }
      
      for (const p of posts){
        const node = await renderPost(p);
        listEl.appendChild(node);
      }
    } catch (err) {
      listEl.innerHTML = `<div class="error">Failed to load posts: ${err.message}</div>`;
    }
  }

  async function renderPost(post){
    const tpl = document.getElementById('post-tpl');
    const node = tpl.content.cloneNode(true);
    node.querySelector('.post-title').textContent = post.title;
    node.querySelector('.post-content').textContent = post.content;
    node.querySelector('.post-meta').textContent = new Date(post.createdAt).toLocaleDateString() + ' at ' + new Date(post.createdAt).toLocaleTimeString();
    
    // Load and display comments
    const commentsEl = node.querySelector('.comments');
    try {
      const comments = await api.listComments(post._id);
      if (comments.length > 0) {
        commentsEl.innerHTML = comments.map(c => 
          `<div class="comment" data-comment-id="${c._id}">
            <div class="comment-header">
              <small>${new Date(c.createdAt).toLocaleString()}</small>
              <div class="comment-actions">
                <button class="edit-comment-btn" title="Edit comment">✏️</button>
                <button class="delete-comment-btn" title="Delete comment">🗑️</button>
              </div>
            </div>
            <p class="comment-content">${c.content}</p>
          </div>`
        ).join('');
      } else {
        commentsEl.innerHTML = '<p class="no-comments">No comments yet.</p>';
      }
    } catch (err) {
      commentsEl.innerHTML = '<p class="error">Failed to load comments.</p>';
    }
    
    const form = node.querySelector('.comment-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const content = form.querySelector('.comment-content').value.trim();
      if (!content) return;
      try {
        await api.addComment({ postId: post._id, content });
        form.reset();
        // Re-render just this post to update comments
        const postEl = e.target.closest('.post');
        const postData = { _id: post._id, title: postEl.querySelector('.post-title').textContent, content: postEl.querySelector('.post-content').textContent, createdAt: post.createdAt };
        const newPostEl = await renderPost(postData);
        postEl.parentNode.replaceChild(newPostEl, postEl);
      } catch (err) { alert(err.message); }
    });
    
    // Post edit/delete handlers
    const editPostBtn = node.querySelector('.edit-post-btn');
    const deletePostBtn = node.querySelector('.delete-post-btn');
    
    editPostBtn.addEventListener('click', () => editPost(post));
    deletePostBtn.addEventListener('click', () => deletePost(post._id));
    
    // Comment edit/delete handlers
    node.querySelectorAll('.edit-comment-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const commentEl = e.target.closest('.comment');
        const commentId = commentEl.dataset.commentId;
        const content = commentEl.querySelector('.comment-content').textContent;
        editComment(commentId, content);
      });
    });
    
    node.querySelectorAll('.delete-comment-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const commentEl = e.target.closest('.comment');
        const commentId = commentEl.dataset.commentId;
        deleteComment(commentId);
      });
    });
    
    return node;
  }

  // CRUD functions
  function editPost(post) {
    const newTitle = prompt('Edit title:', post.title);
    if (newTitle === null) return;
    const newContent = prompt('Edit content:', post.content);
    if (newContent === null) return;
    
    api.updatePost(post._id, { title: newTitle, content: newContent })
      .then(() => renderPosts())
      .catch(err => alert(err.message));
  }
  
  function deletePost(postId) {
    if (!confirm('Delete this post?')) return;
    api.deletePost(postId)
      .then(() => renderPosts())
      .catch(err => alert(err.message));
  }
  
  function editComment(commentId, currentContent) {
    const newContent = prompt('Edit comment:', currentContent);
    if (newContent === null || newContent === currentContent) return;
    
    api.updateComment(commentId, { content: newContent })
      .then(() => renderPosts())
      .catch(err => alert(err.message));
  }
  
  function deleteComment(commentId) {
    if (!confirm('Delete this comment?')) return;
    api.deleteComment(commentId)
      .then(() => renderPosts())
      .catch(err => alert(err.message));
  }

  // Only render posts if authenticated
  if (token) {
    renderPosts();
  }
})();


