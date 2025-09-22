import Dispensing from '../models/Dispensing.js';

// @desc    Get all dispensing records
// @route   GET /api/v1/dispensing
// @access  Public
export const getDispensingRecords = async (req, res, next) => {
  try {
    const records = await Dispensing.find().populate('patient');
    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Create a dispensing record
// @route   POST /api/v1/dispensing
// @access  Private
export const createDispensingRecord = async (req, res, next) => {
  try {
    const record = await Dispensing.create(req.body);
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};