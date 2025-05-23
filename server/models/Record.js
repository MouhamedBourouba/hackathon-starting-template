import mongoose from "mongoose";

const baseRecordFields = {
  ArabicFullName: {
    type: String,
    required: true,
  },
  LatinFullName: {
    type: String,
    required: true,
  },
  BirthDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        return value <= new Date();
      },
      message: 'Birth date cannot be in the future'
    }
  },
  City: {
    type: String,
    required: true,
  },
  Gender: {
    type: String,
    enum: ["Male", "Female"],
    required: true,
  },
  FatherName: String,
  MotherName: String,
  SignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'employee',
    required: true,
  },
  Status: {
    type: String,
    enum: ["pending", "verified", "rejected"],
    default: "pending",
  },
  StatusUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'employee',
    default: null,
  },
  Hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "hospital",
    default: null
  }
};

const DeathRecordSchema = new mongoose.Schema({
  ...baseRecordFields,
  DateOfDeath: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        return value <= new Date();
      },
      message: 'Death date cannot be in the future'
    }
  },
  PlaceOfDeath: {
    type: String,
    required: true,
  },
  CauseOfDeath: {
    type: String,
  },
});

const BirthRecordSchema = new mongoose.Schema({
  ...baseRecordFields,
});


const DeathRecord = mongoose.model('DeathRecord', DeathRecordSchema);
const BirthRecord = mongoose.model('BirthRecord', BirthRecordSchema);

export { DeathRecord, BirthRecord };
