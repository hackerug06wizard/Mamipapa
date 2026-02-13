// Shopping Cart State
let cart = [];
let cartTotal = 0;

// Meta Pixel Tracking Functions
function trackCustomEvent(eventName, parameters = {}) {
    if (typeof fbq !== 'undefined') {
        fbq('trackCustom', eventName, parameters);
        console.log(`Tracked: ${eventName}`, parameters);
    }
}

function trackStandardEvent(eventName, parameters = {}) {
    if (typeof fbq !== 'undefined') {
        fbq('track', eventName, parameters);
        console.log(`Tracked Standard: ${eventName}`, parameters);
    }
}

// Feature Click Tracking
function trackFeatureClick(featureName) {
    trackCustomEvent('FeatureEngagement', {
        content_type: 'feature',
        feature_name: featureName,
        page_location: 'homepage'
    });
    
    // Show feedback to user
    showNotification(`Learning more about ${featureName.replace('_', ' ')}...`);
}

// Category Click Tracking
function trackCategoryClick(categoryName) {
    trackCustomEvent('CategoryExploration', {
        content_category: categoryName,
        user_intent: 'browsing',
        page_location: 'homepage'
    });
    
    showNotification(`Browsing ${categoryName} category...`);
}

// Add to Cart Function
function addToCart(productName, price) {
    // Add to cart array
    cart.push({ name: productName, price: price });
    cartTotal += price;
    
    // Update UI
    updateCartUI();
    
    // Track with Meta Pixel
    trackStandardEvent('AddToCart', {
        content_name: productName,
        value: price,
        currency: 'USD',
        content_type: 'product'
    });
    
    // Track custom conversion
    trackCustomEvent('AddToCartCustom', {
        product_name: productName,
        product_price: price,
        cart_total: cartTotal,
        item_count: cart.length
    });
    
    showNotification(`${productName} added to cart!`);
}

// Update Cart UI
function updateCartUI() {
    const cartCount = document.querySelector('.cart-count');
    const cartItems = document.getElementById('cartItems');
    const cartTotalEl = document.getElementById('cartTotal');
    
    // Update badge
    cartCount.textContent = cart.length;
    
    // Update modal content
    if (cartItems) {
        if (cart.length === 0) {
            cartItems.innerHTML = '<p>Your cart is empty</p>';
        } else {
            cartItems.innerHTML = cart.map((item, index) => `
                <div class="cart-item">
                    <span>${item.name}</span>
                    <span>$${item.price.toFixed(2)}</span>
                </div>
            `).join('');
        }
    }
    
    // Update total
    if (cartTotalEl) {
        cartTotalEl.textContent = cartTotal.toFixed(2);
    }
}

// Open Cart Modal
document.querySelector('.nav-cart').addEventListener('click', () => {
    document.getElementById('cartModal').style.display = 'block';
    
    trackCustomEvent('CartViewed', {
        item_count: cart.length,
        cart_value: cartTotal
    });
});

// Close Cart Modal
function closeCart() {
    document.getElementById('cartModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('cartModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Checkout Function
function checkout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }
    
    // Track purchase initiation
    trackStandardEvent('InitiateCheckout', {
        value: cartTotal,
        currency: 'USD',
        num_items: cart.length
    });
    
    trackCustomEvent('CheckoutStarted', {
        cart_total: cartTotal,
        item_count: cart.length,
        items: cart.map(item => item.name).join(', ')
    });
    
    showNotification('Proceeding to checkout...');
    
    // Simulate checkout process
    setTimeout(() => {
        // Track successful purchase (simulated)
        trackStandardEvent('Purchase', {
            value: cartTotal,
            currency: 'USD',
            num_items: cart.length
        });
        
        trackCustomEvent('PurchaseComplete', {
            transaction_value: cartTotal,
            item_count: cart.length,
            payment_method: 'demo'
        });
        
        alert(`Thank you for your purchase! Total: $${cartTotal.toFixed(2)}`);
        cart = [];
        cartTotal = 0;
        updateCartUI();
        closeCart();
    }, 1500);
}

// Newsletter Submit
function handleNewsletterSubmit(event) {
    event.preventDefault();
    const email = event.target.querySelector('input[type="email"]').value;
    
    trackCustomEvent('NewsletterSignup', {
        lead_source: 'homepage_footer',
        user_email: email
    });
    
    trackStandardEvent('Lead', {
        content_name: 'Newsletter Subscription'
    });
    
    showNotification('Thank you for subscribing!');
    event.target.reset();
}

// Notification System
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #f59e0b;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 3000;
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    // Add animation keyframes
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Track Page Scroll Depth
let scrollTracked = { 25: false, 50: false, 75: false, 100: false };

window.addEventListener('scroll', () => {
    const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    
    if (scrollPercent >= 25 && !scrollTracked[25]) {
        trackCustomEvent('ScrollDepth', { depth: '25%' });
        scrollTracked[25] = true;
    }
    if (scrollPercent >= 50 && !scrollTracked[50]) {
        trackCustomEvent('ScrollDepth', { depth: '50%' });
        scrollTracked[50] = true;
    }
    if (scrollPercent >= 75 && !scrollTracked[75]) {
        trackCustomEvent('ScrollDepth', { depth: '75%' });
        scrollTracked[75] = true;
    }
    if (scrollPercent >= 100 && !scrollTracked[100]) {
        trackCustomEvent('ScrollDepth', { depth: '100%' });
        scrollTracked[100] = true;
    }
});

// Track Time on Page
let timeOnPage = 0;
setInterval(() => {
    timeOnPage += 10;
    if (timeOnPage === 30) { // 30 seconds
        trackCustomEvent('EngagementTime', { duration: '30_seconds' });
    }
    if (timeOnPage === 60) { // 1 minute
        trackCustomEvent('EngagementTime', { duration: '1_minute' });
    }
}, 10000);

// Product Card Hover Tracking
document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        const productName = card.dataset.product;
        trackCustomEvent('ProductHover', {
            content_name: productName,
            content_type: 'product'
        });
    });
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('Bespoke Baby Store loaded');
    updateCartUI();
    
    // Track initial page view with custom parameters
    trackCustomEvent('PageViewDetailed', {
        page_type: 'homepage',
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString()
    });
});
