/* ========================================
   Plant Parents Community — JavaScript
   The Nursery Green
   ======================================== */

(function () {
    'use strict';

    const sharedAuth = window.authSession || null;
    const API_BASE = 'https://backend-production-f128.up.railway.app';

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
    let posts = [];
    let uploadedImages = [];
    let currentFilter = 'all';
    let currentSort = 'latest';
    let postsPerPage = 10;
    let displayedPosts = postsPerPage;
    let liveRefreshId = null;
    const LIVE_REFRESH_MS = 20000; // 20 seconds
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
        hideProfileModal();
        loadPostsFromApi();
        loadStats();
        loadTrending();
        loadLeaderboard();
        if (isAuthed()) {
            loadNotifications();
            loadMyProfile();
        }
        handleScannerBridge();
    }

    // ==========================================
    // DATA LOADING
    // ==========================================
    async function loadPostsFromApi(searchQuery) {
        authToken = sharedAuth && sharedAuth.getToken ? sharedAuth.getToken() : authToken;
        const headers = {};
        if (authToken) headers.Authorization = `Bearer ${authToken}`;

        renderFeedSkeleton(3);

        let url = `${API_BASE}/api/community?limit=30`;
        if (searchQuery) url += `&q=${encodeURIComponent(searchQuery)}`;
        if (currentFilter && currentFilter !== 'all') url += `&category=${currentFilter}`;
        if (activeTag) url += `&tag=${encodeURIComponent(activeTag)}`;

        try {
            const res = await fetch(url, { headers });
            if (!res.ok) throw new Error('Failed to fetch posts');

            const data = await res.json();
            const incoming = normalizePosts(data.posts || []);
            if (incoming.length) {
                mergePosts(incoming);
            } else if (!posts.length) {
                posts = normalizePosts(SEED_POSTS);
            }
        } catch (err) {
            console.warn('Falling back to seed posts:', err);
            if (!posts.length) posts = normalizePosts(SEED_POSTS);
        }

        displayedPosts = Math.max(displayedPosts, postsPerPage);
        updateTimes();
        renderFeed();
        updateCounts();
        startLiveUpdates();
    }

    // ==========================================
    // DYNAMIC WIDGETS — Stats, Trending, Leaderboard
    // ==========================================
    async function loadStats() {
        try {
            const res = await fetch(`${API_BASE}/api/community/stats`);
            if (!res.ok) return;
            const data = await res.json();
            const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = (val || 0).toLocaleString(); };
            el('memberCount', data.members);
            el('postCount', data.posts);
            el('cityCount', data.cities);
        } catch (err) {
            console.warn('Stats load error:', err);
        }
    }

    async function loadTrending() {
        try {
            const res = await fetch(`${API_BASE}/api/community/trending`);
            if (!res.ok) return;
            const data = await res.json();
            const list = document.getElementById('trendingList');
            if (!list) return;
            if (!data.trending || data.trending.length === 0) {
                list.innerHTML = '<p style="font-size:0.9rem;color:var(--text-light);">No trending topics yet</p>';
                return;
            }
            list.innerHTML = data.trending.map(t => `
                <a href="#" class="trending-item" data-tag="${t.tag}">
                    <span class="trend-tag">#${t.tag.charAt(0).toUpperCase() + t.tag.slice(1)}</span>
                    <span class="trend-count">${t.count} post${t.count !== 1 ? 's' : ''}</span>
                </a>
            `).join('');
            list.querySelectorAll('.trending-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    filterByTag(item.dataset.tag);
                });
            });
        } catch (err) {
            console.warn('Trending load error:', err);
        }
    }

    async function loadLeaderboard() {
        try {
            const res = await fetch(`${API_BASE}/api/community/leaderboard`);
            if (!res.ok) return;
            const data = await res.json();
            const list = document.getElementById('leaderboardList');
            if (!list) return;
            if (!data.leaderboard || data.leaderboard.length === 0) {
                list.innerHTML = '<p style="font-size:0.9rem;color:var(--text-light);">Be the first contributor!</p>';
                return;
            }
            const ranks = ['🥇', '🥈', '🥉'];
            list.innerHTML = data.leaderboard.map((l, i) => `
                <div class="leader-row">
                    <span class="leader-rank">${ranks[i] || (i + 1)}</span>
                    <span class="leader-avatar">${l.avatar}</span>
                    <div class="leader-info">
                        <span class="leader-name">${l.name}${l.isExpert ? ' <span class="expert-badge">✓ Expert</span>' : ''}${l.badges.length ? ' ' + l.badges.map(b => b.icon).join('') : ''}</span>
                        <span class="leader-detail">${l.city} · ${l.postCount} posts · ${l.totalLikes} ❤️</span>
                    </div>
                </div>
            `).join('');
        } catch (err) {
            console.warn('Leaderboard load error:', err);
        }
    }

    // ==========================================
    // SEARCH & HASHTAG FILTERING
    // ==========================================
    let activeTag = null;
    let searchDebounce = null;

    function setupSearch() {
        const input = document.getElementById('communitySearch');
        const clearBtn = document.getElementById('searchClear');
        if (!input) return;

        input.addEventListener('input', () => {
            clearBtn.style.display = input.value.length > 0 ? 'block' : 'none';
            clearTimeout(searchDebounce);
            searchDebounce = setTimeout(() => {
                activeTag = null;
                loadPostsFromApi(input.value.trim());
            }, 400);
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                clearTimeout(searchDebounce);
                activeTag = null;
                loadPostsFromApi(input.value.trim());
            }
        });

        clearBtn.addEventListener('click', () => {
            input.value = '';
            clearBtn.style.display = 'none';
            activeTag = null;
            loadPostsFromApi();
        });
    }

    function filterByTag(tag) {
        activeTag = tag;
        const input = document.getElementById('communitySearch');
        if (input) { input.value = '#' + tag; document.getElementById('searchClear').style.display = 'block'; }
        displayedPosts = postsPerPage;
        loadPostsFromApi();
        showToast('Filtering by #' + tag);
    }

    // ==========================================
    // NOTIFICATIONS
    // ==========================================
    async function loadNotifications() {
        try {
            const res = await fetch(`${API_BASE}/api/community/notifications`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            if (!res.ok) return;
            const data = await res.json();

            const card = document.getElementById('notifCard');
            const list = document.getElementById('notifList');
            const badge = document.getElementById('notifBadge');
            const markBtn = document.getElementById('notifMarkRead');
            if (!card || !list) return;
            card.style.display = 'block';

            if (data.unreadCount > 0) {
                badge.textContent = data.unreadCount;
                badge.style.display = 'inline-block';
                markBtn.style.display = 'block';
            } else {
                badge.style.display = 'none';
                markBtn.style.display = 'none';
            }

            if (data.notifications.length === 0) {
                list.innerHTML = '<p style="font-size:0.9rem;color:var(--text-light);">No notifications yet</p>';
                return;
            }

            list.innerHTML = data.notifications.slice(0, 10).map(n => `
                <div class="notif-item ${n.read ? '' : 'notif-unread'}">
                    <span class="notif-icon">${n.icon}</span>
                    <div class="notif-body">
                        <span class="notif-msg">${n.message}</span>
                        <span class="notif-time">${formatRelativeTime(new Date(n.createdAt))}</span>
                    </div>
                </div>
            `).join('');
        } catch (err) {
            console.warn('Notifications error:', err);
        }
    }

    async function markNotificationsRead() {
        try {
            await fetch(`${API_BASE}/api/community/notifications/read`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${authToken}` }
            });
            document.getElementById('notifBadge').style.display = 'none';
            document.getElementById('notifMarkRead').style.display = 'none';
            document.querySelectorAll('.notif-unread').forEach(el => el.classList.remove('notif-unread'));
        } catch (err) { console.warn('Mark read error:', err); }
    }

    // ==========================================
    // GAMIFICATION PROFILE
    // ==========================================
    const LEVEL_LABELS = { seedling: '🌱 Seedling', sapling: '🌿 Sapling', tree: '🌳 Tree', forest: '🌲 Forest', expert: '👑 Expert' };
    const LEVEL_MAX = { seedling: 100, sapling: 500, tree: 2000, forest: 5000, expert: 10000 };
    const DAILY_PROMPTS = [
        {
            title: 'What changed in your garden this week?',
            body: 'Share one win, one challenge, and one photo so others can learn from your setup.',
            template: 'Weekly garden update:\n✅ Win: \n⚠️ Challenge: \n📸 Progress photo: '
        },
        {
            title: 'Show your most improved plant',
            body: 'Before-and-after stories get the highest replies. Share what you changed and what worked.',
            template: 'Plant recovery story:\n🪴 Plant: \n🧪 What I changed: \n📈 Result after 2 weeks: '
        },
        {
            title: 'Ask one focused care question',
            body: 'Targeted questions help experts answer faster. Mention plant, weather, and routine.',
            template: 'Need quick help with:\n🌿 Plant: \n🌤️ City/weather: \n💧 Current routine: \n❓Question: '
        },
        {
            title: 'Share one no-fail care tip',
            body: 'Actionable tips with exact frequency and dosage are most saved by members.',
            template: 'Care tip that works for me:\n🧴 Product/mix: \n📅 Frequency: \n🌱 Best for: '
        }
    ];

    async function loadMyProfile() {
        try {
            const res = await fetch(`${API_BASE}/api/community/my-profile`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            if (!res.ok) return;
            const data = await res.json();

            const card = document.getElementById('gamificationCard');
            if (!card) return;
            card.style.display = 'block';

            document.getElementById('gamLevel').textContent = LEVEL_LABELS[data.level] || '🌱 Seedling';
            document.getElementById('gamPoints').textContent = (data.points || 0).toLocaleString();
            document.getElementById('gamStreak').textContent = `🔥 ${data.streak?.current || 0}-day streak`;

            const max = LEVEL_MAX[data.level] || 100;
            const pct = Math.min(100, Math.round((data.points / max) * 100));
            document.getElementById('gamProgressBar').style.width = pct + '%';

            const badgesEl = document.getElementById('gamBadges');
            if (data.badges && data.badges.length > 0) {
                badgesEl.innerHTML = data.badges.map(b => `<span class="gam-badge-icon" title="${b.name}">${b.icon}</span>`).join('');
            } else {
                badgesEl.innerHTML = '<span style="font-size:0.85rem;color:var(--text-light);">Earn your first badge!</span>';
            }
        } catch (err) {
            console.warn('Profile load error:', err);
        }
    }

    // ==========================================
    // SCANNER → COMMUNITY BRIDGE
    // ==========================================
    function handleScannerBridge() {
        const params = new URLSearchParams(window.location.search);
        const scanDiagnosis = params.get('scanDiagnosis');
        const scanConfidence = params.get('scanConfidence');
        const scanId = params.get('scanId');

        if (scanDiagnosis) {
            // Auto-open create post with pre-filled content
            const confPct = scanConfidence ? Math.round(parseFloat(scanConfidence) * 100) : '?';
            const preContent = `🔬 Scanner detected **${scanDiagnosis}** (${confPct}% confidence) on my plant. Has anyone dealt with this? What worked for you?\n\n#${scanDiagnosis.replace(/\\s+/g, '')} #HelpNeeded #PlantScanner`;

            // Wait for auth check then fill
            setTimeout(() => {
                if (isAuthed()) {
                    const trigger = document.getElementById('createTrigger');
                    const expanded = document.getElementById('createPostExpanded');
                    const textarea = document.getElementById('postContent');
                    const catSelect = document.getElementById('postCategory');
                    if (trigger) trigger.style.display = 'none';
                    if (expanded) expanded.style.display = 'block';
                    if (textarea) { textarea.value = preContent; document.getElementById('charCount').textContent = preContent.length; }
                    if (catSelect) catSelect.value = 'help';

                    // Store scan metadata for post submission
                    window._scanBridge = { scanId, scanDiagnosis, scanConfidence: parseFloat(scanConfidence) || null };
                    showToast('Share your scan with the community! Edit and post below 👇');
                }
            }, 500);

            // Clean URL
            window.history.replaceState({}, '', 'community.html');
        }
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

    function hydrateDailyPrompt() {
        const idx = new Date().getDate() % DAILY_PROMPTS.length;
        const prompt = DAILY_PROMPTS[idx];
        const title = document.getElementById('dailyPromptTitle');
        const body = document.getElementById('dailyPromptBody');
        const btn = document.getElementById('useDailyPromptBtn');

        if (title) title.textContent = prompt.title;
        if (body) body.textContent = prompt.body;
        if (btn) btn.dataset.template = prompt.template;
    }

    function openComposerWithTemplate(templateText, category) {
        if (!requireAuth()) return;

        const trigger = document.getElementById('createTrigger');
        const expanded = document.getElementById('createPostExpanded');
        const textarea = document.getElementById('postContent');
        const catSelect = document.getElementById('postCategory');
        const safeText = String(templateText || '');

        if (expanded) expanded.style.display = 'block';
        if (trigger) trigger.style.display = 'none';

        if (catSelect && category) catSelect.value = category;

        if (textarea) {
            if (!textarea.value.trim()) {
                textarea.value = safeText;
            } else {
                textarea.value = textarea.value.trimEnd() + '\n\n' + safeText;
            }
            textarea.focus();
            document.getElementById('charCount').textContent = textarea.value.length;
        }

        const createCard = document.getElementById('createPostCard');
        if (createCard) createCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

            // Attempt to close tab once profile is set (will be ignored if not opened by script)
            try {
                window.close();
                setTimeout(() => {
                    // Fallback: keep the page usable if close is blocked
                    document.getElementById('profileModal').style.display = 'none';
                }, 400);
            } catch (err) {
                document.getElementById('profileModal').style.display = 'none';
            }
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

        const writeHelpfulPostBtn = document.getElementById('writeHelpfulPostBtn');
        if (writeHelpfulPostBtn) {
            writeHelpfulPostBtn.addEventListener('click', function () {
                openComposerWithTemplate('One practical thing that improved my plant growth this week:\n\n', 'tips');
            });
        }

        const starterRow = document.getElementById('starterChipRow');
        if (starterRow) {
            starterRow.addEventListener('click', function (e) {
                const chip = e.target.closest('.starter-chip');
                if (!chip) return;
                openComposerWithTemplate(chip.dataset.template || '', chip.dataset.cat || null);
            });
        }

        const pollRow = document.getElementById('pollChipRow');
        if (pollRow) {
            pollRow.addEventListener('click', function (e) {
                const chip = e.target.closest('.poll-chip');
                if (!chip) return;
                openComposerWithTemplate(chip.dataset.template || '', chip.dataset.cat || null);
            });
        }

        const promptBtn = document.getElementById('useDailyPromptBtn');
        if (promptBtn) {
            promptBtn.addEventListener('click', function () {
                const text = this.dataset.template || 'Weekly plant update:\n';
                openComposerWithTemplate(text, 'show-tell');
            });
        }

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

        // Search
        setupSearch();

        // Notifications mark read
        const markReadBtn = document.getElementById('notifMarkRead');
        if (markReadBtn) markReadBtn.addEventListener('click', markNotificationsRead);
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
    async function submitPost() {
        if (!requireAuth()) return;

        const content = document.getElementById('postContent').value.trim();
        if (!content && uploadedImages.length === 0) {
            showToast('Write something or add a photo! 📝');
            return;
        }

        const category = document.getElementById('postCategory').value;
        const submitBtn = document.getElementById('submitPost');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Posting...';
        }

        try {
            const res = await fetch(`${API_BASE}/api/community`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    content,
                    category,
                    images: [...uploadedImages],
                    ...(window._scanBridge ? {
                        linkedScanId: window._scanBridge.scanId,
                        scanDiagnosis: window._scanBridge.scanDiagnosis,
                        scanConfidence: window._scanBridge.scanConfidence
                    } : {})
                })
            });

            if (!res.ok) throw new Error('post failed');
            const data = await res.json();
            const newPost = normalizePost(data.post || {
                content,
                category,
                images: [...uploadedImages],
                author: userProfile?.name,
                avatar: userProfile?.avatar,
                city: userProfile?.city,
                createdAt: Date.now(),
                likes: 0,
                comments: []
            });

            posts.unshift(newPost);

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

            // Clear scan bridge data
            window._scanBridge = null;

            showToast('Post shared! 🌱');

            // Scroll to post
            setTimeout(() => {
                const firstPost = document.querySelector('.post-card');
                if (firstPost) firstPost.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        } catch (err) {
            console.error(err);
            showToast('Could not post right now. Please try again.');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Post 🌱';
            }
        }
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

    function renderFeedSkeleton(count) {
        const container = document.getElementById('feedContainer');
        if (!container) return;

        const total = Math.max(1, count || 3);
        container.innerHTML = Array.from({ length: total }).map(() => `
            <div class="skeleton-post">
                <div class="skeleton-line short"></div>
                <div class="skeleton-line medium"></div>
                <div class="skeleton-line full"></div>
                <div class="skeleton-line full"></div>
            </div>
        `).join('');

        const emptyFeed = document.getElementById('emptyFeed');
        if (emptyFeed) emptyFeed.style.display = 'none';
    }

    function renderPostCard(post) {
        const isLiked = Boolean(post.liked);
        const hashtagContent = post.content.replace(/#(\w+)/g, '<a href="#" class="hashtag" data-tag="$1">#$1</a>');

        let imagesHTML = '';
        if (post.images && post.images.length > 0) {
            const imgClass = 'img-' + Math.min(post.images.length, 4);
            imagesHTML = `<div class="post-images ${imgClass}">
                ${post.images.map(img => `<img src="${img}" alt="Post image" class="post-img" loading="lazy">`).join('')}
            </div>`;
        }

        // Expert badge
        const expertHTML = post.isExpertPost ? '<span class="expert-badge">✓ Expert</span>' : '';

        // Scanner diagnosis badge
        let scanBadgeHTML = '';
        if (post.scanDiagnosis) {
            const confPct = post.scanConfidence ? Math.round(post.scanConfidence * 100) : '?';
            scanBadgeHTML = `<div class="scan-diagnosis-badge">🔬 Scanner: <strong>${post.scanDiagnosis}</strong> (${confPct}% confidence)</div>`;
        }

        // Product suggestions
        let productHTML = '';
        if (post.linkedProducts && post.linkedProducts.length > 0) {
            productHTML = `<div class="product-suggestions">
                <span class="product-label">🛒 Recommended:</span>
                ${post.linkedProducts.map(p => `<a href="index.html#products" class="product-chip">${p}</a>`).join('')}
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

        return `
        <div class="post-card" data-post-id="${post.id}">
            <div class="post-header">
                <div class="post-avatar">${post.avatar}</div>
                <div class="post-meta">
                    <div class="post-author">
                        ${post.author} ${expertHTML}
                        <span class="post-category-badge">${CATEGORY_LABELS[post.category] || post.category}</span>
                    </div>
                    <div class="post-location">${post.city} · <span class="post-time">${post.time}</span></div>
                </div>
            </div>
            ${scanBadgeHTML}
            <div class="post-body">${hashtagContent}</div>
            ${imagesHTML}
            ${productHTML}
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
        const expertBadge = comment.isExpert ? ' <span class="expert-badge-sm">✓</span>' : '';
        return `
            <div class="comment-item ${comment.isPinned ? 'best-answer' : ''}">
                <div class="comment-avatar">${comment.avatar}</div>
                <div class="comment-body">
                    <span class="comment-author">${comment.author}${expertBadge}</span>
                    ${comment.isPinned ? '<span class="best-answer-label">✅ Best Answer</span>' : ''}
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
                toggleLike(this.dataset.postId);
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

        // Share (with view tracking)
        container.querySelectorAll('.share-post-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                activeSharePostId = this.dataset.postId;
                // Track share on backend
                fetch(`${API_BASE}/api/community/${activeSharePostId}/share`, {
                    method: 'POST',
                    headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
                }).catch(() => {});
                document.getElementById('shareModal').style.display = 'flex';
            });
        });

        // Hashtag click to filter
        container.querySelectorAll('.hashtag').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                filterByTag(link.dataset.tag);
            });
        });

        // Image lightbox
        container.querySelectorAll('.post-img').forEach(img => {
            img.addEventListener('click', function () {
                showLightbox(this.src);
            });
        });
    }

    async function toggleLike(postId) {
        if (!requireAuth()) return;
        const post = posts.find(p => p.id === postId);
        if (!post) return;

        const btn = document.querySelector(`.like-btn[data-post-id="${postId}"]`);
        if (btn) btn.disabled = true;

        try {
            const res = await fetch(`${API_BASE}/api/community/${postId}/like`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${authToken}` }
            });

            if (!res.ok) throw new Error('like failed');
            const data = await res.json();

            post.likes = data.likes;
            post.liked = data.liked;
            renderFeed();
            updateUserCard();
        } catch (err) {
            console.error(err);
            showToast('Could not update like right now.');
        } finally {
            if (btn) btn.disabled = false;
        }
    }

    // ==========================================
    // COMMENTS
    // ==========================================
    async function submitComment(postId) {
        if (!requireAuth()) return;

        const input = document.querySelector(`.comment-input[data-post-id="${postId}"]`);
        const text = input?.value.trim();
        if (!text) return;

        if (input) input.disabled = true;

        try {
            const res = await fetch(`${API_BASE}/api/community/${postId}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`
                },
                body: JSON.stringify({ text })
            });

            if (!res.ok) throw new Error('comment failed');
            const data = await res.json();

            const post = posts.find(p => p.id === postId);
            if (post) {
                post.comments = (data.comments || []).map(normalizeComment);
            }

            renderFeed();
            showToast('Comment added! 💬');
        } catch (err) {
            console.error(err);
            showToast('Could not add comment right now.');
        } finally {
            if (input) {
                input.value = '';
                input.disabled = false;
            }
        }
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
            if (!text || !requireAuth()) return;

            input.disabled = true;

            fetch(`${API_BASE}/api/community/${post.id}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`
                },
                body: JSON.stringify({ text })
            })
            .then(res => {
                if (!res.ok) throw new Error('comment failed');
                return res.json();
            })
            .then(data => {
                post.comments = (data.comments || []).map(normalizeComment);
                showPostDetail(post); // Re-render modal
                renderFeed();
                showToast('Comment added! 💬');
            })
            .catch(err => {
                console.error(err);
                showToast('Could not add comment right now.');
            })
            .finally(() => {
                input.value = '';
                input.disabled = false;
            });
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
    function normalizePosts(arr) {
        return (arr || []).map(normalizePost);
    }

    function mergePosts(incoming) {
        const map = new Map();
        posts.forEach(p => map.set(p.id, p));
        incoming.forEach(p => {
            const existing = map.get(p.id);
            if (existing) {
                map.set(p.id, { ...existing, ...p });
            } else {
                map.set(p.id, p);
            }
        });
        posts = Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
    }

    function normalizePost(raw) {
        const created = raw && raw.createdAt ? new Date(raw.createdAt) : new Date(raw?.timestamp || Date.now());
        return {
            id: raw?.id || raw?._id || raw?.postId || ('seed-' + created.getTime()),
            author: raw?.author || raw?.authorName || 'Plant Parent',
            avatar: raw?.avatar || '🌱',
            city: raw?.city || 'India',
            category: raw?.category || 'show-tell',
            content: raw?.content || '',
            images: raw?.images || [],
            likes: raw?.likes !== undefined ? raw.likes : Array.isArray(raw?.likedBy) ? raw.likedBy.length : 0,
            liked: Boolean(raw?.liked),
            comments: (raw?.comments || []).map(normalizeComment),
            timestamp: created.getTime(),
            time: formatRelativeTime(created),
            isExpertPost: Boolean(raw?.isExpertPost),
            scanDiagnosis: raw?.scanDiagnosis || null,
            scanConfidence: raw?.scanConfidence || null,
            linkedProducts: raw?.linkedProducts || [],
            tags: raw?.tags || [],
            viewCount: raw?.viewCount || 0,
            shareCount: raw?.shareCount || 0
        };
    }

    function normalizeComment(raw) {
        const created = raw?.createdAt ? new Date(raw.createdAt) : new Date();
        return {
            id: raw?._id || raw?.id || null,
            author: raw?.author || raw?.authorName || 'Plant Parent',
            avatar: raw?.avatar || '🌱',
            text: raw?.text || '',
            time: raw?.time || formatRelativeTime(created),
            timestamp: created.getTime(),
            isExpert: Boolean(raw?.isExpert),
            isPinned: Boolean(raw?.isPinned)
        };
    }

    function formatRelativeTime(date) {
        const diff = Date.now() - date.getTime();
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (mins < 1) return 'Just now';
        if (mins < 60) return mins + 'm ago';
        if (hours < 24) return hours + 'h ago';
        if (days < 7) return days + 'd ago';
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    }

    function startLiveUpdates() {
        if (liveRefreshId) return;
        liveRefreshId = setInterval(() => {
            loadPostsFromApi();
        }, LIVE_REFRESH_MS);
    }

    function savePosts() {
        // Posts persist on the backend; keep local storage out to avoid stale copies
    }

    function getLikedPosts() {
        return [];
    }

    function setLikedPosts(arr) {
        // noop: likes are tracked server-side now
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
            post.time = formatRelativeTime(new Date(post.timestamp));
        });
    }

    // Run time updates
    setInterval(() => {
        updateTimes();
    }, 60000);

    document.addEventListener('authReady', () => {
        syncAuthFromShared();
        setAuthedUI();
        loadPostsFromApi();
    });

    // ==========================================
    // BOOT
    // ==========================================
    updateTimes();
    document.addEventListener('DOMContentLoaded', () => {
        hydrateDailyPrompt();
        init();
    });

})();
