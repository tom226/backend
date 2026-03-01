// WhatsApp Integration & Chat Bot with All Features
// Business WhatsApp Number
const WHATSAPP_NUMBER = '918887608236'; // Include country code without + or 00
const BUSINESS_NAME = 'The Nursery Green';

// Product catalog for WhatsApp inquiries
const whatsappProductsCatalog = [
    { id: 1, name: 'Vermi Compost', price: 150, category: 'Fertilizer' },
    { id: 2, name: 'Neem Cake Powder', price: 150, category: 'Pest Control' },
    { id: 3, name: 'Flower Mixture', price: 130, category: 'Fertilizer' },
    { id: 4, name: 'All in One Mixture', price: 130, category: 'Multipurpose' },
    { id: 5, name: 'Plant Booster Spray', price: 230, category: 'Spray' },
    { id: 6, name: 'Flower Booster Spray', price: 230, category: 'Spray' },
    { id: 7, name: 'Plant Protection Spray', price: 230, category: 'Spray' },
    { id: 8, name: 'Neem Oil', price: 150, category: 'Pest Control' },
    { id: 9, name: 'Root Booster', price: 150, category: 'Root Growth' },
    { id: 10, name: 'Plant Care Plus', price: 180, category: 'Nutrient' }
];

let whatsappChatState = 'default';
let whatsappOpen = false;
let messageHistory = [];
let whatsappInactivityTimeout = null;
let lastActivityTime = Date.now();

// Initialize WhatsApp Widget
function initializeWhatsApp() {
    // Check if WhatsApp widget already exists
    if (!document.getElementById('whatsappWidget')) {
        createWhatsAppWidget();
    }
    
    // Show welcome notification
    const lastVisit = localStorage.getItem('lastWhatsAppVisit');
    const today = new Date().toDateString();
    
    if (lastVisit !== today && !whatsappOpen) {
        // Show WhatsApp badge notification after 3 seconds
        setTimeout(showWhatsAppNotification, 3000);
        localStorage.setItem('lastWhatsAppVisit', today);
    }
}

// Create WhatsApp Widget UI
function createWhatsAppWidget() {
    const container = document.body;
    
    const whatsappWidget = document.createElement('div');
    whatsappWidget.id = 'whatsappWidget';
    whatsappWidget.className = 'whatsapp-widget';
    whatsappWidget.innerHTML = `
        <div class="whatsapp-container">
            <div class="whatsapp-header">
                <div class="whatsapp-header-content">
                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004c-1.605 0-3.122-.483-4.759-1.455.331 6.302 5.943 11.292 12.381 11.292 1.331 0 2.633-.165 3.876-.477-1.996-5.574-7.157-9.527-13.228-9.527l-.266.167z'/%3E%3C/svg%3E" alt="WhatsApp" class="whatsapp-icon-header">
                    <div>
                        <h3>The Nursery Green</h3>
                        <p class="whatsapp-status">Usually replies instantly</p>
                    </div>
                </div>
                <button id="whatsappCloseBtn" class="whatsapp-close">&times;</button>
            </div>
            
            <div class="whatsapp-messages" id="whatsappMessages">
                <div class="whatsapp-message bot-message">
                    <p>👋 Welcome to The Nursery Green!</p>
                </div>
                <div class="whatsapp-message bot-message">
                    <p>How can we help you today? 🌱</p>
                </div>
                <div class="whatsapp-quick-replies">
                    <button class="whatsapp-quick-reply" onclick="sendWhatsAppQuickReply('Browse Products')">🛍️ Browse</button>
                    <button class="whatsapp-quick-reply" onclick="sendWhatsAppQuickReply('View Cart')">🛒 Cart</button>
                    <button class="whatsapp-quick-reply" onclick="sendWhatsAppQuickReply('Order Status')">📦 Orders</button>
                </div>
                <div class="whatsapp-quick-replies">
                    <button class="whatsapp-quick-reply" onclick="sendWhatsAppQuickReply('Shipping Info')">🚚 Shipping</button>
                    <button class="whatsapp-quick-reply" onclick="sendWhatsAppQuickReply('Contact')">☎️ Contact</button>
                </div>
            </div>
            
            <div class="whatsapp-input-area">
                <input type="text" id="whatsappInput" class="whatsapp-input" placeholder="Type a message..." onkeypress="handleWhatsAppKeyPress(event)">
                <button class="whatsapp-send-btn" onclick="sendWhatsAppMessage()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </div>
            
            <div class="whatsapp-footer">
                <a href="https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20The%20Nursery%20Green" target="_blank" class="whatsapp-footer-link">
                    Open WhatsApp Web ↗️
                </a>
            </div>
        </div>
    `;
    
    container.appendChild(whatsappWidget);
}

// Create WhatsApp Toggle Button
function createWhatsAppToggle() {
    const container = document.body;
    
    const whatsappToggle = document.createElement('button');
    whatsappToggle.id = 'whatsappToggle';
    whatsappToggle.className = 'whatsapp-toggle';
    whatsappToggle.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004c-1.605 0-3.122-.483-4.759-1.455.331 6.302 5.943 11.292 12.381 11.292 1.331 0 2.633-.165 3.876-.477-1.996-5.574-7.157-9.527-13.228-9.527l-.266.167z"/>
        </svg>
        <span class="whatsapp-badge">💬</span>
    `;
    whatsappToggle.onclick = toggleWhatsAppWidget;
    
    container.appendChild(whatsappToggle);
}

// Toggle WhatsApp Widget
function toggleWhatsAppWidget() {
    whatsappOpen = !whatsappOpen;
    const widget = document.getElementById('whatsappWidget');
    const toggle = document.getElementById('whatsappToggle');
    
    if (whatsappOpen) {
        widget.style.display = 'flex';
        toggle.style.display = 'none';
        document.getElementById('whatsappInput').focus();
        addBotMessage('How can I help you today? 🌱');
        lastActivityTime = Date.now();
        resetInactivityTimer();
    } else {
        widget.style.display = 'none';
        toggle.style.display = 'flex';
        clearTimeout(whatsappInactivityTimeout);
    }
}

// Close WhatsApp Widget
function closeWhatsAppWidget() {
    console.log('Closing WhatsApp widget...');
    whatsappOpen = false;
    
    try {
        const widget = document.getElementById('whatsappWidget');
        const toggle = document.getElementById('whatsappToggle');
        
        if (widget) {
            widget.style.display = 'none';
            console.log('Widget hidden');
        }
        
        if (toggle) {
            toggle.style.display = 'flex';
            console.log('Toggle button shown');
        }
        
        clearTimeout(whatsappInactivityTimeout);
        console.log('WhatsApp widget closed successfully');
    } catch (error) {
        console.error('Error closing WhatsApp widget:', error);
    }
}

// Track User Activity
function trackWhatsAppActivity() {
    lastActivityTime = Date.now();
    resetInactivityTimer();
}

// Reset Inactivity Timer
function resetInactivityTimer() {
    // Clear existing timeout
    if (whatsappInactivityTimeout) {
        clearTimeout(whatsappInactivityTimeout);
    }
    
    // Only set timer if widget is open
    if (whatsappOpen) {
        whatsappInactivityTimeout = setTimeout(() => {
            // Auto-minimize after 3 seconds of inactivity
            if (whatsappOpen) {
                console.log('Auto-minimizing WhatsApp widget due to inactivity');
                closeWhatsAppWidget();
            }
        }, 3000);
    }
}

// Send WhatsApp Quick Reply
function sendWhatsAppQuickReply(optionText) {
    trackWhatsAppActivity();
    const input = document.getElementById('whatsappInput');
    input.value = optionText;
    sendWhatsAppMessage();
}

// Send WhatsApp Message
function sendWhatsAppMessage() {
    trackWhatsAppActivity();
    const input = document.getElementById('whatsappInput');
    const message = input.value.trim();
    
    if (message === '') return;
    
    // Add user message to chat
    addUserMessage(message);
    messageHistory.push({ type: 'user', message });
    input.value = '';
    
    // Process user input and get response
    processWhatsAppInput(message);
}

// Add User Message to Chat
function addUserMessage(message) {
    trackWhatsAppActivity();
    const messagesContainer = document.getElementById('whatsappMessages');
    const messageElement = document.createElement('div');
    messageElement.className = 'whatsapp-message user-message';
    messageElement.innerHTML = `<p>${escapeHtml(message)}</p>`;
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Add Bot Message to Chat
function addBotMessage(text, includeQuickReplies = false) {
    trackWhatsAppActivity();
    const messagesContainer = document.getElementById('whatsappMessages');
    
    // Remove quick replies from previous bot message if needed
    const lastQuickReplies = messagesContainer.querySelector('.whatsapp-quick-replies:last-child');
    
    const messageElement = document.createElement('div');
    messageElement.className = 'whatsapp-message bot-message';
    messageElement.innerHTML = `<p>${text}</p>`;
    messagesContainer.appendChild(messageElement);
    
    if (includeQuickReplies) {
        const quickRepliesDiv = document.createElement('div');
        quickRepliesDiv.className = 'whatsapp-quick-replies';
        messagesContainer.appendChild(quickRepliesDiv);
    }
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Process WhatsApp Input
function processWhatsAppInput(userInput) {
    const input = userInput.toLowerCase().trim();
    let response = '';
    
    // Product browsing
    if (input.includes('browse') || input.includes('products') || input.includes('catalog')) {
        response = '📦 <strong>Our Products:</strong>\n\n';
        whatsappProductsCatalog.forEach(product => {
            response += `• <strong>${product.name}</strong> - ₹${product.price}\n`;
        });
        response += '\n📝 Reply with product name to learn more!';
        whatsappChatState = 'browsing';
    }
    
    // View cart
    else if (input.includes('view cart') || input.includes('cart')) {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        if (cart.length === 0) {
            response = '🛒 Your cart is empty\n\n💡 Type "browse products" to start shopping!';
        } else {
            response = '🛒 <strong>Your Cart:</strong>\n\n';
            let total = 0;
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                response += `• ${item.name} (${item.quantity}) = ₹${itemTotal}\n`;
            });
            const shipping = total >= 1999 ? 0 : 100;
            response += `\n📦 Subtotal: ₹${total}\n🚚 Shipping: ${shipping === 0 ? '✅ FREE' : '₹' + shipping}\n💰 <strong>Total: ₹${total + shipping}</strong>\n\n✅ Reply "checkout" to proceed!`;
        }
    }
    
    // Order status
    else if (input.includes('order status') || input.includes('track') || input.includes('order')) {
        response = '📦 <strong>Order Status</strong>\n\n📧 To track your order:\n1️⃣ We\'ll send you order details via WhatsApp\n2️⃣ Share your Order ID for tracking\n\n💬 What\'s your Order ID?';
        whatsappChatState = 'order_tracking';
    }
    
    // Checkout
    else if (input.includes('checkout') || input.includes('buy') || input.includes('purchase')) {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        if (cart.length === 0) {
            response = '❌ Your cart is empty!\n\n💡 Browse products first. Type "Browse Products"';
        } else {
            response = '✅ <strong>Proceeding to Checkout</strong>\n\n📋 Your details:\n\nPlease share:\n1️⃣ Your Name\n2️⃣ Phone Number\n3️⃣ Delivery Address\n\n(Or click "Checkout" on website for faster processing)';
            whatsappChatState = 'checkout';
        }
    }
    
    // Shipping info
    else if (input.includes('shipping') || input.includes('delivery') || input.includes('free')) {
        response = '🚚 <strong>Shipping Information</strong>\n\n✅ FREE Shipping on orders above ₹1999\n💰 Standard Shipping: ₹100 (below ₹1999)\n⚡ Express Shipping: 1-2 days (+₹150)\n📅 Standard Delivery: 3-5 days\n\n🌍 We deliver across India!';
    }
    
    // Contact info
    else if (input.includes('contact') || input.includes('help') || input.includes('support')) {
        response = '☎️ <strong>Contact Us</strong>\n\n📱 WhatsApp: +91-8887608236\n📞 Phone: +91-8887608236\n📧 Email: thenurserygreen@gmail.com\n\n⏰ <strong>Support Hours:</strong>\n🕘 Mon-Fri: 9 AM - 6 PM\n🕘 Sat-Sun: 10 AM - 4 PM\n(IST)';
    }
    
    // Product details
    else if (whatsappChatState === 'browsing') {
        const product = whatsappProductsCatalog.find(p => p.name.toLowerCase().includes(input));
        if (product) {
            response = `📦 <strong>${product.name}</strong>\n\n💰 Price: ₹${product.price}\n🏷️ Category: ${product.category}\n✨ 100% Organic\n⭐ Premium Quality\n\n🛒 Reply "add ${product.name}" to add to cart\n📋 Reply "more info" for details`;
            whatsappChatState = 'product_detail';
        } else {
            response = '❓ Product not found. Please try again or type "browse products" to see all items.';
        }
    }
    
    // Add to cart from WhatsApp
    else if (input.includes('add')) {
        const product = whatsappProductsCatalog.find(p => 
            input.includes(p.name.toLowerCase()) || input.includes(p.id.toString())
        );
        if (product) {
            addProductToCartFromWhatsApp(product);
            response = `✅ <strong>${product.name}</strong> added to cart!\n\n💰 Price: ₹${product.price}\n\n🛒 <strong>Options:</strong>\nReply "view cart" to see all items\nReply "add more" to continue shopping\nReply "checkout" to proceed to payment`;
        } else {
            response = '❌ Could not add item. Please specify the product name correctly.';
        }
    }
    
    // FAQ
    else if (input.includes('faq') || input.includes('question') || input.includes('guarantee')) {
        response = '❓ <strong>Frequently Asked Questions</strong>\n\n✅ Free shipping above ₹1999\n✅ 30-day money-back guarantee\n✅ 100% organic products\n✅ Secure payment via Razorpay\n✅ Same-day order confirmation\n\n📞 Need more help? Contact us!';
    }
    
    // Default response
    else if (input.length > 0) {
        response = '👋 Thanks for your message!\n\n🛍️ <strong>Popular Options:</strong>\n• Browse Products\n• View Cart\n• Order Status\n• Shipping Info\n• Contact Us\n\nOr reply "help" for all options!';
    }
    
    // Display response after slight delay
    setTimeout(() => {
        addBotMessage(response);
        
        // Add quick replies for specific scenarios
        if (whatsappChatState === 'browsing' || whatsappChatState === 'checkout') {
            addQuickReplies(['🛒 View Cart', '📞 Contact', '🏠 Home']);
        }
    }, 500);
}

// Add Quick Replies
function addQuickReplies(replies) {
    const messagesContainer = document.getElementById('whatsappMessages');
    const quickRepliesDiv = document.createElement('div');
    quickRepliesDiv.className = 'whatsapp-quick-replies';
    
    replies.forEach(reply => {
        const btn = document.createElement('button');
        btn.className = 'whatsapp-quick-reply';
        btn.textContent = reply;
        btn.onclick = () => sendWhatsAppQuickReply(reply);
        quickRepliesDiv.appendChild(btn);
    });
    
    messagesContainer.appendChild(quickRepliesDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Add Product to Cart from WhatsApp
function addProductToCartFromWhatsApp(product) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            category: product.category,
            quantity: 1,
            image: `Images/${product.name.replace(/\s+/g, '-').toLowerCase()}.jpg`
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count on website
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }
}

// Handle WhatsApp Key Press
function handleWhatsAppKeyPress(event) {
    trackWhatsAppActivity();
    if (event.key === 'Enter') {
        sendWhatsAppMessage();
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Show WhatsApp Notification
function showWhatsAppNotification() {
    const toggle = document.getElementById('whatsappToggle');
    if (toggle) {
        toggle.classList.add('pulse-animation');
        setTimeout(() => {
            toggle.classList.remove('pulse-animation');
        }, 3000);
    }
}

// Generate WhatsApp Message Link
function generateWhatsAppLink(phone, message) {
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phone}?text=${encodedMessage}`;
}

// Send Product Inquiry via WhatsApp
function sendProductInquiry(productName, price) {
    const message = `Hi The Nursery Green! I'm interested in ${productName} (₹${price}). Can you tell me more?`;
    const link = generateWhatsAppLink(WHATSAPP_NUMBER, message);
    window.open(link, '_blank');
}

// Send Order Status Query
function queryOrderStatus(orderId) {
    const message = `Hi! Can you check the status of my order? Order ID: ${orderId}`;
    const link = generateWhatsAppLink(WHATSAPP_NUMBER, message);
    window.open(link, '_blank');
}

// Direct WhatsApp Chat Link Button
function openWhatsAppChat() {
    const message = `Hi The Nursery Green! I have a question about your products.`;
    const link = generateWhatsAppLink(WHATSAPP_NUMBER, message);
    window.open(link, '_blank');
}

// Initialize WhatsApp on Page Load
document.addEventListener('DOMContentLoaded', () => {
    initializeWhatsApp();
    createWhatsAppToggle();
    
    // Add activity listeners
    setTimeout(() => {
        const widget = document.getElementById('whatsappWidget');
        const input = document.getElementById('whatsappInput');
        const closeBtn = document.getElementById('whatsappCloseBtn');
        
        if (widget) {
            // Track clicks inside widget
            widget.addEventListener('click', trackWhatsAppActivity);
            widget.addEventListener('touchstart', trackWhatsAppActivity);
        }
        
        if (input) {
            // Track typing
            input.addEventListener('input', trackWhatsAppActivity);
            input.addEventListener('focus', trackWhatsAppActivity);
        }
        
        // Add close button click handler
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Close button clicked');
                closeWhatsAppWidget();
            });
        }
    }, 500);
    
    // Log WhatsApp initialization
    console.log('WhatsApp Bot initialized with phone: +91-8887608236');
    console.log('Available commands: browse, cart, order, shipping, contact, help');
    console.log('Auto-minimize enabled: Widget will close after 3 seconds of inactivity');
});

// Export functions for external use
window.sendProductInquiry = sendProductInquiry;
window.queryOrderStatus = queryOrderStatus;
window.openWhatsAppChat = openWhatsAppChat;
window.toggleWhatsAppWidget = toggleWhatsAppWidget;
window.closeWhatsAppWidget = closeWhatsAppWidget;
window.trackWhatsAppActivity = trackWhatsAppActivity;
