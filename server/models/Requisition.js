import mongoose from 'mongoose';

const RequisitionItemSchema = new mongoose.Schema({
  medicine: {
    type: String,
    required: true,
  },
  qty: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Issued', 'Rejected'],
    default: 'Pending',
  },
  issuedQty: {
    type: Number,
    default: 0,
  },
});

const RequisitionSchema = new mongoose.Schema({
  from: {
    type: String,
    required: [true, 'Please specify the department'],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  items: [RequisitionItemSchema],
  status: {
    type: String,
    enum: ['Sent', 'Processing', 'Closed'],
    default: 'Sent',
  },
});

export default mongoose.model('Requisition', RequisitionSchema);