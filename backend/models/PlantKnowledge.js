const mongoose = require('mongoose');

const referenceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    source: { type: String, default: 'internal' },
    publishedAt: Date,
    lastCheckedAt: Date
  },
  { _id: false }
);

const solutionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    priority: { type: Number, default: 1 },
    estimatedDays: { type: String, default: '3-14 days' },
    steps: [{ type: String, required: true }]
  },
  { _id: false }
);

const plantKnowledgeSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    diseaseName: { type: String, required: true, index: true },
    aliases: [{ type: String }],
    category: {
      type: String,
      enum: ['fungal', 'bacterial', 'pest', 'nutrient', 'watering', 'soil', 'general-care'],
      required: true
    },
    severity: { type: String, enum: ['mild', 'moderate', 'severe'], default: 'moderate' },
    summary: { type: String, required: true },
    symptoms: [{ type: String, required: true }],
    plantTypes: [{ type: String }],
    leafIndicators: {
      colors: [{ type: String }],
      textures: [{ type: String }],
      hasSpots: { type: Boolean, default: false },
      hasWilting: { type: Boolean, default: false },
      hasPests: { type: Boolean, default: false }
    },
    soilIndicators: {
      moisture: [{ type: String, enum: ['dry', 'slightly-dry', 'moist', 'wet', 'waterlogged', 'unknown'] }],
      drainage: [{ type: String, enum: ['poor', 'average', 'good', 'unknown'] }],
      smell: [{ type: String, enum: ['normal', 'foul', 'musty', 'none', 'unknown'] }],
      textures: [{ type: String }],
      pHRange: {
        min: { type: Number, default: 5.5 },
        max: { type: Number, default: 7.2 }
      }
    },
    environmentIndicators: {
      locationType: [{ type: String, enum: ['indoor', 'outdoor', 'balcony', 'unknown'] }],
      sunlightHours: {
        min: { type: Number, default: 3 },
        max: { type: Number, default: 8 }
      },
      humidityRange: {
        min: { type: Number, default: 35 },
        max: { type: Number, default: 85 }
      }
    },
    solutions: [solutionSchema],
    preventiveCare: [{ type: String }],
    recommendedProducts: [{ type: String }],
    references: [referenceSchema],
    verification: {
      status: {
        type: String,
        enum: ['verified', 'review-needed', 'provisional'],
        default: 'verified'
      },
      evidenceScore: { type: Number, min: 0, max: 1, default: 0.8 },
      lastVerifiedAt: { type: Date, default: Date.now },
      reviewedBy: { type: String, default: 'system-seed' }
    },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

plantKnowledgeSchema.index({ diseaseName: 'text', summary: 'text', symptoms: 'text', aliases: 'text' });

module.exports = mongoose.model('PlantKnowledge', plantKnowledgeSchema);
