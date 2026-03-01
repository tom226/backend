const mongoose = require('mongoose');

const referenceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    url: { type: String },
    source: { type: String, default: 'internal' },
    publishedAt: Date,
    lastCheckedAt: Date
  },
  { _id: false }
);

const plantEnergySchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    commonName: { type: String, required: true, index: true },
    hindiName: { type: String, default: '' },
    scientificName: { type: String, default: '' },
    aliases: [{ type: String }],

    // Energy classification
    energy: {
      type: { type: String, enum: ['positive', 'negative', 'caution', 'neutral'], required: true },
      score: { type: Number, min: 0, max: 100, default: 50 },
      summary: { type: String, required: true },           // brief one-liner shown first
      detailedDescription: { type: String, required: true } // shown on "Read More"
    },

    // Vastu & Feng Shui
    vastu: {
      direction: { type: String, default: '' },
      insight: { type: String, required: true },            // brief
      detailedInsight: { type: String, default: '' },       // expanded
      dosAndDonts: [{ type: String }]
    },

    // Placement info
    placement: {
      ideal: { type: String, enum: ['indoor', 'outdoor', 'both', 'avoid'], default: 'both' },
      tips: [{ type: String }],
      avoidLocations: [{ type: String }]
    },

    // Health & Air Quality
    healthBenefits: {
      airPurify: { type: Boolean, default: false },
      oxygenOutput: { type: String, enum: ['very-high', 'high', 'medium', 'low', 'none'], default: 'medium' },
      nasaApproved: { type: Boolean, default: false },
      toxinsRemoved: [{ type: String }],
      medicinalUses: [{ type: String }],
      healthSummary: { type: String, default: '' },         // brief
      healthDetailed: { type: String, default: '' }         // expanded
    },

    // Spiritual & Cultural
    spiritual: {
      significance: { type: String, default: '' },
      festivals: [{ type: String }],
      deities: [{ type: String }],
      traditions: [{ type: String }]
    },

    // Care brief
    care: {
      sunlight: { type: String, default: '' },
      watering: { type: String, default: '' },
      soil: { type: String, default: '' },
      temperature: { type: String, default: '' },
      difficulty: { type: String, enum: ['easy', 'moderate', 'hard'], default: 'easy' }
    },

    // Healthy plant indicators (what a healthy specimen looks like)
    healthyIndicators: {
      leafColor: { type: String, default: '' },
      leafTexture: { type: String, default: '' },
      growth: { type: String, default: '' },
      signs: [{ type: String }]
    },

    // Image hints for matching scanned photos
    imageHints: {
      leafShape: [{ type: String }],
      leafColors: [{ type: String }],
      flowerColors: [{ type: String }],
      distinctiveFeatures: [{ type: String }]
    },

    // Data provenance
    references: [referenceSchema],
    verification: {
      status: {
        type: String,
        enum: ['verified', 'review-needed', 'provisional'],
        default: 'verified'
      },
      evidenceScore: { type: Number, min: 0, max: 1, default: 0.85 },
      lastVerifiedAt: { type: Date, default: Date.now },
      reviewedBy: { type: String, default: 'system-seed' },
      crossReferencedSources: { type: Number, default: 0 }
    },

    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

plantEnergySchema.index({ commonName: 'text', hindiName: 'text', scientificName: 'text', aliases: 'text' });

module.exports = mongoose.model('PlantEnergy', plantEnergySchema);
