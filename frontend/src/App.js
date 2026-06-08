import React, { useState, useEffect } from 'react';
import { API_BASE } from './config';
import './App.css';

function App() {
  // Auth Form State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [authMsg, setAuthMsg] = useState('');

  // Content Form & List State
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [contentMsg, setContentMsg] = useState('');

  // Fetch all content posts on mount
  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_BASE.CONTENT}/content/posts`);
      const data = await res.json();
      if (res.ok) setPosts(data);
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE.USER}/auth/users`);
      const data = await res.json();
      if (res.ok) setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };



  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      const res = await fetch(`${API_BASE.USER}/auth/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchUsers();
      } else {
        const data = await res.json();
        console.error('Delete user failed:', data);
        alert(data.error || 'Failed to delete user');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Could not connect to Auth Service');
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      const res = await fetch(`${API_BASE.CONTENT}/content/posts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchPosts();
      } else {
        const data = await res.json();
        console.error('Delete post failed:', data);
        alert(data.error || 'Failed to delete post');
      }
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Could not connect to Content Service');
    }
  };

  

  useEffect(() => {
    fetchPosts();
    fetchUsers();
    
  }, []);

  // Handle User Registration
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE.USER}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email }),
      });
      const data = await res.json();
      if (res.ok) {
        setAuthMsg(`Success! Created User ID: ${data[0]?.id || 'New'}`);
        setUsername('');
        setEmail('');
      } else {
        setAuthMsg(`Error: ${data.error}`);
      }
    } catch (err) {
      setAuthMsg('Could not connect to Auth Service');
    }
  };

  // Handle Post Creation
  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE.CONTENT}/content/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body }),
      });
      const data = await res.json();
      if (res.ok) {
        setContentMsg('Post created successfully!');
        setTitle('');
        setBody('');
        fetchPosts(); // Refresh list
      } else {
        setContentMsg(`Error: ${data.error}`);
      }
    } catch (err) {
      setContentMsg('Could not connect to Content Service');
    }
  };



  return (
    <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      <h1>Microservices Dashboard webhook check 1</h1>
      <hr />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '20px' }}>
        {/* Left Side: Auth Service */}
        <section style={{ background: '#f4f4f4', padding: '20px', borderRadius: '8px' }}>
          <h2>User Service </h2>
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: '10px' }}>
              <label>Username: </label><br />
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} required style={{ width: '90%', padding: '8px' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Email: </label><br />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '90%', padding: '8px' }} />
            </div>
            <button type="submit" style={{ padding: '10px 15px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Register User</button>
          </form>
          {authMsg && <p style={{ fontWeight: 'bold', color: '#333' }}>{authMsg}</p>}
        </section>

        {/* Right Side: Content Service */}
        <section style={{ background: '#e9f7ef', padding: '20px', borderRadius: '8px' }}>
          <h2>Content Service</h2>
          <form onSubmit={handleCreatePost}>
            <div style={{ marginBottom: '10px' }}>
              <label>Post Title: </label><br />
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} required style={{ width: '90%', padding: '8px' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Body Content: </label><br />
              <textarea value={body} onChange={e => setBody(e.target.value)} required style={{ width: '90%', padding: '8px', height: '60px' }} />
            </div>
            <button type="submit" style={{ padding: '10px 15px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Create Post</button>
          </form>
          {contentMsg && <p style={{ fontWeight: 'bold', color: '#333' }}>{contentMsg}</p>}
        </section>
      </div>

     

      {/* Bottom Section: View Content Feed */}
      <section style={{ marginTop: '40px' }}>
        <h2>Live Content Feed (From database via Content Service)</h2>
        {posts.length === 0 ? <p>No posts available yet.</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {posts.map(post => (
              <div key={post.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px', position: 'relative' }}>
                <button onClick={() => handleDeletePost(post.id)} style={{ position: 'absolute', right: '10px', top: '10px', background: '#dc3545', color: 'white', border: 'none', padding: '6px 8px', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                <h3 style={{ margin: '0 0 5px 0' }}>{post.title}</h3>
                <p style={{ margin: '0', color: '#555' }}>{post.body}</p>
                <small style={{ color: '#aaa' }}>Created at: {new Date(post.created_at).toLocaleString()}</small>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Registered Users */}
      <section style={{ marginTop: '40px' }}>
        <h2>Registered Users (From Auth Service)</h2>
        {users.length === 0 ? <p>No users registered yet.</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {users.map(u => (
              <div key={u.id} style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '5px', position: 'relative' }}>
                <button onClick={() => handleDeleteUser(u.id)} style={{ position: 'absolute', right: '10px', top: '10px', background: '#dc3545', color: 'white', border: 'none', padding: '6px 8px', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                <strong>{u.username}</strong> — <span>{u.email}</span>
                <br />
                <small style={{ color: '#aaa' }}>Joined: {new Date(u.created_at).toLocaleString()}</small>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default App;
