// CreateCategory.jsx - Form to create a new category

import React, { useState } from 'react';
import { categoryService } from '../services/api';

const CreateCategory = ({ onCategoryCreated }) => {
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await categoryService.createCategory({ name: categoryName });
      
      // Notify parent component (CreatePostPage) to update the category list
      onCategoryCreated(response.data); 
      
      setSuccess(`Category '${response.data.name}' created successfully!`);
      setCategoryName('');
    } catch (err) {
      console.error('Category creation error:', err);
      setError(err.response?.data?.error || 'Failed to create category.');
    } finally {
      setLoading(false);
      // Clear success message after a few seconds
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  return (
    <div style={containerStyle}>
      <h4 style={titleStyle}>Create New Category:</h4>
      <form onSubmit={handleSubmit} style={formStyle}>
        <input
          type="text"
          placeholder="Category Name (e.g., Technology)"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          required
          style={inputStyle}
        />
        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? 'Adding...' : 'Add Category'}
        </button>
      </form>
      {error && <p style={errorStyle}>Error: {error}</p>}
      {success && <p style={successStyle}>✅ {success}</p>}
    </div>
  );
};

// Simple inline styles
const containerStyle = { 
    border: '1px solid #ddd', 
    padding: '15px', 
    borderRadius: '4px', 
    marginBottom: '20px', 
    backgroundColor: '#f9f9f9' 
};
const titleStyle = { 
    marginTop: 0, 
    fontSize: '1.1em' 
};
const formStyle = { 
    display: 'flex', 
    gap: '10px' 
};
const inputStyle = { 
    padding: '8px', 
    border: '1px solid #ccc', 
    borderRadius: '4px', 
    flexGrow: 1 
};
const buttonStyle = { 
    padding: '8px 15px', 
    backgroundColor: '#28a745', 
    color: 'white', 
    border: 'none', 
    borderRadius: '4px', 
    cursor: 'pointer' 
};
const errorStyle = { 
    color: 'red', 
    marginTop: '10px' 
};
const successStyle = { 
    color: 'green', 
    marginTop: '10px' 
};

export default CreateCategory;