// EcoBeach - Main JavaScript Functions

// Global variables
let currentUser = null;
let preferences = {
    theme: 'default',
    language: 'pt-BR',
    notifications: true
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadUserPreferences();
    setupAnimations();
});

// Initialize main application functions
function initializeApp() {
    // Check if user is returning visitor
    if (localStorage.getItem('ecobeach_visited')) {
        showWelcomeBackMessage();
    } else {
        localStorage.setItem('ecobeach_visited', 'true');
        showFirstVisitTour();
    }
    
    // Initialize tooltips and popovers
    initializeBootstrapComponents();
    
    // Setup service worker for offline functionality
    if ('serviceWorker' in navigator) {
        registerServiceWorker();
    }
    
    // Initialize analytics
    trackPageView();
}

// Setup global event listeners
function setupEventListeners() {
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
    
    // Mobile menu handling
    const navbarToggler = document.querySelector('.navbar-toggler');
    if (navbarToggler) {
        navbarToggler.addEventListener('click', function() {
            document.body.classList.toggle('nav-open');
        });
    }
    
    // Search functionality
    const searchInput = document.querySelector('#searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    
    // Back to top button
    setupBackToTop();
    
    // Form validation
    setupFormValidation();
    
    // Image lazy loading
    setupLazyLoading();
}

// Initialize Bootstrap components
function initializeBootstrapComponents() {
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Initialize popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
    
    // Initialize carousels
    const carousels = document.querySelectorAll('.carousel');
    carousels.forEach(carousel => {
        new bootstrap.Carousel(carousel, {
            interval: 5000,
            wrap: true
        });
    });
}

// Setup scroll animations
function setupAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                
                // Special handling for counters
                if (entry.target.classList.contains('stat-counter')) {
                    animateCounter(entry.target);
                }
                
                // Special handling for progress bars
                if (entry.target.classList.contains('progress-animated')) {
                    animateProgressBar(entry.target);
                }
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.fade-in, .slide-in-left, .timeline-item, .stat-counter, .progress-animated');
    animatedElements.forEach(el => observer.observe(el));
}

// Counter animation
function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// Progress bar animation
function animateProgressBar(element) {
    const progressBar = element.querySelector('.progress-bar');
    if (progressBar) {
        const targetWidth = progressBar.getAttribute('data-width') || '100%';
        progressBar.style.width = targetWidth;
    }
}

// Back to top functionality
function setupBackToTop() {
    // Create back to top button if it doesn't exist
    let backToTopBtn = document.querySelector('#backToTop');
    if (!backToTopBtn) {
        backToTopBtn = document.createElement('button');
        backToTopBtn.id = 'backToTop';
        backToTopBtn.className = 'btn btn-ocean position-fixed';
        backToTopBtn.style.cssText = 'bottom: 20px; right: 20px; z-index: 1000; border-radius: 50%; width: 50px; height: 50px; display: none;';
        backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
        document.body.appendChild(backToTopBtn);
    }
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.style.display = 'block';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });
    
    // Scroll to top when clicked
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Search functionality
function handleSearch(event) {
    const query = event.target.value.toLowerCase();
    const searchResults = document.querySelector('#searchResults');
    
    if (query.length < 2) {
        if (searchResults) {
            searchResults.innerHTML = '';
            searchResults.style.display = 'none';
        }
        return;
    }
    
    // Search through page content
    const searchableContent = [
        { title: 'História de Guriri', url: '/historia', keywords: ['história', 'passado', 'colonização', 'jesuíta'] },
        { title: 'Biodiversidade', url: '/biodiversidade', keywords: ['fauna', 'flora', 'animais', 'plantas', 'espécies'] },
        { title: 'Cultura Caiçara', url: '/cultura', keywords: ['cultura', 'culinária', 'tradição', 'pesca', 'moqueca'] },
        { title: 'Mapa Interativo', url: '/mapa', keywords: ['mapa', 'localização', 'pontos', 'turísticos', 'restaurantes'] },
        { title: 'Emergência', url: '/emergencia', keywords: ['emergência', 'telefone', 'socorro', 'denúncia'] },
        { title: 'Educativo', url: '/educativo', keywords: ['educação', 'aprender', 'quiz', 'vídeos'] },
        { title: 'Preserve Guriri', url: '/preserve', keywords: ['preservação', 'sustentabilidade', 'reciclagem', 'meio ambiente'] }
    ];
    
    const results = searchableContent.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.keywords.some(keyword => keyword.includes(query))
    );
    
    displaySearchResults(results, searchResults);
}

// Display search results
function displaySearchResults(results, container) {
    if (!container) return;
    
    if (results.length === 0) {
        container.innerHTML = '<div class="p-3 text-muted">Nenhum resultado encontrado</div>';
    } else {
        const resultsHTML = results.map(result => `
            <a href="${result.url}" class="list-group-item list-group-item-action">
                <i class="fas fa-search me-2"></i>${result.title}
            </a>
        `).join('');
        container.innerHTML = resultsHTML;
    }
    
    container.style.display = 'block';
}

// Form validation
function setupFormValidation() {
    const forms = document.querySelectorAll('.needs-validation');
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        });
    });
}

// Lazy loading for images
function setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Service Worker registration
function registerServiceWorker() {
    navigator.serviceWorker.register('/sw.js')
        .then(registration => {
            console.log('Service Worker registered successfully');
        })
        .catch(error => {
            console.log('Service Worker registration failed');
        });
}

// User preferences
function loadUserPreferences() {
    const savedPreferences = localStorage.getItem('ecobeach_preferences');
    if (savedPreferences) {
        preferences = { ...preferences, ...JSON.parse(savedPreferences) };
        applyPreferences();
    }
}

function saveUserPreferences() {
    localStorage.setItem('ecobeach_preferences', JSON.stringify(preferences));
}

function applyPreferences() {
    // Apply theme
    if (preferences.theme === 'dark') {
        document.body.classList.add('dark-theme');
    }
    
    // Apply other preferences
    if (!preferences.notifications) {
        // Disable notifications
    }
}

// Welcome messages
function showWelcomeBackMessage() {
    const lastVisit = localStorage.getItem('ecobeach_last_visit');
    if (lastVisit) {
        const daysSinceVisit = Math.floor((Date.now() - parseInt(lastVisit)) / (1000 * 60 * 60 * 24));
        if (daysSinceVisit > 7) {
            showNotification('Bem-vindo de volta ao EcoBeach! Confira as novidades sobre Guriri.', 'info');
        }
    }
    localStorage.setItem('ecobeach_last_visit', Date.now().toString());
}

function showFirstVisitTour() {
    // Show welcome tour for first-time visitors
    setTimeout(() => {
        showNotification('Bem-vindo ao EcoBeach! Explore todas as seções para conhecer Guriri.', 'success');
    }, 1000);
}

// Notification system
function showNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 100px; right: 20px; z-index: 1050; max-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-dismiss after duration
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, duration);
}

// Analytics tracking
function trackPageView() {
    // Track page views for analytics
    const page = window.location.pathname;
    const timestamp = new Date().toISOString();
    
    // Store in local storage for now (in production, send to analytics service)
    const views = JSON.parse(localStorage.getItem('ecobeach_analytics') || '[]');
    views.push({ page, timestamp });
    
    // Keep only last 100 views
    if (views.length > 100) {
        views.splice(0, views.length - 100);
    }
    
    localStorage.setItem('ecobeach_analytics', JSON.stringify(views));
}

function trackEvent(category, action, label = null) {
    // Track custom events
    const event = {
        category,
        action,
        label,
        timestamp: new Date().toISOString()
    };
    
    const events = JSON.parse(localStorage.getItem('ecobeach_events') || '[]');
    events.push(event);
    
    // Keep only last 50 events
    if (events.length > 50) {
        events.splice(0, events.length - 50);
    }
    
    localStorage.setItem('ecobeach_events', JSON.stringify(events));
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

function formatDate(date, locale = 'pt-BR') {
    return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date));
}

function formatNumber(number, locale = 'pt-BR') {
    return new Intl.NumberFormat(locale).format(number);
}

// Error handling
window.addEventListener('error', function(event) {
    console.error('JavaScript error:', event.error);
    
    // In production, send errors to monitoring service
    trackEvent('error', 'javascript', event.error?.message);
});

// Unhandled promise rejections
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    trackEvent('error', 'promise', event.reason?.message);
});

// Export functions for use in other scripts
window.EcoBeach = {
    showNotification,
    trackEvent,
    formatDate,
    formatNumber,
    preferences,
    saveUserPreferences
};
