// PostCard.jsx - Component for displaying a single post summary

import React from 'react';
import { Link } from 'react-router-dom';

const PostCard = ({ post }) => {
  // Use a placeholder image path until we fully implement image uploads
  const imageUrl = post.featuredImage.startsWith('http') 
    ? post.featuredImage 
    : `/uploads/${post.featuredImage}`;
    
  // Format the date
  const date = new Date(post.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="post-card" style={postCardStyle}>
      <img src={imageUrl} alt={post.title} style={imageStyle} />
      <div style={contentStyle}>
        {/* Link to the single post view using the slug */}
        <Link to={`/posts/${post.slug}`} style={titleLinkStyle}>
          <h3>{post.title}</h3>
        </Link>
        <p style={metaStyle}>
          By **{post.author.username}** in *{post.category.name}* on {date}
        </p>
        <p>{post.excerpt || post.content.substring(0, 150) + '...'}</p>
        <Link to={`/posts/${post.slug}`} style={readMoreStyle}>
          Read More &rarr;
        </Link>
      </div>
    </div>
  );
};

// Simple inline styles for demonstration (replace with proper CSS/Tailwind)
const postCardStyle = {
  border: '1px solid #ddd',
  borderRadius: '8px',
  marginBottom: '20px',
  display: 'flex',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};
const imageStyle = {
  width: '30%',
  height: 'auto',
  objectFit: 'cover',
  borderTopLeftRadius: '8px',
  borderBottomLeftRadius: '8px',
};
const contentStyle = {
  padding: '20px',
  width: '70%',
};
const titleLinkStyle = {
  textDecoration: 'none',
  color: '#333',
};
const metaStyle = {
  fontSize: '0.85em',
  color: '#666',
  marginBottom: '10px',
};
const readMoreStyle = {
    display: 'inline-block',
    marginTop: '10px',
    color: '#007bff',
    textDecoration: 'none',
}

export default PostCard;