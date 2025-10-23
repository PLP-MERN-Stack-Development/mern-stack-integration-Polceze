// HomePage.jsx - Updated to handle pagination, search, and filter

import React, { useState } from 'react';
import { postService, categoryService } from '../services/api';
import useFetch from '../hooks/useFetch';
import PostCard from '../components/posts/PostCard';
import SearchFilter from '../components/SearchFilter';

const HomePage = () => {
    // State for filtering and pagination
    const [filter, setFilter] = useState({
        page: 1,
        limit: 10,
        category: null,
        search: null,
    });
    
    // Fetch posts using the filter state
    const { 
        data: postsData, 
        loading: postsLoading, 
        error: postsError 
    } = useFetch(
        () => postService.getAllPosts(filter.page, filter.limit, filter.category, filter.search),
        [filter.page, filter.limit, filter.category, filter.search]
    );

    // Fetch categories for the filter dropdown
    const { data: categories } = useFetch(() => categoryService.getAllCategories());

    const handleFilterChange = (newFilters) => {
        setFilter(prev => ({ 
            ...prev, 
            ...newFilters, 
            page: 1 // Reset to page 1 on any new filter/search
        }));
    };

    const handlePageChange = (newPage) => {
        setFilter(prev => ({ ...prev, page: newPage }));
    };
    
    if (postsLoading && filter.page === 1) {
        return <div style={{ textAlign: 'center' }}>Loading initial posts...</div>;
    }

    // Extract posts and pagination info
    const posts = postsData?.data || [];
    const pagination = postsData?.pagination;
    
    return (
        <div className="home-page">
            <h2>Latest Blog Posts</h2>
            
            <SearchFilter 
                onFilterChange={handleFilterChange} 
                categories={categories} 
            />

            {postsError && <div style={{ color: 'red', textAlign: 'center' }}>Error: {postsError}</div>}

            <div className="post-list">
                {posts.map((post) => (
                    <PostCard key={post._id} post={post} />
                ))}
            </div>

            {/* Pagination Component */}
            {pagination && pagination.totalPages > 1 && (
                <div style={paginationStyle}>
                    <button 
                        onClick={() => handlePageChange(pagination.page - 1)} 
                        disabled={pagination.page <= 1}
                        style={pageButtonStyle}
                    >
                        &larr; Previous
                    </button>
                    <span>Page {pagination.page} of {pagination.totalPages}</span>
                    <button 
                        onClick={() => handlePageChange(pagination.page + 1)} 
                        disabled={pagination.page >= pagination.totalPages}
                        style={pageButtonStyle}
                    >
                        Next &rarr;
                    </button>
                </div>
            )}
            
            {posts.length === 0 && !postsLoading && <div style={{ textAlign: 'center' }}>No posts found matching your criteria.</div>}
        </div>
    );
};

const paginationStyle = { display: 'flex', justifyContent: 'center', gap: '20px', margin: '30px 0' };
const pageButtonStyle = { padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };

export default HomePage;