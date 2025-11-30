// ===== NEWS PAGE JAVASCRIPT =====

document.addEventListener('DOMContentLoaded', function() {
    // Initialize content filtering
    initializeContentFiltering();
    
    // Initialize pagination
    initializePagination();
    
    // Initialize animations
    initializeAnimations();
    
    // Initialize search functionality
    initializeSearch();
});

// Initialize content filtering
function initializeContentFiltering() {
    const contentTabs = document.querySelectorAll('#contentTabs button[data-bs-toggle="pill"]');
    const allPosts = document.querySelectorAll('.post-card');
    
    // Create content categories
    const contentCategories = {
        'all': allPosts,
        'blog': Array.from(allPosts).filter(post => 
            post.querySelector('.post-category').textContent.toLowerCase().includes('blog')
        ),
        'news': Array.from(allPosts).filter(post => 
            post.querySelector('.post-category').textContent.toLowerCase().includes('news')
        ),
        'press': Array.from(allPosts).filter(post => 
            post.querySelector('.post-category').textContent.toLowerCase().includes('press')
        ),
        'field': Array.from(allPosts).filter(post => 
            post.querySelector('.post-category').textContent.toLowerCase().includes('field')
        )
    };
    
    contentTabs.forEach(tab => {
        tab.addEventListener('shown.bs.tab', function(event) {
            const targetTab = event.target.getAttribute('data-bs-target').replace('#', '');
            filterContent(targetTab, contentCategories);
        });
    });
}

// Filter content based on selected tab
function filterContent(category, contentCategories) {
    const allPosts = document.querySelectorAll('.post-card');
    const postsToShow = contentCategories[category] || allPosts;
    
    // Hide all posts
    allPosts.forEach(post => {
        post.style.display = 'none';
        post.style.opacity = '0';
        post.style.transform = 'translateY(20px)';
    });
    
    // Show filtered posts with animation
    setTimeout(() => {
        postsToShow.forEach((post, index) => {
            setTimeout(() => {
                post.style.display = 'block';
                post.style.opacity = '1';
                post.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }, 100);
    
    // Update pagination if needed
    updatePaginationForCategory(category, postsToShow.length);
}

// Initialize pagination
function initializePagination() {
    const pagination = document.querySelector('.pagination');
    if (!pagination) return;
    
    const pageLinks = pagination.querySelectorAll('.page-link');
    pageLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageNumber = this.textContent;
            if (pageNumber !== '...' && pageNumber !== 'Previous' && pageNumber !== 'Next') {
                handlePageChange(parseInt(pageNumber));
            }
        });
    });
}

// Handle page change
function handlePageChange(pageNumber) {
    // Update active page
    const pageLinks = document.querySelectorAll('.pagination .page-link');
    pageLinks.forEach(link => {
        link.parentElement.classList.remove('active');
        if (link.textContent == pageNumber) {
            link.parentElement.classList.add('active');
        }
    });
    
    // Scroll to top of posts section
    const postsSection = document.querySelector('.recent-posts-section');
    if (postsSection) {
        postsSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // In a real application, you would load new content here
    console.log('Loading page:', pageNumber);
    
    // Simulate loading
    showLoadingState();
    setTimeout(() => {
        hideLoadingState();
        showNotification(`Loaded page ${pageNumber}`, 'info');
    }, 1000);
}

// Update pagination for category
function updatePaginationForCategory(category, postCount) {
    // In a real application, you would calculate pagination based on actual content
    console.log(`Category: ${category}, Post count: ${postCount}`);
}

// Initialize search functionality
function initializeSearch() {
    // Create search input if it doesn't exist
    const contentNav = document.querySelector('.content-nav');
    if (contentNav && !document.querySelector('.news-search')) {
        const searchContainer = document.createElement('div');
        searchContainer.className = 'news-search mt-3';
        searchContainer.innerHTML = `
            <div class="search-input-group">
                <input type="text" class="form-control" placeholder="Search articles..." id="newsSearchInput">
                <button class="btn btn-outline-primary" type="button" id="newsSearchBtn">
                    <i class="fas fa-search"></i>
                </button>
            </div>
        `;
        contentNav.appendChild(searchContainer);
        
        // Add search functionality
        const searchInput = document.getElementById('newsSearchInput');
        const searchBtn = document.getElementById('newsSearchBtn');
        
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        // Add search styles
        addSearchStyles();
    }
}

// Perform search
function performSearch() {
    const searchTerm = document.getElementById('newsSearchInput').value.trim().toLowerCase();
    const allPosts = document.querySelectorAll('.post-card');
    
    if (!searchTerm) {
        // Show all posts if search is empty
        allPosts.forEach(post => {
            post.style.display = 'block';
        });
        return;
    }
    
    let foundPosts = 0;
    
    allPosts.forEach(post => {
        const title = post.querySelector('h3').textContent.toLowerCase();
        const content = post.querySelector('p').textContent.toLowerCase();
        const category = post.querySelector('.post-category').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || content.includes(searchTerm) || category.includes(searchTerm)) {
            post.style.display = 'block';
            post.style.opacity = '1';
            foundPosts++;
        } else {
            post.style.display = 'none';
        }
    });
    
    if (foundPosts === 0) {
        showNotification('No articles found matching your search.', 'info');
    } else {
        showNotification(`Found ${foundPosts} article(s) matching your search.`, 'success');
    }
}

// Initialize animations
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.post-card, .featured-image, .featured-content');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Show loading state
function showLoadingState() {
    const postsContainer = document.querySelector('.recent-posts-section .row');
    if (postsContainer) {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-overlay';
        loadingDiv.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Loading articles...</p>
            </div>
        `;
        postsContainer.appendChild(loadingDiv);
    }
}

// Hide loading state
function hideLoadingState() {
    const loadingOverlay = document.querySelector('.loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.remove();
    }
}

// Add search styles
function addSearchStyles() {
    if (document.getElementById('news-search-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'news-search-styles';
    style.textContent = `
        .news-search {
            text-align: center;
        }
        .search-input-group {
            display: flex;
            max-width: 400px;
            margin: 0 auto;
        }
        .search-input-group .form-control {
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
            border-right: none;
        }
        .search-input-group .btn {
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
        }
        .loading-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10;
        }
        .loading-spinner {
            text-align: center;
        }
        .post-card {
            transition: all 0.3s ease;
        }
    `;
    document.head.appendChild(style);
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Utility functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
    
    // Close button handler
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => notification.remove());
    
    // Add notification styles if not already added
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                animation: slideIn 0.3s ease;
            }
            .notification-success {
                background: #d4edda;
                border: 1px solid #c3e6cb;
                color: #155724;
            }
            .notification-error {
                background: #f8d7da;
                border: 1px solid #f5c6cb;
                color: #721c24;
            }
            .notification-info {
                background: #d1ecf1;
                border: 1px solid #bee5eb;
                color: #0c5460;
            }
            .notification-content {
                display: flex;
                align-items: center;
                padding: 1rem;
            }
            .notification-content i {
                margin-right: 0.5rem;
                font-size: 1.2rem;
            }
            .notification-close {
                background: none;
                border: none;
                font-size: 1.2rem;
                margin-left: auto;
                cursor: pointer;
                color: inherit;
            }
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
}
