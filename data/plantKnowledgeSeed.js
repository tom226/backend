module.exports = [
  {
    slug: 'powdery-mildew',
    diseaseName: 'Powdery Mildew',
    aliases: ['safed-chita', 'white powder fungus'],
    category: 'fungal',
    severity: 'moderate',
    summary: 'Fungal infection that appears like white powder on leaf surfaces.',
    symptoms: ['white powder on leaves', 'leaf yellowing', 'leaf curling', 'stunted growth'],
    plantTypes: ['rose', 'hibiscus', 'vegetables', 'ornamental'],
    leafIndicators: {
      colors: ['green', 'yellowing'],
      textures: ['powdery', 'dry'],
      hasSpots: false,
      hasWilting: false,
      hasPests: false
    },
    soilIndicators: {
      moisture: ['moist'],
      drainage: ['average', 'good'],
      smell: ['normal'],
      textures: ['loamy'],
      pHRange: { min: 5.8, max: 7.0 }
    },
    environmentIndicators: {
      locationType: ['indoor', 'outdoor', 'balcony'],
      sunlightHours: { min: 4, max: 8 },
      humidityRange: { min: 50, max: 90 }
    },
    solutions: [
      {
        title: 'Neem oil foliar spray',
        priority: 1,
        estimatedDays: '7-21 days',
        steps: [
          'Mix 5ml neem oil + 1L water + a few drops of mild soap.',
          'Spray both sides of leaves in early morning/evening.',
          'Repeat every 5-7 days for 3 cycles.'
        ]
      }
    ],
    preventiveCare: ['Improve airflow around plant canopy', 'Avoid wet leaves at night'],
    recommendedProducts: ['Neem Oil', 'Plant Protection Spray'],
    references: [
      {
        title: 'Powdery Mildew Management - University of Minnesota Extension',
        url: 'https://extension.umn.edu/plant-diseases/powdery-mildew-flower-garden',
        source: 'University Extension'
      }
    ]
  },
  {
    slug: 'leaf-spot',
    diseaseName: 'Leaf Spot',
    aliases: ['patti-dhaag', 'brown spots'],
    category: 'fungal',
    severity: 'moderate',
    summary: 'Brown or black spots with yellow halo on leaves, often fungal in nature.',
    symptoms: ['brown spots on leaves', 'yellow halo', 'premature leaf drop'],
    plantTypes: ['money plant', 'rose', 'vegetables', 'ornamental'],
    leafIndicators: {
      colors: ['brown', 'yellow'],
      textures: ['spotted', 'necrotic'],
      hasSpots: true,
      hasWilting: false,
      hasPests: false
    },
    soilIndicators: {
      moisture: ['wet', 'moist'],
      drainage: ['poor', 'average'],
      smell: ['normal', 'musty'],
      textures: ['loamy', 'clayey'],
      pHRange: { min: 5.5, max: 7.2 }
    },
    environmentIndicators: {
      locationType: ['outdoor', 'balcony'],
      sunlightHours: { min: 3, max: 7 },
      humidityRange: { min: 55, max: 95 }
    },
    solutions: [
      {
        title: 'Sanitation + antifungal cycle',
        priority: 1,
        estimatedDays: '10-21 days',
        steps: [
          'Remove infected leaves and discard safely.',
          'Spray neem-based antifungal every 5 days.',
          'Shift to base watering and improve sunlight.'
        ]
      }
    ],
    preventiveCare: ['Avoid overhead watering', 'Do not crowd plants'],
    recommendedProducts: ['Neem Oil', 'Neem Cake Powder'],
    references: [
      {
        title: 'Leaf spot diseases in ornamentals - Penn State Extension',
        url: 'https://extension.psu.edu/leaf-spot-diseases-of-shade-trees-and-ornamentals',
        source: 'University Extension'
      }
    ]
  },
  {
    slug: 'aphids',
    diseaseName: 'Aphid Infestation',
    aliases: ['maahu', 'sap sucking insects'],
    category: 'pest',
    severity: 'moderate',
    summary: 'Soft-bodied insects clustering on tender growth and leaf undersides.',
    symptoms: ['sticky leaves', 'curled new leaves', 'visible tiny insects', 'ant activity'],
    plantTypes: ['rose', 'hibiscus', 'vegetables', 'flowering plants'],
    leafIndicators: {
      colors: ['green', 'yellowing'],
      textures: ['curled', 'sticky'],
      hasSpots: false,
      hasWilting: false,
      hasPests: true
    },
    soilIndicators: {
      moisture: ['slightly-dry', 'moist'],
      drainage: ['good', 'average'],
      smell: ['normal', 'none'],
      textures: ['loamy'],
      pHRange: { min: 6.0, max: 7.5 }
    },
    environmentIndicators: {
      locationType: ['indoor', 'outdoor', 'balcony'],
      sunlightHours: { min: 4, max: 8 },
      humidityRange: { min: 35, max: 75 }
    },
    solutions: [
      {
        title: 'Neem + soap insect control',
        priority: 1,
        estimatedDays: '7-14 days',
        steps: [
          'Use neem + mild soap spray on affected zones.',
          'Spray under leaves where aphids hide.',
          'Repeat every 3-4 days until activity drops.'
        ]
      }
    ],
    preventiveCare: ['Inspect new shoots weekly', 'Encourage beneficial insects'],
    recommendedProducts: ['Neem Oil', 'Plant Protection Spray'],
    references: [
      {
        title: 'Aphids in home gardens - UC IPM',
        url: 'https://ipm.ucanr.edu/PMG/PESTNOTES/pn7404.html',
        source: 'University IPM'
      }
    ]
  },
  {
    slug: 'root-rot',
    diseaseName: 'Root Rot',
    aliases: ['jad-sadna', 'waterlogging rot'],
    category: 'watering',
    severity: 'severe',
    summary: 'Root decay due to prolonged wet soil and poor drainage.',
    symptoms: ['wilting with wet soil', 'yellowing leaves', 'foul smell from soil', 'mushy roots'],
    plantTypes: ['indoor plants', 'succulents', 'ornamental'],
    leafIndicators: {
      colors: ['yellow'],
      textures: ['droopy', 'soft'],
      hasSpots: false,
      hasWilting: true,
      hasPests: false
    },
    soilIndicators: {
      moisture: ['wet', 'waterlogged'],
      drainage: ['poor'],
      smell: ['foul', 'musty'],
      textures: ['compacted', 'clayey'],
      pHRange: { min: 5.8, max: 7.2 }
    },
    environmentIndicators: {
      locationType: ['indoor', 'outdoor', 'balcony'],
      sunlightHours: { min: 2, max: 6 },
      humidityRange: { min: 45, max: 95 }
    },
    solutions: [
      {
        title: 'Emergency root rescue',
        priority: 1,
        estimatedDays: '7-20 days',
        steps: [
          'Unpot and trim black/mushy roots using clean tools.',
          'Dust roots with cinnamon or bio-fungicide.',
          'Repot in fresh well-draining mix and reduce watering.'
        ]
      }
    ],
    preventiveCare: ['Use pots with drainage holes', 'Water only when topsoil is dry'],
    recommendedProducts: ['Root Booster', 'Neem Cake Powder'],
    references: [
      {
        title: 'Managing root rot in container plants - Extension',
        url: 'https://extension.umn.edu/plant-diseases/root-rots-indoor-plants',
        source: 'University Extension'
      }
    ]
  },
  {
    slug: 'yellow-leaves-nutrient-stress',
    diseaseName: 'Yellowing Leaves (Nutrient/Water Stress)',
    aliases: ['chlorosis', 'peeli patti'],
    category: 'nutrient',
    severity: 'mild',
    summary: 'General yellowing due to nutrient imbalance, light stress, or watering errors.',
    symptoms: ['uniform yellow leaves', 'older leaves yellow first', 'slow growth'],
    plantTypes: ['money plant', 'areca palm', 'rose', 'vegetables'],
    leafIndicators: {
      colors: ['yellow', 'pale-green'],
      textures: ['normal', 'soft'],
      hasSpots: false,
      hasWilting: false,
      hasPests: false
    },
    soilIndicators: {
      moisture: ['dry', 'moist', 'wet'],
      drainage: ['average', 'good', 'poor'],
      smell: ['normal', 'none'],
      textures: ['loamy', 'compacted'],
      pHRange: { min: 5.8, max: 7.5 }
    },
    environmentIndicators: {
      locationType: ['indoor', 'outdoor', 'balcony'],
      sunlightHours: { min: 3, max: 8 },
      humidityRange: { min: 30, max: 85 }
    },
    solutions: [
      {
        title: 'Corrective nutrient and watering plan',
        priority: 1,
        estimatedDays: '10-30 days',
        steps: [
          'Check topsoil before each watering; avoid fixed daily watering.',
          'Feed with balanced organic nutrient every 2-3 weeks.',
          'Move plant to brighter indirect light if currently low light.'
        ]
      }
    ],
    preventiveCare: ['Track watering with finger test', 'Feed lightly but regularly'],
    recommendedProducts: ['All in One Mixture', 'Vermi Compost', 'Plant Diet'],
    references: [
      {
        title: 'Diagnosing yellow leaves in houseplants - RHS',
        url: 'https://www.rhs.org.uk/problems/houseplants-yellowing',
        source: 'RHS'
      }
    ]
  },
  {
    slug: 'general-healthy-care',
    diseaseName: 'General Plant Health Guidance',
    aliases: ['healthy plant', 'preventive care'],
    category: 'general-care',
    severity: 'mild',
    summary: 'Preventive routine for healthy leaves, roots, and soil in Indian home gardens.',
    symptoms: ['healthy growth maintenance'],
    plantTypes: ['all'],
    leafIndicators: {
      colors: ['green'],
      textures: ['firm'],
      hasSpots: false,
      hasWilting: false,
      hasPests: false
    },
    soilIndicators: {
      moisture: ['slightly-dry', 'moist'],
      drainage: ['good'],
      smell: ['normal'],
      textures: ['loamy'],
      pHRange: { min: 5.8, max: 7.2 }
    },
    environmentIndicators: {
      locationType: ['indoor', 'outdoor', 'balcony'],
      sunlightHours: { min: 4, max: 8 },
      humidityRange: { min: 35, max: 75 }
    },
    solutions: [
      {
        title: 'Weekly plant health routine',
        priority: 1,
        estimatedDays: 'Ongoing',
        steps: [
          'Inspect leaf undersides for pests every week.',
          'Water only when topsoil is dry to touch.',
          'Add light compost/neem cake once a month.'
        ]
      }
    ],
    preventiveCare: ['Rotate plants for even light', 'Prune dead leaves early'],
    recommendedProducts: ['Vermi Compost', 'Neem Cake Powder', 'Plant Booster Spray'],
    references: [
      {
        title: 'Houseplant care basics - Royal Horticultural Society',
        url: 'https://www.rhs.org.uk/houseplants',
        source: 'RHS'
      }
    ]
  },
  {
    slug: 'mealybugs',
    diseaseName: 'Mealybug Infestation',
    aliases: ['safed-makhi', 'white cottony pest', 'cottony mealybug'],
    category: 'pest',
    severity: 'moderate',
    summary: 'White cottony/waxy pests that cluster at leaf joints and stems, sucking sap and weakening plants.',
    symptoms: ['white cottony masses on stems', 'sticky honeydew on leaves', 'yellowing leaves', 'stunted growth', 'ant activity'],
    plantTypes: ['hibiscus', 'croton', 'succulents', 'ornamental', 'indoor plants'],
    leafIndicators: {
      colors: ['green', 'yellowing'],
      textures: ['sticky', 'normal'],
      hasSpots: false,
      hasWilting: false,
      hasPests: true
    },
    soilIndicators: {
      moisture: ['moist', 'slightly-dry'],
      drainage: ['good', 'average'],
      smell: ['normal'],
      textures: ['loamy'],
      pHRange: { min: 5.5, max: 7.5 }
    },
    environmentIndicators: {
      locationType: ['indoor', 'outdoor', 'balcony'],
      sunlightHours: { min: 3, max: 8 },
      humidityRange: { min: 35, max: 80 }
    },
    solutions: [
      {
        title: 'Neem + alcohol scrub treatment',
        priority: 1,
        estimatedDays: '14-28 days',
        steps: [
          'Dip cotton bud in rubbing alcohol and touch each mealybug cluster directly.',
          'Spray neem oil (10ml) + dish soap (1 tsp) + water (1L) on all joints and undersides.',
          'Repeat every 3-4 days for 3-4 weeks until clear.'
        ]
      }
    ],
    preventiveCare: ['Quarantine new plants for 2 weeks', 'Control ant populations', 'Apply neem oil monthly'],
    recommendedProducts: ['Neem Oil', 'Plant Protection Spray', 'Neem Cake Powder'],
    references: [
      {
        title: 'Mealybugs management - University of California IPM',
        url: 'https://ipm.ucanr.edu/PMG/PESTNOTES/pn74174.html',
        source: 'UC IPM'
      }
    ]
  },
  {
    slug: 'whitefly',
    diseaseName: 'Whitefly Infestation',
    aliases: ['safed-makhi', 'white flies', 'bemisia'],
    category: 'pest',
    severity: 'moderate',
    summary: 'Tiny white winged insects that fly up when plant is disturbed, sucking sap from leaf undersides.',
    symptoms: ['tiny white flies under leaves', 'sticky honeydew', 'yellow speckled leaves', 'sooty mold', 'wilting'],
    plantTypes: ['tomato', 'brinjal', 'chilli', 'vegetables', 'flowering plants'],
    leafIndicators: {
      colors: ['green', 'yellowing'],
      textures: ['sticky', 'speckled'],
      hasSpots: false,
      hasWilting: false,
      hasPests: true
    },
    soilIndicators: {
      moisture: ['moist', 'slightly-dry'],
      drainage: ['good', 'average'],
      smell: ['normal'],
      textures: ['loamy'],
      pHRange: { min: 5.5, max: 7.0 }
    },
    environmentIndicators: {
      locationType: ['outdoor', 'balcony'],
      sunlightHours: { min: 4, max: 8 },
      humidityRange: { min: 30, max: 70 }
    },
    solutions: [
      {
        title: 'Yellow sticky traps + neem spray',
        priority: 1,
        estimatedDays: '14-21 days',
        steps: [
          'Hang yellow sticky traps near plants at canopy height.',
          'Spray neem oil (5ml) + chilli powder (1 tbsp) + soap (few drops) + water (1L) on leaf undersides.',
          'Repeat every 3-4 days for 2-3 weeks.'
        ]
      }
    ],
    preventiveCare: ['Use yellow sticky traps as early warning', 'Plant marigolds and tulsi as repellents', 'Use fine mesh covers on vegetable beds'],
    recommendedProducts: ['Neem Oil', 'Plant Protection Spray', 'Neem Cake Powder'],
    references: [
      {
        title: 'Whitefly management in vegetables - ICAR',
        url: 'https://www.icar.org.in',
        source: 'ICAR India'
      }
    ]
  },
  {
    slug: 'rust',
    diseaseName: 'Rust Disease',
    aliases: ['geru-rog', 'rust fungus', 'orange spots'],
    category: 'fungal',
    severity: 'moderate',
    summary: 'Orange, yellow, or rust-brown raised pustules on undersides of leaves, caused by Puccinia fungi.',
    symptoms: ['orange/rust colored raised bumps under leaves', 'yellow spots on upper leaf surface', 'powdery orange spores', 'premature leaf drop', 'weakened stems'],
    plantTypes: ['rose', 'chrysanthemum', 'beans', 'ornamental'],
    leafIndicators: {
      colors: ['yellow', 'green'],
      textures: ['spotted', 'powdery'],
      hasSpots: true,
      hasWilting: false,
      hasPests: false
    },
    soilIndicators: {
      moisture: ['moist', 'wet'],
      drainage: ['average', 'poor'],
      smell: ['normal'],
      textures: ['loamy'],
      pHRange: { min: 5.5, max: 7.0 }
    },
    environmentIndicators: {
      locationType: ['outdoor', 'balcony'],
      sunlightHours: { min: 3, max: 7 },
      humidityRange: { min: 55, max: 95 }
    },
    solutions: [
      {
        title: 'Baking soda + neem antifungal cycle',
        priority: 1,
        estimatedDays: '14-21 days',
        steps: [
          'Remove and destroy all infected leaves immediately.',
          'Spray baking soda (1 tbsp) + neem oil (5ml) + soap + water (1L) every 5-7 days.',
          'Apply neem cake soil drench (2 tbsp in 1L water) to strengthen plant immunity.'
        ]
      }
    ],
    preventiveCare: ['Avoid wetting foliage', 'Improve air circulation', 'Apply neem oil preventively during monsoon'],
    recommendedProducts: ['Neem Oil', 'Neem Cake Powder', 'Plant Protection Spray'],
    references: [
      {
        title: 'Rust diseases of ornamental plants - RHS',
        url: 'https://www.rhs.org.uk/disease/rust-diseases',
        source: 'RHS'
      }
    ]
  },
  {
    slug: 'spider-mites',
    diseaseName: 'Spider Mite Infestation',
    aliases: ['makdi-keet', 'red spider mite', 'two-spotted mite'],
    category: 'pest',
    severity: 'moderate',
    summary: 'Microscopic arachnids that suck cell contents from leaves, causing stippling, bronzing, and fine webbing.',
    symptoms: ['fine webbing between leaves', 'tiny yellow/white dots on leaves', 'bronze or rusty coloring', 'leaf drop'],
    plantTypes: ['indoor plants', 'rose', 'vegetables', 'ornamental'],
    leafIndicators: {
      colors: ['yellowing', 'brown'],
      textures: ['speckled', 'dry'],
      hasSpots: true,
      hasWilting: false,
      hasPests: true
    },
    soilIndicators: {
      moisture: ['dry', 'slightly-dry'],
      drainage: ['good', 'average'],
      smell: ['normal'],
      textures: ['loamy'],
      pHRange: { min: 5.5, max: 7.5 }
    },
    environmentIndicators: {
      locationType: ['indoor', 'outdoor', 'balcony'],
      sunlightHours: { min: 4, max: 8 },
      humidityRange: { min: 20, max: 50 }
    },
    solutions: [
      {
        title: 'Humidity + neem mite control',
        priority: 1,
        estimatedDays: '10-21 days',
        steps: [
          'Blast plant with strong water spray to dislodge mites.',
          'Spray neem oil (5ml) + soap (2ml) + water (1L) on all leaves, especially undersides.',
          'Increase humidity by misting daily; mites hate moisture.',
          'Repeat neem spray every 4-5 days.'
        ]
      }
    ],
    preventiveCare: ['Mist plants regularly in dry weather', 'Wipe leaves with wet cloth weekly', 'Apply neem oil preventively in summer'],
    recommendedProducts: ['Neem Oil', 'Plant Protection Spray', 'Plant Booster Spray'],
    references: [
      {
        title: 'Spider mites in the home garden - University of Minnesota',
        url: 'https://extension.umn.edu/yard-and-garden-insects/spider-mites',
        source: 'University Extension'
      }
    ]
  },
  {
    slug: 'fungal-wilt',
    diseaseName: 'Fusarium/Verticillium Wilt',
    aliases: ['murjhana-rog', 'fusarium wilt', 'vascular wilt'],
    category: 'fungal',
    severity: 'severe',
    summary: 'Soil-borne fungal disease blocking water-conducting vessels, causing sudden wilting despite adequate watering.',
    symptoms: ['wilting on one side of plant', 'yellowing from lower leaves upward', 'brown discoloration inside stem', 'afternoon wilting with night recovery', 'complete collapse'],
    plantTypes: ['tomato', 'brinjal', 'ornamental', 'flowers'],
    leafIndicators: {
      colors: ['yellow', 'brown'],
      textures: ['droopy', 'dry'],
      hasSpots: false,
      hasWilting: true,
      hasPests: false
    },
    soilIndicators: {
      moisture: ['moist', 'wet'],
      drainage: ['poor', 'average'],
      smell: ['normal', 'musty'],
      textures: ['compacted', 'clayey'],
      pHRange: { min: 5.5, max: 7.5 }
    },
    environmentIndicators: {
      locationType: ['outdoor', 'balcony'],
      sunlightHours: { min: 4, max: 8 },
      humidityRange: { min: 45, max: 90 }
    },
    solutions: [
      {
        title: 'Neem cake + soil solarization',
        priority: 1,
        estimatedDays: '21-45 days',
        steps: [
          'Mix neem cake (100g) with compost and apply around plant base.',
          'For severely infected soil: cover with clear plastic for 4-6 weeks in peak summer (solarization).',
          'Treat soil with turmeric solution (2 tbsp per 5L water) before replanting.'
        ]
      }
    ],
    preventiveCare: ['Use disease-resistant varieties', 'Rotate crops — 3 year gap', 'Sterilize potting soil before use', 'Clean gardening tools'],
    recommendedProducts: ['Neem Cake Powder', 'Root Booster', 'Vermi Compost'],
    references: [
      {
        title: 'Fusarium wilt management - APS',
        url: 'https://www.apsnet.org/edcenter/disandpath/fungalasco/pdlessons/Pages/Fusarium.aspx',
        source: 'APS'
      }
    ]
  },
  {
    slug: 'scale-insects',
    diseaseName: 'Scale Insect Infestation',
    aliases: ['chhilka-keet', 'armored scale', 'soft scale'],
    category: 'pest',
    severity: 'mild',
    summary: 'Small armored or soft-bodied insects that attach to stems and leaves, resembling tiny brown or white bumps.',
    symptoms: ['small raised bumps on stems and leaves', 'sticky honeydew', 'sooty mold', 'yellowing near infestation', 'branch dieback'],
    plantTypes: ['citrus', 'ficus', 'ornamental', 'indoor plants'],
    leafIndicators: {
      colors: ['green', 'yellowing'],
      textures: ['bumpy', 'sticky'],
      hasSpots: false,
      hasWilting: false,
      hasPests: true
    },
    soilIndicators: {
      moisture: ['moist', 'slightly-dry'],
      drainage: ['good', 'average'],
      smell: ['normal'],
      textures: ['loamy'],
      pHRange: { min: 5.5, max: 7.5 }
    },
    environmentIndicators: {
      locationType: ['indoor', 'outdoor', 'balcony'],
      sunlightHours: { min: 3, max: 8 },
      humidityRange: { min: 30, max: 80 }
    },
    solutions: [
      {
        title: 'Neem oil + alcohol scrub',
        priority: 1,
        estimatedDays: '14-28 days',
        steps: [
          'Use a soft toothbrush dipped in neem oil + alcohol solution to scrub scale off stems.',
          'Spray neem oil (10ml) + dish soap (5ml) + water (1L) on entire plant.',
          'Repeat every 3-5 days until scale is cleared.'
        ]
      }
    ],
    preventiveCare: ['Inspect new plants before bringing home', 'Control ants', 'Apply neem oil monthly as preventive'],
    recommendedProducts: ['Neem Oil', 'Plant Protection Spray', 'Neem Cake Powder'],
    references: [
      {
        title: 'Scale insects management - UC IPM',
        url: 'https://ipm.ucanr.edu/PMG/PESTNOTES/pn7408.html',
        source: 'UC IPM'
      }
    ]
  },
  {
    slug: 'blight',
    diseaseName: 'Blight (Early/Late Blight)',
    aliases: ['jhulsa-rog', 'anga-maari', 'phytophthora blight', 'alternaria blight'],
    category: 'fungal',
    severity: 'severe',
    summary: 'Rapid browning and death of leaves, often starting from tips. Devastates tomato and potato crops during monsoon.',
    symptoms: ['large brown/dark patches on leaves', 'water-soaked spots turning brown', 'white fuzzy growth under leaves', 'concentric rings in spots', 'rapid leaf and fruit rot'],
    plantTypes: ['tomato', 'potato', 'vegetables'],
    leafIndicators: {
      colors: ['brown', 'black'],
      textures: ['necrotic', 'mushy'],
      hasSpots: true,
      hasWilting: true,
      hasPests: false
    },
    soilIndicators: {
      moisture: ['wet', 'moist'],
      drainage: ['poor', 'average'],
      smell: ['normal', 'musty'],
      textures: ['loamy', 'clayey'],
      pHRange: { min: 5.5, max: 7.0 }
    },
    environmentIndicators: {
      locationType: ['outdoor'],
      sunlightHours: { min: 3, max: 7 },
      humidityRange: { min: 60, max: 100 }
    },
    solutions: [
      {
        title: 'Bordeaux mixture + sanitation',
        priority: 1,
        estimatedDays: '7-21 days',
        steps: [
          'Remove all infected leaves and fruits immediately — destroy (do not compost).',
          'Make Bordeaux mixture: copper sulphate (3g) + lime (3g) + water (1L). Spray every 7 days.',
          'Alternatively spray neem oil + garlic + chilli combo every 4-5 days.'
        ]
      }
    ],
    preventiveCare: ['Use disease-resistant varieties', 'Avoid overhead watering', 'Practice 3-year crop rotation', 'Ensure good spacing'],
    recommendedProducts: ['Neem Oil', 'Neem Cake Powder', 'Plant Protection Spray'],
    references: [
      {
        title: 'Late blight management - Cornell University',
        url: 'https://vegetablemdsonline.ppws.vt.edu/crops/tomato/late-blight.html',
        source: 'Cornell Extension'
      }
    ]
  },
  {
    slug: 'damping-off',
    diseaseName: 'Damping Off',
    aliases: ['galne-ka-rog', 'seedling rot', 'pythium rot'],
    category: 'fungal',
    severity: 'severe',
    summary: 'Disease of seedlings where young plants rot at the soil line and topple over, caused by overwatering and poor drainage.',
    symptoms: ['seedlings collapse at soil line', 'stem turns brown/mushy at base', 'white cotton-like fungus on soil', 'seeds fail to germinate', 'entire seedling trays wiped out'],
    plantTypes: ['seedlings', 'vegetables', 'flowers'],
    leafIndicators: {
      colors: ['brown', 'green'],
      textures: ['mushy', 'soft'],
      hasSpots: false,
      hasWilting: true,
      hasPests: false
    },
    soilIndicators: {
      moisture: ['wet', 'waterlogged'],
      drainage: ['poor'],
      smell: ['musty', 'foul'],
      textures: ['compacted'],
      pHRange: { min: 5.0, max: 7.0 }
    },
    environmentIndicators: {
      locationType: ['indoor', 'outdoor', 'balcony'],
      sunlightHours: { min: 2, max: 6 },
      humidityRange: { min: 60, max: 100 }
    },
    solutions: [
      {
        title: 'Cinnamon treatment + soil sterility',
        priority: 1,
        estimatedDays: '7-14 days',
        steps: [
          'Dust cinnamon powder on soil surface around remaining seedlings.',
          'Water seedlings from below — never overhead.',
          'Improve air circulation with a small fan.',
          'Use chamomile tea or diluted turmeric water for watering.'
        ]
      }
    ],
    preventiveCare: ['Use fresh sterilized seed-starting mix', 'Water from bottom only', 'Do not sow seeds too close together', 'Provide bright light'],
    recommendedProducts: ['Neem Cake Powder', 'Vermi Compost', 'Root Booster'],
    references: [
      {
        title: 'Damping off in seedlings - University of Minnesota',
        url: 'https://extension.umn.edu/solve-problem/damping',
        source: 'University Extension'
      }
    ]
  },
  {
    slug: 'nitrogen-deficiency',
    diseaseName: 'Nitrogen Deficiency',
    aliases: ['naitrojan-ki-kami', 'nitrogen starvation', 'pale leaves'],
    category: 'nutrient',
    severity: 'mild',
    summary: 'Most common nutrient deficiency — plants become pale, growth slows, and older leaves turn yellow uniformly.',
    symptoms: ['overall pale green/yellow color', 'lower/older leaves yellow first', 'slow stunted growth', 'thin weak stems', 'small leaves and few flowers'],
    plantTypes: ['all', 'vegetables', 'flowering plants', 'ornamental'],
    leafIndicators: {
      colors: ['yellow', 'pale-green'],
      textures: ['normal', 'thin'],
      hasSpots: false,
      hasWilting: false,
      hasPests: false
    },
    soilIndicators: {
      moisture: ['dry', 'moist'],
      drainage: ['good', 'average'],
      smell: ['normal'],
      textures: ['loamy', 'sandy'],
      pHRange: { min: 5.5, max: 7.5 }
    },
    environmentIndicators: {
      locationType: ['indoor', 'outdoor', 'balcony'],
      sunlightHours: { min: 3, max: 8 },
      humidityRange: { min: 30, max: 80 }
    },
    solutions: [
      {
        title: 'Organic nitrogen boost plan',
        priority: 1,
        estimatedDays: '14-30 days',
        steps: [
          'Top-dress with vermicompost (1-2 inches) around the plant base.',
          'Water with dal/rice water (kitchen waste water) 2-3 times per week.',
          'Add neem cake (2 tbsp) to soil monthly for slow-release nitrogen.',
          'Feed with balanced organic fertilizer every 2-3 weeks.'
        ]
      }
    ],
    preventiveCare: ['Add vermicompost every 3-4 weeks', 'Use kitchen waste water regularly', 'Mulch with dry leaves to retain nutrients'],
    recommendedProducts: ['Vermi Compost', 'All in One Mixture', 'Plant Diet'],
    references: [
      {
        title: 'Nutrient deficiency symptoms in plants - RHS',
        url: 'https://www.rhs.org.uk/soil-composts-mulches/nutrient-deficiencies',
        source: 'RHS'
      }
    ]
  },
  {
    slug: 'sunburn',
    diseaseName: 'Sunburn / Sun Scald',
    aliases: ['dhoop-se-jalana', 'leaf scorch', 'sun damage'],
    category: 'general-care',
    severity: 'mild',
    summary: 'Brown/white bleached patches from excessive direct sunlight, common in Indian summers when shade plants are exposed.',
    symptoms: ['white or bleached patches on leaves', 'brown crispy edges', 'scorched appearance on sun-facing side', 'wilting during afternoon heat', 'faded leaf color'],
    plantTypes: ['indoor plants', 'fern', 'peace lily', 'shade-loving plants'],
    leafIndicators: {
      colors: ['brown', 'white'],
      textures: ['crispy', 'dry'],
      hasSpots: true,
      hasWilting: true,
      hasPests: false
    },
    soilIndicators: {
      moisture: ['dry', 'slightly-dry'],
      drainage: ['good', 'average'],
      smell: ['normal'],
      textures: ['loamy'],
      pHRange: { min: 5.5, max: 7.5 }
    },
    environmentIndicators: {
      locationType: ['outdoor', 'balcony'],
      sunlightHours: { min: 6, max: 14 },
      humidityRange: { min: 20, max: 60 }
    },
    solutions: [
      {
        title: 'Shade relocation + recovery care',
        priority: 1,
        estimatedDays: '14-21 days',
        steps: [
          'Move plant to partial shade immediately.',
          'Remove severely damaged leaves — they will not recover.',
          'Water deeply and apply diluted vermicompost tea.',
          'Gradually reintroduce to sunlight over 2 weeks.'
        ]
      }
    ],
    preventiveCare: ['Acclimatize plants gradually to brighter spots', 'Use 50% shade cloth in peak summer', 'Water early morning only', 'Use mulching to keep roots cool'],
    recommendedProducts: ['Plant Booster Spray', 'Vermi Compost', 'Plant Diet'],
    references: [
      {
        title: 'Sunscald and heat stress in plants - Penn State',
        url: 'https://extension.psu.edu/sunscald',
        source: 'Penn State Extension'
      }
    ]
  }
];
