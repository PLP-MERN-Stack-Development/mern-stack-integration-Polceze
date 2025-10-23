// App.jsx - Main application component with routing

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Layout (still using placeholder for simplicity) and Page components
// You should create a proper Layout component in components/layout/
const Layout = ({ children }) => (
  <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
    <header style={{ padding: '10px 20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h1 style={{ margin: 0 }}><a href="/" style={{ textDecoration: 'none', color: '#333' }}>MERN Blog</a></h1>
      <nav>
        <a href="/" style={{ margin: '0 10px' }}>Home</a>
        <a href="/create" style={{ margin: '0 10px' }}>Create Post</a>
        <a href="/login" style={{ margin: '0 10px' }}>Login</a>
      </nav>
    </header>
    <main style={{ padding: '20px' }}>{children}</main>
  </div>
);


// ----------------------------------------------------------------------
// Import Real Components:

import HomePage from './pages/HomePage'; 
// import PostDetails from './pages/PostDetails';
// import CreatePostPage from './pages/CreatePostPage';
// import LoginPage from './pages/LoginPage';
// import RegisterPage from './pages/RegisterPage';

// Placeholder components for pages we haven't built yet
const PostDetails = () => <h2>Post Details Page (In Progress)</h2>;
const CreatePostPage = () => <h2>Create/Edit Post Page (In Progress)</h2>;
const LoginPage = () => <h2>Login (In Progress)</h2>;
const RegisterPage = () => <h2>Register (In Progress)</h2>;

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/posts/:slug" element={<PostDetails />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected Routes (Will add protection later) */}
          <Route path="/create" element={<CreatePostPage />} />
          <Route path="/edit/:id" element={<CreatePostPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;