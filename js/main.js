// Shopping Cart State
let cart = [];
let cartTotal = 0;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Load cart from localStorage
    loadCart();
    
    // Setup mobile navigation
    setupMobileNav();
    
    // Setup cart modal
    setupCartModal();
    
    console.log('Bespoke Baby Store loaded');
});

// Mobile Navigation Setup
function setupMobileNav() {
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
        
        // Close menu when clicking a link
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }
}

// Cart Modal Setup
function setupCartModal() {
    const navCart = document.getElementById('navCart');
    const cartModal = document.getElementById('cartModal');
    
    if (navCart && cartModal) {
        navCart.addEventListener('click', function(e) {
            e.preventDefault();
            openCart();
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === cartModal) {
            closeCart();
        }
    });
}

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

// Format UGX Currency
function formatUGX(amount) {
    return 'UGX ' + amount.toLocaleString('en-UG');
}

// Add to Cart Function
function addToCart(productName, price) {
    // Add to cart array
    cart.push({ 
        id: Date.now(), // unique ID for each item
        name: productName, 
        price: price 
    });
    cartTotal += price;
    
    // Save to localStorage
    saveCart();
    
    // Update UI
    updateCartUI();
    
    // Track with Meta Pixel
    trackStandardEvent('AddToCart', {
        content_name: productName,
        value: price,
        currency: 'UGX',
        content_type: 'product'
    });
    
    trackCustomEvent('AddToCartCustom', {
        product_name: productName,
        product_price: price,
        cart_total: cartTotal,
        item_count: cart.length
    });
    
    showNotification(`${productName} added to cart!`);
}

// Remove from Cart
function removeFromCart(itemId) {
    const itemIndex = cart.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
        const item = cart[itemIndex];
        cartTotal -= item.price;
        cart.splice(itemIndex, 1);
        
        saveCart();
        updateCartUI();
        
        trackCustomEvent('RemoveFromCart', {
            product_name: item.name,
            cart_total: cartTotal
        });
        
        showNotification('Item removed from cart');
    }
}

// Update Cart UI
function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotalEl = document.getElementById('cartTotal');
    
    // Update badge
    if (cartCount) {
        cartCount.textContent = cart.length;
    }
    
    // Update modal content
    if (cartItems) {
        if (cart.length === 0) {
            cartItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        } else {
            cartItems.innerHTML = cart.map((item) => `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">${formatUGX(item.price)}</div>
                    </div>
                    <button class="cart-item-remove" onclick="removeFromCart(${item.id})">Remove</button>
                </div>
            `).join('');
        }
    }
    
    // Update total
    if (cartTotalEl) {
        cartTotalEl.textContent = cartTotal.toLocaleString('en-UG');
    }
}

// Open Cart Modal
function openCart() {
    const modal = document.getElementById('cartModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        
        trackCustomEvent('CartViewed', {
            item_count: cart.length,
            cart_value: cartTotal
        });
    }
}

// Close Cart Modal
function closeCart() {
    const modal = document.getElementById('cartModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
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
        currency: 'UGX',
        num_items: cart.length
    });
    
    trackCustomEvent('CheckoutStarted', {
        cart_total: cartTotal,
        item_count: cart.length,
        items: cart.map(item => item.name).join(', ')
    });
    
    showNotification('Processing your order...');
    
    // Simulate checkout process
    setTimeout(() => {
        // Track successful purchase (simulated)
        trackStandardEvent('Purchase', {
            value: cartTotal,
            currency: 'UGX',
            num_items: cart.length
        });
        
        trackCustomEvent('PurchaseComplete', {
            transaction_value: cartTotal,
            item_count: cart.length,
            payment_method: 'demo'
        });
        
        alert(`Thank you for your purchase!\n\nTotal: ${formatUGX(cartTotal)}\n\nThis is a demo checkout.`);
        
        // Clear cart
        cart = [];
        cartTotal = 0;
        saveCart();
        updateCartUI();
        closeCart();
    }, 1500);
}

// Save Cart to localStorage
function saveCart() {
    localStorage.setItem('bbs_cart', JSON.stringify(cart));
    localStorage.setItem('bbs_cartTotal', cartTotal);
}

// Load Cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('bbs_cart');
    const savedTotal = localStorage.getItem('bbs_cartTotal');
    
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    if (savedTotal) {
        cartTotal = parseInt(savedTotal);
    }
    
    updateCartUI();
}

// Contact Form Submit
function handleContactSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    trackCustomEvent('ContactFormSubmitted', {
        subject: data.subject,
        has_phone: !!data.phone
    });
    
    trackStandardEvent('Contact', {
        content_name: 'Contact Form'
    });
    
    showNotification('Thank you! We will get back to you soon.');
    event.target.reset();
}

// Notification System
function showNotification(message) {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease reverse';
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
    if (timeOnPage === 30) {
        trackCustomEvent('EngagementTime', { duration: '30_seconds' });
    }
    if (timeOnPage === 60) {
        trackCustomEvent('EngagementTime', { duration: '1_minute' });
    }
}, 10000);

// Track initial page view with custom parameters
trackCustomEvent('PageViewDetailed', {
    page_type: window.location.pathname === '/' ? 'homepage' : 'internal',
    page_path: window.location.pathname,
    timestamp: new Date().toISOString()
});
                
