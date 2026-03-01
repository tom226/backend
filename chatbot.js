// Chatbot Functionality with Order Management
let chatbotOpen = false;
let chatbotConversationState = 'default'; // Track conversation flow
let pendingProductOrder = null; // Track product user is ordering
let pendingOrder = null; // Track order being created
let orderCollectionStep = 0; // Step in order collection process
const CHATBOT_BACKEND_URL = 'https://backend-production-f128.up.railway.app'; // Backend server URL scoped for chatbot

// Product catalog for chatbot
const chatbotProductsCatalog = [
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

const chatbotResponses = {
    'hello': 'Hello! 👋 Welcome to The Nursery Green. How can I help you today?\n\nYou can:\n📦 Create Order\n🔍 Browse Products\n🛒 View Cart\n👤 Login\n❓ Ask Questions',
    'hi': 'Hi there! 👋 Welcome to The Nursery Green. How can I help you today?\n\nYou can:\n📦 Create Order\n🔍 Browse Products\n🛒 View Cart\n👤 Login\n❓ Ask Questions',
    'help': 'I can help you with:\n📦 Create & Track Orders\n🔍 Browse Products\n🛒 View & Manage Cart\n👤 Login with Gmail/Facebook\n📊 Order Dashboard\n❓ FAQ & Product Info\n☎️ Contact Support',
    'faq': 'Common Questions:\n✓ Free shipping on orders above ₹1999\n✓ 30-Day quality guarantee\n✓ 100% organic products\n✓ Fast delivery to your doorstep\n✓ Login required to place orders\n✓ Track orders 24/7 from dashboard',
    'order': 'To create a new order:\n1. Type "login" to sign in with Gmail or Facebook\n2. Type "create order"\n3. Browse and add products\n4. Type "place order" to confirm\n\n📦 You can track orders from your dashboard!',
    'shipping': 'Standard Shipping: 3-5 business days\nExpressed Shipping: 1-2 business days\nFree shipping on orders above ₹1999!',
    'delivery': 'We deliver across India! Delivery takes 3-5 business days typically. You can track your order with your Order ID from your dashboard.',
    'return': 'We offer 30-day replacement guarantee on all products. If you\'re not satisfied, contact our support team.',
    'payment': 'We accept online payment via Razorpay (Card, UPI, Net Banking)',
    'product': 'We offer: ✓ Fertilizers ✓ Plant Care Sprays ✓ Nutrients\nEach product is 100% organic and carefully selected for quality.',
    'contact': 'Contact Us:\n📞 +91-8887608236\n📧 thenurserygreen@gmail.com\n💬 WhatsApp: 8887608236',
    'hours': 'Customer Support Hours:\nMonday - Friday: 9 AM - 6 PM\nSaturday - Sunday: 10 AM - 4 PM\nIST',
    'thanks': 'You\'re welcome! Is there anything else I can help you with? 😊',
    'bye': 'Thank you for chatting with us! Have a great day! 👋',
    'price': 'Our prices range from ₹130 to ₹230. All products offer great value for money with organic quality.',
    'organic': 'Yes! All our products are 100% organic and free from harmful chemicals.',
    'inquiry': 'What would you like to know? Ask about:\n• Products & Ordering\n• Pricing\n• Shipping\n• Returns\n• Payment methods\n• Tracking Orders',
    'default': 'I didn\'t quite understand that. Try:\n"create order" - Start ordering\n"browse products" - See what we have\n"view cart" - Check your cart\n"login" - Sign in\n"help" - See all options'
};

function toggleChatbot() {
    const widget = document.getElementById('chatbotWidget');
    const toggle = document.getElementById('chatbotToggle');
    
    chatbotOpen = !chatbotOpen;
    
    if (chatbotOpen) {
        widget.classList.remove('chatbot-hidden');
        toggle.classList.add('chatbot-hidden');
        
        // Show greeting if first time
        const messagesDiv = document.getElementById('chatbotMessages');
        if (messagesDiv.children.length === 0) {
            addBotMessage('🌿 Welcome to The Nursery Green!\n\nI can help you:\n📦 Create Orders Directly\n🔍 Browse Products\n🛒 Check Your Cart\n\nWhat would you like to do?');
        }
    } else {
        widget.classList.add('chatbot-hidden');
        toggle.classList.remove('chatbot-hidden');
    }
}

function closeChatbot() {
    const widget = document.getElementById('chatbotWidget');
    const toggle = document.getElementById('chatbotToggle');
    
    chatbotOpen = false;
    widget.classList.add('chatbot-hidden');
    toggle.classList.remove('chatbot-hidden');
}

function addBotMessage(message, isHTML = false) {
    const messagesDiv = document.getElementById('chatbotMessages');
    const msgElement = document.createElement('div');
    msgElement.className = 'chatbot-message bot-message';
    if (isHTML) {
        msgElement.innerHTML = message;
    } else {
        msgElement.textContent = message;
    }
    messagesDiv.appendChild(msgElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function addUserMessage(message) {
    const messagesDiv = document.getElementById('chatbotMessages');
    const msgElement = document.createElement('div');
    msgElement.className = 'chatbot-message user-message';
    msgElement.textContent = message;
    messagesDiv.appendChild(msgElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

async function sendChatMessage() {
    const input = document.getElementById('chatbotInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    addUserMessage(message);
    input.value = '';
    
    // Get response
    setTimeout(async () => {
        const response = await Promise.resolve(getChatbotResponse(message));
        addBotMessage(response.message, response.isHTML);
    }, 300);
}

function handleChatInput(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

// Show products list for browsing/ordering
function showProductsList() {
    let productsList = '📦 <strong>Our Products:</strong>\n\n';
    chatbotProductsCatalog.forEach((product, index) => {
        productsList += `${index + 1}. <strong>${product.name}</strong> - ₹${product.price}\n`;
    });
    productsList += '\n💬 Reply with: "add [product name]" or "add #[number]"\nExample: "add Vermi Compost" or "add #1"';
    return productsList;
}

// Search for product by name or number
function findProduct(input) {
    const cleanInput = input.toLowerCase().trim();
    
    // Try number-based search
    const numMatch = cleanInput.match(/^#?(\d+)$/);
    if (numMatch) {
        const index = parseInt(numMatch[1]) - 1;
        if (index >= 0 && index < chatbotProductsCatalog.length) {
            return chatbotProductsCatalog[index];
        }
    }
    
    // Try name-based search
    return chatbotProductsCatalog.find(p => p.name.toLowerCase().includes(cleanInput));
}

// Add product to cart from chat with quantity
function addProductToCartFromChat(productName, quantity = 1) {
    const product = findProduct(productName);
    
    if (!product) {
        return {
            message: `❌ Sorry, I couldn't find "${productName}" in our catalog.\n\nType "browse products" to see all available items.`,
            isHTML: false
        };
    }
    
    // Add to cart array (same as regular add to cart)
    const existingItem = cart.find(item => item.name === product.name);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity
        });
    }
    
    // Save to localStorage
    saveCart();
    updateCartCount();
    updateCartUI();
    
    return {
        message: `✅ Added ${quantity}x <strong>${product.name}</strong> (₹${product.price}) to your cart!`,
        isHTML: true
    };
}

// Show cart summary from chat
function showCartSummary() {
    if (cart.length === 0) {
        return {
            message: '🛒 Your cart is empty.\n\nType "browse products" to start shopping!',
            isHTML: false
        };
    }
    
    let summary = '🛒 <strong>Your Cart:</strong>\n\n';
    let total = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        summary += `${index + 1}. ${item.name} x${item.quantity} = ₹${itemTotal}\n`;
    });
    
    summary += `\n💰 <strong>Subtotal: ₹${total}</strong>\n`;
    summary += `📦 Shipping: ${total >= 1999 ? '✅ FREE' : '₹100'}\n`;
    summary += `\n🎯 <strong>Total: ₹${total >= 1999 ? total : total + 100}</strong>\n`;
    summary += '\n💬 Type:\n"checkout" - Proceed to checkout\n"remove [product]" - Remove item\n"continue shopping" - Browse more\n"clear cart" - Clear everything';
    
    return {
        message: summary,
        isHTML: true
    };
}

// Remove product from cart
function removeProductFromCart(productName) {
    const product = findProduct(productName);
    if (!product) {
        return {
            message: `❌ Product not found: "${productName}"`,
            isHTML: false
        };
    }
    
    const index = cart.findIndex(item => item.name === product.name);
    if (index > -1) {
        const removedItem = cart[index];
        cart.splice(index, 1);
        saveCart();
        updateCartCount();
        updateCartUI();
        
        return {
            message: `🗑️ Removed <strong>${removedItem.name}</strong> from cart.`,
            isHTML: true
        };
    }
    
    return {
        message: `❌ "${productName}" is not in your cart.`,
        isHTML: false
    };
}

// Initiate checkout from chat
function initiateCheckoutFromChat() {
    if (cart.length === 0) {
        return {
            message: '❌ Your cart is empty! Add items before checkout.',
            isHTML: false
        };
    }
    
    return {
        message: '✅ Redirecting you to checkout...\n\n💳 You\'ll be able to:\n• Enter shipping details\n• Select payment method\n• Complete your order\n\n⏳ Preparing checkout...',
        isHTML: true
    };
}

// ===== ORDER CREATION FLOW =====
// Start order creation process
function startOrderCreation() {
    pendingOrder = {
        items: [],
        customerEmail: '',
        customerPhone: '',
        shippingAddress: {},
        notes: ''
    };
    orderCollectionStep = 1;
    
    return {
        message: '📦 <strong>Create a New Order</strong>\n\n✅ Step 1/3: First, type "browse" to select products or tell me what you need.',
        isHTML: true
    };
}

// Finalize order and send to backend
async function finalizeOrder() {
    if (!pendingOrder || cart.length === 0) {
        return {
            message: '❌ No items in order or incomplete information. Please add items first.',
            isHTML: false
        };
    }
    
    // Check if has auth token (user is logged in)
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
        return {
            message: '🔐 <strong>Please Login First!</strong>\n\nTo create an order, you need to log in with Gmail or Facebook.\n\n<a href="login.html" target="_blank" style="color: #228a3a; font-weight: bold;">👤 Login Now</a>\n\nAfter login, you can create orders easily!',
            isHTML: true
        };
    }
    
    try {
        // Prepare order data
        const orderData = {
            items: cart.map(item => ({
                productName: item.name,
                productId: item.id,
                quantity: item.quantity,
                price: item.price,
                subtotal: item.quantity * item.price
            })),
            shippingAddress: pendingOrder.shippingAddress|| {
                street: 'Not provided',
                city: 'Not provided',
                state: 'Not provided',
                zipCode: 'Not provided',
                country: 'India'
            },
            paymentMethod: 'razorpay',
            notes: pendingOrder.notes
        };
        
        // Send to backend
        const response = await fetch(`${CHATBOT_BACKEND_URL}/api/orders/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(orderData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to create order');
        }
        
        const result = await response.json();
        
        // Clear cart after successful order
        cart = [];
        saveCart();
        updateCartCount();
        updateCartUI();
        
        // Reset order collection
        pendingOrder = null;
        orderCollectionStep = 0;
        
        return {
            message: `✅ <strong>Order Created Successfully!</strong>\n\n📦 <strong>Order ID:</strong> ${result.orderId}\n💰 <strong>Total Amount:</strong> ₹${result.order.totalAmount}\n📅 <strong>Order Date:</strong> ${new Date().toLocaleDateString()}\n📅 <strong>Est. Delivery:</strong> 5-7 business days\n\n<strong>Next Steps:</strong>\n1. Complete payment on next screen\n2. Track your order using Order ID\n3. Receive updates via email\n\n🔗 <a href="dashboard.html" target="_blank" style="color: #228a3a; font-weight: bold;">📊 View Dashboard</a> | <a href="#" onclick="closeChatbot()" style="color: #228a3a; font-weight: bold;">✓ Thank You</a>`,
            isHTML: true
        };
    } catch (error) {
        console.error('Order creation error:', error);
        return {
            message: `❌ Error creating order: ${error.message}\n\nPlease try again or contact support.`,
            isHTML: false
        };
    }
}

function isPlantCareQuery(message = '') {
    return /(plant|leaf|leaves|soil|disease|fungus|fungal|pest|aphid|mealybug|yellow|wilting|root rot|powdery|spot)/i.test(message);
}

async function fetchKnowledgeChatResponse(query) {
    const payload = {
        query,
        context: {
            source: 'chatbot',
            leafCondition: { color: 'unknown', texture: 'unknown' },
            soilCondition: { moisture: 'unknown', drainage: 'unknown', smell: 'unknown' },
            environment: { locationType: 'unknown' }
        }
    };

    const res = await fetch(`${CHATBOT_BACKEND_URL}/api/plant-knowledge/chat-assist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        throw new Error('Knowledge assistant unavailable');
    }

    return res.json();
}

async function getChatbotResponse(userMessage) {
    const msg = userMessage.toLowerCase().trim();
    
    // ===== ORDER-RELATED COMMANDS =====
    if (msg.includes('add ') && msg.length > 4) {
        const productInput = msg.replace('add ', '').trim();
        return addProductToCartFromChat(productInput);
    }
    
    if (msg === 'browse products' || msg === 'browse' || msg === 'products' || msg === 'show products') {
        const productsList = showProductsList();
        return {
            message: productsList,
            isHTML: true
        };
    }
    
    if (msg === 'view cart' || msg === 'cart' || msg === 'show cart' || msg === 'my cart') {
        return showCartSummary();
    }
    
    if (msg === 'checkout' || msg === 'proceed to checkout' || msg === 'pay') {
        const checkoutMsg = initiateCheckoutFromChat();
        if (cart.length > 0) {
            setTimeout(() => {
                openCart();
            }, 800);
        }
        return checkoutMsg;
    }
    
    if (msg === 'clear cart' || msg === 'empty cart') {
        cart = [];
        saveCart();
        updateCartCount();
        updateCartUI();
        return {
            message: '🗑️ Your cart has been cleared.',
            isHTML: false
        };
    }
    
    if (msg.includes('remove ')) {
        const productInput = msg.replace('remove ', '').trim();
        return removeProductFromCart(productInput);
    }
    
    if (msg === 'create order' || msg === 'new order' || msg === 'order now') {
        const response = startOrderCreation();
        orderCollectionStep = 1;
        return response;
    }
    
    if (msg === 'place order' || msg === 'submit order' || msg === 'confirm order') {
        return await finalizeOrder();
    }
    
    if (msg === 'login' || msg === 'sign in' || msg === 'authenticate') {
        return {
            message: '🔐 <strong>Login to Your Account</strong>\n\n👤 Use Gmail or Facebook to login:\n\n<a href="login.html" target="_blank" style="color: #228a3a; font-weight: bold;">📱 Login with Google or Facebook</a>\n\nAfter login, you can:\n• Create and track orders\n• View order history\n• Save shipping address\n• Get delivery updates',
            isHTML: true
        };
    }
    
    if (msg === 'continue shopping' || msg === 'more products') {
        const productsList = showProductsList();
        return {
            message: productsList,
            isHTML: true
        };
    }
    
    // ===== INFO COMMANDS =====
    
    // Check for exact or partial matches in chatbotResponses
    for (const [key, value] of Object.entries(chatbotResponses)) {
        if (msg.includes(key)) {
            return {
                message: value,
                isHTML: false
            };
        }
    }
    
    // Special handling for order inquiries
    if (msg.includes('order') && msg.includes('status')) {
        return {
            message: 'To check your order status, please provide your Order ID (starts with TNG-) or email address.',
            isHTML: false
        };
    }
    
    if (msg.includes('track') || msg.includes('where')) {
        return {
            message: 'You can track your order using your Order ID. Please share your Order ID and I can help!',
            isHTML: false
        };
    }
    
    if (msg.includes('talk to') || msg.includes('human') || msg.includes('agent')) {
        return {
            message: 'You can reach our support team:\n📞 +91-8887608236\n📧 thenurserygreen@gmail.com\n💬 WhatsApp: 8887608236\n\nSupport Hours: Mon-Fri 9 AM-6 PM, Sat-Sun 10 AM-4 PM IST',
            isHTML: false
        };
    }

    if (isPlantCareQuery(userMessage)) {
        try {
            const knowledge = await fetchKnowledgeChatResponse(userMessage);
            const refs = (knowledge.references || []).slice(0, 2);
            const refText = refs.length
                ? `\n\nReferences:\n${refs.map(r => `• ${r.title}`).join('\n')}`
                : '';

            return {
                message: `${knowledge.answer || 'Please share leaf and soil details for exact guidance.'}${refText}`,
                isHTML: false
            };
        } catch (err) {
            return {
                message: 'I need leaf color, soil moisture, drainage, and sunlight details to give an accurate plant-care solution right now.',
                isHTML: false
            };
        }
    }
    
    return {
        message: chatbotResponses['default'],
        isHTML: false
    };
}

// Initialize chatbot
document.addEventListener('DOMContentLoaded', function() {
    // Initialize chatbot state
    chatbotOpen = false;
    
    // Ensure widget is hidden by default using CSS class
    const widget = document.getElementById('chatbotWidget');
    const toggle = document.getElementById('chatbotToggle');
    
    if (widget) {
        widget.classList.add('chatbot-hidden');
    }
    if (toggle) {
        toggle.classList.remove('chatbot-hidden');
    }
});
