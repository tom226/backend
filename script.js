// ===== AUTHENTICATION & USER INFO =====
const BACKEND_URL = 'https://backend-production-f128.up.railway.app';

function getStoredUserData() {
    try {
        const raw = localStorage.getItem('userData');
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        console.error('Error parsing stored user data:', e);
        return null;
    }
}

function saveStoredUserData(userObj) {
    try {
        localStorage.setItem('userData', JSON.stringify(userObj));
    } catch (e) {
        console.error('Error saving user data:', e);
    }
}

function isCommunityMemberUser(user) {
    return Boolean(user && (
        user.isCommunityMember ||
        user.membershipActive ||
        user.communityMembershipActive ||
        (user.membership && user.membership.status === 'active')
    ));
}

function isCurrentUserCommunityMember() {
    return isCommunityMemberUser(getStoredUserData());
}

function updateMembershipStatusUI() {
    const statusEl = document.getElementById('membershipStatus');
    if (!statusEl) return;

    if (isCurrentUserCommunityMember()) {
        statusEl.textContent = 'Membership active: You can now access members-only community, events, competitions, and quizzes.';
        statusEl.style.color = 'var(--primary-green)';
    } else {
        statusEl.textContent = 'Not a member yet.';
        statusEl.style.color = 'var(--text-light)';
    }
}

async function activateMonthlyMembership() {
    const authToken = localStorage.getItem('authToken');
    const user = getStoredUserData();

    if (!authToken || !user) {
        showNotification('Please login first to activate membership.');
        setTimeout(() => {
            window.location.href = 'login.html?redirect=index.html';
        }, 500);
        return;
    }

    try {
        const res = await fetch(`${BACKEND_URL}/api/users/community-membership/activate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ amount: 200, plan: 'monthly' }),
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || 'Membership activation failed');
        }

        const updatedUser = {
            ...user,
            ...(data.user || {}),
            isCommunityMember: true,
            membershipActive: true,
            membership: {
                ...(data.membership || {}),
                status: 'active',
                amount: 200,
                currency: 'INR',
                plan: 'monthly',
            },
        };

        saveStoredUserData(updatedUser);
        showNotification('Membership activated: Rs. 200/month. Community unlocked!');
        updateMembershipStatusUI();
    } catch (error) {
        console.error('Membership activation failed:', error);
        showNotification('Could not activate membership right now. Please try again.');
    }
}

function setupMembershipActions() {
    const joinBtns = document.querySelectorAll('.join-membership-btn');
    joinBtns.forEach((btn) => {
        btn.addEventListener('click', activateMonthlyMembership);
    });

    const memberOnlyLinks = document.querySelectorAll('.membership-required');
    memberOnlyLinks.forEach((link) => {
        link.addEventListener('click', function (e) {
            const authToken = localStorage.getItem('authToken');
            if (!authToken) {
                e.preventDefault();
                showNotification('Login required to access members community.');
                setTimeout(() => {
                    window.location.href = 'login.html?redirect=community.html';
                }, 500);
                return;
            }

            if (!isCurrentUserCommunityMember()) {
                e.preventDefault();
                showNotification('Community is for members only. Activate Rs. 200/month membership.');
                const membership = document.getElementById('membership');
                if (membership) membership.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    });

    updateMembershipStatusUI();
}

function initializeUserInfo() {
    const authToken = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (authToken && userData) {
        try {
            const user = JSON.parse(userData);
            const loginBtn = document.querySelector('.login-btn');
            
            if (loginBtn) {
                // Hide login button
                loginBtn.style.display = 'none';
            }
            
            // Show user name in place of login button
            const userDisplayName = user.firstName && user.lastName ? 
                `${user.firstName} ${user.lastName}` : 
                user.email;
            
            // Create user info element if it doesn't exist
            let userInfo = document.querySelector('.user-info');
            if (!userInfo) {
                const navIcons = document.querySelector('.nav-icons');
                userInfo = document.createElement('div');
                userInfo.className = 'user-info';
                userInfo.innerHTML = `
                    <div style="text-align: center; padding: 10px 15px; color: #228a3a; font-weight: 600; font-size: 13px;">
                        <div>👤 ${userDisplayName}</div>
                        <a href="dashboard.html" style="color: #228a3a; text-decoration: none; font-size: 11px;">View Dashboard</a>
                    </div>
                `;
                // Insert after login button or at beginning
                const loginBtn = document.querySelector('.login-btn');
                if (loginBtn) {
                    loginBtn.parentNode.insertBefore(userInfo, loginBtn);
                } else {
                    navIcons.insertBefore(userInfo, navIcons.firstChild);
                }
            }
            
            // Update account button to go to dashboard if logged in
            const accountBtn = document.querySelector('.account-btn');
            if (accountBtn) {
                accountBtn.onclick = function() {
                    window.location.href = 'dashboard.html';
                };
            }
        } catch (e) {
            console.error('Error parsing user data:', e);
        }
    } else {
        // If not logged in, set account button to go to login
        const accountBtn = document.querySelector('.account-btn');
        if (accountBtn) {
            accountBtn.onclick = function() {
                window.location.href = 'login.html';
            };
        }
    }
}

// ===== CART MANAGEMENT =====
let cart = [];
let cartCount = 0;
let cartElement = null;

// Get cart element - delayed to ensure it exists
function getCartElement() {
    if (!cartElement) {
        cartElement = document.querySelector('.cart-count');
    }
    return cartElement;
}

// Initialize cart from localStorage
function initializeCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartCount();
        updateCartUI();
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Add to cart
function addToCart(buttonOrEvent) {
    // Handle both event and direct button reference
    let button = buttonOrEvent;
    
    // If it's an event, prevent default and get the button
    if (buttonOrEvent && buttonOrEvent.type === 'click') {
        buttonOrEvent.preventDefault();
        buttonOrEvent.stopPropagation();
        button = buttonOrEvent.target;
    }
    
    console.log('🛒 addToCart called with button:', button);
    
    try {
        const card = button.closest('.product-card');
        console.log('✓ Found product card:', card);
        
        if (!card) {
            console.error('✗ Product card not found!');
            alert('Error: Could not find product card');
            return;
        }
        
        const productName = card.querySelector('h3').textContent.trim();
        const priceText = card.querySelector('.sale-price').textContent.trim().replace('₹', '').replace(/,/g, '');
        const price = parseInt(priceText);
        
        console.log(`✓ Product: ${productName}, Price: ₹${price}`);
        
        // Check if product already in cart
        const existingItem = cart.find(item => item.name === productName);
        
        if (existingItem) {
            existingItem.quantity += 1;
            console.log(`✓ Updated quantity for ${productName} to ${existingItem.quantity}`);
        } else {
            cart.push({
                id: Date.now(),
                name: productName,
                price: price,
                quantity: 1
            });
            console.log(`✓ Added new product: ${productName}`);
        }
        
        console.log('📦 Cart contents:', cart);
        saveCart();
        updateCartCount();
        updateCartUI();
        showNotification(`✓ ${productName} added to cart!`);
        
        // Animate button
        const originalText = button.textContent;
        button.textContent = '✓ Added!';
        button.style.background = 'var(--primary-green)';
    
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
        }, 2000);
        
        console.log('✓ addToCart completed successfully!');
    } catch (error) {
        console.error('✗ Error in addToCart:', error);
        alert('Error adding product to cart: ' + error.message);
    }
}

// Update cart count
function updateCartCount() {
    cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const element = getCartElement();
    if (element) {
        element.textContent = cartCount;
    }
}

// Update cart UI (modal content)
function updateCartUI() {
    const cartItemsContainer = document.getElementById('cartItems');
    const emptyCartDiv = document.getElementById('emptyCart');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (cart.length === 0) {
        cartItemsContainer.classList.remove('show');
        emptyCartDiv.style.display = 'block';
        checkoutBtn.disabled = true;
    } else {
        cartItemsContainer.classList.add('show');
        emptyCartDiv.style.display = 'none';
        checkoutBtn.disabled = false;
        
        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image"></div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">₹${item.price.toLocaleString()}</div>
                    <div class="quantity-control">
                        <button onclick="updateQuantity(${item.id}, -1)">−</button>
                        <input type="number" value="${item.quantity}" readonly>
                        <button onclick="updateQuantity(${item.id}, 1)">+</button>
                    </div>
                </div>
                <div class="remove-item">
                    <button onclick="removeFromCart(${item.id})">🗑️</button>
                </div>
            </div>
        `).join('');
    }
    
    updateCartSummary();
}

// Update cart summary
function updateCartSummary() {
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = subtotal >= 1999 ? 0 : 100; // Free shipping above ₹1999
    const total = subtotal + shipping;
    
    document.getElementById('subtotal').textContent = `₹${subtotal.toLocaleString()}`;
    document.getElementById('shipping').textContent = shipping === 0 ? 'FREE' : `₹${shipping}`;
    document.getElementById('cartTotal').textContent = `₹${total.toLocaleString()}`;
    
    // Also update checkout page
    updateCheckoutSummary();
}

// Update checkout summary
function updateCheckoutSummary() {
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = calculateShippingCharge();
    const total = subtotal + shipping;
    
    const orderSummary = document.getElementById('checkoutOrderSummary');
    orderSummary.innerHTML = cart.map(item => `
        <div class="summary-item">
            <span class="summary-item-name">${item.name} x${item.quantity}</span>
            <span class="summary-item-price">₹${(item.price * item.quantity).toLocaleString()}</span>
        </div>
    `).join('');
    
    document.getElementById('checkoutSubtotal').textContent = `₹${subtotal.toLocaleString()}`;
    document.getElementById('checkoutShipping').textContent = shipping === 0 ? 'FREE (Order >₹1999)' : `₹${shipping}`;
    document.getElementById('checkoutTotalAmount').textContent = `₹${total.toLocaleString()}`;
}

// Update quantity
function updateQuantity(itemId, change) {
    const item = cart.find(i => i.id === itemId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(itemId);
        } else {
            saveCart();
            updateCartUI();
            updateCartCount();
        }
    }
}

// Remove from cart
function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    saveCart();
    updateCartUI();
    updateCartCount();
    showNotification('✓ Item removed from cart');
}

// Open cart modal
function openCart() {
    document.getElementById('cartModal').classList.add('active');
    updateCartUI();
}

// Close cart modal
function closeCart() {
    document.getElementById('cartModal').classList.remove('active');
}

// ===== PRODUCT DETAIL MODAL =====
function openProductDetail(productCard) {
    const modal = document.getElementById('productDetailModal');
    const productData = productCard.querySelector('.product-data');
    
    if (!productData) {
        console.error('Product data not found');
        return;
    }

    // Extract product information
    const name = productData.dataset.name;
    const price = productData.dataset.price;
    const image = productData.dataset.image;
    const rating = productData.dataset.rating;
    const reviews = productData.dataset.reviews;
    const description = productData.dataset.description;
    const benefits = productData.dataset.benefits.split('|');
    const usage = productData.dataset.usage;
    const type = productData.dataset.type;
    const weight = productData.dataset.weight;
    const packaging = productData.dataset.packaging;
    const shelflife = productData.dataset.shelflife;
    const tags = productCard.querySelector('.tags').innerHTML;

    // Set product details in modal
    document.getElementById('mainProductImage').src = image;
    document.getElementById('productDetailName').textContent = name;
    document.getElementById('productRating').textContent = '⭐⭐⭐⭐⭐';
    document.getElementById('productReviews').textContent = reviews;
    document.getElementById('productTags').innerHTML = tags;
    document.getElementById('productPrice').textContent = '₹' + price;
    document.getElementById('productDescription').textContent = description;
    document.getElementById('productUsage').textContent = usage;
    
    // Update specifications
    document.getElementById('specType').textContent = type;
    document.getElementById('specWeight').textContent = weight;
    document.getElementById('specPackaging').textContent = packaging;
    document.getElementById('specShelfLife').textContent = shelflife;

    // Update benefits list
    const benefitsList = document.getElementById('productBenefits');
    benefitsList.innerHTML = '';
    benefits.forEach(benefit => {
        const li = document.createElement('li');
        li.textContent = benefit.trim();
        benefitsList.appendChild(li);
    });

    // Store current product for add to cart from modal
    window.currentSelectedProduct = productCard;

    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProductDetail() {
    const modal = document.getElementById('productDetailModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function addFromDetailModal() {
    if (window.currentSelectedProduct) {
        const button = window.currentSelectedProduct.querySelector('.add-btn');
        addToCart(button);
        closeProductDetail();
    }
}

function changeMainImage(src) {
    document.getElementById('mainProductImage').src = src;
}

// Close modals on background click
window.addEventListener('click', function(event) {
    const cartModal = document.getElementById('cartModal');
    const checkoutModal = document.getElementById('checkoutModal');
    const confirmationModal = document.getElementById('confirmationModal');
    const productDetailModal = document.getElementById('productDetailModal');
    
    if (event.target === cartModal) {
        closeCart();
    }
    if (event.target === checkoutModal) {
        closeCheckout();
    }
    if (event.target === confirmationModal) {
        closeConfirmation();
    }
    if (event.target === productDetailModal) {
        closeProductDetail();
    }
});

// Close button functionality
document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', function() {
        if (this.closest('#cartModal')) closeCart();
        if (this.closest('#checkoutModal')) closeCheckout();
        if (this.closest('#productDetailModal')) closeProductDetail();
    });
});

// Product detail close button
document.addEventListener('DOMContentLoaded', function() {
    const productDetailClose = document.querySelector('.product-detail-close');
    if (productDetailClose) {
        productDetailClose.addEventListener('click', closeProductDetail);
    }
});

// ===== SHIPPING CHARGE CALCULATION (FROM LUCKNOW) =====
const shippingRates = {
    'Uttar Pradesh': { rate: 40, zone: 'Same State' },
    'Delhi': { rate: 60, zone: 'NCR' },
    'Haryana': { rate: 60, zone: 'NCR' },
    'Noida': { rate: 60, zone: 'NCR' },
    'Ghaziabad': { rate: 60, zone: 'NCR' },
    'Bihar': { rate: 80, zone: 'Adjacent' },
    'Jharkhand': { rate: 80, zone: 'Adjacent' },
    'Madhya Pradesh': { rate: 100, zone: 'Medium Distance' },
    'Rajasthan': { rate: 100, zone: 'Medium Distance' },
    'Punjab': { rate: 100, zone: 'Medium Distance' },
    'Himachal Pradesh': { rate: 100, zone: 'Medium Distance' },
    'Uttarakhand': { rate: 100, zone: 'Medium Distance' },
    'West Bengal': { rate: 120, zone: 'Far' },
    'Odisha': { rate: 120, zone: 'Far' },
    'Gujarat': { rate: 120, zone: 'Far' },
    'Maharashtra': { rate: 120, zone: 'Far' },
    'Andhra Pradesh': { rate: 150, zone: 'Far South' },
    'Telangana': { rate: 150, zone: 'Far South' },
    'Karnataka': { rate: 150, zone: 'Far South' },
    'Tamil Nadu': { rate: 150, zone: 'Far South' },
    'Kerala': { rate: 150, zone: 'Far South' },
    'Assam': { rate: 150, zone: 'North-East' },
    'Meghalaya': { rate: 150, zone: 'North-East' },
    'Manipur': { rate: 150, zone: 'North-East' },
    'Mizoram': { rate: 150, zone: 'North-East' },
    'Nagaland': { rate: 150, zone: 'North-East' },
    'Tripura': { rate: 150, zone: 'North-East' },
    'Arunachal Pradesh': { rate: 150, zone: 'North-East' }
};

// Calculate shipping charge based on state
function calculateShippingCharge() {
    const state = document.getElementById('state').value.trim();
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Free shipping for orders above ₹1999
    if (subtotal >= 1999) {
        return 0;
    }
    
    // Check if state exists in rates
    const stateRate = shippingRates[state];
    if (stateRate) {
        return stateRate.rate;
    }
    
    // Default rate for unknown states
    return 100;
}

// Display shipping rate info for the selected state
function displayShippingRateInfo() {
    const state = document.getElementById('state').value.trim();
    const stateRate = shippingRates[state];
    const rateInfoElement = document.getElementById('rateInfo');
    
    if (!rateInfoElement) return;
    
    if (stateRate) {
        rateInfoElement.textContent = `✓ Shipping: ₹${stateRate.rate} (${stateRate.zone})`;
        rateInfoElement.style.color = 'var(--primary-green)';
    } else if (state) {
        rateInfoElement.textContent = `⚠ Rate not found for "${state}". Standard rate: ₹100 will apply`;
        rateInfoElement.style.color = '#FF9800';
    } else {
        rateInfoElement.textContent = '';
    }
}

// ===== CHECKOUT =====
function goToCheckout() {
    if (cart.length > 0) {
        document.getElementById('checkoutModal').classList.add('active');
        updateCheckoutSummary();
    }
}

function closeCheckout() {
    document.getElementById('checkoutModal').classList.remove('active');
}

function goBackToCart() {
    document.getElementById('checkoutModal').classList.remove('active');
    openCart();
}

// Place order
function placeOrder() {
    const form = document.getElementById('checkoutForm');
    
    if (!form.checkValidity()) {
        showNotification('❌ Please fill in all required fields');
        return;
    }
    
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;
    const pincode = document.getElementById('pincode').value;
    const country = document.getElementById('country').value;
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = calculateShippingCharge();
    const total = subtotal + shipping;
    
    const order = {
        orderNumber: 'TNG-' + Date.now(),
        date: new Date().toLocaleDateString(),
        customer: {
            name: fullName,
            email: email,
            phone: phone,
            address: address,
            city: city,
            state: state,
            pincode: pincode,
            country: country
        },
        items: [...cart],
        subtotal: subtotal,
        shipping: shipping,
        total: total,
        paymentMethod: 'online',
        status: 'pending'
    };
    
    // Initiate Razorpay payment (Online only)
    initiateRazorpayPayment(order);
}

// Razorpay Integration
function initiateRazorpayPayment(order) {
    const razorpayOptions = {
        key: 'rzp_live_SHZiFJR4b8szCy', // Your Razorpay Key ID
        amount: order.total * 100, // Amount in paise
        currency: 'INR',
        name: 'The Nursery Green',
        description: `Order #${order.orderNumber}`,
        order_id: '', // Will be set if you have a backend
        handler: function(response) {
            // Payment successful
            order.status = 'completed';
            order.paymentId = response.razorpay_payment_id;
            processOrderConfirmation(order);
        },
        prefill: {
            name: order.customer.name,
            email: order.customer.email,
            contact: order.customer.phone
        },
        notes: {
            address: order.customer.address,
            city: order.customer.city,
            state: order.customer.state,
            pincode: order.customer.pincode
        },
        theme: {
            color: '#22863A' // Your brand green color
        },
        modal: {
            ondismiss: function() {
                showNotification('❌ Payment cancelled. Please try again.');
            }
        }
    };
    
    const rzp = new Razorpay(razorpayOptions);
    
    // Handle payment errors
    rzp.on('payment.failed', function(response) {
        showNotification('❌ Payment failed: ' + response.error.description);
        console.error('Razorpay Error:', response.error);
    });
    
    rzp.open();
}

// Process order after payment or COD
function processOrderConfirmation(order) {
    // Save order
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Show confirmation
    showOrderConfirmation(order);
}

function showOrderConfirmation(order) {
    document.getElementById('checkoutModal').classList.remove('active');
    document.getElementById('cartModal').classList.remove('active');
    
    document.getElementById('orderNumber').textContent = `Order #${order.orderNumber}`;
    
    const confirmationDetails = document.getElementById('confirmationDetails');
    confirmationDetails.innerHTML = `
        <div>
            <h4>Delivery Address</h4>
            <p>${order.customer.name}<br>${order.customer.address}<br>${order.customer.city}, ${order.customer.state} ${order.customer.pincode}</p>
        </div>
        <div>
            <h4>Order Total: ₹${order.total.toLocaleString()}</h4>
            <p>Payment Method: ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
        </div>
    `;
    
    document.getElementById('confirmationModal').classList.add('active');
    
    // Clear cart and form
    cart = [];
    saveCart();
    updateCartCount();
    updateCartUI();
    document.getElementById('checkoutForm').reset();
}

function closeConfirmation() {
    document.getElementById('confirmationModal').classList.remove('active');
    window.location.href = '#bestsellers';
}

// ===== CART BUTTON CLICK HANDLER =====
document.querySelector('.cart-btn').addEventListener('click', openCart);

// ===== ADD TO CART BUTTON HANDLERS =====
document.addEventListener('DOMContentLoaded', function() {
    initializeUserInfo();
    initializeCart();
    setupMembershipActions();
    
    // Checkout button
    document.getElementById('checkoutBtn').addEventListener('click', goToCheckout);
    document.getElementById('placeOrderBtn').addEventListener('click', placeOrder);
});

// ===== NEWSLETTER =====
function handleNewsletterSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const email = form.querySelector('input[type="email"]').value;
    
    if (email) {
        showNotification(`✓ Thanks! We've sent a confirmation to ${email}`);
        form.reset();
        
        // Store email
        const subscribers = JSON.parse(localStorage.getItem('subscribers') || '[]');
        if (!subscribers.includes(email)) {
            subscribers.push(email);
            localStorage.setItem('subscribers', JSON.stringify(subscribers));
        }
    }
}

// ===== NOTIFICATIONS =====
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: var(--primary-green);
        color: white;
        padding: 1rem 2rem;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(34, 134, 58, 0.3);
        z-index: 3000;
        animation: slideInRight 0.4s ease;
        font-weight: 600;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.4s ease';
        setTimeout(() => notification.remove(), 400);
    }, 3000);
}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            document.querySelector(href).scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// ===== ANIMATIONS CSS =====
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);

// Add event listener for state input to update shipping in real-time
document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart from localStorage
    initializeCart();
    updateMembershipStatusUI();
    
    // Shipping state input listeners
    const stateInput = document.getElementById('state');
    if (stateInput) {
        stateInput.addEventListener('change', function() {
            displayShippingRateInfo();
            updateCheckoutSummary();
        });
        stateInput.addEventListener('blur', function() {
            displayShippingRateInfo();
            updateCheckoutSummary();
        });
        stateInput.addEventListener('input', displayShippingRateInfo);
    }
});

console.log('✓ Cart and Checkout System Ready!');
console.log('✓ Shipping charges calculated from Lucknow');
console.log('✓ Add to Cart buttons activated');

// ===== LAZY LOADING FOR IMAGES =====
const lazyLoadImages = () => {
    const imageElements = document.querySelectorAll('[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.getAttribute('data-src');
                    if (src) {
                        img.style.backgroundImage = `url('${src}')`;
                        img.removeAttribute('data-src');
                        img.classList.add('loaded');
                        observer.unobserve(img);
                    }
                }
            });
        });
        
        imageElements.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for older browsers
        imageElements.forEach(img => {
            const src = img.getAttribute('data-src');
            if (src) {
                img.style.backgroundImage = `url('${src}')`;
                img.removeAttribute('data-src');
            }
        });
    }
};

// Initialize lazy loading once DOM is ready
document.addEventListener('DOMContentLoaded', lazyLoadImages);
