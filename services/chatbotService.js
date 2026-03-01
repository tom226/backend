const PlantKnowledge = require('../models/PlantKnowledge');
const Product = require('../models/Product');

// In-memory conversation context (keyed by sessionId)
const sessions = new Map();
const SESSION_TTL = 30 * 60 * 1000; // 30 min

function getSession(sessionId) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, { history: [], intent: null, lastActive: Date.now() });
  }
  const s = sessions.get(sessionId);
  s.lastActive = Date.now();
  return s;
}

// Cleanup stale sessions every 10 min
setInterval(() => {
  const now = Date.now();
  for (const [id, s] of sessions) {
    if (now - s.lastActive > SESSION_TTL) sessions.delete(id);
  }
}, 10 * 60 * 1000);

// Intent detection
const intentPatterns = [
  { intent: 'greeting', patterns: [/^(hi|hello|hey|namaste|good\s*(morning|evening|afternoon))/i] },
  { intent: 'plant-care', patterns: [/\b(plant|leaf|leaves|yellow|brown|wilting|drooping|rot|fungus|pest|disease|dying|spots?|mold|mildew|aphid|mealybug|bug|insect|water|sunlight|fertiliz)/i] },
  { intent: 'product-inquiry', patterns: [/\b(product|buy|price|cost|order|shop|catalog|neem|vermi|spray|fertilizer|seed|pot|planter|compost)\b/i] },
  { intent: 'order-status', patterns: [/\b(order|track|status|delivery|shipping|where.*order|my.*order)\b/i] },
  { intent: 'complaint', patterns: [/\b(complaint|issue|problem|broken|damaged|wrong|refund|return|exchange|not\s*work)\b/i] },
  { intent: 'thanks', patterns: [/\b(thank|thanks|thx|appreciated)\b/i] },
  { intent: 'bye', patterns: [/\b(bye|goodbye|see\s*you|take\s*care)\b/i] },
];

function detectIntent(message) {
  const text = message.toLowerCase().trim();
  for (const { intent, patterns } of intentPatterns) {
    if (patterns.some(p => p.test(text))) return intent;
  }
  return 'general';
}

// Plant knowledge lookup
async function lookupPlantCare(query) {
  try {
    const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const results = await PlantKnowledge.find({
      $or: [
        { name: { $regex: keywords.join('|'), $options: 'i' } },
        { symptoms: { $regex: keywords.join('|'), $options: 'i' } },
        { category: { $regex: keywords.join('|'), $options: 'i' } },
        { tags: { $in: keywords } },
      ],
    }).limit(3).lean();
    return results;
  } catch (err) {
    return [];
  }
}

// Product recommendations based on plant issue
async function getProductRecommendations(issue) {
  try {
    const keywords = [];
    if (/fungus|mildew|rot|mold/i.test(issue)) keywords.push('fungicide', 'neem');
    if (/pest|bug|aphid|mealybug|insect/i.test(issue)) keywords.push('neem', 'pest', 'spray');
    if (/yellow|nutrient|weak|growth/i.test(issue)) keywords.push('fertilizer', 'compost', 'booster');
    if (/water|drooping|wilting/i.test(issue)) keywords.push('self-watering');
    if (keywords.length === 0) keywords.push('organic', 'all-purpose');

    const regex = keywords.join('|');
    const products = await Product.find({
      $or: [
        { name: { $regex: regex, $options: 'i' } },
        { category: { $regex: regex, $options: 'i' } },
        { description: { $regex: regex, $options: 'i' } },
      ],
      isActive: true,
    }).limit(3).lean();
    return products;
  } catch (err) {
    return [];
  }
}

// Response generators
const responses = {
  greeting: () => ({
    text: "Hello! 🌱 Welcome to The Nursery Green! I can help you with:\n\n🌿 Plant care & disease diagnosis\n🛒 Product recommendations\n📦 Order tracking\n❓ Any questions!\n\nWhat would you like help with?",
  }),

  thanks: () => ({ text: "You're welcome! 🌻 Happy to help. Anything else?" }),
  bye: () => ({ text: "Goodbye! 🌿 Happy gardening! Come back anytime." }),

  async 'plant-care'(message) {
    const knowledge = await lookupPlantCare(message);
    const products = await getProductRecommendations(message);

    let text = '';
    if (knowledge.length > 0) {
      const k = knowledge[0];
      text = `🔍 **${k.name}**\n\n`;
      if (k.symptoms) text += `📋 Symptoms: ${k.symptoms}\n`;
      if (k.solution) text += `💊 Treatment: ${k.solution}\n`;
      if (k.prevention) text += `🛡️ Prevention: ${k.prevention}\n`;
    } else {
      text = "I couldn't find an exact match in our database, but here are some general tips:\n\n🌡️ Check sunlight & watering\n🔍 Look for pests under leaves\n💧 Ensure proper drainage\n\nTry our Plant Scanner for a detailed diagnosis!";
    }

    if (products.length > 0) {
      text += `\n\n🛒 Recommended products:\n`;
      products.forEach(p => { text += `• ${p.name} — ₹${p.price}\n`; });
    }

    return { text, products: products.map(p => ({ id: p._id, name: p.name, price: p.price })) };
  },

  async 'product-inquiry'(message) {
    const products = await Product.find({ isActive: true }).limit(6).lean();
    let text = "🛍️ Here are some of our popular products:\n\n";
    products.forEach(p => { text += `• **${p.name}** — ₹${p.price} (${p.category})\n`; });
    text += "\nVisit our Shop for the full catalog! Type a product name for details.";
    return { text, products: products.map(p => ({ id: p._id, name: p.name, price: p.price, category: p.category })) };
  },

  'order-status': () => ({
    text: "📦 To check your order status:\n\n1. Go to your Profile → Orders\n2. Or provide your Order ID and I'll look it up!\n\nNeed help with a specific order?",
  }),

  complaint: () => ({
    text: "😔 I'm sorry to hear that! We want to make this right.\n\n📞 Call us: +91-8887608236\n📧 Email: thenurserygreen@gmail.com\n💬 WhatsApp: 8887608236\n\nOur team will respond within 24 hours. We offer a 30-day replacement guarantee on all products.",
  }),

  general: () => ({
    text: "I'm not sure I understood that. Here's what I can help with:\n\n🌿 Plant care advice\n🛒 Product info & recommendations\n📦 Order tracking\n📞 Contact support\n\nTry asking about a specific plant issue or product!",
  }),
};

async function processMessage(sessionId, message) {
  const session = getSession(sessionId);
  const intent = detectIntent(message);
  session.intent = intent;
  session.history.push({ role: 'user', text: message, timestamp: Date.now() });

  const handler = responses[intent];
  let response;
  if (typeof handler === 'function') {
    response = await handler(message);
  } else {
    response = responses.general();
  }

  session.history.push({ role: 'bot', text: response.text, timestamp: Date.now() });
  return { ...response, intent, sessionId };
}

module.exports = { processMessage, detectIntent };