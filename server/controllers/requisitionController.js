import Requisition from '../models/Requisition.js';

// @desc    Get all requisitions
// @route   GET /api/v1/requisitions
// @access  Public
export const getRequisitions = async (req, res, next) => {
  try {
    const requisitions = await Requisition.find();
    res.status(200).json({ success: true, count: requisitions.length, data: requisitions });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Create a requisition
// @route   POST /api/v1/requisitions
// @access  Private
export const createRequisition = async (req, res, next) => {
  try {
    const requisition = await Requisition.create(req.body);
    res.status(201).json({ success: true, data: requisition });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Update a requisition
// @route   PUT /api/v1/requisitions/:id
// @access  Private
export const updateRequisition = async (req, res, next) => {
  try {
    const requisition = await Requisition.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!requisition) {
        return res.status(404).json({ success: false, message: 'Requisition not found' });
    }

    res.status(200).json({ success: true, data: requisition });
  } catch (error) {
      res.status(400).json({ success: false, message: error.message });
  }
};