import DirectDispensing from '../models/DirectDispensing.js';

// @desc    Get all direct dispensing records
// @route   GET /api/v1/direct-dispensing
// @access  Public
export const getDirectDispensingRecords = async (req, res, next) => {
  try {
    const records = await DirectDispensing.find();
    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Create a direct dispensing record
// @route   POST /api/v1/direct-dispensing
// @access  Private
export const createDirectDispensingRecord = async (req, res, next) => {
  try {
    const record = await DirectDispensing.create(req.body);
    // You should also update your stock levels here
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};