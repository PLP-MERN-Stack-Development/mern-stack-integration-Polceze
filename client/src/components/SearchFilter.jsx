// SearchFilter.jsx - Component for filtering and searching posts

import React, { useState } from 'react';

const SearchFilter = ({ onFilterChange, categories }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        onFilterChange({ search: searchTerm, category: selectedCategory });
    };

    const handleCategoryChange = (e) => {
        const categoryId = e.target.value;
        setSelectedCategory(categoryId);
        onFilterChange({ search: searchTerm, category: categoryId });
    };
    
    return (
        <div style={containerStyle}>
            <form onSubmit={handleSearch} style={formStyle}>
                <input
                    type="text"
                    placeholder="Search posts by title, content, or tag..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={searchInputStyle}
                />
                <button type="submit" style={buttonStyle}>Search</button>
            </form>

            <select value={selectedCategory} onChange={handleCategoryChange} style={selectStyle}>
                <option value="">-- All Categories --</option>
                {/* FIX: Check if categories exists and is an array */}
                {categories && Array.isArray(categories) && categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
            </select>
        </div>
    );
};

// Simple inline styles for demonstration
const containerStyle = { display: 'flex', gap: '20px', marginBottom: '30px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' };
const formStyle = { display: 'flex', flexGrow: 1 };
const searchInputStyle = { padding: '10px', border: '1px solid #ccc', borderRadius: '4px 0 0 4px', flexGrow: 1 };
const buttonStyle = { padding: '10px 15px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '0 4px 4px 0', cursor: 'pointer' };
const selectStyle = { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', minWidth: '200px' };

export default SearchFilter;