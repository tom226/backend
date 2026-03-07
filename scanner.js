/* ============================================
   PLANT DISEASE SCANNER — JavaScript
   AI Analysis + 50+ Disease Indian Remedy DB
   ============================================ */

const BACKEND_URL = 'https://backend-production-f128.up.railway.app';
const SCANNER_DEBUG_FLAG = 'scannerDebug';
const SCANNER_DEBUG_QUERY = 'debugScanner';

let environmentGuess = makeDefaultEnvironmentGuess();
let scannerUser = null;
let storageHealthy = true;
let authToken = null;

function isScannerDebugEnabled() {
    try {
        const params = new URLSearchParams(window.location.search || '');
        const queryValue = params.get(SCANNER_DEBUG_QUERY);

        if (queryValue === '1') {
            localStorage.setItem(SCANNER_DEBUG_FLAG, '1');
            return true;
        }
        if (queryValue === '0') {
            localStorage.removeItem(SCANNER_DEBUG_FLAG);
            return false;
        }

        return localStorage.getItem(SCANNER_DEBUG_FLAG) === '1';
    } catch (error) {
        return false;
    }
}

function getPlantCheckDebugDetails(plantCheck) {
    if (!plantCheck || !plantCheck.stats) return '';
    const stats = plantCheck.stats;
    return `Debug: green=${stats.greenRatio}, strongGreen=${stats.strongGreenRatio}, wood=${stats.woodRatio}, signal=${stats.vegSignal}, var=${stats.brightnessVar}`;
}

function buildNotPlantStatusHtml(data, plantCheck) {
    const message = data.message || 'Please upload a clear photo of leaves or stems.';
    const detailLine = data.detail ? `<p class="hint">${data.detail}</p>` : '';
    const debugLine = isScannerDebugEnabled() ? getPlantCheckDebugDetails(plantCheck) : '';
    const debugHtml = debugLine ? `<p class="hint" style="opacity:.8">${debugLine}</p>` : '';

    return `<h3>🚫 Not a Plant</h3><p>${message}</p>${detailLine}${debugHtml}`;
}

function clampNumber(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

const PLANT_NAME_HINTS = [
    { keywords: ['tulsi', 'holy basil', 'basil', 'tulasi'], name: 'Tulsi (Holy Basil)', slug: 'tulsi', confidence: 0.97 },
    { keywords: ['money plant', 'pothos', 'devils ivy', 'devil\'s ivy'], name: 'Money Plant (Pothos)', slug: 'money-plant', confidence: 0.95 },
    { keywords: ['snake plant', 'sansevieria', 'mother in law tongue', 'mother-in-law'], name: 'Snake Plant (Sansevieria)', slug: 'snake-plant', confidence: 0.95 },
    { keywords: ['aloe', 'aloe vera', 'ghritkumari'], name: 'Aloe Vera', slug: 'aloe-vera', confidence: 0.95 },
    { keywords: ['rose', 'gulab'], name: 'Rose (Gulab)', slug: 'rose', confidence: 0.95 },
    { keywords: ['hibiscus', 'gudhal', 'shoe flower'], name: 'Hibiscus (Gudhal)', slug: 'hibiscus', confidence: 0.95 },
    { keywords: ['marigold', 'genda'], name: 'Marigold (Genda)', slug: 'marigold', confidence: 0.95 },
    { keywords: ['areca', 'areca palm'], name: 'Areca Palm', slug: 'areca-palm', confidence: 0.94 },
    { keywords: ['spider plant', 'chlorophytum'], name: 'Spider Plant', slug: 'spider-plant', confidence: 0.94 },
    { keywords: ['curry leaf', 'kadi patta', 'kari patta'], name: 'Curry Leaf Plant', slug: 'curry-leaf', confidence: 0.94 },
    { keywords: ['peace lily'], name: 'Peace Lily', slug: 'peace-lily', confidence: 0.94 },
    { keywords: ['jade', 'crassula'], name: 'Jade Plant (Crassula)', slug: 'jade', confidence: 0.93 },
    { keywords: ['neem'], name: 'Neem Tree', slug: 'neem', confidence: 0.93 },
    { keywords: ['banana', 'kela'], name: 'Banana Plant (Kela)', slug: 'banana', confidence: 0.92 }
];

function scorePlantByVisualHeuristics(stats, envInfo) {
    const envType = envInfo && envInfo.type ? envInfo.type : 'unknown';
    const g = stats.greenRatio || 0;
    const s = stats.strongGreenRatio || 0;
    const y = stats.yellowRatio || 0;
    const w = stats.whiteRatio || 0;
    const o = stats.orangeRatio || 0;
    const wood = stats.woodRatio || 0;
    const sat = stats.saturationMean || 0;

    const candidates = [];
    const add = (slug, name, score) => {
        if (score >= 0.52) {
            candidates.push({ slug, name, confidence: clampNumber(score, 0.52, 0.89), source: 'visual-heuristic' });
        }
    };

    const indoorBonus = envType === 'indoor' ? 0.08 : 0;
    const outdoorBonus = envType === 'outdoor' ? 0.08 : 0;

    add('money-plant', 'Money Plant (Pothos)', 0.34 + (g > 0.24 ? 0.20 : 0) + (s > 0.08 ? 0.14 : 0) + (sat > 0.28 ? 0.08 : 0) + indoorBonus - (wood > 0.14 ? 0.10 : 0));
    add('snake-plant', 'Snake Plant (Sansevieria)', 0.32 + (g > 0.16 ? 0.14 : 0) + (s > 0.05 ? 0.12 : 0) + (wood > 0.06 && wood < 0.16 ? 0.08 : 0) + indoorBonus - (y > 0.16 ? 0.08 : 0));
    add('aloe-vera', 'Aloe Vera', 0.30 + (g > 0.18 ? 0.14 : 0) + (s > 0.10 ? 0.15 : 0) + (wood < 0.08 ? 0.08 : 0) + indoorBonus - (w > 0.08 ? 0.08 : 0));
    add('tulsi', 'Tulsi (Holy Basil)', 0.30 + (g > 0.20 ? 0.18 : 0) + (s > 0.09 ? 0.12 : 0) + (y < 0.10 ? 0.08 : 0) + outdoorBonus - (o > 0.05 ? 0.08 : 0));
    add('hibiscus', 'Hibiscus (Gudhal)', 0.30 + (g > 0.17 ? 0.14 : 0) + (y > 0.04 && y < 0.16 ? 0.06 : 0) + (sat > 0.26 ? 0.08 : 0) + outdoorBonus);
    add('rose', 'Rose (Gulab)', 0.29 + (g > 0.16 ? 0.12 : 0) + (o > 0.03 ? 0.08 : 0) + (sat > 0.30 ? 0.07 : 0) + outdoorBonus);
    add('marigold', 'Marigold (Genda)', 0.28 + (o > 0.05 ? 0.16 : 0) + (sat > 0.33 ? 0.10 : 0) + outdoorBonus);
    add('areca-palm', 'Areca Palm', 0.30 + (g > 0.23 ? 0.16 : 0) + (s > 0.10 ? 0.12 : 0) + (wood < 0.10 ? 0.05 : 0) + indoorBonus);
    add('spider-plant', 'Spider Plant', 0.28 + (g > 0.19 ? 0.12 : 0) + (w > 0.03 && w < 0.15 ? 0.10 : 0) + indoorBonus);

    candidates.sort((a, b) => b.confidence - a.confidence);
    return candidates;
}

function suggestPlantName(plantCheck, fileName = '', envInfo = environmentGuess) {
    if (!plantCheck || !plantCheck.isPlant) return { primary: null, alternatives: [] };

    const lower = (fileName || '').toLowerCase();
    for (let i = 0; i < PLANT_NAME_HINTS.length; i++) {
        const hint = PLANT_NAME_HINTS[i];
        for (let j = 0; j < hint.keywords.length; j++) {
            if (lower.includes(hint.keywords[j])) {
                return {
                    primary: { name: hint.name, slug: hint.slug, confidence: hint.confidence, source: 'filename-hint' },
                    alternatives: []
                };
            }
        }
    }

    const candidates = scorePlantByVisualHeuristics(plantCheck.stats || {}, envInfo);
    return {
        primary: candidates.length ? candidates[0] : null,
        alternatives: candidates.slice(1, 3)
    };
}

// =============================================
// COMPREHENSIVE INDIAN PLANT DISEASE DATABASE
// =============================================
const DISEASE_DB = {
    'powdery-mildew': {
        name: 'Powdery Mildew (Safed Chita)',
        severity: 'moderate',
        description: 'A common fungal disease that appears as white powdery patches on leaves, stems, and buds. Very common in Indian winters and humid conditions.',
        cause: 'Caused by Erysiphales fungi. Spreads in humid conditions with poor air circulation, especially during winters (Oct-Feb) in North India.',
        symptoms: ['White/gray powdery coating on leaf surfaces', 'Yellowing and curling of affected leaves', 'Stunted growth of new shoots', 'Premature leaf drop', 'Distorted flower buds'],
        remedies: [
            {
                name: 'Neem Oil Spray',
                icon: '🌿',
                ingredients: 'Neem oil (5ml) + liquid soap (2ml) + water (1L)',
                steps: 'Mix neem oil with a few drops of liquid soap in water. Shake well and spray on all affected parts, covering both sides of leaves. Best applied in early morning or late evening.',
                frequency: 'Spray every 5-7 days for 3 weeks'
            },
            {
                name: 'Doodh (Milk) Spray',
                icon: '🥛',
                ingredients: 'Raw milk (100ml) + water (1L)',
                steps: 'Mix 1 part milk with 9 parts water. Spray directly on affected leaves. The proteins in milk have antifungal properties and help build plant immunity.',
                frequency: 'Spray every 3-4 days until cleared'
            },
            {
                name: 'Haldi + Baking Soda Mix',
                icon: '🧡',
                ingredients: 'Haldi/Turmeric (1 tsp) + baking soda (1 tsp) + liquid soap (few drops) + water (1L)',
                steps: 'Mix turmeric and baking soda in water, add soap. Spray thoroughly on leaves. Turmeric is antifungal and baking soda changes leaf pH making it hostile for fungus.',
                frequency: 'Apply every 5 days for 2-3 weeks'
            }
        ],
        prevention: [
            '🌬️ Ensure good air circulation between plants — don\'t crowd them',
            '💧 Water at the base, avoid wetting leaves — use drip irrigation',
            '☀️ Ensure plants get 4-6 hours of sunlight daily',
            '✂️ Prune dense growth regularly to improve airflow',
            '🍂 Remove and dispose of infected leaves immediately'
        ],
        products: ['Neem Oil', 'Plant Protection Spray', 'Neem Cake Powder']
    },

    'leaf-spot': {
        name: 'Leaf Spot (Patti ka Dhaag)',
        severity: 'moderate',
        description: 'Brown or black spots with yellow halos on leaves. Can be caused by various fungi or bacteria. Very common during Indian monsoon season.',
        cause: 'Caused by Cercospora, Alternaria, or Colletotrichum fungi. Thrives in warm, wet conditions — peak during July-September monsoon.',
        symptoms: ['Circular brown/black spots on leaves', 'Yellow halo around spots', 'Spots may merge to cover large areas', 'Leaf edges turn brown and crispy', 'Premature leaf drop in severe cases'],
        remedies: [
            {
                name: 'Neem + Haldi Spray',
                icon: '🌿',
                ingredients: 'Neem oil (5ml) + haldi powder (1 tsp) + water (1L)',
                steps: 'Mix neem oil and turmeric in water. Spray on all leaves, focusing on affected areas. Both have strong antifungal properties widely used in Ayurveda.',
                frequency: 'Spray every 5 days for 3 weeks'
            },
            {
                name: 'Lahsun (Garlic) Spray',
                icon: '🧄',
                ingredients: 'Garlic cloves (10-15) + water (1L) + liquid soap (2-3 drops)',
                steps: 'Crush garlic cloves and soak in water overnight. Strain, add soap, and spray. Garlic contains allicin which is a powerful natural fungicide.',
                frequency: 'Spray every 4-5 days'
            },
            {
                name: 'Chuna (Lime) Solution',
                icon: '⚪',
                ingredients: 'Chuna/slaked lime (2 tsp) + water (1L)',
                steps: 'Dissolve lime in water and let it settle. Use the clear water to spray on leaves. Creates an alkaline environment that stops fungal growth.',
                frequency: 'Apply once a week for 3 weeks'
            }
        ],
        prevention: [
            '💧 Avoid overhead watering — water at the soil level',
            '🍂 Remove fallen leaves promptly — they harbor fungal spores',
            '✂️ Prune infected leaves and destroy them (don\'t compost)',
            '🌤️ Ensure adequate sunlight and air circulation',
            '🫧 Clean gardening tools with bleach solution between plants'
        ],
        products: ['Neem Oil', 'Plant Protection Spray', 'Neem Cake Powder']
    },

    'aphids': {
        name: 'Aphids / Maahu (माहू)',
        severity: 'moderate',
        description: 'Tiny sap-sucking insects (green, black, or brown) that cluster on tender shoots and under leaves. Extremely common in Indian gardens, especially on roses, hibiscus, and vegetables.',
        cause: 'Aphids (Aphis gossypii, Myzus persicae) multiply rapidly in warm weather. They secrete honeydew which attracts ants and promotes sooty mold.',
        symptoms: ['Clusters of small insects on tender shoots', 'Curling and distortion of new leaves', 'Sticky honeydew on leaves', 'Black sooty mold growth', 'Stunted growth of young plants'],
        remedies: [
            {
                name: 'Neem Oil + Soap Spray',
                icon: '🌿',
                ingredients: 'Neem oil (10ml) + liquid soap (5ml) + water (1L)',
                steps: 'Mix well and spray directly on aphid clusters. The soap breaks their waxy coating, and neem disrupts their feeding and reproduction. Spray undersides of leaves too.',
                frequency: 'Spray every 3-4 days for 2 weeks'
            },
            {
                name: 'Mirchi-Lahsun Spray (Chilli-Garlic)',
                icon: '🌶️',
                ingredients: 'Green chillies (5-6) + garlic (10 cloves) + water (1L)',
                steps: 'Grind chillies and garlic to a paste. Soak in water overnight. Strain and spray on infested plants. The capsaicin repels aphids instantly.',
                frequency: 'Spray every 3-4 days until cleared'
            },
            {
                name: 'Sabun-Paani (Soap Water)',
                icon: '🫧',
                ingredients: 'Liquid dish soap (1 tbsp) + water (1L)',
                steps: 'Mix soap in water and spray directly on aphids. The soap suffocates them by blocking their breathing pores. Rinse plant with plain water after 2-3 hours.',
                frequency: 'Apply every 2-3 days'
            }
        ],
        prevention: [
            '🌼 Plant marigolds (genda) nearby — they repel aphids naturally',
            '🐞 Encourage ladybugs — they eat 50+ aphids per day',
            '💦 Hose off aphids with strong water spray early morning',
            '🌿 Plant tulsi (basil) near susceptible plants as a natural repellent',
            '🧹 Regularly inspect tender growth and undersides of leaves'
        ],
        products: ['Neem Oil', 'Plant Protection Spray', 'Plant Booster Spray']
    },

    'root-rot': {
        name: 'Root Rot (Jad Sadna)',
        severity: 'severe',
        description: 'A deadly fungal infection that causes roots to turn brown/black and mushy. Usually caused by overwatering — the #1 plant killer in Indian households.',
        cause: 'Caused by Pythium, Phytophthora, or Fusarium fungi. Develops in waterlogged soil with poor drainage, especially common in monsoon and in pots without drainage holes.',
        symptoms: ['Wilting despite moist soil', 'Yellowing of lower leaves first', 'Roots are brown/black and mushy (not white)', 'Foul smell from soil', 'Plant easily pulls out of soil'],
        remedies: [
            {
                name: 'Daalchini (Cinnamon) Treatment',
                icon: '🟤',
                ingredients: 'Cinnamon powder (2 tbsp) + fresh potting mix',
                steps: 'Remove plant, trim all rotten roots with clean scissors. Dust cinnamon powder on cut ends — it\'s a natural antifungal. Repot in fresh, well-draining soil mix.',
                frequency: 'One-time treatment; monitor weekly'
            },
            {
                name: 'Haldi (Turmeric) Root Dip',
                icon: '🧡',
                ingredients: 'Haldi powder (2 tsp) + water (500ml)',
                steps: 'After trimming rotten roots, soak remaining healthy roots in turmeric solution for 20-30 minutes. Turmeric is a powerful antifungal used in Ayurveda for centuries.',
                frequency: 'One-time dip before repotting'
            },
            {
                name: 'Neem Cake Soil Amendment',
                icon: '🌿',
                ingredients: 'Neem cake powder (50g per pot) + cocopeat + perlite',
                steps: 'Mix neem cake into fresh potting soil (10% by volume). Repot the treated plant. Neem cake prevents future fungal attacks and also adds nitrogen.',
                frequency: 'Mix into soil at repotting; top dress monthly'
            }
        ],
        prevention: [
            '🏺 Always use pots with drainage holes — place gravel at bottom',
            '💧 Water only when top 1-2 inches of soil feels dry (finger test)',
            '🌱 Use well-draining soil mix — 40% garden soil + 30% cocopeat + 30% perlite/sand',
            '☀️ Don\'t keep pots in water-collecting saucers during monsoon',
            '🫧 Sterilize old pots with diluted bleach before reuse'
        ],
        products: ['Neem Cake Powder', 'Root Booster', 'Vermi Compost']
    },

    'mealybugs': {
        name: 'Mealybugs (Safed Makhi)',
        severity: 'moderate',
        description: 'White cottony/waxy pests that cluster at leaf joints, stems, and roots. They suck sap and weaken the plant. Very common on hibiscus, crotons, and succulents in India.',
        cause: 'Mealybugs (Pseudococcus, Planococcus spp.) thrive in warm, protected spots. Spread through contaminated plants, ants, and wind.',
        symptoms: ['White cottony masses at stem joints and leaf bases', 'Sticky honeydew on leaves and nearby surfaces', 'Yellowing and wilting of leaves', 'Stunted growth and leaf drop', 'Ants crawling on the plant (farming mealybugs)'],
        remedies: [
            {
                name: 'Rubbing Alcohol Swab',
                icon: '🧴',
                ingredients: 'Rubbing alcohol (isopropyl) + cotton buds/earbuds',
                steps: 'Dip cotton bud in rubbing alcohol and directly touch each mealybug cluster. The alcohol dissolves their waxy coating instantly. Good for early infestations.',
                frequency: 'Every 2-3 days until clear'
            },
            {
                name: 'Neem + Dish Soap Spray',
                icon: '🌿',
                ingredients: 'Neem oil (10ml) + dish soap (1 tsp) + water (1L)',
                steps: 'Mix neem oil and dish soap in water thoroughly. Spray generously on all affected areas, especially hidden joints and undersides. The soap strips their waxy coating while neem poisons them.',
                frequency: 'Spray every 4-5 days for 3-4 weeks'
            },
            {
                name: 'Pressure Water + Neem Oil',
                icon: '💦',
                ingredients: 'Garden hose/spray bottle + neem oil solution',
                steps: 'First, blast the plant with a strong water spray to dislodge mealybugs physically. Then immediately spray with neem oil solution. Repeat this two-step treatment.',
                frequency: 'Every 3-4 days for 2 weeks'
            }
        ],
        prevention: [
            '🔍 Quarantine new plants for 2 weeks before placing near others',
            '🐜 Control ant populations — ants protect and farm mealybugs',
            '🌬️ Ensure good air circulation; don\'t crowd plants together',
            '🌿 Apply neem oil preventively once a month',
            '🧹 Keep plants clean — wipe leaves regularly with damp cloth'
        ],
        products: ['Neem Oil', 'Plant Protection Spray', 'Neem Cake Powder']
    },

    'yellow-leaves': {
        name: 'Yellowing Leaves (Peeli Patti)',
        severity: 'mild',
        description: 'Leaves turning yellow is one of the most common plant problems in India. Can indicate overwatering, nutrient deficiency, or pest issues.',
        cause: 'Multiple causes: overwatering (most common in India), nitrogen deficiency, iron chlorosis (high pH soil), root problems, or natural aging of lower leaves.',
        symptoms: ['Leaves turning yellow from edges or between veins', 'Lower leaves affected first (nitrogen deficiency)', 'New leaves yellow with green veins (iron deficiency)', 'Overall pale color (light deficiency)', 'Yellow + mushy stem (overwatering)'],
        remedies: [
            {
                name: 'Chai Patti (Used Tea Leaves)',
                icon: '🍵',
                ingredients: 'Used tea leaves (from 2-3 cups) + soil',
                steps: 'Dry used tea leaves in sunlight for 1-2 days. Mix into soil around the plant. Tea leaves add nitrogen, improve soil acidity, and provide micronutrients. Works especially well for roses and acid-loving plants.',
                frequency: 'Add once every 2-3 weeks'
            },
            {
                name: 'Kele ka Chilka (Banana Peel) Fertilizer',
                icon: '🍌',
                ingredients: 'Banana peels (2-3) + water (1L)',
                steps: 'Chop banana peels and soak in water for 24-48 hours. Strain and use the brown water to water plants. Rich in potassium and phosphorus. Alternative: dry peels, powder them, and mix into soil.',
                frequency: 'Use banana water once a week'
            },
            {
                name: 'Epsom Salt (Sendha Namak) Solution',
                icon: '🧂',
                ingredients: 'Epsom salt (1 tsp) + water (1L)',
                steps: 'Dissolve Epsom salt in water and use to water the plant. Provides magnesium which is essential for chlorophyll production. Leaves green up within 1-2 weeks.',
                frequency: 'Apply once every 2 weeks'
            }
        ],
        prevention: [
            '💧 Follow the "finger test" — water only when top 1 inch of soil is dry',
            '🌱 Feed plants every 2-3 weeks with vermicompost or organic fertilizer',
            '🔆 Ensure adequate sunlight — most plants need 4-6 hours minimum',
            '🏺 Use well-draining soil; repot if soil has become compacted',
            '🍃 Remove yellowed leaves to redirect energy to healthy growth'
        ],
        products: ['All in One Mixture', 'Vermi Compost', 'Plant Diet']
    },

    'whitefly': {
        name: 'Whitefly (Safed Makhi)',
        severity: 'moderate',
        description: 'Tiny white winged insects that fly up in clouds when plant is disturbed. Suck sap from underside of leaves. Very common on tomatoes, brinjal, and chillies across India.',
        cause: 'Bemisia tabaci (most common in India) and Trialeurodes vaporariorum. Thrives in warm, dry conditions. Can transmit viral diseases to vegetables.',
        symptoms: ['Tiny white flies under leaves — fly up when disturbed', 'Sticky honeydew on leaf surfaces', 'Yellow speckled leaves', 'Sooty black mold on honeydew', 'Wilting and stunted growth in severe cases'],
        remedies: [
            {
                name: 'Yellow Sticky Traps',
                icon: '🟡',
                ingredients: 'Yellow chart paper/card + castor oil or Vaseline',
                steps: 'Cut yellow paper into A4 sheets, coat with oil or Vaseline, and hang near plants at canopy height. Whiteflies are attracted to yellow and get stuck. Replace every 3-5 days.',
                frequency: 'Keep traps throughout growing season'
            },
            {
                name: 'Mirchi (Chilli) + Neem Spray',
                icon: '🌶️',
                ingredients: 'Red chilli powder (1 tbsp) + neem oil (5ml) + soap (few drops) + water (1L)',
                steps: 'Mix chilli powder in water, add neem oil and soap. Spray undersides of leaves early morning. Capsaicin repels whiteflies while neem disrupts their lifecycle.',
                frequency: 'Spray every 3-4 days for 2-3 weeks'
            },
            {
                name: 'Dish Soap Water Spray',
                icon: '🫧',
                ingredients: 'Liquid dish soap (2 tsp) + water (1L)',
                steps: 'Mix soap in water and spray undersides of all leaves thoroughly. The soap suffocates the adults and nymphs. Rinse with clean water after 3-4 hours.',
                frequency: 'Spray every 2-3 days for 2 weeks'
            }
        ],
        prevention: [
            '🟡 Use yellow sticky traps as early warning system',
            '🌿 Plant marigolds and tulsi around vegetable beds as repellents',
            '🌬️ Use reflective mulch (aluminum foil) around base — confuses whiteflies',
            '🕸️ Use fine mesh/net covers over vegetable beds',
            '🧹 Check undersides of leaves weekly for early detection'
        ],
        products: ['Neem Oil', 'Plant Protection Spray', 'Neem Cake Powder']
    },

    'rust': {
        name: 'Rust Disease (Geru Rog)',
        severity: 'moderate',
        description: 'Orange, yellow, or rust-brown raised pustules on undersides of leaves. Common on roses, chrysanthemums, and beans in Indian climates.',
        cause: 'Caused by Puccinia and Uromyces fungi. Spores spread by wind and rain splash. Peak during monsoon and post-monsoon (July-November) in India.',
        symptoms: ['Orange/rust-colored raised bumps under leaves', 'Yellow spots on upper leaf surface', 'Powdery orange spores when touched', 'Leaves dry up and fall prematurely', 'Weakened stems'],
        remedies: [
            {
                name: 'Baking Soda + Neem Spray',
                icon: '🧹',
                ingredients: 'Baking soda (1 tbsp) + neem oil (5ml) + liquid soap (few drops) + water (1L)',
                steps: 'Dissolve baking soda in water, add neem oil and soap. Spray all parts of plant, especially undersides. Soda creates alkaline conditions hostile to rust fungi.',
                frequency: 'Spray every 5-7 days for 3 weeks'
            },
            {
                name: 'Lahsun-Adrak (Garlic-Ginger) Spray',
                icon: '🧄',
                ingredients: 'Garlic (10 cloves) + ginger (1 inch piece) + water (1L)',
                steps: 'Blend garlic and ginger, soak in water for 24 hours. Strain and spray on plants. Both have strong antifungal compounds. Add a drop of soap for better coverage.',
                frequency: 'Apply every 5 days until cleared'
            },
            {
                name: 'Neem Cake Soil Drench',
                icon: '🌿',
                ingredients: 'Neem cake powder (2 tbsp) + water (1L)',
                steps: 'Soak neem cake in water for 12 hours. Strain and drench the soil around the plant. This strengthens plant immunity from the roots up.',
                frequency: 'Apply once every 2 weeks'
            }
        ],
        prevention: [
            '✂️ Remove and destroy infected leaves immediately — don\'t compost',
            '💧 Water at base only — avoid wetting foliage, especially in evening',
            '🌤️ Plant in sunny locations with good air circulation',
            '🧹 Clean up fallen leaves around plants — spores overwinter there',
            '🌿 Apply neem oil spray preventively every 2 weeks during monsoon'
        ],
        products: ['Neem Oil', 'Neem Cake Powder', 'Plant Protection Spray']
    },

    'spider-mites': {
        name: 'Spider Mites (Makdi Keet)',
        severity: 'moderate',
        description: 'Microscopic arachnids that suck cell contents from leaves, causing stippling and yellowing. Very common in hot, dry Indian summers on indoor and outdoor plants.',
        cause: 'Tetranychus urticae (two-spotted spider mite) thrives in hot, dry conditions. Often appear when humidity drops below 40% — common in Delhi, Rajasthan summers.',
        symptoms: ['Fine webbing between leaves and stems', 'Tiny yellow/white dots (stippling) on leaves', 'Leaves become bronze or rusty colored', 'Fine silk threads visible in sunlight', 'Leaf drop and plant decline'],
        remedies: [
            {
                name: 'Water Spray + Neem',
                icon: '💦',
                ingredients: 'Strong water spray + neem oil (5ml) + soap (2ml) + water (1L)',
                steps: 'First blast plant with strong water spray — mites hate moisture. Then spray neem oil solution on all leaves, especially undersides. Increase humidity around plant.',
                frequency: 'Water spray daily; neem every 4-5 days'
            },
            {
                name: 'Haldi-Mirchi (Turmeric-Chilli) Spray',
                icon: '🌶️',
                ingredients: 'Haldi (1 tsp) + red chilli powder (1/2 tsp) + water (1L)',
                steps: 'Mix turmeric and chilli powder in water. Let it sit for 4 hours. Strain and spray. The combination creates a hostile environment for mites.',
                frequency: 'Spray every 3-4 days for 2 weeks'
            }
        ],
        prevention: [
            '💨 Mist plants regularly in summer to raise humidity',
            '🌬️ Keep plants clean — wipe leaves with wet cloth weekly',
            '🔍 Check undersides of leaves routinely with a hand lens',
            '🌿 Apply neem oil preventively every 2 weeks in dry weather',
            '♻️ Isolate new plants for 2 weeks before mixing with collection'
        ],
        products: ['Neem Oil', 'Plant Protection Spray', 'Plant Booster Spray']
    },

    'fungal-wilt': {
        name: 'Fusarium/Verticillium Wilt (Murjhana Rog)',
        severity: 'severe',
        description: 'Soil-borne fungal disease causing sudden wilting despite adequate watering. Very destructive in tomato, brinjal, and ornamental plants across India.',
        cause: 'Fusarium oxysporum or Verticillium spp. live in soil and block water-conducting vessels inside the stem. Spread through contaminated soil, water, and tools.',
        symptoms: ['Wilting on one side of plant first', 'Yellowing starts from lower leaves upward', 'Brown discoloration inside stem (cut stem to check)', 'Plant wilts during hot afternoons, recovers at night (early stage)', 'Complete collapse in severe cases'],
        remedies: [
            {
                name: 'Trichoderma + Neem Cake Treatment',
                icon: '🌿',
                ingredients: 'Neem cake (100g) + Trichoderma viride (if available, 10g) + compost',
                steps: 'Mix neem cake and Trichoderma into compost. Apply around the base of the plant and water in. Trichoderma is a beneficial fungus that attacks Fusarium. Available at agricultural shops across India.',
                frequency: 'Apply once; follow up monthly'
            },
            {
                name: 'Solarization + Haldi Treatment',
                icon: '☀️',
                ingredients: 'Clear plastic sheet + haldi (turmeric) solution',
                steps: 'For soil sterilization: water the area well, cover with clear plastic for 4-6 weeks in peak summer. Then treat soil with haldi solution (2 tbsp per 5L water) before replanting.',
                frequency: 'Once before new planting season'
            }
        ],
        prevention: [
            '🌱 Use disease-resistant varieties when available',
            '♻️ Rotate crops — don\'t plant same family in same spot for 3 years',
            '🏺 Sterilize potting soil by sun-baking before use',
            '🧹 Clean and disinfect gardening tools regularly',
            '🌿 Add neem cake to soil at planting time as preventive measure'
        ],
        products: ['Neem Cake Powder', 'Root Booster', 'Vermi Compost']
    },

    'scale-insects': {
        name: 'Scale Insects (Chhilka Keet)',
        severity: 'mild',
        description: 'Small armored or soft-bodied insects that attach to stems and leaves, resembling tiny brown or white bumps. Common on citrus, ficus, and ornamental plants in India.',
        cause: 'Various species of Coccoidea. They secrete a protective waxy covering making them resistant to sprays. Spread by ants, wind, and contaminated plants.',
        symptoms: ['Small raised bumps on stems and leaves', 'Sticky honeydew residue', 'Sooty mold (black coating)', 'Yellowing leaves near infestation', 'Branch dieback in severe cases'],
        remedies: [
            {
                name: 'Neem Oil + Alcohol Scrub',
                icon: '🌿',
                ingredients: 'Neem oil (10ml) + rubbing alcohol (10ml) + dish soap (5ml) + water (1L)',
                steps: 'Mix all ingredients. Use a soft toothbrush dipped in solution to scrub scale off stems and leaves. Then spray entire plant. The alcohol penetrates their waxy armor.',
                frequency: 'Scrub every 3-4 days; spray weekly'
            },
            {
                name: 'Sarson ka Tel (Mustard Oil) Treatment',
                icon: '🫒',
                ingredients: 'Mustard oil (2 tbsp) + water (1L) + dish soap (1 tsp)',
                steps: 'Mix mustard oil with soapy water. Spray on scale-infested areas. The oil suffocates them by blocking breathing. Very effective in Indian households where mustard oil is readily available.',
                frequency: 'Apply every 5-7 days for 3 weeks'
            }
        ],
        prevention: [
            '🔍 Inspect new plants carefully before bringing home',
            '🐜 Control ants — they protect scale from predators',
            '✂️ Prune heavily infested branches and destroy them',
            '🌿 Apply neem oil monthly as preventive spray',
            '🐞 Encourage ladybugs and lacewings — natural predators'
        ],
        products: ['Neem Oil', 'Plant Protection Spray', 'Neem Cake Powder']
    },

    'damping-off': {
        name: 'Damping Off (Galne ka Rog)',
        severity: 'severe',
        description: 'A disease of seedlings where young plants rot at the soil line and topple over. Every Indian gardener starting seeds has faced this frustrating problem.',
        cause: 'Caused by Pythium, Rhizoctonia, or Fusarium in soil. Triggered by overwatering, poor drainage, and overcrowded seedlings — common during monsoon seed starting.',
        symptoms: ['Seedlings collapse at soil line', 'Stem turns brown/mushy at base', 'White cotton-like fungus on soil surface', 'Seeds fail to germinate (pre-emergence)', 'Entire seedling trays wiped out quickly'],
        remedies: [
            {
                name: 'Daalchini (Cinnamon) Soil Dust',
                icon: '🟤',
                ingredients: 'Cinnamon powder (generously)',
                steps: 'Dust cinnamon powder on soil surface around seedlings. Cinnamon is a powerful natural fungicide. Can also mix into top layer of soil before sowing seeds.',
                frequency: 'Dust after every watering'
            },
            {
                name: 'Chamomile Tea Spray',
                icon: '🍵',
                ingredients: 'Chamomile tea bags (2) + water (500ml)',
                steps: 'Brew strong chamomile tea, let it cool. Use to water seedlings. Chamomile has natural antifungal properties. Alternative: use diluted haldi water.',
                frequency: 'Water with tea solution every other day'
            }
        ],
        prevention: [
            '🏺 Use sterilized/fresh seed-starting mix — never reuse old soil',
            '💧 Water from bottom — never overhead water seedlings',
            '🌬️ Ensure good air circulation with a small fan',
            '🌱 Don\'t sow seeds too close together — thin early',
            '☀️ Provide bright light to keep soil surface dry'
        ],
        products: ['Neem Cake Powder', 'Vermi Compost', 'Root Booster']
    },

    'blight': {
        name: 'Blight (Anga Maari / Jhulsa Rog)',
        severity: 'severe',
        description: 'Rapid browning and death of leaves, often starting from tips. Early and late blight devastate tomato and potato crops across India every monsoon.',
        cause: 'Phytophthora infestans (late blight) or Alternaria solani (early blight). Spread rapidly in humid, rainy conditions. Major crop loss during Indian monsoon.',
        symptoms: ['Large brown/dark patches on leaves', 'Water-soaked spots that turn brown quickly', 'White fuzzy growth under leaves (late blight)', 'Concentric rings in spots (early blight)', 'Rapid leaf and fruit rot'],
        remedies: [
            {
                name: 'Copper Solution (Neela Thotha)',
                icon: '🔵',
                ingredients: 'Copper sulphate (Neela Thotha) — 3g + lime (Chuna) — 3g + water (1L)',
                steps: 'Make Bordeaux mixture: dissolve copper sulphate in 500ml water, dissolve lime in another 500ml, then slowly add lime solution to copper. Spray on plants. This traditional remedy has been used by Indian farmers for generations.',
                frequency: 'Spray every 7 days during monsoon'
            },
            {
                name: 'Neem + Garlic + Chilli Combo Spray',
                icon: '🌿',
                ingredients: 'Neem oil (10ml) + garlic (5 cloves) + green chilli (3) + water (1L)',
                steps: 'Blend garlic and chilli, strain into water, add neem oil. This triple-action spray has antifungal, antibacterial, and pest-repelling properties.',
                frequency: 'Spray every 4-5 days during monsoon'
            }
        ],
        prevention: [
            '🌱 Use disease-resistant tomato varieties (like Arka Rakshak)',
            '💧 Avoid overhead watering; use drip irrigation',
            '🌤️ Ensure adequate spacing for air circulation',
            '♻️ Practice crop rotation — 3 year gap for same crop',
            '🍂 Remove and burn all infected plant material'
        ],
        products: ['Neem Oil', 'Neem Cake Powder', 'Plant Protection Spray']
    },

    'nitrogen-deficiency': {
        name: 'Nitrogen Deficiency (Naitrojan ki Kami)',
        severity: 'mild',
        description: 'Most common nutrient deficiency in Indian gardens. Plants become pale, growth slows, and older leaves turn yellow. Easy to fix with organic supplements.',
        cause: 'Insufficient nitrogen in soil, depleted by repeated cropping without fertilizing, heavy rains washing away nutrients, or using inert growing media.',
        symptoms: ['Overall pale green/yellow color', 'Lower/older leaves yellow first', 'Slow, stunted growth', 'Thin, weak stems', 'Small leaves and few flowers'],
        remedies: [
            {
                name: 'Vermicompost Top Dressing',
                icon: '🪱',
                ingredients: 'Vermicompost (handful per pot)',
                steps: 'Add a generous layer (1-2 inches) of vermicompost around the base of the plant and water in. Vermicompost is the single best organic fertilizer — slowly releases nitrogen and other nutrients.',
                frequency: 'Apply every 3-4 weeks'
            },
            {
                name: 'Dal ka Paani (Lentil Water)',
                icon: '🫘',
                ingredients: 'Water used for soaking/washing dal/rice',
                steps: 'Save the starchy water from washing rice or soaking dal. Let it cool and use to water plants. Rich in nitrogen and starch. Every Indian kitchen produces this daily — zero cost!',
                frequency: 'Use 2-3 times per week'
            },
            {
                name: 'Onion Peel Fertilizer',
                icon: '🧅',
                ingredients: 'Onion peels (from 4-5 onions) + water (1L)',
                steps: 'Soak onion peels in water for 24-48 hours. Strain and use the brown water to water plants. Rich in potassium, phosphorus, and nitrogen. Can also dry and powder peels to mix into soil.',
                frequency: 'Water with onion peel tea weekly'
            }
        ],
        prevention: [
            '🪱 Add vermicompost to soil every 3-4 weeks',
            '🌿 Use neem cake as slow-release nitrogen source',
            '🫘 Regularly use kitchen waste water (dal/rice water)',
            '🍃 Mulch with dry leaves to retain nutrients',
            '♻️ Compost kitchen waste and add to garden beds'
        ],
        products: ['Vermi Compost', 'All in One Mixture', 'Plant Diet']
    },

    'sunburn': {
        name: 'Sunburn / Sun Scald (Dhoop se Jalana)',
        severity: 'mild',
        description: 'Brown/white bleached patches on leaves from excessive direct sunlight. Common in harsh Indian summers (April-June) especially for shade-loving plants moved outdoors.',
        cause: 'Excessive UV exposure, especially when plants are suddenly moved from shade to full sun. Peak in Indian summer when temperatures cross 40°C.',
        symptoms: ['White or bleached patches on leaves', 'Brown crispy edges on foliage', 'Scorched appearance on sun-facing side', 'Wilting during afternoon heat', 'Faded leaf color'],
        remedies: [
            {
                name: 'Relocate + Recovery Care',
                icon: '🏠',
                ingredients: 'Shade cloth (50%) or indoor location',
                steps: 'Move plant to partial shade immediately. Remove severely damaged leaves. Water deeply. Apply diluted seaweed solution or vermicompost tea to help recovery. Gradually reintroduce to sunlight over 2 weeks.',
                frequency: 'Ongoing care for 2-3 weeks'
            },
            {
                name: 'Buttermilk (Chhach) Spray',
                icon: '🥛',
                ingredients: 'Buttermilk/chhach (100ml) + water (500ml)',
                steps: 'Dilute buttermilk and spray on leaves. Contains beneficial bacteria that help plant recover. Also provides mild nutrition. An old dadi-nani remedy used across Indian villages.',
                frequency: 'Spray every 3-4 days during recovery'
            }
        ],
        prevention: [
            '☀️ Acclimatize plants gradually when moving to brighter spots',
            '🏗️ Use 50% shade cloth/green net during peak summer (April-June)',
            '💧 Water deeply in morning — never during hot afternoon',
            '🍃 Use mulching to keep roots cool',
            '🌿 Group shade-loving plants under trees or taller plants'
        ],
        products: ['Plant Booster Spray', 'Vermi Compost', 'Plant Diet']
    }
};

// Product catalog matching
const PRODUCT_CATALOG = {
    'Neem Oil': { name: 'Neem Oil (250ml)', price: '₹150', image: 'Images/Flower mixture 2.png', match: 'Natural pesticide & fungicide' },
    'Neem Cake Powder': { name: 'Neem Cake Powder (1kg)', price: '₹150', image: 'Images/Flower mixture 2.png', match: 'Soil treatment & pest prevention' },
    'Plant Protection Spray': { name: 'Plant Protection Spray (500ml)', price: '₹230', image: 'Images/Flower mixture 2.png', match: 'Fights pests & diseases' },
    'Plant Booster Spray': { name: 'Plant Booster Spray (500ml)', price: '₹230', image: 'Images/Flower mixture 2.png', match: 'Strengthens plant immunity' },
    'Flower Booster Spray': { name: 'Flower Booster Spray (500ml)', price: '₹230', image: 'Images/Flower mixture 2.png', match: 'Promotes healthy blooming' },
    'Vermi Compost': { name: 'Vermi Compost (2kg)', price: '₹150', image: 'Images/Flower mixture 2.png', match: 'Complete organic nutrition' },
    'All in One Mixture': { name: 'All in One Mixture (2kg)', price: '₹130', image: 'Images/Flower mixture 2.png', match: 'Balanced soil nutrition' },
    'Root Booster': { name: 'Root Booster (800g)', price: '₹150', image: 'Images/Flower mixture 2.png', match: 'Strengthens root system' },
    'Plant Diet': { name: 'Plant Diet (500g)', price: '₹150', image: 'Images/Flower mixture 2.png', match: 'Complete micro/macro nutrients' },
    'Flower Mixture': { name: 'Flower Mixture (1kg)', price: '₹130', image: 'Images/Flower mixture 2.png', match: 'Promotes flowering' }
};

// =============================================
// PLANT ENERGY KNOWLEDGE DATABASE (Vastu + Feng Shui + Botanical Science)
// =============================================
const PLANT_ENERGY_DB = {
    // ---- Positive Energy Indoor Plants ----
    'tulsi':        { name: 'Tulsi (Holy Basil)', energy: 'positive', placement: 'indoor', direction: 'North/East', vastu: 'Sacred plant — purifies air and radiates spiritual positivity. Tulsi is worshipped in Indian homes and is believed to ward off negativity.', tips: ['Place near entrance or in prayer area', 'Water daily at sunrise for best energy', 'Never place in bedroom — too stimulating'], oxygenBoost: 'high', airPurify: true },
    'money-plant':  { name: 'Money Plant (Pothos)', energy: 'positive', placement: 'indoor', direction: 'South-East', vastu: 'Attracts wealth and prosperity according to Vastu Shastra. Its heart-shaped leaves symbolise love and abundance.', tips: ['Place in South-East corner for financial growth', 'Never let it touch the floor — keep elevated', 'Grows well in water or soil'], oxygenBoost: 'medium', airPurify: true },
    'snake-plant':  { name: 'Snake Plant (Sansevieria)', energy: 'positive', placement: 'indoor', direction: 'South/South-East', vastu: 'One of the best air purifiers — releases oxygen at night. Creates a protective energy shield and absorbs toxins.', tips: ['Ideal for bedrooms — produces O₂ at night', 'Place near electronics to absorb radiation', 'Low maintenance, thrives on neglect'], oxygenBoost: 'very-high', airPurify: true },
    'bamboo':       { name: 'Lucky Bamboo', energy: 'positive', placement: 'indoor', direction: 'East/South-East', vastu: 'Represents the five elements of Feng Shui. Number of stalks determines the type of luck it brings.', tips: ['3 stalks = happiness, 5 = health, 7 = wealth', 'Keep in clean water, change weekly', 'Avoid direct sunlight — prefers shade'], oxygenBoost: 'low', airPurify: false },
    'peace-lily':   { name: 'Peace Lily', energy: 'positive', placement: 'indoor', direction: 'North', vastu: 'Symbolises peace, harmony, and spiritual growth. Excellent air purifier that removes formaldehyde, benzene, and other toxins.', tips: ['Place in living room or meditation area', 'Keep away from pets — mildly toxic if ingested', 'Thrives in low light with weekly watering'], oxygenBoost: 'high', airPurify: true },
    'jade':         { name: 'Jade Plant (Crassula)', energy: 'positive', placement: 'indoor', direction: 'South-East/East', vastu: 'Known as the "money tree" — its round leaves resemble coins and attract prosperity. Common gift for new businesses.', tips: ['Place near entrance or on work desk', 'Let soil dry between waterings', 'Prune regularly for bushy, coin-like growth'], oxygenBoost: 'low', airPurify: false },
    'aloe-vera':    { name: 'Aloe Vera', energy: 'positive', placement: 'indoor', direction: 'North/East', vastu: 'Powerful healer — absorbs negative energy and EMF radiation. Medicinal gel has cooling, healing properties used in Ayurveda.', tips: ['Place near windows for bright indirect light', 'Use gel for burns, skin care, hair health', 'Avoid overwatering — succulent needs dry soil'], oxygenBoost: 'medium', airPurify: true },
    'lavender':     { name: 'Lavender', energy: 'positive', placement: 'indoor', direction: 'North', vastu: 'Promotes calmness, reduces stress, and aids sleep. Its fragrance is scientifically proven to lower anxiety and heart rate.', tips: ['Place in bedroom for better sleep', 'Needs 6+ hours of sunlight daily', 'Dried flowers can be used in pillows'], oxygenBoost: 'low', airPurify: false },
    'jasmine':      { name: 'Jasmine (Mogra)', energy: 'positive', placement: 'both', direction: 'South/South-East', vastu: 'Enhances romantic energy and brings sweetness to relationships. Its night-blooming fragrance calms the mind.', tips: ['Place in bedroom or balcony facing South', 'Water regularly, needs 4+ hours sunlight', 'Offer flowers in puja for spiritual merit'], oxygenBoost: 'medium', airPurify: false },
    'spider-plant': { name: 'Spider Plant', energy: 'positive', placement: 'indoor', direction: 'Any', vastu: 'NASA-approved air purifier. Absorbs carbon monoxide and xylene. Creates a calm, clean environment and is very easy to grow.', tips: ['Hang in kitchen or near stove to purify cooking fumes', 'Safe for pets and children', 'Produces baby plantlets you can propagate'], oxygenBoost: 'high', airPurify: true },
    'rose':         { name: 'Rose (Gulab)', energy: 'positive', placement: 'outdoor', direction: 'South-West', vastu: 'Symbolises love and beauty. Red roses attract romantic energy. White roses bring peace. Yellow roses bring friendship.', tips: ['Place in garden facing South-West for love energy', 'Needs 6+ hours of direct sunlight', 'Prune spent blooms to encourage new flowers'], oxygenBoost: 'medium', airPurify: false },
    'marigold':     { name: 'Marigold (Genda)', energy: 'positive', placement: 'outdoor', direction: 'North/North-East', vastu: 'Auspicious flower used in puja. Its bright orange-yellow colour radiates warm, positive energy and keeps pests away.', tips: ['Plant near entrance for welcoming energy', 'Used in festivals, weddings, and daily puja', 'Natural pest repellent — great companion plant'], oxygenBoost: 'medium', airPurify: false },
    'neem':         { name: 'Neem Tree', energy: 'positive', placement: 'outdoor', direction: 'North-West', vastu: 'Sacred tree in Indian tradition. Purifies air, repels insects, and is used extensively in Ayurvedic medicine. Symbol of protection.', tips: ['Plant in North-West for health protection', 'Every part is medicinal — leaves, bark, seeds', 'Provides natural shade and cooling'], oxygenBoost: 'very-high', airPurify: true },
    'peepal':       { name: 'Peepal Tree', energy: 'positive', placement: 'outdoor', direction: 'West', vastu: 'One of few trees that release oxygen 24/7. Sacred in Hinduism, Buddhism, and Jainism. Believed to be the abode of Lord Vishnu.', tips: ['Do not plant too close to buildings — large root system', 'Sitting under it improves respiratory health', 'Sacred — never cut without necessity'], oxygenBoost: 'very-high', airPurify: true },
    'banana':       { name: 'Banana Plant (Kela)', energy: 'positive', placement: 'outdoor', direction: 'North-East', vastu: 'Symbol of Lord Vishnu. Brings prosperity, health, and positive vibrations. Its large leaves create a tropical, lush energy.', tips: ['Plant in North-East corner of garden', 'Leaves used in puja and serving food', 'Needs regular watering and rich soil'], oxygenBoost: 'high', airPurify: true },
    'curry-leaf':   { name: 'Curry Leaf Plant', energy: 'positive', placement: 'both', direction: 'East', vastu: 'Culinary herb with strong protective energy. Used daily in Indian cooking. Believed to ward off evil eye (nazar).', tips: ['Plant near kitchen garden for daily use', 'Rich in iron and antioxidants', 'Needs full sun and well-drained soil'], oxygenBoost: 'medium', airPurify: false },
    'hibiscus':     { name: 'Hibiscus (Gudhal)', energy: 'positive', placement: 'outdoor', direction: 'South', vastu: 'Offered to Goddess Kali and Lord Ganesha. Red hibiscus attracts fame and recognition. Promotes courage and passion.', tips: ['Place in South direction for fame/recognition', 'Flowers used in hair oil and herbal tea', 'Needs full sunlight and regular pruning'], oxygenBoost: 'medium', airPurify: false },
    'areca-palm':   { name: 'Areca Palm', energy: 'positive', placement: 'indoor', direction: 'South/East', vastu: 'Best tropical air purifier. Humidifies dry air naturally. Creates a resort-like ambiance and filters formaldehyde.', tips: ['Place in living room as statement piece', 'Mist leaves in dry weather', 'Avoid direct harsh sunlight — prefers bright indirect'], oxygenBoost: 'very-high', airPurify: true },
    'fern':         { name: 'Boston Fern', energy: 'positive', placement: 'indoor', direction: 'North/East', vastu: 'Excellent air purifier and natural humidifier. Creates a calm, forest-like energy. Removes toxins from indoor air.', tips: ['Hang in bathroom or kitchen for humidity', 'Mist daily in dry season', 'Keep away from direct sunlight'], oxygenBoost: 'high', airPurify: true },
    'rubber-plant': { name: 'Rubber Plant (Ficus)', energy: 'positive', placement: 'indoor', direction: 'South-East', vastu: 'Round, dark green leaves symbolise wealth and abundance. Powerful air purifier that absorbs formaldehyde from furniture.', tips: ['Wipe leaves monthly to keep pores open', 'Place in wealth corner (South-East)', 'Avoid moving frequently — prefers a fixed spot'], oxygenBoost: 'high', airPurify: true },

    // ---- Negative/Caution Energy Plants ----
    'cactus':       { name: 'Cactus', energy: 'negative', placement: 'outdoor', direction: 'Avoid indoors', vastu: 'Thorns create "sha chi" (negative/piercing energy) in Feng Shui. Can cause arguments and financial stress when kept indoors.', tips: ['Keep only outdoors or on balcony railing', 'Never place in bedroom or living room', 'If kept, place facing South to deflect negativity outside'], oxygenBoost: 'low', airPurify: false },
    'bonsai':       { name: 'Bonsai Tree', energy: 'negative', placement: 'outdoor', direction: 'Avoid indoors', vastu: 'Represents stunted growth in Vastu. Its dwarfed form symbolises restricted potential and can hinder career growth.', tips: ['Avoid in home office or study room', 'If you love bonsai, keep on outdoor porch only', 'Replace with jade plant for similar aesthetic + positive energy'], oxygenBoost: 'low', airPurify: false },
    'cotton-plant': { name: 'Cotton Plant', energy: 'negative', placement: 'outdoor', direction: 'Avoid at home', vastu: 'Attracts negative energy and is considered inauspicious in residential spaces. Associated with mourning in some cultures.', tips: ['Strictly avoid indoors', 'Not recommended for home gardens', 'Fine for agricultural/commercial farming'], oxygenBoost: 'low', airPurify: false },
    'tamarind':     { name: 'Tamarind Tree (Imli)', energy: 'negative', placement: 'outdoor', direction: 'Avoid near home', vastu: 'Believed to attract negative spirits and cause quarrels. Its sour fruit symbolises bitterness in relationships.', tips: ['Do not plant near the house entrance', 'Keep at a distance if in compound', 'Use fruit for cooking but avoid planting close'], oxygenBoost: 'medium', airPurify: false },
    'dead-dry':     { name: 'Dead/Dried Plants', energy: 'negative', placement: 'avoid', direction: 'Remove immediately', vastu: 'Dead or dying plants accumulate stagnant, negative energy. They symbolise decay and neglect and block positive flow.', tips: ['Remove dead plants immediately from home', 'Replace with a fresh, healthy plant', 'Compost dead plants — recycle the energy'], oxygenBoost: 'none', airPurify: false },
    'thorny':       { name: 'Thorny Plants (General)', energy: 'negative', placement: 'outdoor', direction: 'Only at boundary', vastu: 'Thorns represent conflict, aggression, and sharp energy. They block the smooth flow of positive chi/prana in living spaces.', tips: ['Use only as boundary/fence plants for protection', 'Never keep on desk, dining table, or bedroom', 'Exception: roses for South-West garden are okay'], oxygenBoost: 'varies', airPurify: false },
    'milky-sap':    { name: 'Milky Sap Plants (Euphorbia)', energy: 'caution', placement: 'outdoor', direction: 'Keep away from living areas', vastu: 'Plants with white milky sap are considered inauspicious in Vastu. They may cause skin irritation and represent hidden toxicity.', tips: ['Keep away from children and pets', 'Only suitable for outdoor garden corners', 'Wash hands after handling'], oxygenBoost: 'low', airPurify: false }
};

// =============================================
// PLANT ENERGY ANALYSIS ENGINE
// =============================================

/**
 * Fetch plant energy data from backend first, fall back to local DB.
 * Returns a resolved backend entry or null.
 */
async function fetchEnergyFromBackend(plantName) {
    try {
        var res = await fetch(BACKEND_URL + '/api/plant-scanner/energy/match', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plantName: plantName, limit: 1 })
        });
        if (!res.ok) return null;
        var json = await res.json();
        if (json.status === 'matched' && json.matches && json.matches.length > 0) {
            return json.matches[0].plant;
        }
        return null;
    } catch (e) {
        console.warn('Backend energy fetch failed, using local DB:', e.message);
        return null;
    }
}

async function analyzeEnergy(plantCheck, envInfo, diseaseData) {
    var stats = plantCheck ? plantCheck.stats || {} : {};
    var greenRatio = stats.greenRatio || 0;
    var strongGreen = stats.strongGreenRatio || 0;
    var woodRatio = stats.woodRatio || 0;
    var brightMean = stats.brightnessMean || 130;
    var brightVar = stats.brightnessVar || 0;
    var envType = envInfo ? envInfo.type || 'unknown' : 'unknown';
    var envConfidence = envInfo ? envInfo.confidence || 0.5 : 0.5;

    // --- 1. Vitality Score (0-100): How alive/healthy does the plant look? ---
    var vitalityScore = 50; // baseline
    if (greenRatio > 0.25) vitalityScore += 20;
    else if (greenRatio > 0.18) vitalityScore += 12;
    else if (greenRatio < 0.12) vitalityScore -= 15;

    if (strongGreen > 0.15) vitalityScore += 15;
    else if (strongGreen > 0.08) vitalityScore += 8;

    if (woodRatio > 0.1) vitalityScore -= 10; // dry/woody = stress
    if (brightVar > 1000) vitalityScore -= 8; // spotty = disease
    if (brightMean > 160 && brightMean < 210) vitalityScore += 5; // well-lit healthy range

    // Disease penalty
    if (diseaseData && diseaseData.severity) {
        if (diseaseData.severity === 'severe') vitalityScore -= 20;
        else if (diseaseData.severity === 'moderate') vitalityScore -= 10;
        else if (diseaseData.severity === 'mild') vitalityScore -= 5;
    }
    if (diseaseData && diseaseData.healthy) vitalityScore += 15;

    vitalityScore = Math.max(5, Math.min(100, vitalityScore));

    // --- 2. Try to identify the plant from backend DB, then local fallback ---
    var matchedPlant = null;   // local DB entry (old format)
    var backendPlant = null;   // rich backend entry (new format)
    var plantName = (diseaseData && (diseaseData.plantName || diseaseData.plant || '')) || '';
    var fileName = selectedFile ? selectedFile.name.toLowerCase() : '';
    var searchText = (plantName + ' ' + fileName).toLowerCase();

    // Try backend first
    if (searchText.trim()) {
        try {
            backendPlant = await fetchEnergyFromBackend(searchText.trim());
        } catch (e) { /* ignore */ }
    }

    // If backend miss, try local PLANT_ENERGY_DB
    if (!backendPlant) {
        var energyKeys = Object.keys(PLANT_ENERGY_DB);
        for (var i = 0; i < energyKeys.length; i++) {
            var key = energyKeys[i];
            var dbEntry = PLANT_ENERGY_DB[key];
            var nameWords = dbEntry.name.toLowerCase().split(/[\s()\/]+/);
            for (var j = 0; j < nameWords.length; j++) {
                if (nameWords[j].length > 2 && searchText.indexOf(nameWords[j]) !== -1) {
                    matchedPlant = dbEntry;
                    break;
                }
            }
            if (!matchedPlant && searchText.indexOf(key) !== -1) {
                matchedPlant = dbEntry;
            }
            if (matchedPlant) break;
        }
    }

    // --- 3. Determine energy rating ---
    var energyType, energyLabel, energyIcon, energyColor, energyDesc;
    var vastuAdvice = '';
    var vastuDetailed = '';
    var vastuDosAndDonts = [];
    var energyDetailed = '';
    var healthSummary = '';
    var healthDetailed = '';
    var spiritualInfo = null;
    var careInfo = null;
    var healthyIndicators = null;
    var medicinalUses = [];
    var placementTips = [];
    var plantDisplayName = '';
    var nasaApproved = false;
    var toxinsRemoved = [];
    var references = [];

    if (backendPlant) {
        // ===== RICH BACKEND DATA =====
        var bp = backendPlant;
        plantDisplayName = bp.commonName || bp.slug;
        energyType = bp.energy ? bp.energy.type : 'neutral';
        vitalityScore = bp.energy ? Math.max(5, Math.min(100, (vitalityScore + bp.energy.score) / 2)) : vitalityScore;
        energyDesc = bp.energy ? bp.energy.summary : '';
        energyDetailed = bp.energy ? bp.energy.detailedDescription : '';
        vastuAdvice = bp.vastu ? bp.vastu.insight : '';
        vastuDetailed = bp.vastu ? bp.vastu.detailedInsight : '';
        vastuDosAndDonts = bp.vastu ? (bp.vastu.dosAndDonts || []) : [];
        placementTips = bp.placement ? (bp.placement.tips || []) : [];
        healthSummary = bp.healthBenefits ? bp.healthBenefits.healthSummary : '';
        healthDetailed = bp.healthBenefits ? bp.healthBenefits.healthDetailed : '';
        nasaApproved = bp.healthBenefits ? bp.healthBenefits.nasaApproved : false;
        toxinsRemoved = bp.healthBenefits ? (bp.healthBenefits.toxinsRemoved || []) : [];
        medicinalUses = bp.healthBenefits ? (bp.healthBenefits.medicinalUses || []) : [];
        spiritualInfo = bp.spiritual || null;
        careInfo = bp.care || null;
        healthyIndicators = bp.healthyIndicators || null;
        references = bp.references || [];

        if (energyType === 'positive') {
            energyLabel = 'Positive Energy';
            energyIcon = '✨';
            energyColor = '#2e7d32';
        } else if (energyType === 'negative') {
            energyLabel = 'Negative Energy';
            energyIcon = '⚠️';
            energyColor = '#c62828';
        } else if (energyType === 'caution') {
            energyLabel = 'Use with Caution';
            energyIcon = '⚡';
            energyColor = '#e65100';
        } else {
            energyLabel = 'Neutral Energy';
            energyIcon = '🔵';
            energyColor = '#1565c0';
        }

        // Placement mismatch check
        var idealPlacement = bp.placement ? bp.placement.ideal : 'both';
        if (idealPlacement === 'outdoor' && envType === 'indoor') {
            placementTips.unshift('⚠️ This plant is better suited outdoors — consider moving it to balcony/terrace for best energy.');
            if (energyType !== 'negative') { energyLabel = 'Good Energy, Wrong Spot'; energyIcon = '🔄'; energyColor = '#e65100'; }
        } else if (idealPlacement === 'indoor' && envType === 'outdoor') {
            placementTips.unshift('💡 This plant thrives indoors — bring it inside for stronger energy benefits.');
        }

        // Air purification and oxygen info
        var airPurify = bp.healthBenefits ? bp.healthBenefits.airPurify : false;
        var oxygenOutput = bp.healthBenefits ? bp.healthBenefits.oxygenOutput : 'medium';
        if (airPurify) placementTips.push('🌬️ Air Purifier — actively cleans your indoor air of toxins and pollutants.');
        var oxygenLabels = { 'very-high': '🫁 Very High O₂ output', 'high': '🫁 High O₂ output', 'medium': '🫁 Moderate O₂ output', 'low': '🫁 Low O₂ output', 'none': '🫁 No O₂ output' };
        if (oxygenOutput && oxygenLabels[oxygenOutput]) placementTips.push(oxygenLabels[oxygenOutput]);
        if (bp.vastu && bp.vastu.direction) placementTips.push('🧭 Best Vastu direction: ' + bp.vastu.direction);

    } else if (matchedPlant) {
        // ===== LOCAL FALLBACK (old format) =====
        plantDisplayName = matchedPlant.name;
        energyType = matchedPlant.energy;
        vastuAdvice = matchedPlant.vastu;
        placementTips = matchedPlant.tips.slice();

        if (matchedPlant.energy === 'positive') {
            energyLabel = 'Positive Energy'; energyIcon = '✨'; energyColor = '#2e7d32';
            energyDesc = matchedPlant.name + ' radiates positive energy. ' + matchedPlant.vastu;
        } else if (matchedPlant.energy === 'negative') {
            energyLabel = 'Negative Energy'; energyIcon = '⚠️'; energyColor = '#c62828';
            energyDesc = matchedPlant.name + ' may bring negative energy indoors. ' + matchedPlant.vastu;
        } else {
            energyLabel = 'Use with Caution'; energyIcon = '⚡'; energyColor = '#e65100';
            energyDesc = matchedPlant.name + ' needs careful placement. ' + matchedPlant.vastu;
        }

        if (matchedPlant.placement === 'outdoor' && envType === 'indoor') {
            placementTips.unshift('⚠️ This plant is better suited outdoors — consider moving it to balcony/terrace.');
            if (matchedPlant.energy !== 'negative') { energyLabel = 'Good Energy, Wrong Spot'; energyIcon = '🔄'; energyColor = '#e65100'; }
        } else if (matchedPlant.placement === 'indoor' && envType === 'outdoor') {
            placementTips.unshift('💡 This plant thrives indoors — bring it inside for stronger energy benefits.');
        }

        if (matchedPlant.airPurify) placementTips.push('🌬️ Air Purifier — actively cleans your indoor air.');
        var oxygenLabels2 = { 'very-high': '🫁 Very High O₂ output', 'high': '🫁 High O₂ output', 'medium': '🫁 Moderate O₂ output', 'low': '🫁 Low O₂ output' };
        if (matchedPlant.oxygenBoost && oxygenLabels2[matchedPlant.oxygenBoost]) placementTips.push(oxygenLabels2[matchedPlant.oxygenBoost]);
        if (matchedPlant.direction) placementTips.push('🧭 Best Vastu direction: ' + matchedPlant.direction);

    } else {
        // Unknown plant — infer energy from vitality + environment
        if (vitalityScore >= 65) {
            energyType = 'positive'; energyLabel = 'Positive Energy'; energyIcon = '✨'; energyColor = '#2e7d32';
            energyDesc = 'Your plant looks healthy and vibrant! Lush green plants radiate positive prana (life force) and improve the energy of any space.';
            vastuAdvice = 'Healthy green plants are natural energy boosters. They absorb CO₂, release O₂, and create a calming, productive atmosphere.';
            placementTips = ['Keep in a well-lit area to maintain vitality', 'Healthy plants attract positive energy — maintain regular watering and feeding', 'Talk to your plants — studies show attention improves growth'];
        } else if (vitalityScore >= 40) {
            energyType = 'neutral'; energyLabel = 'Neutral Energy'; energyIcon = '🔵'; energyColor = '#1565c0';
            energyDesc = 'Your plant is showing mild stress. While it still provides oxygen, its energy output is reduced. Treat issues to restore vitality.';
            vastuAdvice = 'Stressed plants emit stagnant energy. Treating diseases and improving care will restore their positive energy flow.';
            placementTips = ['Move to a spot with better lighting', 'Follow the remedies above to restore health', 'Once healthy, this plant will radiate positive energy again'];
        } else {
            energyType = 'negative'; energyLabel = 'Low/Negative Energy'; energyIcon = '⚠️'; energyColor = '#c62828';
            energyDesc = 'Your plant is significantly stressed or dying. Wilting or diseased plants accumulate stagnant energy.';
            vastuAdvice = 'In Vastu Shastra, keeping sick or dying plants indoors blocks positive energy (prana). Either revive it urgently or replace it.';
            placementTips = ['🚨 Urgently treat the disease/deficiency detected above', 'If plant cannot be revived, compost it and get a fresh plant', 'Never keep dead or dying plants indoors — they drain energy', 'Clean the pot and soil before replanting'];
        }

        if (envType === 'indoor') {
            placementTips.push('🏠 Indoor: Ensure at least 4 hours of indirect sunlight for healthy energy.');
            placementTips.push('🧭 Vastu tip: Place green plants in the North or East for best energy flow.');
        } else if (envType === 'outdoor') {
            placementTips.push('🌿 Outdoor: Excellent! Peak energy producers with natural sunlight.');
            placementTips.push('🧭 Vastu tip: Tall plants in the South-West, flowering plants in the South.');
        }
    }

    // --- 4. Build energy meter visual data ---
    var meterPercent = vitalityScore;
    var meterColor;
    if (vitalityScore >= 65) meterColor = '#2e7d32';
    else if (vitalityScore >= 40) meterColor = '#f9a825';
    else meterColor = '#c62828';

    return {
        energyType: energyType,
        energyLabel: energyLabel,
        energyIcon: energyIcon,
        energyColor: energyColor,
        energyDesc: energyDesc,
        energyDetailed: energyDetailed,
        vastuAdvice: vastuAdvice,
        vastuDetailed: vastuDetailed,
        vastuDosAndDonts: vastuDosAndDonts,
        healthSummary: healthSummary,
        healthDetailed: healthDetailed,
        medicinalUses: medicinalUses,
        spiritualInfo: spiritualInfo,
        careInfo: careInfo,
        healthyIndicators: healthyIndicators,
        nasaApproved: nasaApproved,
        toxinsRemoved: toxinsRemoved,
        references: references,
        placementTips: placementTips,
        vitalityScore: vitalityScore,
        meterPercent: meterPercent,
        meterColor: meterColor,
        envType: envType,
        envConfidence: Math.round(envConfidence * 100),
        matchedPlant: plantDisplayName || (matchedPlant ? matchedPlant.name : null),
        airPurify: backendPlant ? (backendPlant.healthBenefits ? backendPlant.healthBenefits.airPurify : false) : (matchedPlant ? matchedPlant.airPurify : (greenRatio > 0.2)),
        oxygenBoost: backendPlant ? (backendPlant.healthBenefits ? backendPlant.healthBenefits.oxygenOutput : 'medium') : (matchedPlant ? matchedPlant.oxygenBoost : (greenRatio > 0.25 ? 'high' : 'medium')),
        isBackendData: !!backendPlant
    };
}

// Render energy card into DOM with Read More expandable sections
function displayEnergyCard(energyResult) {
    var card = document.getElementById('energyCard');
    if (!card) return;
    card.style.display = '';

    // Energy badge
    var badge = document.getElementById('energyBadge');
    badge.textContent = energyResult.energyIcon + ' ' + energyResult.energyLabel;
    badge.className = 'energy-badge ' + energyResult.energyType;

    // Plant name display
    var nameEl = document.getElementById('energyPlantName');
    if (nameEl) {
        nameEl.textContent = energyResult.matchedPlant || '';
        nameEl.style.display = energyResult.matchedPlant ? '' : 'none';
    }

    // Environment tag
    var envTag = document.getElementById('energyEnvTag');
    var envLabel = energyResult.envType === 'outdoor' ? '☀️ Outdoor' : '🏠 Indoor';
    envTag.textContent = envLabel + ' · ' + energyResult.envConfidence + '% confidence';
    envTag.className = 'energy-env-tag ' + energyResult.envType;

    // Vitality meter
    var meterFill = document.getElementById('vitalityFill');
    var meterLabel = document.getElementById('vitalityLabel');
    meterFill.style.width = energyResult.meterPercent + '%';
    meterFill.style.background = 'linear-gradient(90deg, ' + energyResult.meterColor + ', ' + lightenColor(energyResult.meterColor, 30) + ')';
    meterLabel.textContent = energyResult.vitalityScore + '/100';
    meterLabel.style.color = energyResult.meterColor;

    // Description (brief)
    document.getElementById('energyDesc').textContent = energyResult.energyDesc;

    // Read More: Energy Detailed
    var energyDetailWrap = document.getElementById('energyDetailedWrap');
    if (energyDetailWrap) {
        if (energyResult.energyDetailed) {
            energyDetailWrap.style.display = '';
            document.getElementById('energyDetailedContent').textContent = energyResult.energyDetailed;
            document.getElementById('energyDetailedContent').style.display = 'none';
            var btn = document.getElementById('energyDetailedBtn');
            btn.textContent = '📖 Read More about Energy';
            btn.onclick = function () { toggleReadMore('energyDetailedContent', btn, 'Energy'); };
        } else {
            energyDetailWrap.style.display = 'none';
        }
    }

    // Vastu advice (brief)
    document.getElementById('vastuAdvice').textContent = energyResult.vastuAdvice;

    // Read More: Vastu Detailed
    var vastuDetailWrap = document.getElementById('vastuDetailedWrap');
    if (vastuDetailWrap) {
        if (energyResult.vastuDetailed) {
            vastuDetailWrap.style.display = '';
            document.getElementById('vastuDetailedContent').textContent = energyResult.vastuDetailed;
            document.getElementById('vastuDetailedContent').style.display = 'none';
            var vBtn = document.getElementById('vastuDetailedBtn');
            vBtn.textContent = '📖 Read More about Vastu';
            vBtn.onclick = function () { toggleReadMore('vastuDetailedContent', vBtn, 'Vastu'); };
        } else {
            vastuDetailWrap.style.display = 'none';
        }
    }

    // Vastu Dos and Don'ts
    var dosWrap = document.getElementById('vastuDosAndDonts');
    if (dosWrap) {
        if (energyResult.vastuDosAndDonts && energyResult.vastuDosAndDonts.length) {
            dosWrap.style.display = '';
            var dosList = document.getElementById('vastuDosList');
            dosList.innerHTML = '';
            energyResult.vastuDosAndDonts.forEach(function (item) {
                var li = document.createElement('li');
                li.className = item.indexOf('DON') === 0 ? 'vastu-dont' : 'vastu-do';
                li.textContent = item;
                dosList.appendChild(li);
            });
        } else {
            dosWrap.style.display = 'none';
        }
    }

    // Placement tips
    var tipsList = document.getElementById('energyTips');
    tipsList.innerHTML = '';
    energyResult.placementTips.forEach(function (tip) {
        var li = document.createElement('li');
        li.textContent = tip;
        tipsList.appendChild(li);
    });

    // Quick stats row
    var statsRow = document.getElementById('energyStats');
    var airIcon = energyResult.airPurify ? '✅' : '❌';
    var o2Labels = { 'very-high': '🟢 Very High', 'high': '🟢 High', 'medium': '🟡 Medium', 'low': '🔴 Low', 'none': '⚫ None' };
    var o2Display = o2Labels[energyResult.oxygenBoost] || '🟡 Medium';
    var nasaBadge = energyResult.nasaApproved ? '<div class="energy-stat"><span class="energy-stat-icon">🛰️</span><span class="energy-stat-label">NASA Approved</span></div>' : '';
    statsRow.innerHTML =
        '<div class="energy-stat"><span class="energy-stat-icon">' + airIcon + '</span><span class="energy-stat-label">Air Purifier</span></div>' +
        '<div class="energy-stat"><span class="energy-stat-icon">' + o2Display.split(' ')[0] + '</span><span class="energy-stat-label">O₂: ' + o2Display.split(' ').slice(1).join(' ') + '</span></div>' +
        '<div class="energy-stat"><span class="energy-stat-icon">' + (energyResult.envType === 'indoor' ? '🏠' : '☀️') + '</span><span class="energy-stat-label">' + (energyResult.envType === 'indoor' ? 'Indoor' : 'Outdoor') + '</span></div>' +
        nasaBadge;

    // Health Benefits section (if backend data)
    var healthWrap = document.getElementById('energyHealthWrap');
    if (healthWrap) {
        if (energyResult.healthSummary) {
            healthWrap.style.display = '';
            document.getElementById('healthSummaryText').textContent = energyResult.healthSummary;
            if (energyResult.healthDetailed) {
                document.getElementById('healthDetailedContent').textContent = energyResult.healthDetailed;
                document.getElementById('healthDetailedContent').style.display = 'none';
                var hBtn = document.getElementById('healthDetailedBtn');
                hBtn.style.display = '';
                hBtn.textContent = '📖 Read More about Health Benefits';
                hBtn.onclick = function () { toggleReadMore('healthDetailedContent', hBtn, 'Health Benefits'); };
            }
            // Toxins removed
            var toxinsEl = document.getElementById('toxinsRemovedList');
            if (toxinsEl && energyResult.toxinsRemoved && energyResult.toxinsRemoved.length) {
                toxinsEl.innerHTML = '<strong>Toxins removed:</strong> ' + energyResult.toxinsRemoved.join(', ');
                toxinsEl.style.display = '';
            } else if (toxinsEl) { toxinsEl.style.display = 'none'; }

            // Medicinal uses
            var medEl = document.getElementById('medicinalUsesList');
            if (medEl && energyResult.medicinalUses && energyResult.medicinalUses.length) {
                medEl.innerHTML = '';
                energyResult.medicinalUses.forEach(function (use) {
                    var li = document.createElement('li');
                    li.textContent = use;
                    medEl.appendChild(li);
                });
                medEl.parentElement.style.display = '';
            } else if (medEl) { medEl.parentElement.style.display = 'none'; }
        } else {
            healthWrap.style.display = 'none';
        }
    }

    // Spiritual & Care section (collapsible)
    var extraWrap = document.getElementById('energyExtraWrap');
    if (extraWrap) {
        var hasExtra = energyResult.spiritualInfo || energyResult.careInfo || energyResult.healthyIndicators;
        if (hasExtra) {
            extraWrap.style.display = 'none'; // collapsed by default
            var extraContent = document.getElementById('energyExtraContent');
            extraContent.innerHTML = '';

            // Spiritual
            if (energyResult.spiritualInfo && energyResult.spiritualInfo.significance) {
                extraContent.innerHTML += '<div class="extra-section"><h5>🙏 Spiritual Significance</h5><p>' + energyResult.spiritualInfo.significance + '</p></div>';
                if (energyResult.spiritualInfo.traditions && energyResult.spiritualInfo.traditions.length) {
                    extraContent.innerHTML += '<ul class="extra-list">' + energyResult.spiritualInfo.traditions.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul>';
                }
            }

            // Care
            if (energyResult.careInfo) {
                var ci = energyResult.careInfo;
                extraContent.innerHTML += '<div class="extra-section"><h5>🌱 Care Guide</h5><ul class="extra-list">' +
                    (ci.sunlight ? '<li>☀️ ' + ci.sunlight + '</li>' : '') +
                    (ci.watering ? '<li>💧 ' + ci.watering + '</li>' : '') +
                    (ci.soil ? '<li>🪴 ' + ci.soil + '</li>' : '') +
                    (ci.temperature ? '<li>🌡️ ' + ci.temperature + '</li>' : '') +
                    (ci.difficulty ? '<li>📊 Difficulty: ' + ci.difficulty + '</li>' : '') +
                    '</ul></div>';
            }

            // Healthy indicators
            if (energyResult.healthyIndicators) {
                var hi = energyResult.healthyIndicators;
                extraContent.innerHTML += '<div class="extra-section"><h5>✅ Signs of a Healthy Plant</h5><ul class="extra-list">' +
                    (hi.leafColor ? '<li>🍃 Leaf colour: ' + hi.leafColor + '</li>' : '') +
                    (hi.leafTexture ? '<li>🍃 Texture: ' + hi.leafTexture + '</li>' : '') +
                    (hi.growth ? '<li>📈 Growth: ' + hi.growth + '</li>' : '') +
                    (hi.signs ? hi.signs.map(function (s) { return '<li>✓ ' + s + '</li>'; }).join('') : '') +
                    '</ul></div>';
            }

            var extraBtn = document.getElementById('energyExtraBtn');
            if (extraBtn) {
                extraBtn.style.display = '';
                extraBtn.textContent = '📖 Show Spiritual, Care & Health Indicators';
                extraBtn.onclick = function () {
                    if (extraWrap.style.display === 'none') {
                        extraWrap.style.display = '';
                        extraBtn.textContent = '🔽 Hide Details';
                    } else {
                        extraWrap.style.display = 'none';
                        extraBtn.textContent = '📖 Show Spiritual, Care & Health Indicators';
                    }
                };
            }
        } else {
            extraWrap.style.display = 'none';
            var extraBtn2 = document.getElementById('energyExtraBtn');
            if (extraBtn2) extraBtn2.style.display = 'none';
        }
    }

    // References
    var refsEl = document.getElementById('energyReferences');
    if (refsEl) {
        if (energyResult.references && energyResult.references.length) {
            refsEl.innerHTML = '<strong>📚 Sources:</strong> ' + energyResult.references.map(function (r) {
                return '<a href="' + r.url + '" target="_blank" rel="noopener">' + (r.source || r.title) + '</a>';
            }).join(' · ');
            refsEl.style.display = '';
        } else {
            refsEl.style.display = 'none';
        }
    }

    // Data source badge
    var srcBadge = document.getElementById('energySourceBadge');
    if (srcBadge) {
        srcBadge.textContent = energyResult.isBackendData ? '🔗 Verified data from database' : '📦 Local data (offline mode)';
        srcBadge.className = 'energy-source-badge ' + (energyResult.isBackendData ? 'verified' : 'local');
    }
}

// Toggle Read More sections
function toggleReadMore(contentId, btn, label) {
    var el = document.getElementById(contentId);
    if (!el) return;
    if (el.style.display === 'none') {
        el.style.display = '';
        btn.textContent = '🔽 Show Less';
    } else {
        el.style.display = 'none';
        btn.textContent = '📖 Read More about ' + label;
    }
}

// Utility: lighten a hex color
function lightenColor(hex, percent) {
    hex = hex.replace('#', '');
    var r = parseInt(hex.substring(0, 2), 16);
    var g = parseInt(hex.substring(2, 4), 16);
    var b = parseInt(hex.substring(4, 6), 16);
    r = Math.min(255, r + Math.round((255 - r) * percent / 100));
    g = Math.min(255, g + Math.round((255 - g) * percent / 100));
    b = Math.min(255, b + Math.round((255 - b) * percent / 100));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// =============================================
// IMAGE HANDLING
// =============================================
let selectedFile = null;

const uploadZone = document.getElementById('uploadZone');
const previewZone = document.getElementById('previewZone');
const plantImageInput = document.getElementById('plantImage');
const previewImg = document.getElementById('previewImg');
const gateOverlay = document.getElementById('gateOverlay');
const loginRedirectBtn = document.getElementById('loginRedirect');
const accessBar = document.getElementById('accessBar');
const userNameLabel = document.getElementById('userNameLabel');
const userContactLabel = document.getElementById('userContactLabel');
const switchAccountBtn = document.getElementById('switchAccountBtn');

const workflowHint = document.getElementById('workflowHint');
const workflowSteps = {
    upload: document.getElementById('wfUpload'),
    preview: document.getElementById('wfPreview'),
    analyze: document.getElementById('wfAnalyze'),
    result: document.getElementById('wfResult')
};

function updateWorkflowStep(stage) {
    const order = ['upload', 'preview', 'analyze', 'result'];
    const idx = order.indexOf(stage);
    if (idx < 0) return;

    order.forEach((key, i) => {
        const el = workflowSteps[key];
        if (!el) return;
        el.classList.remove('active', 'done');
        if (i < idx) el.classList.add('done');
        if (i === idx) el.classList.add('active');
    });

    if (!workflowHint) return;
    const hints = {
        upload: 'Step 1 of 4: Upload a clear plant photo.',
        preview: 'Step 2 of 4: Check the photo and start analysis.',
        analyze: 'Step 3 of 4: AI is analyzing symptoms and plant health.',
        result: 'Step 4 of 4: Review diagnosis, remedies, and next actions.'
    };
    workflowHint.textContent = hints[stage] || '';
}

updateWorkflowStep('upload');

// Drag and drop
uploadZone.addEventListener('dragover', e => {
    e.preventDefault();
    uploadZone.classList.add('drag-over');
});
uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('drag-over');
});
uploadZone.addEventListener('drop', e => {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
    if (!requireLogin()) return;
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
});

// File input change
plantImageInput.addEventListener('change', e => {
    if (!requireLogin()) return;
    const file = e.target.files[0];
    if (file) handleFile(file);
});

function handleFile(file) {
    if (file.size > 10 * 1024 * 1024) {
        alert('Image too large. Please use an image under 10MB.');
        return;
    }
    if (!requireLogin()) return;
    selectedFile = file;
    const reader = new FileReader();
    reader.onload = e => {
        previewImg.onload = () => {
            environmentGuess = estimateEnvironmentFromImage(previewImg, file.name);
        };
        previewImg.src = e.target.result;
        uploadZone.style.display = 'none';
        previewZone.style.display = 'block';
        updateWorkflowStep('preview');
    };
    reader.readAsDataURL(file);
}

function openCamera() {
    if (!requireLogin()) return;
    plantImageInput.setAttribute('capture', 'environment');
    plantImageInput.click();
    // Reset capture so choose file works normally next time
    setTimeout(() => plantImageInput.removeAttribute('capture'), 500);
}

function resetScanner() {
    selectedFile = null;
    environmentGuess = makeDefaultEnvironmentGuess();
    plantImageInput.value = '';
    previewImg.src = '';
    
    uploadZone.style.display = '';
    previewZone.style.display = 'none';
    document.getElementById('scanLoading').style.display = 'none';
    document.getElementById('scanResults').style.display = 'none';
    var energyReset = document.getElementById('energyCard');
    if (energyReset) energyReset.style.display = 'none';
    
    // Scroll to scanner
    document.querySelector('.scanner-main').scrollIntoView({ behavior: 'smooth' });
    updateWorkflowStep('upload');
}

function makeDefaultEnvironmentGuess() {
    return { type: 'unknown', confidence: 0.5, reason: 'Awaiting photo analysis' };
}

function getAuthToken() {
    return localStorage.getItem('authToken');
}

function normalizeEnvironment(env) {
    if (!env) return makeDefaultEnvironmentGuess();
    if (typeof env === 'string') {
        return { type: env.toLowerCase().includes('out') ? 'outdoor' : 'indoor', confidence: 0.7, reason: 'Backend classification' };
    }
    return {
        type: env.type || 'unknown',
        confidence: env.confidence || 0.6,
        reason: env.reason || 'Backend classification'
    };
}

function estimateEnvironmentFromImage(imgEl, fileName = '') {
    const name = (fileName || '').toLowerCase();
    const indoorHints = ['indoor', 'room', 'office', 'desk', 'table', 'living', 'bed'];
    const outdoorHints = ['garden', 'lawn', 'park', 'terrace', 'balcony', 'outdoor'];
    let scoreIndoor = 0;
    let scoreOutdoor = 0;

    indoorHints.forEach(h => { if (name.includes(h)) scoreIndoor += 0.6; });
    outdoorHints.forEach(h => { if (name.includes(h)) scoreOutdoor += 0.6; });

    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const w = Math.min(imgEl.naturalWidth || imgEl.width || 0, 200);
        const h = Math.min(imgEl.naturalHeight || imgEl.height || 0, 200);
        if (w > 0 && h > 0) {
            canvas.width = w;
            canvas.height = h;
            ctx.drawImage(imgEl, 0, 0, w, h);
            const data = ctx.getImageData(0, 0, w, h).data;
            let brightSum = 0, blueSum = 0, greenSum = 0, samples = 0;
            for (let i = 0; i < data.length; i += 16) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const avg = (r + g + b) / 3;
                brightSum += avg;
                blueSum += b;
                greenSum += g;
                samples++;
            }
            const avgBright = brightSum / samples;
            const colorSum = Math.max(blueSum + greenSum, 1);
            const blueShare = blueSum / colorSum;

            if (avgBright > 175) scoreOutdoor += 1.1;
            if (avgBright < 140) scoreIndoor += 1.0;
            if (blueShare > 0.32 && avgBright > 150) scoreOutdoor += 0.8; // sky/light hint
            if (greenSum > blueSum && avgBright < 165) scoreIndoor += 0.3; // softer indoor light
        }
    } catch (err) {
        // Fallback silently if canvas read fails
    }

    const type = scoreOutdoor > scoreIndoor ? 'outdoor' : 'indoor';
    const confidence = Math.min(0.9, Math.max(0.55, 0.5 + Math.abs(scoreOutdoor - scoreIndoor) * 0.3));
    const reason = scoreOutdoor > scoreIndoor ? 'Bright/sky tones indicate outdoor light' : 'Softer light and no sky tones indicate indoor/balcony';
    return { type, confidence: Number(confidence.toFixed(2)), reason };
}

function buildSoilPlan(envInfo = makeDefaultEnvironmentGuess(), diseaseMeta = {}) {
    const envType = envInfo.type === 'outdoor' ? 'outdoor' : (envInfo.type === 'indoor' ? 'indoor' : 'indoor');
    const confidence = envInfo.confidence ? Math.round(envInfo.confidence * 100) : 0;
    const month = new Date().getMonth();
    const isMonsoon = month >= 5 && month <= 8; // Jun-Sep
    const isSummer = month >= 2 && month <= 5;  // Mar-Jun
    const items = [];

    if (diseaseMeta.key === 'root-rot' || diseaseMeta.severity === 'severe') {
        items.push('Repot in a fresh, airy mix; remove soggy soil and ensure drainage holes are clear to stop rot from spreading.');
    }

    if (envType === 'outdoor') {
        items.push('Outdoor mix for Indian weather: ~40% garden soil + 30% vermicompost/compost + 20% cocopeat + 10% river sand/perlite for drainage.');
        items.push('Mulch lightly with cocopeat/leaf mulch in summer; during monsoon, reduce cocopeat and add extra sand to avoid waterlogging.');
        items.push('Feed a balanced organic fertilizer (All in One/Plant Diet) every 20-25 days; add a handful of vermicompost near the root zone.');
        items.push('Top-dress with 1-2 tbsp neem cake monthly to keep soil pests down; keep pots raised so water does not pool in rains.');
    } else {
        items.push('Indoor/balcony mix: ~30% garden soil + 40% cocopeat + 20% vermicompost + 10% perlite/sand for breathable, light soil.');
        items.push('Use half-strength liquid feed (seaweed/plant booster) every 15 days in summer, monthly in winter; flush with plain water once a month.');
        items.push('Top-dress with 1-2 tbsp neem cake + a small handful of vermicompost every 30-40 days to keep nutrients steady and pests low.');
        items.push('Water only when the top inch dries; in humid/monsoon weather, cut watering frequency to prevent fungus and gnats.');
    }

    if (isMonsoon) {
        items.push('Monsoon note: shift pots under cover during heavy rain, cut nitrogen doses in half, and favor faster-draining sand/perlite.');
    } else if (isSummer) {
        items.push('Summer note: water early morning, add a thin cocopeat or leaf mulch to slow evaporation, and provide noon shade for tender plants.');
    }

    const intro = envType === 'outdoor'
        ? 'Photo looks outdoor - keep mix airy for rain/heat while feeding steadily.'
        : 'Photo looks indoor/balcony - keep soil light, well-draining, and gentle on roots.';

    const badge = envInfo.type === 'unknown'
        ? 'Photo check pending'
        : `${envType === 'outdoor' ? 'Outdoor' : 'Indoor'} | ${confidence || 'est.'}%`;

    return { type: envType, badge, intro, items };
}

// =============================================
// ANALYSIS LOGIC
// =============================================
// Store pending plant check for re-analysis after questionnaire
let pendingPlantCheck = null;
let pendingUserObservation = null;

async function analyzePlant(userObservation = null) {
    if (!requireLogin()) return;
    if (!selectedFile) return;

    // Fast gate: detect if the photo even looks like a plant/leaf/grass before doing AI calls
    const plantCheck = await quickPlantCheck(selectedFile);
    pendingPlantCheck = plantCheck;

    if (!plantCheck.isPlant) {
        displayResults({
            notPlant: true,
            message: 'This photo does not look like a plant. Please retake a clear photo of leaves/stems.',
            detail: plantCheck.reason
        }, environmentGuess, plantCheck);
        return;
    }

    const analyzeBtn = document.getElementById('analyzeBtn');
    analyzeBtn.disabled = true;
    previewZone.querySelector('.preview-img-wrap').style.display = 'none';
    analyzeBtn.style.display = 'none';
    updateWorkflowStep('analyze');
    
    // Hide questionnaire during analysis
    const qForm = document.getElementById('observationForm');
    if (qForm) qForm.style.display = 'none';

    const loading = document.getElementById('scanLoading');
    loading.style.display = 'block';

    let analysisDone = false;
    const analysisPromise = (async () => {
        try {
            const backendResult = await analyzeWithBackend(plantCheck, userObservation);
            if (backendResult.environment) {
                environmentGuess = normalizeEnvironment(backendResult.environment);
            }
            return backendResult;
        } catch {
            return analyzeLocally(plantCheck, userObservation);
        } finally {
            analysisDone = true;
        }
    })();

    // Animate quickly while analysis runs; stop early once analysis finishes.
    const steps = ['ls1', 'ls2', 'ls3', 'ls4', 'ls5'];
    for (let i = 0; i < steps.length; i++) {
        await delay(180);
        steps.forEach(s => document.getElementById(s).classList.remove('active'));
        document.getElementById(steps[i]).classList.add('active');
        if (analysisDone && i >= 1) break;
    }

    const result = await analysisPromise;
    await delay(120);
    loading.style.display = 'none';
    displayResults(result, environmentGuess, plantCheck);
}

function buildObservationPayload(plantCheck = {}, userObservation = null) {
    const stats = plantCheck.stats || {};
    const green = stats.greenRatio || 0;
    const wood = stats.woodRatio || 0;
    const variance = stats.brightnessVar || 0;
    const yellow = stats.yellowRatio || 0;
    const white = stats.whiteRatio || 0;
    const darkSpot = stats.darkSpotRatio || 0;
    const orange = stats.orangeRatio || 0;

    // Derive leaf color from image analysis (more accurate)
    let leafColor = 'green';
    if (yellow > 0.10) leafColor = 'yellow';
    else if (green < 0.12 && wood > 0.10) leafColor = 'brown';
    else if (green < 0.16) leafColor = 'pale-green';

    // Derive texture from patterns
    let leafTexture = 'normal';
    if (white > 0.05) leafTexture = 'powdery';
    else if (darkSpot > 0.03 || variance > 800) leafTexture = 'spotted';
    else if (wood > 0.10 && green < 0.15) leafTexture = 'droopy';

    // Auto-detect symptoms from image analysis
    const autoSymptoms = [];
    if (yellow > 0.10) autoSymptoms.push('yellowing leaves');
    if (white > 0.05) autoSymptoms.push('white powder on leaves');
    if (darkSpot > 0.03) autoSymptoms.push('brown spots on leaves');
    if (orange > 0.03) autoSymptoms.push('orange/rust colored spots');
    if (wood > 0.12 && green < 0.12) autoSymptoms.push('wilting with wet soil');
    if (white > 0.03 && white < 0.15 && green > 0.10) autoSymptoms.push('white cottony masses on stems');
    if (yellow > 0.05 && variance > 500) autoSymptoms.push('curled new leaves');

    // Merge user-provided observation if available
    const userLeaf = userObservation?.leafCondition || {};
    const userSoil = userObservation?.soilCondition || {};
    const userSymptoms = userObservation?.symptoms || [];
    const mergedSymptoms = [...new Set([...autoSymptoms, ...userSymptoms])];
    const suggestedPlantName = plantCheck && plantCheck.suggestedPlant ? plantCheck.suggestedPlant.name : '';

    return {
        source: 'scanner',
        plantName: userObservation?.plantName || suggestedPlantName || 'unknown',
        symptoms: mergedSymptoms,
        leafCondition: {
            color: userLeaf.color || leafColor,
            texture: userLeaf.texture || leafTexture,
            hasSpots: userLeaf.hasSpots !== undefined ? userLeaf.hasSpots : (darkSpot > 0.03 || variance > 800),
            isWilting: userLeaf.isWilting !== undefined ? userLeaf.isWilting : (wood > 0.10 && green < 0.15),
            hasPests: userLeaf.hasPests !== undefined ? userLeaf.hasPests : (white > 0.03 && white < 0.15 && green > 0.10)
        },
        soilCondition: {
            moisture: userSoil.moisture || 'unknown',
            drainage: userSoil.drainage || 'unknown',
            smell: userSoil.smell || 'unknown',
            texture: userSoil.texture || 'unknown'
        },
        environment: {
            locationType: environmentGuess.type || 'unknown',
            sunlightHours: environmentGuess.type === 'outdoor' ? 6 : 4,
            humidity: 60,
            temperatureC: 28
        },
        // Pass image analysis metadata to backend for logging
        imageAnalysis: {
            greenRatio: green,
            yellowRatio: yellow,
            whiteRatio: white,
            darkSpotRatio: darkSpot,
            orangeRatio: orange,
            woodRatio: wood,
            brightnessVar: variance,
            exgRatio: stats.exgRatio || 0,
            neutralRatio: stats.neutralRatio || 0,
            saturationMean: stats.saturationMean || 0,
            healthScore: plantCheck.health?.score || 50
        },
        plantSuggestion: {
            name: suggestedPlantName || undefined,
            confidence: plantCheck?.suggestedPlant?.confidence || undefined,
            alternatives: (plantCheck?.suggestedPlantAlternatives || []).map(p => p.name)
        }
    };
}

async function analyzeWithBackend(plantCheck = {}, userObservation = null) {
    const observation = buildObservationPayload(plantCheck, userObservation);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    let res;
    try {
        res = await fetch(`${BACKEND_URL}/api/plant-scanner/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(observation),
            signal: controller.signal
        });
    } finally {
        clearTimeout(timeoutId);
    }

    if (!res.ok) throw new Error('Backend unavailable');
    const data = await res.json();

    if (data.status === 'insufficient-match') {
        return {
            notPlant: true,
            message: 'Need a little more detail to verify diagnosis.',
            detail: data.askFor?.length
                ? `Please provide: ${data.askFor.join(', ')}`
                : 'Please share leaf and soil details for an exact result.'
        };
    }

    return data;
}

function analyzeLocally(plantCheck = { isPlant: true }, userObservation = null) {
    if (!plantCheck.isPlant) {
        return {
            notPlant: true,
            message: 'Photo likely not a plant. Please retake a clearer plant image.',
            detail: plantCheck.reason
        };
    }

    const health = plantCheck.health || { score: 50, isHealthy: false, isStressed: true, isSevere: false };
    const diseaseScores = plantCheck.diseaseScores || [];

    // If plant looks genuinely healthy based on deep analysis
    if (health.isHealthy && (!diseaseScores.length || diseaseScores[0].score < 0.20)) {
        return {
            success: true,
            healthy: true,
            plantName: userObservation?.plantName || plantCheck?.suggestedPlant?.name || 'Unknown Plant',
            plantSuggestionConfidence: plantCheck?.suggestedPlant?.confidence || 0,
            plantSuggestions: (plantCheck?.suggestedPlantAlternatives || []).map(p => p.name),
            confidence: Math.min(0.92, 0.70 + health.score * 0.003),
            source: 'local-deep',
            description: 'Multi-zone color analysis shows healthy chlorophyll levels, minimal stress markers, and no disease patterns detected.',
            detailedSignals: ['Green coverage: strong', 'No brown spots or lesions', 'No white/powdery patches', 'No yellowing pattern', 'Brightness distribution: normal'],
            products: ['Plant Booster Spray', 'Vermi Compost'],
            environment: environmentGuess
        };
    }

    // Use deep pattern scoring to pick the best disease match
    let diseaseKey = null;
    let matchScore = 0;
    let matchSignals = [];

    if (diseaseScores.length > 0 && diseaseScores[0].score >= 0.15) {
        diseaseKey = diseaseScores[0].key;
        matchScore = diseaseScores[0].score;
        matchSignals = diseaseScores[0].signals || [];
    }

    // Also factor in user-selected symptoms (if observation questionnaire was filled)
    if (userObservation && userObservation.symptoms && userObservation.symptoms.length) {
        const userSymptoms = userObservation.symptoms.map(s => s.toLowerCase());
        // Boost scores for diseases whose symptoms match user input
        const symptomBoosts = {
            'yellow-leaves': ['yellow', 'yellowing', 'pale', 'chlorosis'],
            'powdery-mildew': ['white powder', 'powdery', 'white coating'],
            'leaf-spot': ['brown spots', 'black spots', 'spots', 'lesions'],
            'aphids': ['insects', 'bugs', 'sticky', 'tiny insects', 'curled leaves'],
            'root-rot': ['wilting', 'mushy', 'foul smell', 'rotting', 'overwatered'],
            'mealybugs': ['white cottony', 'white clusters', 'cottony', 'mealybugs'],
            'whitefly': ['white flies', 'tiny flies', 'whitefly'],
            'rust': ['orange spots', 'rust', 'orange pustules'],
            'spider-mites': ['webbing', 'stippling', 'tiny dots', 'spider mites'],
            'sunburn': ['bleached', 'scorched', 'sun damage', 'crispy edges'],
            'nitrogen-deficiency': ['pale green', 'stunted', 'slow growth', 'weak stems'],
            'blight': ['rapid browning', 'water soaked', 'blight'],
        };

        for (const [dKey, keywords] of Object.entries(symptomBoosts)) {
            const hits = userSymptoms.filter(s => keywords.some(k => s.includes(k) || k.includes(s))).length;
            if (hits > 0) {
                const existingEntry = diseaseScores.find(d => d.key === dKey);
                const boostedScore = (existingEntry ? existingEntry.score : 0.10) + hits * 0.15;
                if (boostedScore > matchScore) {
                    diseaseKey = dKey;
                    matchScore = boostedScore;
                    matchSignals = existingEntry ? [...existingEntry.signals, 'User-confirmed symptoms boost'] : ['Matched from user-reported symptoms'];
                }
            }
        }
    }

    // Fallback: if no disease scored high enough, use the best available
    if (!diseaseKey) {
        const stats = plantCheck.stats || {};
        if (stats.yellowRatio > 0.08 || stats.greenRatio < 0.16) {
            diseaseKey = 'yellow-leaves';
            matchSignals = ['Low green ratio suggests nutrient stress'];
        } else if (stats.brightnessVar > 800) {
            diseaseKey = 'leaf-spot';
            matchSignals = ['High brightness variance suggests spots/lesions'];
        } else {
            diseaseKey = 'yellow-leaves';
            matchSignals = ['General stress indicator — more details needed for precision'];
        }
        matchScore = 0.35;
    }

    const disease = DISEASE_DB[diseaseKey];
    if (!disease) {
        return {
            success: true,
            healthy: false,
            confidence: 0.40,
            source: 'local-deep',
            description: 'Some stress signals detected but could not match a specific disease. Please use the questionnaire below for a more accurate diagnosis.',
            products: ['Neem Oil', 'Plant Protection Spray'],
            environment: environmentGuess,
            needsMoreInfo: true
        };
    }

    // Calibrate confidence based on actual match quality
    const calibratedConfidence = Math.min(0.93, Math.max(0.35, 0.30 + matchScore * 0.65));

    // Build runner-up suggestions for differential diagnosis
    const runnerUps = diseaseScores
        .filter(d => d.key !== diseaseKey && d.score >= 0.15)
        .slice(0, 2)
        .map(d => ({ key: d.key, name: DISEASE_DB[d.key]?.name || d.key, score: d.score, signals: d.signals }));

    return {
        success: true,
        diseaseKey,
        disease: disease.name,
        plantName: userObservation?.plantName || plantCheck?.suggestedPlant?.name || 'Unknown Plant',
        plantSuggestionConfidence: plantCheck?.suggestedPlant?.confidence || 0,
        plantSuggestions: (plantCheck?.suggestedPlantAlternatives || []).map(p => p.name),
        severity: disease.severity,
        description: disease.description,
        cause: disease.cause,
        symptoms: disease.symptoms,
        remedies: disease.remedies,
        prevention: disease.prevention,
        products: disease.products,
        confidence: Number(calibratedConfidence.toFixed(2)),
        source: 'local-deep',
        environment: environmentGuess,
        detailedSignals: matchSignals,
        runnerUps,
        needsMoreInfo: calibratedConfidence < 0.60,
        healthScore: health.score
    };
}

// =============================================
// DEEP IMAGE ANALYSIS ENGINE (Multi-zone + Color Histogram + Pattern Detection)
// =============================================

/**
 * Analyze a specific rectangular region of pixel data.
 * Returns detailed color distribution stats for that zone.
 */
function analyzeZone(data, imgWidth, x0, y0, x1, y1) {
    let greenish = 0, strongGreen = 0, brownish = 0, yellowish = 0;
    let whitish = 0, darkSpots = 0, orangeRust = 0, total = 0;
    let brightSum = 0, brightSqSum = 0;
    let rSum = 0, gSum = 0, bSum = 0;
    let exgPositive = 0, neutralish = 0, satSum = 0;

    for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
            const i = (y * imgWidth + x) * 4;
            const r = data[i], g = data[i + 1], b = data[i + 2];
            const bright = (r + g + b) / 3;
            const sum = r + g + b || 1;
            const greenShare = g / sum;
            const maxC = Math.max(r, g, b);
            const minC = Math.min(r, g, b);
            const sat = maxC > 0 ? (maxC - minC) / maxC : 0;
            const exg = (2 * g) - r - b;

            // Plant green detection
            if (g > r * 1.1 && g > b * 1.1) {
                greenish++;
                if (greenShare > 0.4) strongGreen++;
            }
            // Brown/dry tissue (wood, dry leaves, necrotic areas)
            if (r > 90 && g > 60 && g < r * 0.92 && b < g * 0.8) brownish++;
            // Yellowing (chlorosis indicator)
            if (r > 150 && g > 140 && b < 100 && Math.abs(r - g) < 50) yellowish++;
            // White/powdery patches (powdery mildew, mealybugs)
            if (r > 210 && g > 210 && b > 210 && Math.abs(r - g) < 20 && Math.abs(g - b) < 20) whitish++;
            // Dark spots (necrotic lesions, sooty mold)
            if (bright < 60 && Math.abs(r - g) < 20) darkSpots++;
            // Orange/rust pustules
            if (r > 160 && g > 80 && g < 150 && b < 80 && r > g * 1.2) orangeRust++;
            if (exg > 24) exgPositive++;
            if (sat < 0.12) neutralish++;

            brightSum += bright;
            brightSqSum += bright * bright;
            rSum += r; gSum += g; bSum += b;
            satSum += sat;
            total++;
        }
    }

    if (total === 0) total = 1;
    const meanBright = brightSum / total;
    const variance = brightSqSum / total - meanBright * meanBright;

    return {
        greenRatio: greenish / total,
        strongGreenRatio: strongGreen / total,
        woodRatio: brownish / total,
        yellowRatio: yellowish / total,
        whiteRatio: whitish / total,
        darkSpotRatio: darkSpots / total,
        orangeRatio: orangeRust / total,
        brightnessMean: meanBright,
        brightnessVar: variance,
        avgR: rSum / total,
        avgG: gSum / total,
        avgB: bSum / total,
        exgRatio: exgPositive / total,
        neutralRatio: neutralish / total,
        saturationMean: satSum / total,
        total
    };
}

/**
 * Score how strongly each disease pattern matches the image analysis.
 * Returns an array of { key, score, signals } sorted by score descending.
 */
function scoreDiseasePatterns(zoneStats) {
    const { center, edges, full } = zoneStats;
    const scores = [];

    // 1. Powdery Mildew — white patches on leaf surface
    {
        let s = 0;
        const signals = [];
        if (full.whiteRatio > 0.05) { s += 0.35; signals.push('white patches detected (' + (full.whiteRatio * 100).toFixed(1) + '%)'); }
        if (center.whiteRatio > 0.08) { s += 0.20; signals.push('concentrated white on leaf center'); }
        if (full.greenRatio > 0.10) { s += 0.10; signals.push('green tissue still present — partial coverage'); }
        if (full.brightnessVar > 600) { s += 0.10; signals.push('high brightness contrast (powder vs leaf)'); }
        scores.push({ key: 'powdery-mildew', score: Math.min(s, 0.95), signals });
    }

    // 2. Leaf Spot — brown/dark spots with high variance
    {
        let s = 0;
        const signals = [];
        if (full.darkSpotRatio > 0.03) { s += 0.25; signals.push('dark lesions detected (' + (full.darkSpotRatio * 100).toFixed(1) + '%)'); }
        if (full.woodRatio > 0.06 && full.woodRatio < 0.25) { s += 0.20; signals.push('brown necrotic tissue present'); }
        if (full.brightnessVar > 800) { s += 0.15; signals.push('high contrast — spots against healthy tissue'); }
        if (center.darkSpotRatio > edges.darkSpotRatio) { s += 0.10; signals.push('spots concentrated in center zone'); }
        if (full.greenRatio > 0.10) { s += 0.05; signals.push('surrounding healthy green tissue'); }
        scores.push({ key: 'leaf-spot', score: Math.min(s, 0.95), signals });
    }

    // 3. Aphids/Pests — lush green with potential honeydew shine
    {
        let s = 0;
        const signals = [];
        if (full.strongGreenRatio > 0.12) { s += 0.15; signals.push('healthy green foliage — common aphid host'); }
        if (full.yellowRatio > 0.03 && full.yellowRatio < 0.15) { s += 0.15; signals.push('mild yellowing from sap drain'); }
        if (full.brightnessMean > 130 && full.brightnessVar > 400) { s += 0.10; signals.push('shiny/sticky patches (honeydew hint)'); }
        scores.push({ key: 'aphids', score: Math.min(s, 0.85), signals });
    }

    // 4. Yellow Leaves — widespread yellowing
    {
        let s = 0;
        const signals = [];
        if (full.yellowRatio > 0.10) { s += 0.30; signals.push('significant yellowing (' + (full.yellowRatio * 100).toFixed(1) + '%)'); }
        if (full.yellowRatio > 0.20) { s += 0.15; signals.push('heavy chlorosis pattern'); }
        if (full.greenRatio < 0.15) { s += 0.15; signals.push('low green — unhealthy chlorophyll levels'); }
        if (edges.yellowRatio > center.yellowRatio) { s += 0.10; signals.push('yellowing starts from edges (nutrient deficiency pattern)'); }
        scores.push({ key: 'yellow-leaves', score: Math.min(s, 0.95), signals });
    }

    // 5. Root Rot — wilted appearance, dark/dull tones
    {
        let s = 0;
        const signals = [];
        if (full.woodRatio > 0.12) { s += 0.20; signals.push('significant brown/dry tissue'); }
        if (full.greenRatio < 0.12) { s += 0.15; signals.push('very low green — severe stress'); }
        if (full.darkSpotRatio > 0.05) { s += 0.10; signals.push('dark rotting patterns'); }
        if (full.brightnessMean < 110) { s += 0.10; signals.push('overall dark/dull appearance'); }
        scores.push({ key: 'root-rot', score: Math.min(s, 0.90), signals });
    }

    // 6. Mealybugs — white cottony clusters
    {
        let s = 0;
        const signals = [];
        if (full.whiteRatio > 0.03 && full.whiteRatio < 0.15) { s += 0.20; signals.push('white clusters detected'); }
        if (full.greenRatio > 0.12) { s += 0.10; signals.push('on green tissue background'); }
        // Distinguish from powdery mildew: mealybugs are more localized, less uniform
        if (center.whiteRatio < edges.whiteRatio && full.whiteRatio > 0.03) { s += 0.10; signals.push('white patches at joints/edges (mealybug pattern)'); }
        scores.push({ key: 'mealybugs', score: Math.min(s, 0.85), signals });
    }

    // 7. Whitefly — small white specks
    {
        let s = 0;
        const signals = [];
        if (full.whiteRatio > 0.02 && full.whiteRatio < 0.10) { s += 0.15; signals.push('scattered white specks'); }
        if (full.yellowRatio > 0.05) { s += 0.10; signals.push('yellow stippling from feeding damage'); }
        if (full.greenRatio > 0.10) { s += 0.05; signals.push('on green foliage'); }
        scores.push({ key: 'whitefly', score: Math.min(s, 0.80), signals });
    }

    // 8. Rust Disease — orange/rust pustules
    {
        let s = 0;
        const signals = [];
        if (full.orangeRatio > 0.03) { s += 0.35; signals.push('orange/rust-colored areas (' + (full.orangeRatio * 100).toFixed(1) + '%)'); }
        if (full.orangeRatio > 0.08) { s += 0.15; signals.push('heavy rust pustule coverage'); }
        if (full.greenRatio > 0.08) { s += 0.05; signals.push('surrounding green tissue present'); }
        if (full.brightnessVar > 500) { s += 0.10; signals.push('contrasting pustule pattern'); }
        scores.push({ key: 'rust', score: Math.min(s, 0.95), signals });
    }

    // 9. Spider Mites — stippling (tiny dots), bronzing
    {
        let s = 0;
        const signals = [];
        if (full.yellowRatio > 0.05 && full.brightnessVar > 500 && full.brightnessVar < 1200) { s += 0.20; signals.push('fine stippling pattern detected'); }
        if (full.woodRatio > 0.06 && full.orangeRatio > 0.01) { s += 0.15; signals.push('bronzing discoloration'); }
        scores.push({ key: 'spider-mites', score: Math.min(s, 0.80), signals });
    }

    // 10. Sunburn — white/bleached + brown crispy edges
    {
        let s = 0;
        const signals = [];
        if (edges.woodRatio > center.woodRatio * 1.5 && edges.woodRatio > 0.08) { s += 0.25; signals.push('brown crispy edges'); }
        if (full.whiteRatio > 0.04 && full.brightnessMean > 155) { s += 0.15; signals.push('bleached/sun-scorched patches'); }
        if (full.greenRatio > 0.08 && full.greenRatio < 0.25) { s += 0.05; signals.push('faded green — UV damage'); }
        scores.push({ key: 'sunburn', score: Math.min(s, 0.85), signals });
    }

    // 11. Nitrogen Deficiency — overall pale, uniform yellowing
    {
        let s = 0;
        const signals = [];
        if (full.yellowRatio > 0.08 && full.brightnessVar < 500) { s += 0.25; signals.push('uniform pale/yellow with low variance (deficiency pattern)'); }
        if (full.greenRatio < 0.18 && full.greenRatio > 0.06) { s += 0.15; signals.push('reduced but present chlorophyll'); }
        if (Math.abs(center.yellowRatio - edges.yellowRatio) < 0.04) { s += 0.10; signals.push('uniform yellowing across leaf'); }
        scores.push({ key: 'nitrogen-deficiency', score: Math.min(s, 0.85), signals });
    }

    // 12. Fungal Wilt — one-sided, wilt + brown vascular
    {
        let s = 0;
        const signals = [];
        if (full.woodRatio > 0.10 && full.greenRatio > 0.05 && full.greenRatio < 0.20) { s += 0.20; signals.push('mixed live/dead tissue — wilt pattern'); }
        if (full.brightnessMean < 130 && full.woodRatio > 0.12) { s += 0.15; signals.push('dark, wilted appearance'); }
        scores.push({ key: 'fungal-wilt', score: Math.min(s, 0.80), signals });
    }

    // 13. Blight — large brown water-soaked patches
    {
        let s = 0;
        const signals = [];
        if (full.woodRatio > 0.15) { s += 0.20; signals.push('extensive brown tissue'); }
        if (full.darkSpotRatio > 0.04 && full.woodRatio > 0.10) { s += 0.15; signals.push('combined dark + brown lesions (blight pattern)'); }
        if (full.greenRatio < 0.15) { s += 0.10; signals.push('significant tissue loss'); }
        scores.push({ key: 'blight', score: Math.min(s, 0.85), signals });
    }

    // 14. Damping Off — base browning + overall collapse
    {
        let s = 0;
        const signals = [];
        if (full.woodRatio > 0.10 && full.brightnessMean < 120) { s += 0.15; signals.push('dark rotting tissue'); }
        if (full.greenRatio < 0.10) { s += 0.15; signals.push('very low vitality'); }
        scores.push({ key: 'damping-off', score: Math.min(s, 0.75), signals });
    }

    // 15. Scale Insects — small brown bumps
    {
        let s = 0;
        const signals = [];
        if (full.woodRatio > 0.05 && full.woodRatio < 0.18 && full.greenRatio > 0.12) { s += 0.15; signals.push('brown specks on green tissue'); }
        if (full.brightnessVar > 600 && full.darkSpotRatio > 0.02) { s += 0.10; signals.push('spotted bumpy texture'); }
        scores.push({ key: 'scale-insects', score: Math.min(s, 0.75), signals });
    }

    scores.sort((a, b) => b.score - a.score);
    return scores;
}

/**
 * Determine if plant looks healthy based on deep analysis.
 * More granular than the old binary check.
 */
function assessPlantHealth(zoneStats) {
    const f = zoneStats.full;
    const healthScore =
        (f.greenRatio > 0.20 ? 25 : f.greenRatio > 0.14 ? 15 : 0) +
        (f.strongGreenRatio > 0.08 ? 20 : f.strongGreenRatio > 0.04 ? 10 : 0) +
        (f.yellowRatio < 0.05 ? 15 : f.yellowRatio < 0.10 ? 8 : 0) +
        (f.whiteRatio < 0.03 ? 10 : 0) +
        (f.darkSpotRatio < 0.02 ? 10 : 0) +
        (f.orangeRatio < 0.02 ? 10 : 0) +
        (f.woodRatio < 0.08 ? 10 : f.woodRatio < 0.12 ? 5 : 0);

    return {
        score: healthScore,
        isHealthy: healthScore >= 75,
        isStressed: healthScore >= 40 && healthScore < 75,
        isSevere: healthScore < 40
    };
}

// Lightweight plant vs. non-plant gate + DEEP multi-zone analysis
function quickPlantCheck(file) {
    return new Promise((resolve) => {
        const url = URL.createObjectURL(file);
        const img = new Image();

        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const size = 192; // higher resolution for better pattern detection
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, size, size);
                const data = ctx.getImageData(0, 0, size, size).data;

                // ===== MULTI-ZONE ANALYSIS =====
                // Full image
                const fullZone = analyzeZone(data, size, 0, 0, size, size);
                // Center zone (inner 50% — usually the main leaf/plant area)
                const margin = Math.floor(size * 0.25);
                const centerZone = analyzeZone(data, size, margin, margin, size - margin, size - margin);
                // Edge zone (outer ring — leaf edges, background)
                // We compute edge by subtracting center contribution from full
                const edgeTotal = fullZone.total - centerZone.total;
                const edgeZone = {
                    greenRatio: edgeTotal > 0 ? Math.max(0, (fullZone.greenRatio * fullZone.total - centerZone.greenRatio * centerZone.total) / edgeTotal) : 0,
                    strongGreenRatio: edgeTotal > 0 ? Math.max(0, (fullZone.strongGreenRatio * fullZone.total - centerZone.strongGreenRatio * centerZone.total) / edgeTotal) : 0,
                    woodRatio: edgeTotal > 0 ? Math.max(0, (fullZone.woodRatio * fullZone.total - centerZone.woodRatio * centerZone.total) / edgeTotal) : 0,
                    yellowRatio: edgeTotal > 0 ? Math.max(0, (fullZone.yellowRatio * fullZone.total - centerZone.yellowRatio * centerZone.total) / edgeTotal) : 0,
                    whiteRatio: edgeTotal > 0 ? Math.max(0, (fullZone.whiteRatio * fullZone.total - centerZone.whiteRatio * centerZone.total) / edgeTotal) : 0,
                    darkSpotRatio: edgeTotal > 0 ? Math.max(0, (fullZone.darkSpotRatio * fullZone.total - centerZone.darkSpotRatio * centerZone.total) / edgeTotal) : 0,
                    orangeRatio: edgeTotal > 0 ? Math.max(0, (fullZone.orangeRatio * fullZone.total - centerZone.orangeRatio * centerZone.total) / edgeTotal) : 0,
                    exgRatio: edgeTotal > 0 ? Math.max(0, (fullZone.exgRatio * fullZone.total - centerZone.exgRatio * centerZone.total) / edgeTotal) : 0,
                    neutralRatio: edgeTotal > 0 ? Math.max(0, (fullZone.neutralRatio * fullZone.total - centerZone.neutralRatio * centerZone.total) / edgeTotal) : 0,
                    saturationMean: fullZone.saturationMean,
                    brightnessMean: fullZone.brightnessMean,
                    brightnessVar: fullZone.brightnessVar,
                    total: edgeTotal
                };

                const zoneStats = { full: fullZone, center: centerZone, edges: edgeZone };

                // ===== PLANT-OR-NOT CHECK =====
                const vegSignal =
                    (fullZone.strongGreenRatio * 0.55) +
                    (fullZone.greenRatio * 0.30) +
                    (fullZone.exgRatio * 0.35) -
                    (fullZone.woodRatio * 0.40) -
                    (fullZone.neutralRatio * 0.18);

                const veryLowVegPattern =
                    fullZone.greenRatio < 0.025 &&
                    fullZone.strongGreenRatio < 0.006 &&
                    fullZone.exgRatio < 0.03 &&
                    fullZone.brightnessVar < 220;

                const woodNeutralPattern =
                    fullZone.greenRatio < 0.02 &&
                    fullZone.exgRatio < 0.025 &&
                    fullZone.woodRatio > 0.18 &&
                    fullZone.neutralRatio > 0.42;

                const artificialUniformPattern =
                    fullZone.greenRatio < 0.09 &&
                    fullZone.exgRatio < 0.10 &&
                    fullZone.brightnessVar < 90 &&
                    fullZone.saturationMean < 0.15;

                const likelyNonPlant = veryLowVegPattern || woodNeutralPattern || artificialUniformPattern;
                const likelyPlant =
                    fullZone.greenRatio > 0.11 ||
                    fullZone.strongGreenRatio > 0.04 ||
                    fullZone.exgRatio > 0.16;

                const isPlant = likelyPlant || (!likelyNonPlant && vegSignal > -0.02);

                // ===== DISEASE PATTERN SCORING =====
                const diseaseScores = scoreDiseasePatterns(zoneStats);
                const healthAssessment = assessPlantHealth(zoneStats);

                const statsPayload = {
                    greenRatio: Number(fullZone.greenRatio.toFixed(3)),
                    strongGreenRatio: Number(fullZone.strongGreenRatio.toFixed(3)),
                    woodRatio: Number(fullZone.woodRatio.toFixed(3)),
                    yellowRatio: Number(fullZone.yellowRatio.toFixed(3)),
                    whiteRatio: Number(fullZone.whiteRatio.toFixed(3)),
                    darkSpotRatio: Number(fullZone.darkSpotRatio.toFixed(3)),
                    orangeRatio: Number(fullZone.orangeRatio.toFixed(3)),
                    exgRatio: Number(fullZone.exgRatio.toFixed(3)),
                    neutralRatio: Number(fullZone.neutralRatio.toFixed(3)),
                    saturationMean: Number(fullZone.saturationMean.toFixed(3)),
                    vegSignal: Number(vegSignal.toFixed(3)),
                    brightnessMean: Number(fullZone.brightnessMean.toFixed(1)),
                    brightnessVar: Number(fullZone.brightnessVar.toFixed(1))
                };

                const plantSuggestion = suggestPlantName({ isPlant, stats: statsPayload }, file ? file.name : '', environmentGuess);

                resolve({
                    isPlant,
                    score: Number((fullZone.greenRatio + fullZone.strongGreenRatio).toFixed(2)),
                    reason: isPlant
                        ? 'Plant-like color and vegetation texture signal detected'
                        : 'Low vegetation signal with non-plant texture pattern',
                    stats: statsPayload,
                    zones: zoneStats,
                    diseaseScores: diseaseScores.slice(0, 5), // top 5 matches
                    health: healthAssessment,
                    suggestedPlant: plantSuggestion.primary,
                    suggestedPlantAlternatives: plantSuggestion.alternatives
                });
            } catch (err) {
                resolve({ isPlant: true, score: 0, reason: 'Image read issue, skipping pre-check', diseaseScores: [], health: { score: 50, isHealthy: false, isStressed: true, isSevere: false } });
            } finally {
                URL.revokeObjectURL(url);
            }
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve({ isPlant: true, score: 0, reason: 'Image decode issue; skipping pre-check', diseaseScores: [], health: { score: 50, isHealthy: false, isStressed: true, isSevere: false } });
        };

        img.src = url;
    });
}

// =============================================
// DISPLAY RESULTS
// =============================================
async function displayResults(data, envInfo = environmentGuess, plantCheck = null) {
    const results = document.getElementById('scanResults');
    results.style.display = 'block';
    updateWorkflowStep('result');

    // Look up from DB if backend returned a key
    let diseaseData;
    if (data.diseaseKey && DISEASE_DB[data.diseaseKey]) {
        diseaseData = DISEASE_DB[data.diseaseKey];
    } else {
        diseaseData = data;
    }

    // Status header
    const statusEl = document.getElementById('resultStatus');
    const plantLabel = data.plantName || data.plant || '';

    if (data.notPlant) {
        statusEl.className = 'result-status diseased';
        statusEl.innerHTML = buildNotPlantStatusHtml(data, plantCheck);
        document.getElementById('diseaseCard').style.display = 'none';
        document.querySelector('.remedies-card').style.display = 'none';
        var energyCardEl = document.getElementById('energyCard');
        if (energyCardEl) energyCardEl.style.display = 'none';
        hideObservationForm();
        return;
    }

    const autoDetectedPlant =
        data.plantName ||
        data.plant ||
        (plantCheck && plantCheck.suggestedPlant ? plantCheck.suggestedPlant.name : '');
    const autoDetectedPlantConfidence =
        data.plantSuggestionConfidence ||
        (plantCheck && plantCheck.suggestedPlant ? plantCheck.suggestedPlant.confidence : 0);
    const fallbackPlantOptions =
        (data.plantSuggestions && data.plantSuggestions.length)
            ? data.plantSuggestions
            : ((plantCheck && plantCheck.suggestedPlantAlternatives) ? plantCheck.suggestedPlantAlternatives.map(p => p.name) : []);

    if (data.healthy) {
        statusEl.className = 'result-status healthy';
        statusEl.innerHTML = '<h3>✅ Your Plant Looks Healthy!</h3><p>No diseases detected. Keep up the good care!</p>';
        if (autoDetectedPlant) {
            const matchCopy = autoDetectedPlantConfidence ? ` (${Math.round(autoDetectedPlantConfidence * 100)}% match)` : '';
            statusEl.innerHTML += `<p class="hint">🌱 Auto-detected plant: <strong>${autoDetectedPlant}</strong>${matchCopy}</p>`;
        }
        // Show analysis signals if available
        if (data.detailedSignals && data.detailedSignals.length) {
            statusEl.innerHTML += '<div class="analysis-signals"><h5>🔬 Analysis Details</h5><ul>' +
                data.detailedSignals.map(s => '<li>' + s + '</li>').join('') + '</ul></div>';
        }
        document.getElementById('diseaseCard').style.display = 'none';
        document.querySelector('.remedies-card').style.display = 'none';
    } else {
        statusEl.className = 'result-status diseased';
        const plantCopy = plantLabel ? ` on ${plantLabel}` : (autoDetectedPlant ? ` on ${autoDetectedPlant}` : '');
        const confStr = data.confidence ? ` (${Math.round(data.confidence * 100)}% confidence)` : '';
        statusEl.innerHTML = `<h3>⚠️ Issue Detected${plantCopy}</h3><p>We found potential signs of <strong>${diseaseData.name || data.disease}</strong>${confStr}</p>`;

        if (autoDetectedPlant) {
            const matchCopy = autoDetectedPlantConfidence ? ` (${Math.round(autoDetectedPlantConfidence * 100)}% match)` : '';
            statusEl.innerHTML += `<p class="hint">🌱 Auto-detected plant: <strong>${autoDetectedPlant}</strong>${matchCopy}</p>`;
            if (fallbackPlantOptions.length) {
                statusEl.innerHTML += `<p class="hint">Other possibilities: ${fallbackPlantOptions.join(', ')}</p>`;
            }
        }

        // Show detailed image analysis signals
        if (data.detailedSignals && data.detailedSignals.length) {
            statusEl.innerHTML += '<div class="analysis-signals"><h5>🔬 How We Detected This</h5><ul>' +
                data.detailedSignals.map(s => '<li>📊 ' + s + '</li>').join('') + '</ul></div>';
        }

        // Show runner-up diagnoses (differential diagnosis)
        if (data.runnerUps && data.runnerUps.length) {
            statusEl.innerHTML += '<div class="differential-diagnosis"><h5>🔄 Other Possible Causes</h5><ul>' +
                data.runnerUps.map(r => '<li><strong>' + r.name + '</strong> (' + Math.round(r.score * 100) + '% match)' +
                    (r.signals && r.signals.length ? ' — ' + r.signals[0] : '') + '</li>').join('') +
                '</ul><p class="hint">Fill in the observation form below for higher accuracy.</p></div>';
        }

        document.getElementById('diseaseCard').style.display = '';
        document.querySelector('.remedies-card').style.display = '';
    }

    // Show observation questionnaire if confidence is low or needsMoreInfo
    if (data.needsMoreInfo || (data.confidence && data.confidence < 0.60)) {
        showObservationForm(plantCheck, data);
    } else {
        hideObservationForm();
    }

    // Severity badge
    const badge = document.getElementById('severityBadge');
    const sev = diseaseData.severity || 'moderate';
    badge.textContent = sev.charAt(0).toUpperCase() + sev.slice(1);
    badge.className = `severity-badge ${sev}`;

    // Disease info
    document.getElementById('diseaseName').textContent = diseaseData.name || data.disease;
    document.getElementById('diseaseDesc').textContent = diseaseData.description || data.description;
    document.getElementById('diseaseCause').textContent = diseaseData.cause || data.cause;

    // Symptoms
    const sympList = document.getElementById('symptomsList');
    sympList.innerHTML = '';
    (diseaseData.symptoms || data.symptoms || []).forEach(s => {
        const li = document.createElement('li');
        li.textContent = s;
        sympList.appendChild(li);
    });

    // Remedies
    const remedyContainer = document.getElementById('remediesList');
    remedyContainer.innerHTML = '';
    (diseaseData.remedies || data.remedies || []).forEach(r => {
        const div = document.createElement('div');
        div.className = 'remedy-item';
        div.innerHTML = `
            <h5>${r.icon || '🌿'} ${r.name}</h5>
            <div class="ingredients">Ingredients: ${r.ingredients}</div>
            <p>${r.steps}</p>
            <div class="frequency">📅 ${r.frequency}</div>
        `;
        remedyContainer.appendChild(div);
    });

    // Prevention
    const prevList = document.getElementById('preventionList');
    prevList.innerHTML = '';
    (diseaseData.prevention || data.prevention || []).forEach(p => {
        const li = document.createElement('li');
        li.textContent = p;
        prevList.appendChild(li);
    });

    // Soil & feeding plan based on environment guess
    const soilCard = document.getElementById('soilCard');
    if (soilCard) {
        const soilPlan = buildSoilPlan(envInfo || environmentGuess, { key: data.diseaseKey, severity: diseaseData.severity });
        const envBadge = document.getElementById('envBadge');
        const soilIntro = document.getElementById('soilIntro');
        const soilList = document.getElementById('soilList');

        envBadge.textContent = soilPlan.badge;
        envBadge.className = `env-badge ${soilPlan.type}`;
        soilIntro.textContent = soilPlan.intro;
        soilList.innerHTML = '';
        soilPlan.items.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            soilList.appendChild(li);
        });
        soilCard.style.display = '';
    }

    // Plant Energy Analysis (async — fetches from backend first)
    try {
        var energyResult = await analyzeEnergy(plantCheck || { stats: {} }, envInfo || environmentGuess, data);
        displayEnergyCard(energyResult);
    } catch (energyErr) {
        console.warn('Energy analysis skipped:', energyErr);
    }

    // Products
    const productsGrid = document.getElementById('recommendedProducts');
    productsGrid.innerHTML = '';
    const productNames = diseaseData.products || data.products || [];
    productNames.forEach(pName => {
        const product = PRODUCT_CATALOG[pName];
        if (product) {
            const div = document.createElement('div');
            div.className = 'rec-product';
            div.onclick = () => window.location.href = 'index.html#organic';
            div.innerHTML = `
                <h5>${product.name}</h5>
                <div class="rec-price">${product.price}</div>
                <div class="rec-match">${product.match}</div>
            `;
            productsGrid.appendChild(div);
        }
    });

    // Ask the Community bridge — show only when a disease/issue is detected
    let communityBridgeEl = document.getElementById('communityBridge');
    if (!communityBridgeEl) {
        communityBridgeEl = document.createElement('div');
        communityBridgeEl.id = 'communityBridge';
        communityBridgeEl.className = 'community-bridge-card';
        results.appendChild(communityBridgeEl);
    }
    if (!data.healthy && !data.notPlant) {
        const diagName = diseaseData.name || data.disease || 'Unknown Issue';
        const conf = data.confidence || 0;
        communityBridgeEl.style.display = '';
        communityBridgeEl.innerHTML = `
            <div class="bridge-icon">🌿</div>
            <div class="bridge-body">
                <h4>Still unsure? Ask the Community!</h4>
                <p>Get advice from experienced plant parents who may have dealt with <strong>${diagName}</strong> before.</p>
                <a href="community.html?scanDiagnosis=${encodeURIComponent(diagName)}&scanConfidence=${conf}" class="btn-bridge">
                    💬 Ask Plant Parents Community
                </a>
            </div>
        `;
    } else {
        communityBridgeEl.style.display = 'none';
    }

    // Scroll to results
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// =============================================
// OBSERVATION QUESTIONNAIRE (improves accuracy when confidence is low)
// =============================================
function showObservationForm(plantCheck = null, analysisData = null) {
    const form = document.getElementById('observationForm');
    if (form) {
        const plantInput = document.getElementById('obsPlantName');
        if (plantInput && !plantInput.value) {
            const suggested =
                (analysisData && analysisData.plantName) ||
                (plantCheck && plantCheck.suggestedPlant ? plantCheck.suggestedPlant.name : '');
            if (suggested) {
                plantInput.value = suggested;
                if (plantCheck && plantCheck.suggestedPlant && plantCheck.suggestedPlant.confidence) {
                    plantInput.title = `Auto-suggested from image (${Math.round(plantCheck.suggestedPlant.confidence * 100)}% match)`;
                }
            }
        }
        form.style.display = '';
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function hideObservationForm() {
    const form = document.getElementById('observationForm');
    if (form) form.style.display = 'none';
}

function submitObservation() {
    const leafColor = document.getElementById('obsLeafColor')?.value || '';
    const leafTexture = document.getElementById('obsLeafTexture')?.value || '';
    const soilMoisture = document.getElementById('obsSoilMoisture')?.value || '';
    const soilDrainage = document.getElementById('obsSoilDrainage')?.value || '';
    const soilSmell = document.getElementById('obsSoilSmell')?.value || '';
    const envType = document.getElementById('obsEnvType')?.value || '';
    const plantName = document.getElementById('obsPlantName')?.value || '';

    // Collect checked symptom checkboxes
    const symptomChecks = document.querySelectorAll('.obs-symptom-check:checked');
    const symptoms = Array.from(symptomChecks).map(cb => cb.value);

    // Additional text symptoms
    const extraSymptoms = document.getElementById('obsExtraSymptoms')?.value || '';
    if (extraSymptoms.trim()) symptoms.push(extraSymptoms.trim());

    const userObservation = {
        plantName: plantName,
        symptoms: symptoms,
        leafCondition: {
            color: leafColor || undefined,
            texture: leafTexture || undefined,
            hasSpots: symptoms.some(s => s.toLowerCase().includes('spot')),
            isWilting: symptoms.some(s => s.toLowerCase().includes('wilt')),
            hasPests: symptoms.some(s => s.toLowerCase().includes('insect') || s.toLowerCase().includes('bug'))
        },
        soilCondition: {
            moisture: soilMoisture || undefined,
            drainage: soilDrainage || undefined,
            smell: soilSmell || undefined
        }
    };

    // Override environment if user specified
    if (envType) {
        environmentGuess = { type: envType, confidence: 0.90, reason: 'User-specified' };
    }

    pendingUserObservation = userObservation;

    // Re-run analysis with user observation data
    analyzePlant(userObservation);
}

// =============================================
// SHARE ON WHATSAPP
// =============================================
function shareResult() {
    if (!requireLogin()) return;
    const diseaseName = document.getElementById('diseaseName').textContent;
    const text = `🌿 I used The Nursery Green's free Plant Disease Scanner!

My plant has: ${diseaseName}

It gave me homemade desi remedies using neem, haldi, and more. Try it free:
https://thenurserygreen.com/plant-scanner.html

#PlantCare #TheNurseryGreen`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

// =============================================
// QUICK REMEDY MODAL (Common Diseases Section)
// =============================================
function showQuickRemedy(diseaseKey) {
    const disease = DISEASE_DB[diseaseKey];
    if (!disease) return;

    const content = document.getElementById('quickRemedyContent');
    let remediesHTML = disease.remedies.map(r => `
        <div class="remedy-item">
            <h5>${r.icon || '🌿'} ${r.name}</h5>
            <div class="ingredients">Ingredients: ${r.ingredients}</div>
            <p>${r.steps}</p>
            <div class="frequency">📅 ${r.frequency}</div>
        </div>
    `).join('');

    let preventionHTML = disease.prevention.map(p => `<li>${p}</li>`).join('');

    let productsHTML = disease.products.map(p => {
        const prod = PRODUCT_CATALOG[p];
        return prod ? `<span style="display:inline-block;background:#f0f7ed;padding:6px 12px;border-radius:8px;font-size:0.8rem;margin:4px;">${prod.name} — ${prod.price}</span>` : '';
    }).join('');

    content.innerHTML = `
        <h3>${disease.name}</h3>
        <p class="qr-desc">${disease.description}</p>
        <span class="severity-badge ${disease.severity}" style="margin-bottom:16px;">${disease.severity}</span>
        
        <h4>🦠 Cause</h4>
        <p style="font-size:0.9rem;color:#5c6f68;margin-bottom:16px;">${disease.cause}</p>
        
        <h4>🔍 Symptoms</h4>
        <ul class="symptom-list" style="margin-bottom:16px;">
            ${disease.symptoms.map(s => `<li>${s}</li>`).join('')}
        </ul>
        
        <h4>🏠 Desi Home Remedies</h4>
        <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:16px;">
            ${remediesHTML}
        </div>
        
        <h4>🛡️ Prevention</h4>
        <ul class="prevention-list" style="margin-bottom:16px;">
            ${preventionHTML}
        </ul>
        
        <h4>🛒 Recommended Products</h4>
        <div style="margin-bottom:12px;">${productsHTML}</div>
        <a href="index.html#organic" class="btn-scan shop-link" style="display:inline-flex;font-size:0.85rem;padding:10px 20px;">Shop Now →</a>
    `;

    document.getElementById('quickRemedyModal').classList.add('active');
}

function closeQuickRemedy() {
    document.getElementById('quickRemedyModal').classList.remove('active');
}

// Close modal on overlay click
document.getElementById('quickRemedyModal').addEventListener('click', e => {
    if (e.target === document.getElementById('quickRemedyModal')) closeQuickRemedy();
});

// =============================================
// UTILITIES
// =============================================
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// =============================================
// SIMPLE ACCOUNT (LOCAL ONLY)
// =============================================
function loadScannerUser() {
    try {
        const raw = localStorage.getItem('scannerUser');
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        storageHealthy = false;
        return null;
    }
}

function saveScannerUser(user) {
    try {
        localStorage.setItem('scannerUser', JSON.stringify(user));
        storageHealthy = true;
    } catch {
        storageHealthy = false;
    }
}

function requireLogin() {
    authToken = getAuthToken();
    if (authToken) return true;
    showGate();
    return false;
}

function showGate() {
    if (!gateOverlay) return;
    gateOverlay.style.display = 'block';
    document.querySelector('.scanner-main').scrollIntoView({ behavior: 'smooth' });
}

function hideGate() {
    if (!gateOverlay) return;
    gateOverlay.style.display = 'none';
}

function updateAccessBar() {
    if (!accessBar) return;
    if (scannerUser) {
        accessBar.style.display = 'flex';
        userNameLabel.textContent = scannerUser.name;
        userContactLabel.textContent = scannerUser.contact;
    } else {
        accessBar.style.display = 'none';
        userNameLabel.textContent = 'Plant Parent';
        userContactLabel.textContent = '-';
    }
}

// Avatar picker
if (switchAccountBtn) {
    switchAccountBtn.addEventListener('click', () => {
        scannerUser = null;
        localStorage.removeItem('scannerUser');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        updateAccessBar();
        showGate();
        if (loginRedirectBtn) loginRedirectBtn.focus();
    });
}

async function hydrateUserFromAuth() {
    authToken = getAuthToken();
    if (!authToken) {
        scannerUser = null;
        updateAccessBar();
        showGate();
        return;
    }

    // Try local userData first
    const localUser = loadScannerUser();
    if (localUser) {
        scannerUser = localUser;
        hideGate();
        updateAccessBar();
    }

    try {
        const res = await fetch(`${BACKEND_URL}/api/users/profile`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        if (!res.ok) throw new Error('profile fetch failed');
        const data = await res.json();
        const user = data.user || {};
        const name = user.firstName || user.email || 'Plant Parent';
        const contact = user.phone || user.email || 'Signed in';
        scannerUser = { name, contact, avatar: '🌿', createdAt: Date.now() };
        saveScannerUser(scannerUser);
        hideGate();
        updateAccessBar();
    } catch (err) {
        console.warn('Auth token invalid or profile fetch failed, showing gate', err);
        scannerUser = null;
        localStorage.removeItem('authToken');
        showGate();
        updateAccessBar();
    }
}

hydrateUserFromAuth();
