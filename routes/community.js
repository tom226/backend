const express = require('express');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const CommunityPost = require('../models/CommunityPost');
const Notification = require('../models/Notification');

const router = express.Router();

const googleClientIds = [
  process.env.COMMUNITY_GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_ID,
  '200209144952-a9u47phmlr7gcamhoe6bp2qbi7h5hi8d.apps.googleusercontent.com'
].filter(Boolean);

const googleClient = googleClientIds.length ? new OAuth2Client(googleClientIds[0]) : null;

// ==========================================
// PRODUCT SUGGESTION MAP
// ==========================================
const PRODUCT_SUGGESTIONS = {
  'yellow': ['NPK Micronutrient Mix', 'All in One Mixture', 'Plant Diet'],
  'yellowing': ['NPK Micronutrient Mix', 'All in One Mixture', 'Plant Diet'],
  'nutrient': ['All in One Mixture', 'Plant Diet', 'Vermi Compost'],
  'pest': ['Neem Oil', 'Plant Protection Spray', 'Neem Cake Powder'],
  'mealybug': ['Neem Oil', 'Plant Protection Spray'],
  'aphid': ['Neem Oil', 'Plant Protection Spray'],
  'whitefly': ['Neem Oil', 'Plant Protection Spray'],
  'fungal': ['Neem Oil', 'Neem Cake Powder'],
  'mildew': ['Neem Oil', 'Neem Cake Powder'],
  'root rot': ['Root Booster', 'Neem Cake Powder'],
  'overwater': ['Root Booster', 'Vermi Compost'],
  'growth': ['Plant Booster Spray', 'All in One Mixture', 'Vermi Compost'],
  'flower': ['Flower Booster Spray', 'Bone Meal'],
  'bloom': ['Flower Booster Spray', 'Bone Meal'],
  'soil': ['Vermi Compost', 'Neem Cake Powder', 'All in One Mixture'],
  'fertilizer': ['All in One Mixture', 'Plant Diet', 'Vermi Compost'],
  'sunburn': ['Plant Booster Spray', 'Vermi Compost'],
  'wilt': ['Root Booster', 'Neem Cake Powder'],
  'rust': ['Neem Oil', 'Plant Protection Spray'],
  'blight': ['Neem Oil', 'Neem Cake Powder'],
  'spider mite': ['Neem Oil', 'Plant Protection Spray'],
  default: ['All in One Mixture', 'Vermi Compost']
};

// ==========================================
// POINTS & LEVELING SYSTEM
// ==========================================
const POINTS = {
  CREATE_POST: 10, ADD_COMMENT: 5, RECEIVE_LIKE: 2, RECEIVE_COMMENT: 3,
  SHARE_SCAN: 15, DAILY_LOGIN: 5, STREAK_BONUS_7: 50, STREAK_BONUS_30: 200
};

const LEVEL_THRESHOLDS = { seedling: 0, sapling: 100, tree: 500, forest: 2000, expert: 5000 };

const BADGE_DEFINITIONS = [
  { slug: 'first-post', name: 'First Post', icon: '🌱', condition: (s) => s.postsCount >= 1 },
  { slug: 'helpful-5', name: 'Helpful Hand', icon: '🤝', condition: (s) => s.commentsCount >= 5 },
  { slug: 'helpful-50', name: 'Plant Doctor', icon: '🩺', condition: (s) => s.helpfulAnswers >= 50 },
  { slug: 'popular-10', name: 'Popular', icon: '⭐', condition: (s) => s.likesReceived >= 10 },
  { slug: 'popular-100', name: 'Plant Star', icon: '🌟', condition: (s) => s.likesReceived >= 100 },
  { slug: 'scanner-5', name: 'Scanner Scout', icon: '🔬', condition: (s) => s.scansShared >= 5 },
  { slug: 'streak-7', name: '7-Day Streak', icon: '🔥', condition: (_, st) => st.longest >= 7 },
  { slug: 'streak-30', name: '30-Day Streak', icon: '💪', condition: (_, st) => st.longest >= 30 },
  { slug: 'contributor-25', name: 'Active Contributor', icon: '🏆', condition: (s) => s.postsCount >= 25 }
];

async function awardPoints(userId, amount) {
  if (!userId) return;
  try {
    const user = await User.findById(userId);
    if (!user) return;
    user.points = (user.points || 0) + amount;
    const oldLevel = user.level || 'seedling';
    let newLevel = 'seedling';
    for (const [level, threshold] of Object.entries(LEVEL_THRESHOLDS).reverse()) {
      if (user.points >= threshold) { newLevel = level; break; }
    }
    user.level = newLevel;

    // Streak
    const today = new Date().toDateString();
    const lastActive = user.streak?.lastActiveDate ? new Date(user.streak.lastActiveDate).toDateString() : null;
    if (lastActive !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      user.streak.current = (lastActive === yesterday) ? (user.streak.current || 0) + 1 : 1;
      if (user.streak.current > (user.streak.longest || 0)) user.streak.longest = user.streak.current;
      user.streak.lastActiveDate = new Date();
      if (user.streak.current === 7) { user.points += POINTS.STREAK_BONUS_7; await notify(userId, null, null, 'streak', '🔥 7-day streak! +50 bonus points!', '🔥'); }
      if (user.streak.current === 30) { user.points += POINTS.STREAK_BONUS_30; await notify(userId, null, null, 'streak', '💪 30-day streak! +200 bonus points!', '💪'); }
    }

    // Badges
    const stats = user.communityStats || {};
    const streak = user.streak || {};
    const existing = (user.badges || []).map(b => b.slug);
    for (const def of BADGE_DEFINITIONS) {
      if (!existing.includes(def.slug) && def.condition(stats, streak)) {
        user.badges.push({ slug: def.slug, name: def.name, icon: def.icon, earnedAt: new Date() });
        await notify(userId, null, null, 'badge', `${def.icon} New badge: ${def.name}!`, def.icon);
      }
    }
    if (newLevel !== oldLevel) await notify(userId, null, null, 'level-up', `🎉 Level up! You're now a ${newLevel}!`, '🎉');
    await user.save();
  } catch (err) { console.error('Award points error:', err); }
}

async function notify(userId, fromUserId, postId, type, message, icon) {
  try { await Notification.create({ userId, fromUserId, postId, type, message, icon: icon || '🔔' }); }
  catch (err) { console.error('Notify error:', err); }
}

function extractTags(content) {
  const matches = content.match(/#(\w+)/g);
  return matches ? matches.map(t => t.slice(1).toLowerCase()) : [];
}

function suggestProducts(content) {
  const lower = (content || '').toLowerCase();
  const sug = new Set();
  for (const [kw, prods] of Object.entries(PRODUCT_SUGGESTIONS)) {
    if (kw !== 'default' && lower.includes(kw)) prods.forEach(p => sug.add(p));
  }
  if (sug.size === 0) PRODUCT_SUGGESTIONS.default.forEach(p => sug.add(p));
  return Array.from(sug).slice(0, 3);
}

// ==========================================
// SEED DATA
// ==========================================
const seedPosts = [
  { authorName: 'Priya Sharma', avatar: '🌱', city: 'Delhi', category: 'tips',
    content: 'Use neem oil every 10 days to keep pests away on balcony plants. #NeemHacks #OrganicOnly',
    tags: ['neemhacks', 'organiconly'] },
  { authorName: 'Arjun Nair', avatar: '🌿', city: 'Bangalore', category: 'show-tell',
    content: 'First bougainvillea bloom of the season. Fed with vermicompost last week. #FirstBloom #BalconyGarden',
    tags: ['firstbloom', 'balconygarden'] },
  { authorName: 'Meera Patel', avatar: '🌸', city: 'Ahmedabad', category: 'help',
    content: 'Money plant tips turning yellow. Reduced watering; looking for more suggestions. #YellowLeaves #HelpNeeded',
    tags: ['yellowleaves', 'helpneeded'] }
];

// ==========================================
// AUTH MIDDLEWARE
// ==========================================
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.userId;
    next();
  } catch (err) { return res.status(401).json({ error: 'Invalid token' }); }
};

const optionalAuth = (req, _res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try { const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key'); req.userId = decoded.userId; }
    catch (err) { /* ignore */ }
  }
  next();
};

const hasActiveMembership = (user) => Boolean(
  user && (
    user.isCommunityMember ||
    user.membershipActive ||
    user.membership?.status === 'active'
  )
);

const verifyMember = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!hasActiveMembership(user)) {
      return res.status(403).json({
        error: 'Community membership required',
        code: 'MEMBERSHIP_REQUIRED',
        membership: { amount: 200, currency: 'INR', plan: 'monthly' }
      });
    }
    req.memberUser = user;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Membership verification failed' });
  }
};

async function ensureSeeded() {
  const count = await CommunityPost.countDocuments();
  if (count === 0) await CommunityPost.insertMany(seedPosts.map(p => ({ ...p, userId: null })));
}

function shapePost(post, viewerId) {
  const created = post.createdAt || new Date();
  const likesCount = Array.isArray(post.likedBy) ? post.likedBy.length : 0;
  const liked = viewerId ? post.likedBy?.some(id => id?.toString() === viewerId) : false;
  return {
    id: post._id.toString(),
    author: post.authorName,
    avatar: post.avatar || '🌱',
    city: post.city || 'India',
    category: post.category || 'show-tell',
    content: post.content,
    images: post.images || [],
    tags: post.tags || [],
    likes: likesCount,
    liked,
    comments: (post.comments || []).map(c => ({
      id: c._id?.toString(),
      author: c.authorName,
      avatar: c.avatar || '🌱',
      text: c.text,
      isExpert: c.isExpert || false,
      isPinned: c.isPinned || false,
      likes: Array.isArray(c.likedBy) ? c.likedBy.length : 0,
      createdAt: c.createdAt
    })),
    linkedScanId: post.linkedScanId || null,
    scanDiagnosis: post.scanDiagnosis || null,
    scanConfidence: post.scanConfidence || null,
    linkedProducts: post.linkedProducts || [],
    isExpertPost: post.isExpertPost || false,
    bestAnswerCommentId: post.bestAnswerCommentId?.toString() || null,
    viewCount: post.viewCount || 0,
    shareCount: post.shareCount || 0,
    isPinned: post.isPinned || false,
    createdAt: created,
    timestamp: created.getTime()
  };
}

// ==========================================
// ROUTES
// ==========================================

// GET / — Feed with search, filters, pagination
router.get('/', verifyToken, verifyMember, async (req, res) => {
  try {
    await ensureSeeded();
    const { q, category, city, tag, sort, page = 1, limit = 30 } = req.query;
    const query = { isHidden: { $ne: true } };
    if (q) query.$text = { $search: q };
    if (category && category !== 'all') query.category = category;
    if (city) query.city = { $regex: city, $options: 'i' };
    if (tag) query.tags = tag.toLowerCase();

    let sortObj = { isPinned: -1, createdAt: -1 };
    if (sort === 'popular') sortObj = { isPinned: -1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    let posts = await CommunityPost.find(query).sort(sortObj).skip(skip).limit(parseInt(limit));
    if (sort === 'popular') posts.sort((a, b) => (b.likedBy?.length || 0) - (a.likedBy?.length || 0));
    const total = await CommunityPost.countDocuments(query);
    res.json({ posts: posts.map(p => shapePost(p, req.userId)), total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    console.error('Fetch community posts failed:', err);
    res.status(500).json({ error: 'Unable to fetch posts' });
  }
});

// GET /stats
router.get('/stats', verifyToken, verifyMember, async (_req, res) => {
  try {
    const totalPosts = await CommunityPost.countDocuments({ isHidden: { $ne: true } });
    const totalMembers = await User.countDocuments();
    const cities = await CommunityPost.distinct('city');
    const totalComments = await CommunityPost.aggregate([
      { $project: { cc: { $size: '$comments' } } },
      { $group: { _id: null, total: { $sum: '$cc' } } }
    ]);
    res.json({ members: Math.max(totalMembers, 1), posts: totalPosts, cities: cities.length || 1, comments: totalComments[0]?.total || 0 });
  } catch (err) { res.json({ members: 1, posts: 0, cities: 1, comments: 0 }); }
});

// GET /trending
router.get('/trending', verifyToken, verifyMember, async (_req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
    const tags = await CommunityPost.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo }, isHidden: { $ne: true } } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    const fallback = [
      { tag: 'MonsoonCare', count: 0 }, { tag: 'BalconyGarden', count: 0 },
      { tag: 'NeemHacks', count: 0 }, { tag: 'FirstBloom', count: 0 },
      { tag: 'DesiJugaad', count: 0 }, { tag: 'OrganicOnly', count: 0 }
    ];
    res.json({ trending: tags.length > 0 ? tags.map(t => ({ tag: t._id, count: t.count })) : fallback });
  } catch (err) { res.json({ trending: [] }); }
});

// GET /leaderboard
router.get('/leaderboard', verifyToken, verifyMember, async (_req, res) => {
  try {
    const leaders = await CommunityPost.aggregate([
      { $match: { isHidden: { $ne: true } } },
      { $group: { _id: '$authorName', avatar: { $first: '$avatar' }, city: { $first: '$city' },
        postCount: { $sum: 1 }, totalLikes: { $sum: { $size: '$likedBy' } } } },
      { $addFields: { score: { $add: [{ $multiply: ['$postCount', 3] }, '$totalLikes'] } } },
      { $sort: { score: -1 } },
      { $limit: 10 }
    ]);
    const enriched = [];
    for (const l of leaders) {
      let badges = [], level = 'seedling', isExpert = false;
      try {
        const user = await User.findOne({ $or: [
          { firstName: l._id.split(' ')[0], lastName: l._id.split(' ').slice(1).join(' ') },
          { email: l._id }
        ]});
        if (user) { badges = (user.badges || []).map(b => ({ slug: b.slug, icon: b.icon })); level = user.level || 'seedling'; isExpert = user.isExpert || false; }
      } catch (e) { /* skip */ }
      enriched.push({ name: l._id, avatar: l.avatar || '🌱', city: l.city || 'India', postCount: l.postCount, totalLikes: l.totalLikes, score: l.score, badges, level, isExpert });
    }
    res.json({ leaderboard: enriched });
  } catch (err) { res.json({ leaderboard: [] }); }
});

// POST / — Create post (with scanner bridge support)
router.post('/', verifyToken, verifyMember, async (req, res) => {
  try {
    const { content, category, images, linkedScanId, scanDiagnosis, scanConfidence } = req.body;
    if (!content && (!images || images.length === 0)) return res.status(400).json({ error: 'Content is required' });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const authorName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Plant Parent';
    const city = user.address?.city || 'India';
    const tags = extractTags(content || '');
    const linkedProducts = suggestProducts(content || '');

    const post = new CommunityPost({
      userId: req.userId, authorName, avatar: user.communityAvatar || '🌱', city,
      category: category || 'show-tell', content,
      images: Array.isArray(images) ? images.slice(0, 4) : [],
      tags, linkedScanId: linkedScanId || null,
      scanDiagnosis: scanDiagnosis || null,
      scanConfidence: scanConfidence || null,
      linkedProducts, isExpertPost: user.isExpert || false
    });
    await post.save();

    await awardPoints(req.userId, POINTS.CREATE_POST);
    user.communityStats = user.communityStats || {};
    user.communityStats.postsCount = (user.communityStats.postsCount || 0) + 1;
    if (linkedScanId) user.communityStats.scansShared = (user.communityStats.scansShared || 0) + 1;
    await user.save();

    res.status(201).json({ post: shapePost(post, req.userId) });
  } catch (err) {
    console.error('Create community post failed:', err);
    res.status(500).json({ error: 'Unable to create post' });
  }
});

// POST /:postId/like
router.post('/:postId/like', verifyToken, verifyMember, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const alreadyLiked = post.likedBy?.some(id => id?.toString() === req.userId);
    if (alreadyLiked) {
      post.likedBy = post.likedBy.filter(id => id?.toString() !== req.userId);
    } else {
      post.likedBy.push(req.userId);
      if (post.userId && post.userId.toString() !== req.userId) {
        const liker = await User.findById(req.userId);
        const likerName = liker ? `${liker.firstName || ''} ${liker.lastName || ''}`.trim() : 'Someone';
        await notify(post.userId, req.userId, post._id, 'like', `❤️ ${likerName} liked your post`, '❤️');
        await awardPoints(post.userId, POINTS.RECEIVE_LIKE);
        const pa = await User.findById(post.userId);
        if (pa) { pa.communityStats = pa.communityStats || {}; pa.communityStats.likesReceived = (pa.communityStats.likesReceived || 0) + 1; await pa.save(); }
      }
    }
    await post.save();
    res.json({ likes: post.likedBy.length, liked: !alreadyLiked });
  } catch (err) { res.status(500).json({ error: 'Unable to update like' }); }
});

// POST /:postId/comment
router.post('/:postId/comment', verifyToken, verifyMember, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Comment text required' });
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const post = await CommunityPost.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const authorName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Plant Parent';
    post.comments.push({ userId: req.userId, authorName, avatar: user.communityAvatar || '🌱', text, isExpert: user.isExpert || false, createdAt: new Date() });
    await post.save();

    await awardPoints(req.userId, POINTS.ADD_COMMENT);
    user.communityStats = user.communityStats || {};
    user.communityStats.commentsCount = (user.communityStats.commentsCount || 0) + 1;
    await user.save();

    if (post.userId && post.userId.toString() !== req.userId) {
      await notify(post.userId, req.userId, post._id, 'comment', `💬 ${authorName} commented on your post`, '💬');
      await awardPoints(post.userId, POINTS.RECEIVE_COMMENT);
    }

    res.status(201).json({
      comments: post.comments.map(c => ({
        id: c._id?.toString(), author: c.authorName, avatar: c.avatar || '🌱',
        text: c.text, isExpert: c.isExpert || false, isPinned: c.isPinned || false, createdAt: c.createdAt
      }))
    });
  } catch (err) { res.status(500).json({ error: 'Unable to add comment' }); }
});

// POST /:postId/share — Track shares
router.post('/:postId/share', verifyToken, verifyMember, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    post.shareCount = (post.shareCount || 0) + 1;
    await post.save();
    res.json({ shareCount: post.shareCount });
  } catch (err) { res.status(500).json({ error: 'Unable to track share' }); }
});

// POST /:postId/view — Track views
router.post('/:postId/view', verifyToken, verifyMember, async (req, res) => {
  try {
    await CommunityPost.findByIdAndUpdate(req.params.postId, { $inc: { viewCount: 1 } });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: 'Unable to track view' }); }
});

// POST /:postId/best-answer/:commentId — Pin best answer
router.post('/:postId/best-answer/:commentId', verifyToken, verifyMember, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.userId?.toString() !== req.userId) return res.status(403).json({ error: 'Only post author can pick best answer' });
    post.bestAnswerCommentId = req.params.commentId;
    await post.save();
    const best = post.comments.id(req.params.commentId);
    if (best && best.userId) {
      await awardPoints(best.userId, 25);
      await notify(best.userId, req.userId, post._id, 'expert-answer', '⭐ Your answer was marked as the best answer!', '⭐');
      const cu = await User.findById(best.userId);
      if (cu) { cu.communityStats = cu.communityStats || {}; cu.communityStats.helpfulAnswers = (cu.communityStats.helpfulAnswers || 0) + 1; await cu.save(); }
    }
    res.json({ bestAnswerCommentId: req.params.commentId });
  } catch (err) { res.status(500).json({ error: 'Unable to set best answer' }); }
});

// GET /notifications
router.get('/notifications', verifyToken, verifyMember, async (req, res) => {
  try {
    const notifs = await Notification.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ userId: req.userId, read: false });
    res.json({
      notifications: notifs.map(n => ({ id: n._id.toString(), type: n.type, message: n.message, icon: n.icon, read: n.read, postId: n.postId?.toString() || null, createdAt: n.createdAt })),
      unreadCount
    });
  } catch (err) { res.json({ notifications: [], unreadCount: 0 }); }
});

// POST /notifications/read
router.post('/notifications/read', verifyToken, verifyMember, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.userId, read: false }, { $set: { read: true } });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: 'Unable to mark read' }); }
});

// GET /my-profile — Gamification profile
router.get('/my-profile', verifyToken, verifyMember, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const postCount = await CommunityPost.countDocuments({ userId: req.userId, isHidden: { $ne: true } });
    const likesAgg = await CommunityPost.aggregate([
      { $match: { userId: user._id } },
      { $project: { lc: { $size: '$likedBy' } } },
      { $group: { _id: null, total: { $sum: '$lc' } } }
    ]);
    res.json({
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Plant Parent',
      avatar: user.communityAvatar || '🌱', city: user.address?.city || 'India',
      isExpert: user.isExpert || false, expertTitle: user.expertTitle || '',
      points: user.points || 0, level: user.level || 'seedling',
      badges: user.badges || [], streak: user.streak || { current: 0, longest: 0 },
      stats: { postsCount: postCount, likesReceived: likesAgg[0]?.total || 0,
        commentsCount: user.communityStats?.commentsCount || 0,
        helpfulAnswers: user.communityStats?.helpfulAnswers || 0,
        scansShared: user.communityStats?.scansShared || 0 },
      followersCount: (user.followers || []).length,
      followingCount: (user.following || []).length
    });
  } catch (err) { res.status(500).json({ error: 'Unable to load profile' }); }
});

// Google one-tap login
router.post('/login-google', async (req, res) => {
  try {
    if (!googleClient) return res.status(500).json({ error: 'Google client not configured' });
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: 'Missing idToken' });
    const ticket = await googleClient.verifyIdToken({ idToken, audience: googleClientIds });
    const payload = ticket.getPayload();
    const { sub, email, name, picture, given_name, family_name } = payload;
    if (!email) return res.status(400).json({ error: 'Email not available' });

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ googleId: sub, firstName: given_name || name?.split(' ')[0] || 'Plant',
        lastName: family_name || name?.split(' ').slice(1).join(' ') || 'Parent',
        email, profilePicture: picture, provider: 'google', lastLogin: new Date() });
      await user.save();
    } else {
      user.googleId = user.googleId || sub; user.profilePicture = user.profilePicture || picture;
      user.provider = 'google'; user.lastLogin = new Date(); await user.save();
    }
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
    const displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Plant Parent';
    res.json({ token, user: { name: displayName, email: user.email, avatar: user.communityAvatar || '🪴',
      city: user.address?.city || '', picture: user.profilePicture || '', id: user._id,
      points: user.points || 0, level: user.level || 'seedling', badges: user.badges || [], isExpert: user.isExpert || false,
      isCommunityMember: hasActiveMembership(user), membershipActive: hasActiveMembership(user), membership: user.membership || {} } });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
