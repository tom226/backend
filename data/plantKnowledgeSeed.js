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
  }
];
