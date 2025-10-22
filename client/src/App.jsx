// App.jsx - Main application component with routing

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Layout and Page components (to be created)
// import Layout from './components/layout/Layout';
// import HomePage from './pages/HomePage';
// import PostDetails from './pages/PostDetails';
// import CreatePostPage from './pages/CreatePostPage';
// import LoginPage from './pages/LoginPage';
// import RegisterPage from './pages/RegisterPage';

// Placeholder components for initial structure
const Layout = ({ children }) => (
  <div>
    <header style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
      <h1>MERN Blog</h1>
      <nav>
        <a href="/">Home</a> | <a href="/create">Create Post</a> | <a href="/login">Login</a>
      </nav>
    </header>
    <main style={{ padding: '20px' }}>{children}</main>
  </div>
);
const HomePage = () => <h2>Home Page (Post List)</h2>;
const PostDetails = () => <h2>Post Details Page</h2>;
const CreatePostPage = () => <h2>Create/Edit Post Page</h2>;
const LoginPage = () => <h2>Login</h2>;
const RegisterPage = () => <h2>Register</h2>;


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