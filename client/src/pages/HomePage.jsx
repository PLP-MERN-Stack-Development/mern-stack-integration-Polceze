import React, { useState, useCallback } from 'react';
import { postService, categoryService } from '../services/api';
import useFetch from '../hooks/useFetch';
import PostCard from '../components/posts/PostCard';
import SearchFilter from '../components/SearchFilter';

const HomePage = () => {
    const [filter, setFilter] = useState({
        page: 1,
        limit: 10,
        category: null,
        search: null,
    });
    
    const fetchPostsFn = useCallback(
        () => postService.getAllPosts(filter.page, filter.limit, filter.category, filter.search),
        [filter.page, filter.limit, filter.category, filter.search]
    );

    // ----------------------------------------------------------------------
    // 1. FETCH POSTS
    // ----------------------------------------------------------------------
    const { 
        data: postsData, 
        loading: postsLoading, 
        error: postsError 
    } = useFetch(
        fetchPostsFn,
        [filter.page, filter.limit, filter.category, filter.search]
    );

    // ----------------------------------------------------------------------
    // 2. FETCH CATEGORIES FROM DATABASE
    // ----------------------------------------------------------------------
    const { 
        data: categoriesData, 
        loading: categoriesLoading,
        error: categoriesError 
    } = useFetch(
        () => categoryService.getAllCategories(),
        [] // Empty dependency array - fetch once when component mounts
    );

    // ----------------------------------------------------------------------
    // 3. FIX DATA ACCESS - postsData IS THE ARRAY OF POSTS
    // ----------------------------------------------------------------------
    const posts = Array.isArray(postsData) ? postsData : postsData?.data || [];
    const pagination = postsData?.pagination; // This might be undefined

    // ----------------------------------------------------------------------
    // 4. HANDLERS
    // ----------------------------------------------------------------------
    
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
    
    // ----------------------------------------------------------------------
    // 5. RENDERING
    // ----------------------------------------------------------------------

    if (postsLoading && filter.page === 1) {
        return <div style={{ textAlign: 'center' }}>Loading initial posts...</div>;
    }
    
    return (
        <div className="home-page">
            <h2>Latest Blog Posts</h2>
                     
            <SearchFilter 
                onFilterChange={handleFilterChange} 
                categories={categoriesData || []} 
                loading={categoriesLoading}
            />

            {categoriesError && (
                <div style={{ color: 'orange', textAlign: 'center', margin: '10px 0' }}>
                    Note: Categories not available - {categoriesError}
                </div>
            )}

            {postsError && <div style={{ color: 'red', textAlign: 'center' }}>Error: {postsError}</div>}

            <div className="post-list">
                {posts.map((post) => (
                    <PostCard key={post._id} post={post} />
                ))}
            </div>

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
            
            {posts.length === 0 && !postsLoading && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    No posts found matching your criteria.
                </div>
            )}
        </div>
    );
};

const paginationStyle = { 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center',
    gap: '20px', 
    margin: '30px 0' 
};

const pageButtonStyle = { 
    padding: '10px 15px', 
    backgroundColor: '#007bff', 
    color: 'white', 
    border: 'none', 
    borderRadius: '4px', 
    cursor: 'pointer' 
};

export default HomePage;