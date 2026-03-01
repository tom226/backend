const mongoose = require('mongoose');

const diagnosisCaseSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      enum: ['scanner', 'chatbot', 'manual-api'],
      default: 'manual-api'
    },
    plantName: { type: String, default: 'unknown' },
    query: { type: String, default: '' },
    observedSymptoms: [{ type: String }],
    leafCondition: {
      color: String,
      texture: String,
      hasSpots: Boolean,
      isWilting: Boolean,
      hasPests: Boolean
    },
    soilCondition: {
      moisture: String,
      drainage: String,
      smell: String,
      texture: String,
      pH: Number
    },
    environment: {
      locationType: String,
      sunlightHours: Number,
      humidity: Number,
      temperatureC: Number
    },
    verification: {
      completenessScore: { type: Number, min: 0, max: 1, default: 0 },
      missingFields: [{ type: String }],
      isSufficientForHighConfidence: { type: Boolean, default: false }
    },
    matchedKnowledgeId: { type: mongoose.Schema.Types.ObjectId, ref: 'PlantKnowledge' },
    result: {
      diseaseName: String,
      confidence: Number,
      severity: String,
      status: String,
      notes: String,
      solutionTitles: [{ type: String }]
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('DiagnosisCase', diagnosisCaseSchema);
