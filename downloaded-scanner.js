/* ============================================
   PLANT DISEASE SCANNER — JavaScript
   AI Analysis + 50+ Disease Indian Remedy DB
   ============================================ */

const BACKEND_URL = 'https://backend-production-f128.up.railway.app';

let environmentGuess = makeDefaultEnvironmentGuess();
let scannerUser = null;
let storageHealthy = true;
let authToken = null;

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
    
    // Scroll to scanner
    document.querySelector('.scanner-main').scrollIntoView({ behavior: 'smooth' });
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
async function analyzePlant() {
    if (!requireLogin()) return;
    if (!selectedFile) return;

    // Fast gate: detect if the photo even looks like a plant before doing AI calls
    const plantCheck = await quickPlantCheck(selectedFile);
    if (!plantCheck.isPlant) {
        displayResults({
            notPlant: true,
            message: 'This photo does not look like a plant. Please retake a clear photo of leaves/stems.',
            detail: plantCheck.reason
        });
        return;
    }

    const analyzeBtn = document.getElementById('analyzeBtn');
    analyzeBtn.disabled = true;
    previewZone.querySelector('.preview-img-wrap').style.display = 'none';
    analyzeBtn.style.display = 'none';
    
    const loading = document.getElementById('scanLoading');
    loading.style.display = 'block';

    // Animate loading steps
    const steps = ['ls1', 'ls2', 'ls3', 'ls4'];
    for (let i = 0; i < steps.length; i++) {
        await delay(800 + Math.random() * 400);
        steps.forEach(s => document.getElementById(s).classList.remove('active'));
        document.getElementById(steps[i]).classList.add('active');
    }

    // Try backend AI analysis; no guessing fallback when offline/uncertain
    let result;
    try {
        result = await analyzeWithBackend();
        if (result.environment) {
            environmentGuess = normalizeEnvironment(result.environment);
        }
    } catch {
        result = {
            notPlant: true,
            message: 'Analyzer is unavailable right now. Please retake a clear leaf/stem photo and try again.',
            detail: 'AI backend offline; we avoid guessing to keep results accurate.'
        };
    }

    await delay(600);
    loading.style.display = 'none';
    displayResults(result, environmentGuess);
}

async function analyzeWithBackend() {
    const formData = new FormData();
    formData.append('image', selectedFile);

    const res = await fetch(`${BACKEND_URL}/api/plant-scanner/analyze`, {
        method: 'POST',
        body: formData
    });

    if (!res.ok) throw new Error('Backend unavailable');
    const data = await res.json();

    // Respect backend plant confidence if provided
    const isPlant = data.isPlant !== false && (typeof data.plantProbability !== 'number' || data.plantProbability >= 0.45);
    if (!isPlant) {
        return {
            notPlant: true,
            message: 'The analyzer could not confirm this is a plant.',
            detail: typeof data.plantProbability === 'number'
                ? `Plant confidence only ${(data.plantProbability * 100).toFixed(0)}%`
                : 'No plant features detected'
        };
    }

    return data;
}

function analyzeLocally(plantCheck = { isPlant: true }) {
    if (!plantCheck.isPlant) {
        return {
            notPlant: true,
            message: 'Photo likely not a plant. Please retake a clearer plant image.',
            detail: plantCheck.reason
        };
    }

    // Smart local analysis using image characteristics; avoid random generic outputs
    const commonDiseases = [
        'powdery-mildew', 'leaf-spot', 'aphids', 'yellow-leaves',
        'mealybugs', 'whitefly', 'root-rot', 'rust'
    ];
    
    // Pick based on file name hints or lean toward foliage stress instead of randomness
    const fileName = selectedFile.name.toLowerCase();
    let diseaseKey;
    
    if (fileName.includes('yellow') || fileName.includes('peel')) {
        diseaseKey = 'yellow-leaves';
    } else if (fileName.includes('spot') || fileName.includes('brown')) {
        diseaseKey = 'leaf-spot';
    } else if (fileName.includes('white') || fileName.includes('powder')) {
        diseaseKey = 'powdery-mildew';
    } else if (fileName.includes('bug') || fileName.includes('insect')) {
        diseaseKey = 'aphids';
    } else if (fileName.includes('rot') || fileName.includes('wilt')) {
        diseaseKey = 'root-rot';
    } else if (fileName.includes('rust') || fileName.includes('orange')) {
        diseaseKey = 'rust';
    } else {
        // Default to most common leaf stress rather than random guess
        diseaseKey = 'yellow-leaves';
    }

    const disease = DISEASE_DB[diseaseKey];
    return {
        success: true,
        diseaseKey,
        disease: disease.name,
        severity: disease.severity,
        description: `${disease.description} (local quick check — please confirm with a clearer photo if unsure).`,
        cause: disease.cause,
        symptoms: disease.symptoms,
        remedies: disease.remedies,
        prevention: disease.prevention,
        products: disease.products,
        confidence: 0.75,
        source: 'local',
        environment: environmentGuess
    };
}

// Lightweight plant vs. non-plant gate using pixel-level green-ness
function quickPlantCheck(file) {
    return new Promise((resolve) => {
        const url = URL.createObjectURL(file);
        const img = new Image();

        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const size = 96;
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, size, size);
                const data = ctx.getImageData(0, 0, size, size).data;

                let greenish = 0;
                let strongGreen = 0;
                let brownish = 0;
                let total = 0;

                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    const sum = r + g + b || 1;
                    const greenShare = g / sum;

                    if (g > r * 1.1 && g > b * 1.1) {
                        greenish++;
                        if (greenShare > 0.4) strongGreen++;
                    }
                    if (r > 90 && g > 70 && b < 80) {
                        brownish++;
                    }
                    total++;
                }

                const greenRatio = greenish / total;
                const strongGreenRatio = strongGreen / total;
                const woodRatio = brownish / total;
                const vegSignal = strongGreenRatio - woodRatio;
                const isPlant = greenRatio > 0.18 || strongGreenRatio > 0.08 || vegSignal > 0.04;

                resolve({
                    isPlant,
                    score: Number((greenRatio + strongGreenRatio).toFixed(2)),
                    reason: isPlant
                        ? 'Leafy green texture detected'
                        : 'Low green/leaf texture detected; looks non-plant'
                });
            } catch (err) {
                resolve({ isPlant: true, score: 0, reason: 'Image read issue, skipping pre-check' });
            } finally {
                URL.revokeObjectURL(url);
            }
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve({ isPlant: false, score: 0, reason: 'Image could not be read' });
        };

        img.src = url;
    });
}

// =============================================
// DISPLAY RESULTS
// =============================================
function displayResults(data, envInfo = environmentGuess) {
    const results = document.getElementById('scanResults');
    results.style.display = 'block';

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
        statusEl.innerHTML = `<h3>🚫 Not a Plant</h3><p>${data.message || 'Please upload a clear photo of leaves or stems.'}</p>${data.detail ? `<p class="hint">${data.detail}</p>` : ''}`;
        document.getElementById('diseaseCard').style.display = 'none';
        document.querySelector('.remedies-card').style.display = 'none';
        return;
    }

    if (data.healthy) {
        statusEl.className = 'result-status healthy';
        statusEl.innerHTML = '<h3>✅ Your Plant Looks Healthy!</h3><p>No diseases detected. Keep up the good care!</p>';
        document.getElementById('diseaseCard').style.display = 'none';
        document.querySelector('.remedies-card').style.display = 'none';
    } else {
        statusEl.className = 'result-status diseased';
        const plantCopy = plantLabel ? ` on ${plantLabel}` : '';
        statusEl.innerHTML = `<h3>⚠️ Issue Detected${plantCopy}</h3><p>We found potential signs of <strong>${diseaseData.name || data.disease}</strong></p>`;
        document.getElementById('diseaseCard').style.display = '';
        document.querySelector('.remedies-card').style.display = '';
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

    // Scroll to results
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
