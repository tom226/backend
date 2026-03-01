const express = require('express');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const CommunityPost = require('../models/CommunityPost');

const router = express.Router();

const googleClientIds = [
  process.env.COMMUNITY_GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_ID,
  '200209144952-a9u47phmlr7gcamhoe6bp2qbi7h5hi8d.apps.googleusercontent.com'
].filter(Boolean);

const googleClient = googleClientIds.length ? new OAuth2Client(googleClientIds[0]) : null;

const seedPosts = [
  {
    authorName: 'Priya Sharma',
    avatar: '🌱',
    city: 'Delhi',
    category: 'tips',
    content: 'Use neem oil every 10 days to keep pests away on balcony plants.',
    images: []
  },
  {
    authorName: 'Arjun Nair',
    avatar: '🌿',
    city: 'Bangalore',
    category: 'show-tell',
    content: 'First bougainvillea bloom of the season. Fed with vermicompost last week.',
    images: []
  },
  {
    authorName: 'Meera Patel',
    avatar: '🌸',
    city: 'Ahmedabad',
    category: 'help',
    content: 'Money plant tips turning yellow. Reduced watering; looking for more suggestions.',
    images: []
  }
];

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const optionalAuth = (req, _res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      req.userId = decoded.userId;
    } catch (err) {
      // ignore invalid optional token
    }
  }
  next();
};

async function ensureSeeded() {
  const count = await CommunityPost.countDocuments();
  if (count === 0) {
    await CommunityPost.insertMany(seedPosts.map(p => ({ ...p, userId: null })));
  }
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
    likes: likesCount,
    liked,
    comments: (post.comments || []).map(c => ({
      author: c.authorName,
      avatar: c.avatar || '🌱',
      text: c.text,
      createdAt: c.createdAt
    })),
    createdAt: created,
    timestamp: created.getTime()
  };
}

router.get('/', optionalAuth, async (req, res) => {
  try {
    await ensureSeeded();
    const posts = await CommunityPost.find().sort({ createdAt: -1 }).limit(200);
    res.json({ posts: posts.map(p => shapePost(p, req.userId)) });
  } catch (err) {
    console.error('Fetch community posts failed:', err);
    res.status(500).json({ error: 'Unable to fetch posts' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { content, category, images } = req.body;
    if (!content && (!images || images.length === 0)) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const authorName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Plant Parent';
    const city = user.address?.city || 'India';

    const post = new CommunityPost({
      userId: req.userId,
      authorName,
      avatar: '🌱',
      city,
      category: category || 'show-tell',
      content,
      images: Array.isArray(images) ? images.slice(0, 4) : []
    });

    await post.save();
    res.status(201).json({ post: shapePost(post, req.userId) });
  } catch (err) {
    console.error('Create community post failed:', err);
    res.status(500).json({ error: 'Unable to create post' });
  }
});

router.post('/:postId/like', verifyToken, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const alreadyLiked = post.likedBy?.some(id => id?.toString() === req.userId);
    if (alreadyLiked) {
      post.likedBy = post.likedBy.filter(id => id?.toString() !== req.userId);
    } else {
      post.likedBy.push(req.userId);
    }

    await post.save();
    res.json({ likes: post.likedBy.length, liked: !alreadyLiked });
  } catch (err) {
    console.error('Like toggle failed:', err);
    res.status(500).json({ error: 'Unable to update like' });
  }
});

router.post('/:postId/comment', verifyToken, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Comment text required' });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const post = await CommunityPost.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const authorName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Plant Parent';
    const comment = {
      userId: req.userId,
      authorName,
      avatar: '🌱',
      text,
      createdAt: new Date()
    };

    post.comments.push(comment);
    await post.save();

    res.status(201).json({
      comment: {
        author: comment.authorName,
        avatar: comment.avatar,
        text: comment.text,
        createdAt: comment.createdAt
      },
      comments: post.comments.map(c => ({
        author: c.authorName,
        avatar: c.avatar || '🌱',
        text: c.text,
        createdAt: c.createdAt
      }))
    });
  } catch (err) {
    console.error('Add comment failed:', err);
    res.status(500).json({ error: 'Unable to add comment' });
  }
});

// Google one-tap login (kept for backward compatibility)
router.post('/login-google', async (req, res) => {
  try {
    if (!googleClient) {
      return res.status(500).json({ error: 'Google client not configured' });
    }

    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'Missing idToken' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: googleClientIds
    });

    const payload = ticket.getPayload();
    const { sub, email, name, picture, given_name, family_name } = payload;

    if (!email) {
      return res.status(400).json({ error: 'Email not available from Google profile' });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        googleId: sub,
        firstName: given_name || name?.split(' ')[0] || 'Plant',
        lastName: family_name || name?.split(' ').slice(1).join(' ') || 'Parent',
        email,
        profilePicture: picture,
        provider: 'google',
        lastLogin: new Date()
      });
      await user.save();
    } else {
      user.googleId = user.googleId || sub;
      user.profilePicture = user.profilePicture || picture;
      user.provider = 'google';
      user.lastLogin = new Date();
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    const displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Plant Parent';

    res.json({
      token,
      user: {
        name: displayName,
        email: user.email,
        avatar: '🪴',
        city: '',
        picture: user.profilePicture || '',
        id: user._id
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
