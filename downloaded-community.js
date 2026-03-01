/* ========================================
   Plant Parents Community — JavaScript
   The Nursery Green
   ======================================== */

(function () {
    'use strict';

    const sharedAuth = window.authSession || null;

    // ==========================================
    // SEED DATA — Sample community posts
    // ==========================================
    const SEED_POSTS = [
        {
            id: 's1',
            author: 'Sunita Devi',
            avatar: '🌻',
            city: 'Lucknow',
            category: 'show-tell',
            content: 'My mogra finally bloomed after 3 months of patience! 🌸✨ Used Flower Booster Spray from The Nursery Green and the results are unbelievable. 14 buds at once!\n\n#FirstBloom #MograLove #BalconyGarden',
            images: [],
            likes: 87,
            comments: [
                { author: 'Meera Patel', avatar: '🌺', text: 'So beautiful Sunita ji! Which variety is this?', time: '2h ago' },
                { author: 'Rahul Verma', avatar: '🌵', text: 'Amazing result! I need to try this spray on my jasmine too 🌿', time: '1h ago' }
            ],
            time: '3h ago',
            timestamp: Date.now() - 3 * 60 * 60 * 1000
        },
        {
            id: 's2',
            author: 'Rahul Verma',
            avatar: '🌵',
            city: 'Delhi',
            category: 'tips',
            content: '💡 Pro tip for Delhi summers: Mix 1 tablespoon of The Nursery Green\'s Neem Oil in 1 litre water and spray every 7 days. Keeps mealybugs away completely!\n\nAlso add some vermicompost every 15 days for best results. My terrace garden has been pest-free for 6 months now.\n\n#NeemHacks #DelhiGardening #OrganicOnly',
            images: [],
            likes: 134,
            comments: [
                { author: 'Neha Singh', avatar: '🍃', text: 'This is gold! Do you spray in the morning or evening?', time: '5h ago' },
                { author: 'Rahul Verma', avatar: '🌵', text: 'Always evening after 5 PM. Never spray in direct sunlight!', time: '4h ago' },
                { author: 'Arjun Nair', avatar: '🌱', text: 'Following this routine. Thanks bhai! 🙏', time: '3h ago' }
            ],
            time: '6h ago',
            timestamp: Date.now() - 6 * 60 * 60 * 1000
        },
        {
            id: 's3',
            author: 'Meera Patel',
            avatar: '🌺',
            city: 'Ahmedabad',
            category: 'help',
            content: '🆘 Help needed! My money plant leaves are turning yellow from the tips. I water it every 3 days and it\'s kept indoor near a window.\n\nIs it overwatering? Or nutrient deficiency? Any desi remedy would be great!\n\n#HelpNeeded #MoneyPlant #YellowLeaves',
            images: [],
            likes: 45,
            comments: [
                { author: 'Sunita Devi', avatar: '🌻', text: 'Sounds like overwatering. Check if the soil is soggy. Let it dry out between waterings.', time: '2h ago' },
                { author: 'Plant Expert', avatar: '🪴', text: 'Try adding Bone Meal powder - it could be phosphorus deficiency. Also reduce watering to once a week in winter.', time: '1h ago' }
            ],
            time: '8h ago',
            timestamp: Date.now() - 8 * 60 * 60 * 1000
        },
        {
            id: 's4',
            author: 'Arjun Nair',
            avatar: '🌱',
            city: 'Bangalore',
            category: 'diy',
            content: '🔧 Made this DIY vertical garden using old plastic bottles and jute rope! Total cost: ₹200 only.\n\nStep by step:\n1. Cut bottles horizontally\n2. Poke drain holes at bottom\n3. Thread jute rope through\n4. Fill with soil + vermicompost mix\n5. Plant herbs - tulsi, mint, dhaniya\n\nPerfect for small balconies! 🌿\n\n#DesiJugaad #VerticalGarden #BalconyGarden',
            images: [],
            likes: 203,
            comments: [
                { author: 'Neha Singh', avatar: '🍃', text: 'This is brilliant Arjun! Can you share which vermicompost you used?', time: '4h ago' },
                { author: 'Arjun Nair', avatar: '🌱', text: 'The Nursery Green\'s vermicompost works great. Very fine texture, no smell 👍', time: '3h ago' }
            ],
            time: '12h ago',
            timestamp: Date.now() - 12 * 60 * 60 * 1000
        },
        {
            id: 's5',
            author: 'Neha Singh',
            avatar: '🍃',
            city: 'Jaipur',
            category: 'balcony',
            content: '🏠 6 months ago my balcony was empty concrete. Today it\'s a mini jungle with 47 plants! 🌿🌸🌵\n\nBest performers in Jaipur heat:\n- Bougainvillea (blooming non-stop!)\n- Adenium (desert rose - loves the sun)\n- Snake plant (indestructible)\n- Curry leaf plant (grows like crazy)\n\nAll fed with All-in-One Mixture. Can\'t recommend it enough!\n\n#BalconyGarden #JaipurGardening #MonsoonCare',
            images: [],
            likes: 156,
            comments: [
                { author: 'Meera Patel', avatar: '🌺', text: 'Goals! 😍 How do you manage watering 47 plants?', time: '6h ago' },
                { author: 'Neha Singh', avatar: '🍃', text: 'Drip irrigation system from Amazon. Cost me ₹1500 but saves so much time!', time: '5h ago' }
            ],
            time: '1d ago',
            timestamp: Date.now() - 24 * 60 * 60 * 1000
        },
        {
            id: 's6',
            author: 'Vikram Thakur',
            avatar: '🌿',
            city: 'Mumbai',
            category: 'organic',
            content: '🌿 Switched to 100% organic fertilizers 1 year ago. Here\'s my honest review:\n\n✅ Pros:\n- Plants are healthier and more resistant to pests\n- Soil quality improved dramatically\n- Vegetables actually taste better\n- Safe for my kids who play near the plants\n\n❌ Cons:\n- Slightly slower results than chemical (but worth the wait)\n- Need to fertilize more frequently\n\nUsing Nursery Green products throughout. Best decision for my terrace farm!\n\n#OrganicOnly #TerraceFarming #MumbaiGardening',
            images: [],
            likes: 178,
            comments: [
                { author: 'Sunita Devi', avatar: '🌻', text: 'So true about the taste! My organic tomatoes are worlds apart from market ones.', time: '8h ago' },
                { author: 'Rahul Verma', avatar: '🌵', text: '1 year strong! I switched 6 months ago and already seeing the difference 💪', time: '6h ago' }
            ],
            time: '1d ago',
            timestamp: Date.now() - 28 * 60 * 60 * 1000
        },
        {
            id: 's7',
            author: 'Priya Kapoor',
            avatar: '🌸',
            city: 'Chandigarh',
            category: 'indoor',
            content: '🪴 Best indoor plants for Indian homes (tested in my apartment):\n\n1. 🐍 Snake Plant — survives anything, purifies air\n2. 💰 Pothos — grows fast, low maintenance\n3. 🕸️ Spider Plant — great for hanging baskets\n4. ☮️ Peace Lily — blooms indoors, loves shade\n5. 🎋 Bamboo Palm — natural humidifier\n\nAll 5 together cost less than ₹500 from a local nursery. Add Plant Diet from Nursery Green monthly and watch them thrive!\n\n#IndoorPlants #AirPurifier #PlantParents',
            images: [],
            likes: 221,
            comments: [
                { author: 'Meera Patel', avatar: '🌺', text: 'Snake plant is truly indestructible 😂 I forgot to water mine for a month and it\'s still happy!', time: '12h ago' },
                { author: 'Arjun Nair', avatar: '🌱', text: 'Adding rubber plant to this list! They\'re gorgeous and easy.', time: '10h ago' },
                { author: 'Priya Kapoor', avatar: '🌸', text: 'Yes! Rubber plant is my 6th one. Love the burgundy variety 🌿', time: '8h ago' }
            ],
            time: '2d ago',
            timestamp: Date.now() - 48 * 60 * 60 * 1000
        },
        {
            id: 's8',
            author: 'Deepak Sharma',
            avatar: '🪴',
            city: 'Pune',
            category: 'terrace',
            content: '🌇 My terrace vegetable garden update — February harvest:\n\n🍅 Tomatoes: 4 kg\n🌶️ Green chillies: 1.5 kg\n🥬 Palak (spinach): 2 kg\n🫑 Capsicum: 1 kg\n🥒 Cucumber: 3 kg\n\nTotal saved on vegetables this month: ₹2,800! 💰\n\nSecret: Root Booster + Vermi Compost mix. Applied every 2 weeks.\n\nGrowing your own food is the best feeling ever!\n\n#TerraceGarden #GrowYourFood #OrganicVegetables',
            images: [],
            likes: 312,
            comments: [
                { author: 'Vikram Thakur', avatar: '🌿', text: 'This is amazing Deepak! ₹2,800 saved monthly is no joke. How big is your terrace?', time: '1d ago' },
                { author: 'Deepak Sharma', avatar: '🪴', text: 'About 400 sq ft. Using grow bags mostly. Started with just 10 bags!', time: '20h ago' },
                { author: 'Neha Singh', avatar: '🍃', text: 'Inspiring! I want to start terrace farming this monsoon. Any tips for beginners?', time: '15h ago' }
            ],
            time: '2d ago',
            timestamp: Date.now() - 52 * 60 * 60 * 1000
        }
    ];

    // ==========================================
    // CATEGORY LABELS
    // ==========================================
    const CATEGORY_LABELS = {
        'show-tell': '🏆 Show & Tell',
        'help': '🆘 Help Needed',
        'tips': '💡 Tips & Tricks',
        'diy': '🔧 DIY & Hacks',
        'balcony': '🏠 Balcony Garden',
        'terrace': '🌇 Terrace Garden',
        'indoor': '🪴 Indoor Plants',
        'organic': '🌿 Organic Care'
    };

    // ==========================================
    // STATE
    // ==========================================
    let userProfile = JSON.parse(localStorage.getItem('tng_community_profile') || 'null');
    let authToken = sharedAuth && sharedAuth.getToken ? sharedAuth.getToken() : null;
    let posts = JSON.parse(localStorage.getItem('tng_community_posts') || 'null') || [...SEED_POSTS];
    let uploadedImages = [];
    let currentFilter = 'all';
    let currentSort = 'latest';
    let postsPerPage = 10;
    let displayedPosts = postsPerPage;
    let activeSharePostId = null;

    const isAuthed = () => Boolean(authToken && userProfile);

    function syncAuthFromShared() {
        authToken = sharedAuth && sharedAuth.getToken ? sharedAuth.getToken() : null;
        const sharedUser = sharedAuth && sharedAuth.getUser ? sharedAuth.getUser() : null;
        if (!userProfile && sharedUser) {
            const name = sharedUser.firstName && sharedUser.lastName ? `${sharedUser.firstName} ${sharedUser.lastName}` : sharedUser.email || 'Plant Parent';
            userProfile = {
                name,
                email: sharedUser.email,
                avatar: '🌱',
                city: sharedUser.address?.city || ''
            };
            localStorage.setItem('tng_community_profile', JSON.stringify(userProfile));
        }
    }

    // ==========================================
    // INIT
    // ==========================================
    function init() {
        syncAuthFromShared();
        setupEventListeners();
        renderMobileCategories();
        setAuthedUI();
        renderFeed();
        updateCounts();
    }

    // ==========================================
    // PROFILE
    // ==========================================
    function showProfileModal() {
        document.getElementById('profileModal').style.display = 'flex';
    }

    function hideProfileModal() {
        document.getElementById('profileModal').style.display = 'none';
    }

    function updateUserCard() {
        if (!userProfile) return;
        const card = document.getElementById('userCard');
        card.style.display = 'block';
        document.getElementById('userAvatarBig').textContent = userProfile.avatar;
        document.getElementById('userName').textContent = userProfile.name;
        document.getElementById('userCity').textContent = userProfile.city || 'India';
        document.getElementById('createAvatar').textContent = userProfile.avatar;

        // Count user posts
        const myPosts = posts.filter(p => p.author === userProfile.name);
        const myLikes = myPosts.reduce((sum, p) => sum + p.likes, 0);
        document.getElementById('myPostCount').textContent = myPosts.length;
        document.getElementById('myLikeCount').textContent = myLikes;
    }

    // ==========================================
    // AUTH UI
    // ==========================================
    function setAuthedUI() {
        const authGuard = document.getElementById('authGuard');
        const createTrigger = document.getElementById('createTrigger');
        const createExpanded = document.getElementById('createPostExpanded');
        const card = document.getElementById('userCard');
        const banner = document.getElementById('authBanner');

        if (isAuthed()) {
            if (authGuard) authGuard.style.display = 'none';
            if (createTrigger) createTrigger.style.display = 'block';
            if (card) card.style.display = 'block';
            if (banner) banner.style.display = 'none';
            updateUserCard();
        } else {
            if (authGuard) authGuard.style.display = 'flex';
            if (createTrigger) createTrigger.style.display = 'none';
            if (createExpanded) createExpanded.style.display = 'none';
            if (card) card.style.display = 'none';
            if (banner) banner.style.display = 'flex';
        }
    }

    // ==========================================
    // EVENTS
    // ==========================================
    function setupEventListeners() {
        // Profile form
        const profileForm = document.getElementById('profileForm');
        profileForm.addEventListener('submit', function (e) {
            e.preventDefault();
            if (!requireAuth()) return;
            const name = document.getElementById('profileName').value.trim();
            const city = document.getElementById('profileCity').value.trim();
            const avatar = document.querySelector('.avatar-btn.selected')?.dataset.avatar || '🌱';

            if (!name) return;

            userProfile = { ...userProfile, name, city, avatar };
            localStorage.setItem('tng_community_profile', JSON.stringify(userProfile));
            hideProfileModal();
            updateUserCard();
            showToast('Welcome to the community, ' + name + '! 🌱');
        });

        const closeProfileModalBtn = document.getElementById('closeProfileModal');
        if (closeProfileModalBtn) {
            closeProfileModalBtn.addEventListener('click', hideProfileModal);
        }

        // Avatar selection
        document.getElementById('avatarGrid').addEventListener('click', function (e) {
            const btn = e.target.closest('.avatar-btn');
            if (!btn) return;
            document.querySelectorAll('.avatar-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });

        // Edit profile
        document.getElementById('editProfileBtn').addEventListener('click', function () {
            if (!requireAuth()) return;
            if (userProfile) {
                document.getElementById('profileName').value = userProfile.name;
                document.getElementById('profileCity').value = userProfile.city || '';
                document.querySelectorAll('.avatar-btn').forEach(b => {
                    b.classList.toggle('selected', b.dataset.avatar === userProfile.avatar);
                });
            }
            showProfileModal();
        });

        // Create post toggle
        document.getElementById('createTrigger').addEventListener('click', function () {
            if (!requireAuth()) return;
            document.getElementById('createPostExpanded').style.display = 'block';
            this.style.display = 'none';
            document.getElementById('postContent').focus();
        });

        // Char counter
        document.getElementById('postContent').addEventListener('input', function () {
            document.getElementById('charCount').textContent = this.value.length;
        });

        // Image upload
        document.getElementById('uploadBtn').addEventListener('click', function () {
            document.getElementById('imageInput').click();
        });

        document.getElementById('imageInput').addEventListener('change', function (e) {
            handleImageFiles(e.target.files);
        });

        // Submit post
        document.getElementById('submitPost').addEventListener('click', submitPost);

        // Feed tabs
        document.querySelectorAll('.feed-tab').forEach(tab => {
            tab.addEventListener('click', function () {
                document.querySelectorAll('.feed-tab').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                currentSort = this.dataset.sort;
                displayedPosts = postsPerPage;
                renderFeed();
            });
        });

        // Category filters
        document.getElementById('categoryFilters').addEventListener('click', function (e) {
            const pill = e.target.closest('.cat-pill');
            if (!pill) return;
            document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            // Also update mobile cats
            document.querySelectorAll('.mobile-cat-pill').forEach(p => {
                p.classList.toggle('active', p.dataset.cat === pill.dataset.cat);
            });
            currentFilter = pill.dataset.cat;
            displayedPosts = postsPerPage;
            renderFeed();
        });

        // Load more
        document.getElementById('loadMoreBtn').addEventListener('click', function () {
            displayedPosts += postsPerPage;
            renderFeed();
        });

        // Share modal
        document.getElementById('closeShareModal').addEventListener('click', function () {
            document.getElementById('shareModal').style.display = 'none';
        });

        document.getElementById('shareWhatsApp').addEventListener('click', function () {
            const post = posts.find(p => p.id === activeSharePostId);
            if (post) {
                const text = `🌱 Check out this post from Plant Parents Community:\n\n"${post.content.substring(0, 150)}..."\n\n👉 https://thenurserygreen.com/community.html`;
                window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
            }
            document.getElementById('shareModal').style.display = 'none';
        });

        document.getElementById('shareCopyLink').addEventListener('click', function () {
            navigator.clipboard.writeText('https://thenurserygreen.com/community.html').then(() => {
                showToast('Link copied! 📋');
            });
            document.getElementById('shareModal').style.display = 'none';
        });

        document.getElementById('shareTwitter').addEventListener('click', function () {
            const post = posts.find(p => p.id === activeSharePostId);
            if (post) {
                const text = `🌱 ${post.content.substring(0, 200)} — via @TheNurseryGreen`;
                window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(text), '_blank');
            }
            document.getElementById('shareModal').style.display = 'none';
        });

        // Close post modal
        document.getElementById('closePostModal')?.addEventListener('click', function () {
            document.getElementById('postModal').style.display = 'none';
        });

        // Mobile menu
        const mobileToggle = document.getElementById('mobileToggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', function () {
                const menu = document.getElementById('mobileMenu');
                menu.classList.toggle('active');
                this.classList.toggle('active');
            });
        }

        // Close modals on overlay click
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', function (e) {
                if (e.target === this) {
                    this.style.display = 'none';
                }
            });
        });
    }

    // ==========================================
    // IMAGE HANDLING
    // ==========================================
    function handleImageFiles(files) {
        const maxImages = 4;
        const remaining = maxImages - uploadedImages.length;
        const toProcess = Array.from(files).slice(0, remaining);

        toProcess.forEach(file => {
            if (!file.type.startsWith('image/')) return;
            if (file.size > 5 * 1024 * 1024) {
                showToast('Image too large (max 5MB)');
                return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                uploadedImages.push(e.target.result);
                renderImagePreviews();
            };
            reader.readAsDataURL(file);
        });
    }

    function renderImagePreviews() {
        const grid = document.getElementById('imagePreviewGrid');
        grid.innerHTML = uploadedImages.map((img, i) => `
            <div class="image-preview-item">
                <img src="${img}" alt="Upload preview">
                <button class="remove-img" data-idx="${i}">✕</button>
            </div>
        `).join('');

        grid.querySelectorAll('.remove-img').forEach(btn => {
            btn.addEventListener('click', function () {
                uploadedImages.splice(parseInt(this.dataset.idx), 1);
                renderImagePreviews();
            });
        });

        // Update upload button text
        const uploadBtn = document.getElementById('uploadBtn');
        if (uploadedImages.length >= 4) {
            uploadBtn.style.display = 'none';
        } else {
            uploadBtn.style.display = 'block';
            uploadBtn.textContent = `📷 Add Photos (${uploadedImages.length}/4)`;
        }
    }

    // ==========================================
    // SUBMIT POST
    // ==========================================
    function submitPost() {
        if (!requireAuth()) return;

        const content = document.getElementById('postContent').value.trim();
        if (!content && uploadedImages.length === 0) {
            showToast('Write something or add a photo! 📝');
            return;
        }

        const category = document.getElementById('postCategory').value;

        const newPost = {
            id: 'u' + Date.now(),
            author: userProfile.name,
            avatar: userProfile.avatar,
            city: userProfile.city || 'India',
            category: category,
            content: content,
            images: [...uploadedImages],
            likes: 0,
            comments: [],
            time: 'Just now',
            timestamp: Date.now()
        };

        posts.unshift(newPost);
        savePosts();

        // Reset form
        document.getElementById('postContent').value = '';
        document.getElementById('charCount').textContent = '0';
        uploadedImages = [];
        renderImagePreviews();
        document.getElementById('createPostExpanded').style.display = 'none';
        document.getElementById('createTrigger').style.display = 'block';
        document.getElementById('imageInput').value = '';
        document.getElementById('uploadBtn').style.display = 'block';
        document.getElementById('uploadBtn').textContent = '📷 Add Photos (max 4)';

        // Render
        currentSort = 'latest';
        document.querySelectorAll('.feed-tab').forEach(t => t.classList.toggle('active', t.dataset.sort === 'latest'));
        renderFeed();
        updateUserCard();
        updateCounts();

        showToast('Post shared! 🌱');

        // Scroll to post
        setTimeout(() => {
            const firstPost = document.querySelector('.post-card');
            if (firstPost) firstPost.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }

    // ==========================================
    // RENDER FEED
    // ==========================================
    function renderFeed() {
        let filtered = [...posts];

        // Filter by category
        if (currentFilter !== 'all') {
            filtered = filtered.filter(p => p.category === currentFilter);
        }

        // Filter by sort
        if (currentSort === 'popular') {
            filtered.sort((a, b) => b.likes - a.likes);
        } else if (currentSort === 'my-posts') {
            filtered = filtered.filter(p => userProfile && p.author === userProfile.name);
        } else {
            filtered.sort((a, b) => b.timestamp - a.timestamp);
        }

        const container = document.getElementById('feedContainer');
        const toShow = filtered.slice(0, displayedPosts);

        if (toShow.length === 0) {
            container.innerHTML = '';
            document.getElementById('emptyFeed').style.display = 'block';
            document.getElementById('loadMoreBtn').style.display = 'none';
        } else {
            document.getElementById('emptyFeed').style.display = 'none';
            container.innerHTML = toShow.map(post => renderPostCard(post)).join('');
            attachPostEvents(container);

            // Load more button
            document.getElementById('loadMoreBtn').style.display =
                displayedPosts < filtered.length ? 'block' : 'none';
        }

        document.getElementById('feedPostCount').textContent = filtered.length + ' post' + (filtered.length !== 1 ? 's' : '');
    }

    function renderPostCard(post) {
        const isLiked = getLikedPosts().includes(post.id);
        const hashtagContent = post.content.replace(/#(\w+)/g, '<span class="hashtag">#$1</span>');

        let imagesHTML = '';
        if (post.images && post.images.length > 0) {
            const imgClass = 'img-' + Math.min(post.images.length, 4);
            imagesHTML = `<div class="post-images ${imgClass}">
                ${post.images.map(img => `<img src="${img}" alt="Post image" class="post-img" loading="lazy">`).join('')}
            </div>`;
        }

        const commentCount = post.comments ? post.comments.length : 0;
        const commentsPreview = commentCount > 0 ? `
            <div class="comments-section" data-post-id="${post.id}">
                ${commentCount > 2 ? `<button class="show-comments-btn" data-post-id="${post.id}">View all ${commentCount} comments</button>` : ''}
                <div class="comment-list">
                    ${post.comments.slice(-2).map(c => renderComment(c)).join('')}
                </div>
                <div class="comment-input-row">
                    <input type="text" class="comment-input" placeholder="Write a comment..." maxlength="300" data-post-id="${post.id}">
                    <button class="comment-submit" data-post-id="${post.id}">→</button>
                </div>
            </div>
        ` : `
            <div class="comments-section" data-post-id="${post.id}">
                <div class="comment-list"></div>
                <div class="comment-input-row">
                    <input type="text" class="comment-input" placeholder="Write a comment..." maxlength="300" data-post-id="${post.id}">
                    <button class="comment-submit" data-post-id="${post.id}">→</button>
                </div>
            </div>
        `;

        const isOwner = userProfile && post.author === userProfile.name;
        const menuHTML = isOwner ? `<button class="post-menu-btn" data-post-id="${post.id}" title="Delete post">🗑️</button>` : '';

        return `
        <div class="post-card" data-post-id="${post.id}">
            <div class="post-header">
                <div class="post-avatar">${post.avatar}</div>
                <div class="post-meta">
                    <div class="post-author">
                        ${post.author}
                        <span class="post-category-badge">${CATEGORY_LABELS[post.category] || post.category}</span>
                    </div>
                    <div class="post-location">${post.city} · <span class="post-time">${post.time}</span></div>
                </div>
                ${menuHTML}
            </div>
            <div class="post-body">${hashtagContent}</div>
            ${imagesHTML}
            <div class="post-actions">
                <button class="action-btn like-btn ${isLiked ? 'liked' : ''}" data-post-id="${post.id}">
                    <span>${isLiked ? '❤️' : '🤍'}</span>
                    <span class="action-count">${post.likes}</span>
                </button>
                <button class="action-btn comment-toggle-btn" data-post-id="${post.id}">
                    <span>💬</span>
                    <span class="action-count">${commentCount}</span>
                </button>
                <button class="action-btn share-post-btn" data-post-id="${post.id}">
                    <span>📤</span>
                    <span>Share</span>
                </button>
            </div>
            ${commentsPreview}
        </div>`;
    }

    function renderComment(comment) {
        return `
            <div class="comment-item">
                <div class="comment-avatar">${comment.avatar}</div>
                <div class="comment-body">
                    <span class="comment-author">${comment.author}</span>
                    <div class="comment-text">${escapeHTML(comment.text)}</div>
                    <div class="comment-time">${comment.time}</div>
                </div>
            </div>
        `;
    }

    // ==========================================
    // POST EVENTS
    // ==========================================
    function attachPostEvents(container) {
        // Like buttons
        container.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                if (!requireAuth()) return;
                const postId = this.dataset.postId;
                const post = posts.find(p => p.id === postId);
                if (!post) return;

                const liked = getLikedPosts();
                if (liked.includes(postId)) {
                    // Unlike
                    post.likes = Math.max(0, post.likes - 1);
                    setLikedPosts(liked.filter(id => id !== postId));
                } else {
                    // Like
                    post.likes++;
                    liked.push(postId);
                    setLikedPosts(liked);
                }

                savePosts();
                renderFeed();
                updateUserCard();
            });
        });

        // Comment toggle
        container.querySelectorAll('.comment-toggle-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const postId = this.dataset.postId;
                const section = container.querySelector(`.comments-section[data-post-id="${postId}"]`);
                const input = section?.querySelector('.comment-input');
                if (input) input.focus();
            });
        });

        // Comment submit
        container.querySelectorAll('.comment-submit').forEach(btn => {
            btn.addEventListener('click', function () {
                submitComment(this.dataset.postId);
            });
        });

        container.querySelectorAll('.comment-input').forEach(input => {
            input.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    submitComment(this.dataset.postId);
                }
            });
        });

        // Show all comments
        container.querySelectorAll('.show-comments-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const postId = this.dataset.postId;
                const post = posts.find(p => p.id === postId);
                if (!post) return;
                showPostDetail(post);
            });
        });

        // Share
        container.querySelectorAll('.share-post-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                activeSharePostId = this.dataset.postId;
                document.getElementById('shareModal').style.display = 'flex';
            });
        });

        // Delete
        container.querySelectorAll('.post-menu-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const postId = this.dataset.postId;
                if (confirm('Delete this post?')) {
                    posts = posts.filter(p => p.id !== postId);
                    savePosts();
                    renderFeed();
                    updateUserCard();
                    updateCounts();
                    showToast('Post deleted 🗑️');
                }
            });
        });

        // Image lightbox
        container.querySelectorAll('.post-img').forEach(img => {
            img.addEventListener('click', function () {
                showLightbox(this.src);
            });
        });
    }

    // ==========================================
    // COMMENTS
    // ==========================================
    function submitComment(postId) {
        if (!requireAuth()) return;

        const input = document.querySelector(`.comment-input[data-post-id="${postId}"]`);
        const text = input?.value.trim();
        if (!text) return;

        const post = posts.find(p => p.id === postId);
        if (!post) return;

        if (!post.comments) post.comments = [];
        post.comments.push({
            author: userProfile.name,
            avatar: userProfile.avatar,
            text: text,
            time: 'Just now'
        });

        savePosts();
        renderFeed();
        showToast('Comment added! 💬');
    }

    // ==========================================
    // POST DETAIL MODAL
    // ==========================================
    function showPostDetail(post) {
        const modal = document.getElementById('postModal');
        const content = document.getElementById('postModalContent');

        const allComments = (post.comments || []).map(c => renderComment(c)).join('');

        content.innerHTML = `
            <div class="post-header" style="margin-bottom:1rem;">
                <div class="post-avatar">${post.avatar}</div>
                <div class="post-meta">
                    <div class="post-author">${post.author} <span class="post-category-badge">${CATEGORY_LABELS[post.category] || post.category}</span></div>
                    <div class="post-location">${post.city} · ${post.time}</div>
                </div>
            </div>
            <div class="post-body" style="margin-bottom:1rem;">${post.content.replace(/#(\w+)/g, '<span class="hashtag">#$1</span>')}</div>
            ${post.images && post.images.length > 0 ? `<div class="post-images img-${Math.min(post.images.length, 4)}" style="margin-bottom:1rem;">${post.images.map(img => `<img src="${img}" alt="Post image" class="post-img">`).join('')}</div>` : ''}
            <div style="margin-bottom:0.8rem;"><strong>❤️ ${post.likes} likes · 💬 ${(post.comments || []).length} comments</strong></div>
            <div class="comment-list" style="max-height:300px;overflow-y:auto;">
                ${allComments || '<p style="color:var(--text-light);font-size:0.9rem;">No comments yet.</p>'}
            </div>
            <div class="comment-input-row" style="margin-top:0.8rem;">
                <input type="text" class="comment-input" placeholder="Write a comment..." maxlength="300" id="modalCommentInput">
                <button class="comment-submit" id="modalCommentSubmit">→</button>
            </div>
        `;

        modal.style.display = 'flex';

        document.getElementById('modalCommentSubmit').addEventListener('click', function () {
            const input = document.getElementById('modalCommentInput');
            const text = input.value.trim();
            if (!text || !userProfile) return;

            if (!post.comments) post.comments = [];
            post.comments.push({
                author: userProfile.name,
                avatar: userProfile.avatar,
                text: text,
                time: 'Just now'
            });
            savePosts();
            showPostDetail(post); // Re-render modal
            renderFeed();
            showToast('Comment added! 💬');
        });

        document.getElementById('modalCommentInput').addEventListener('keypress', function (e) {
            if (e.key === 'Enter') document.getElementById('modalCommentSubmit').click();
        });
    }

    // ==========================================
    // LIGHTBOX
    // ==========================================
    function showLightbox(src) {
        const lb = document.createElement('div');
        lb.className = 'lightbox';
        lb.innerHTML = `<button class="lightbox-close">✕</button><img src="${src}" alt="Full size image">`;
        document.body.appendChild(lb);

        lb.addEventListener('click', function (e) {
            if (e.target === lb || e.target.classList.contains('lightbox-close')) {
                lb.remove();
            }
        });

        document.addEventListener('keydown', function handler(e) {
            if (e.key === 'Escape') {
                lb.remove();
                document.removeEventListener('keydown', handler);
            }
        });
    }

    // ==========================================
    // MOBILE CATEGORIES
    // ==========================================
    function renderMobileCategories() {
        const feedColumn = document.querySelector('.feed-column');
        if (!feedColumn) return;

        const mobileBar = document.createElement('div');
        mobileBar.className = 'mobile-cats';
        mobileBar.innerHTML = Object.entries({ all: 'All', ...CATEGORY_LABELS }).map(([key, label]) =>
            `<button class="cat-pill mobile-cat-pill ${key === 'all' ? 'active' : ''}" data-cat="${key}">${key === 'all' ? '📋 All' : label}</button>`
        ).join('');

        feedColumn.insertBefore(mobileBar, feedColumn.firstChild);

        mobileBar.addEventListener('click', function (e) {
            const pill = e.target.closest('.mobile-cat-pill');
            if (!pill) return;
            document.querySelectorAll('.mobile-cat-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            // Also update desktop
            document.querySelectorAll('#categoryFilters .cat-pill').forEach(p => {
                p.classList.toggle('active', p.dataset.cat === pill.dataset.cat);
            });
            currentFilter = pill.dataset.cat;
            displayedPosts = postsPerPage;
            renderFeed();
        });
    }

    // ==========================================
    // HELPERS
    // ==========================================
    function savePosts() {
        // Only save user-created posts + modified seed posts to localStorage
        localStorage.setItem('tng_community_posts', JSON.stringify(posts));
    }

    function getLikedPosts() {
        return JSON.parse(localStorage.getItem('tng_community_likes') || '[]');
    }

    function setLikedPosts(arr) {
        localStorage.setItem('tng_community_likes', JSON.stringify(arr));
    }

    function updateCounts() {
        const postCountEl = document.getElementById('postCount');
        if (postCountEl) {
            postCountEl.textContent = posts.length.toLocaleString();
        }
    }

    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function showToast(message) {
        // Remove existing
        document.querySelectorAll('.toast').forEach(t => t.remove());

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 2800);
    }

    function requireAuth() {
        if (isAuthed()) return true;
        showToast('Sign in to continue');
        const banner = document.getElementById('authBanner');
        if (banner) banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
            window.location.href = 'login.html?redirect=community.html';
        }, 600);
        return false;
    }

    // Update post times periodically
    function updateTimes() {
        posts.forEach(post => {
            const diff = Date.now() - post.timestamp;
            const mins = Math.floor(diff / 60000);
            const hours = Math.floor(diff / 3600000);
            const days = Math.floor(diff / 86400000);

            if (mins < 1) post.time = 'Just now';
            else if (mins < 60) post.time = mins + 'm ago';
            else if (hours < 24) post.time = hours + 'h ago';
            else if (days < 7) post.time = days + 'd ago';
            else post.time = new Date(post.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        });
    }

    // Run time updates
    setInterval(() => {
        updateTimes();
        savePosts();
    }, 60000);

    document.addEventListener('authReady', () => {
        syncAuthFromShared();
        setAuthedUI();
    });

    // ==========================================
    // BOOT
    // ==========================================
    updateTimes();
    document.addEventListener('DOMContentLoaded', init);

})();
