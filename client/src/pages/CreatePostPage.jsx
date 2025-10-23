// CreatePostPage.jsx - Form for creating or updating a blog post

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postService, categoryService } from '../services/api';
import useFetch from '../hooks/useFetch';

const CreatePostPage = () => {
  const { id } = useParams(); // Post ID for editing, or undefined for creating
  const navigate = useNavigate();
  const isEditing = !!id;

  // State for form data
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    excerpt: '',
    tags: '',
    featuredImage: null, // For image file input
  });
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [initialDataLoading, setInitialDataLoading] = useState(isEditing);

  // Fetch categories using custom hook
  const { data: categories } = useFetch(() => categoryService.getAllCategories());

  // Fetch existing post data if in edit mode
  useEffect(() => {
    if (isEditing) {
      const fetchPost = async () => {
        try {
          const post = await postService.getPost(id);
          setFormData({
            title: post.title,
            content: post.content,
            // category is an object in the post response, but we need its ID for the form submission
            category: post.category._id, 
            excerpt: post.excerpt || '',
            tags: post.tags.join(', ') || '',
            // Do not pre-fill file input; handle existing image display separately
            featuredImage: null, 
          });
        } catch {
          setSubmitError('Failed to load post data for editing.');
        } finally {
          setInitialDataLoading(false);
        }
      };
      fetchPost();
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);
    setSubmitError(null);

    // Prepare data for submission
    const dataToSubmit = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    };

    try {
      let response;
      if (isEditing) {
        response = await postService.updatePost(id, dataToSubmit);
      } else {
        response = await postService.createPost(dataToSubmit);
      }
      
      // Navigate to the new or updated post's details page
      navigate(`/posts/${response.data.slug}`); 
    } catch (error) {
      console.error('Submission Error:', error);
      setSubmitError(error.response?.data?.error || 'An unexpected error occurred during submission.');
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (initialDataLoading) {
    return <div style={{ textAlign: 'center' }}>Loading post data...</div>;
  }
  
  // Ensure we have categories before rendering the form
  const categoryOptions = categories || [];

  return (
    <div style={formContainerStyle}>
      <h2 style={formTitleStyle}>{isEditing ? 'Edit Post' : 'Create New Post'}</h2>
      
      <form onSubmit={handleSubmit} style={formStyle}>
        
        {submitError && <p style={errorStyle}>Error: {submitError}</p>}

        <label style={labelStyle}>Title:</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          style={inputStyle}
        />
        
        <label style={labelStyle}>Category:</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          style={inputStyle}
        >
          <option value="">-- Select a Category --</option>
          {categoryOptions.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
        
        <label style={labelStyle}>Content:</label>
        <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          required
          rows="15"
          style={textareaStyle}
        />
        
        <label style={labelStyle}>Excerpt (Short Summary):</label>
        <textarea
          name="excerpt"
          value={formData.excerpt}
          onChange={handleChange}
          rows="3"
          maxLength="200"
          style={textareaStyle}
        />

        <label style={labelStyle}>Tags (Comma Separated):</label>
        <input
          type="text"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          style={inputStyle}
        />

        {/* Feature for image uploads - Currently handles file selection */}
        <label style={labelStyle}>Featured Image:</label>
        <input
          type="file"
          name="featuredImage"
          onChange={handleChange}
          style={fileInputStyle}
        />
        
        {/* Placeholder for showing existing image in edit mode */}
        {isEditing && (
            <p>Current Image: {formData.currentImage || 'Not yet implemented'}</p>
        )}

        <button type="submit" disabled={loadingSubmit} style={buttonStyle}>
          {loadingSubmit ? 'Submitting...' : isEditing ? 'Update Post' : 'Create Post'}
        </button>
      </form>
    </div>
  );
};

// Simple inline styles for demonstration
const formContainerStyle = {
    maxWidth: '800px', margin: '0 auto', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px'
};
const formTitleStyle = {
    textAlign: 'center', marginBottom: '30px'
};
const formStyle = {
    display: 'flex', flexDirection: 'column', gap: '15px'
};
const labelStyle = {
    fontWeight: 'bold', marginTop: '10px'
};
const inputStyle = {
    padding: '10px', border: '1px solid #ccc', borderRadius: '4px'
};
const textareaStyle = {
    ...inputStyle, resize: 'vertical'
};
const fileInputStyle = {
    padding: '10px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#fff'
};
const buttonStyle = {
    padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1em'
};
const errorStyle = {
    color: 'white', backgroundColor: '#dc3545', padding: '10px', borderRadius: '4px', textAlign: 'center'
};

export default CreatePostPage;