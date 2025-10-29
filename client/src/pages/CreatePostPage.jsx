import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postService, categoryService } from '../services/api';
import useFetch from '../hooks/useFetch';

const CreatePostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  // Fetch categories from database
  const { 
    data: categoriesData, 
    loading: categoriesLoading, 
    // error: categoriesError 
  } = useFetch(
    () => categoryService.getAllCategories(),
    [] // Fetch once when component mounts
  );

  const categoryOptions = categoriesData || [];

  // State for form data
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    excerpt: '',
    tags: '',
    featuredImage: null,
  });
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [initialDataLoading, setInitialDataLoading] = useState(isEditing);

  // Fetch existing post data if in edit mode
  useEffect(() => {   
    if (isEditing) {
      const fetchPost = async () => {
        try {
          const post = await postService.getPost(id);
          setFormData({
            title: post.data?.title || '',
            content: post.data?.content || '',
            category: post.data?.category?._id || post.data?.category || '',
            excerpt: post.data?.excerpt || '',
            tags: post.data?.tags?.join(', ') || '',
            featuredImage: null, 
          });
        } catch (error) {
          setSubmitError('Failed to load post data for editing.', error);
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
    
    // Validate category selection
    if (!formData.category) {
      setSubmitError('Please select a category');
      return;
    }

    setLoadingSubmit(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    // Use FormData to handle file upload
    const dataToSend = new FormData();
    dataToSend.append('title', formData.title);
    dataToSend.append('content', formData.content);
    dataToSend.append('category', formData.category);
    dataToSend.append('excerpt', formData.excerpt);
    
    // Handle tags array
    const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    tagsArray.forEach(tag => dataToSend.append('tags', tag)); 

    // Append the file only if one was selected
    if (formData.featuredImage) {
      dataToSend.append('featuredImage', formData.featuredImage);
    }

    try {
      let response;
      if (isEditing) {
        response = await postService.updatePost(id, dataToSend);
      } else {
        response = await postService.createPost(dataToSend);
      }
      
      console.log('Success response:', response);
      
      // Clear errors and show success
      setSubmitError(null);
      setSubmitSuccess(isEditing ? 'Post updated successfully!' : 'Post created successfully!');
      setLoadingSubmit(false);
      
      // Redirect to homepage after 1.5 seconds
      setTimeout(() => {
        navigate('/');
      }, 1500);
      
    } catch (error) {      
      setSubmitError(
        error.response?.data?.error || 
        error.response?.data?.message || 
        'An unexpected error occurred during submission.'
      );
      setLoadingSubmit(false);
    }
  };

  if (initialDataLoading) {
    return <div style={{ textAlign: 'center' }}>Loading post data...</div>;
  }

  return (
    <div style={formContainerStyle}>
      <h2 style={formTitleStyle}>{isEditing ? 'Edit Post' : 'Create New Post'}</h2>

      <form onSubmit={handleSubmit} style={formStyle}>
        {submitError && <p style={errorStyle}>Error: {submitError}</p>}
        {submitSuccess && <p style={successStyle}>{submitSuccess} Redirecting to homepage...</p>}

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
          disabled={categoryOptions.length === 0 || categoriesLoading}
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
          placeholder="react, javascript, web-development"
        />

        <label style={labelStyle}>Featured Image:</label>
        <input
          type="file"
          name="featuredImage"
          onChange={handleChange}
          accept="image/*"
          style={fileInputStyle}
        />
        
        {isEditing && (
          <p style={infoStyle}>
            Current Image: {formData.currentImage || 'No image set'}
          </p>
        )}

        <button 
          type="submit" 
          disabled={loadingSubmit || categoryOptions.length === 0} 
          style={{
            ...buttonStyle,
            ...(loadingSubmit || categoryOptions.length === 0 ? disabledButtonStyle : {})
          }}
        >
          {loadingSubmit ? 'Submitting...' : isEditing ? 'Update Post' : 'Create Post'}
        </button>
      </form>
    </div>
  );
};

// Styles
const formContainerStyle = {
  maxWidth: '800px', 
  margin: '0 auto', 
  padding: '20px', 
  backgroundColor: '#f9f9f9', 
  borderRadius: '8px'
};

const formTitleStyle = {
  textAlign: 'center', 
  marginBottom: '30px'
};

const formStyle = {
  display: 'flex', 
  flexDirection: 'column', 
  gap: '15px'
};

const labelStyle = {
  fontWeight: 'bold', 
  marginTop: '10px'
};

const inputStyle = {
  padding: '10px', 
  border: '1px solid #ccc', 
  borderRadius: '4px'
};

const textareaStyle = {
  ...inputStyle, 
  resize: 'vertical'
};

const fileInputStyle = {
  padding: '10px', 
  border: '1px solid #ccc', 
  borderRadius: '4px', 
  backgroundColor: '#fff'
};

const buttonStyle = {
  padding: '12px', 
  backgroundColor: '#007bff', 
  color: 'white', 
  border: 'none', 
  borderRadius: '4px', 
  cursor: 'pointer', 
  fontSize: '1em',
  marginTop: '20px'
};

const disabledButtonStyle = {
  backgroundColor: '#6c757d',
  cursor: 'not-allowed'
};

const errorStyle = {
  color: 'white', 
  backgroundColor: '#dc3545', 
  padding: '10px', 
  borderRadius: '4px', 
  textAlign: 'center'
};

const successStyle = {
  color: '#155724',
  backgroundColor: '#d4edda',
  padding: '10px',
  borderRadius: '4px',
  border: '1px solid #c3e6cb',
  textAlign: 'center'
};

const infoStyle = {
  color: '#0c5460',
  backgroundColor: '#d1ecf1',
  padding: '10px',
  borderRadius: '4px',
  border: '1px solid #bee5eb',
  textAlign: 'center'
};

export default CreatePostPage;