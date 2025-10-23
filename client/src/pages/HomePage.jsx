// HomePage.jsx - Displays the list of all blog posts

import React, { useState } from 'react';
import { postService } from '../services/api';
import useFetch from '../hooks/useFetch';
import PostCard from '../components/posts/PostCard';

const HomePage = () => {
  // We'll manage pagination/filtering later (Task 5), so we use simple state for now
  const [page] = useState(1);
  const [limit] = useState(10);
  const [category] = useState(null);

  // Use the custom hook. The function must be wrapped in a lambda to pass arguments.
  const { data: posts, loading, error } = useFetch(
    () => postService.getAllPosts(page, limit, category),
    [page, limit, category] // Re-fetch when these change
  );

  if (loading) {
    return <div style={{ textAlign: 'center' }}>Loading posts...</div>;
  }

  if (error) {
    return <div style={{ color: 'red', textAlign: 'center' }}>Error: {error}</div>;
  }

  if (!posts || posts.length === 0) {
    return <div style={{ textAlign: 'center' }}>No posts found. Start writing!</div>;
  }

  return (
    <div className="home-page">
      <h2>Latest Blog Posts</h2>
      <div className="post-list">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
      {/* Pagination component will go here later (Task 5) */}
    </div>
  );
};

export default HomePage;