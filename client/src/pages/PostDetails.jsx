// PostDetails.jsx - Displays a single blog post and its comments

import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { postService } from '../services/api';
import useFetch from '../hooks/useFetch';

const PostDetails = () => {
  // Get the slug from the URL parameters
  const { slug } = useParams();
  const { isAuthenticated } = useAuth(); // Removed unused 'user' variable

  // Fetch the single post using the slug
  const { data: post, loading, error, setData: setPost } = useFetch( // Added setData as setPost
    () => postService.getPost(slug),
    [slug]
  );
  
  // State for the new comment form
  const [newComment, setNewComment] = useState('');

  if (loading) {
    return <div style={{ textAlign: 'center' }}>Loading post details...</div>;
  }

  if (error) {
    return <div style={{ color: 'red', textAlign: 'center' }}>Error: {error}</div>;
  }

  if (!post) {
    return <div style={{ textAlign: 'center' }}>Post not found.</div>;
  }

  // Helper function to handle comment submission 
  const handleCommentSubmit = async (e) => {
      e.preventDefault();

      if (!isAuthenticated) {
          alert('You must be logged in to comment.');
          return;
      }

      try {
          // post._id is available because the post was fetched successfully
          const response = await postService.addComment(post._id, { content: newComment });

          // OPTIMISTIC UI UPDATE: Manually update the post state with the new comment
          setPost(prevPost => ({
              ...prevPost,
              comments: [...prevPost.comments, response.data]
          }));

          setNewComment('');
          alert('Comment posted!');
      } catch (error) {
          alert(`Failed to post comment: ${error.response?.data?.error || 'Server error'}`);
      }
  };

  const imageUrl = post.featuredImage.startsWith('http') 
    ? post.featuredImage 
    : `/uploads/${post.featuredImage}`;
    
  const date = new Date(post.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div style={containerStyle}>
      <img src={imageUrl} alt={post.title} style={imageStyle} />
      <h1 style={titleStyle}>{post.title}</h1>
      <p style={metaStyle}>
        By **{post.author.username}** in *{post.category.name}* | {date} | Views: {post.viewCount}
      </p>
      
      {/* Edit button (assuming user is logged in and authorized) */}
      <Link to={`/edit/${post._id}`} style={editButtonStyle}>
        Edit Post
      </Link>
      
      <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} style={contentStyle} />
      
      {/* ----------------- Comments Section ----------------- */}
      <div style={commentsSectionStyle}>
        <h3>Comments ({post.comments.length})</h3>
        
        {/* Comment Form */}
        {isAuthenticated ? (
            <form onSubmit={handleCommentSubmit} style={commentFormStyle}>
                <textarea
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                    rows="4"
                    style={textareaStyle}
                />
                <button type="submit" style={submitButtonStyle}>Post Comment</button>
            </form>
        ) : (
            <p style={{ textAlign: 'center', padding: '15px', border: '1px solid #ddd' }}>
                <Link to="/login">Log in</Link> to leave a comment.
            </p>
        )}

        {/* List Comments */}
        {post.comments.length > 0 ? (
          <div style={commentsListStyle}>
            {post.comments.map((comment, index) => (
              <div key={index} style={commentStyle}>
                <p style={commentMetaStyle}>
                  **{comment.user.username || 'Anonymous'}** on {new Date(comment.createdAt).toLocaleDateString()}
                </p>
                <p>{comment.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No comments yet. Be the first!</p>
        )}
      </div>
    </div>
  );
};

// Simple inline styles for demonstration
const containerStyle = {
  maxWidth: '900px', margin: '0 auto', padding: '20px', backgroundColor: '#fff'
};
const imageStyle = {
  width: '100%', height: '400px', objectFit: 'cover', borderRadius: '8px', marginBottom: '20px'
};
const titleStyle = {
  fontSize: '2.5em', marginBottom: '10px'
};
const metaStyle = {
  fontSize: '0.9em', color: '#666', marginBottom: '20px'
};
const editButtonStyle = {
    display: 'inline-block', padding: '8px 15px', backgroundColor: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '5px', marginBottom: '20px'
}
const contentStyle = {
  lineHeight: '1.7', borderTop: '1px solid #eee', paddingTop: '20px'
};
const commentsSectionStyle = {
    marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #eee'
}
const commentFormStyle = {
    marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px'
}
const textareaStyle = {
    padding: '10px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical'
}
const submitButtonStyle = {
    padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'
}
const commentsListStyle = {
    border: '1px solid #eee', borderRadius: '4px', padding: '15px'
}
const commentStyle = {
    borderBottom: '1px solid #f0f0f0', paddingBottom: '10px', marginBottom: '10px'
}
const commentMetaStyle = {
    fontSize: '0.8em', color: '#555'
}

export default PostDetails;