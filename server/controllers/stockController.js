import StockItem from '../models/StockItem.js';

// @desc    Get all stock items
// @route   GET /api/v1/stock
// @access  Public
export const getStockItems = async (req, res, next) => {
  try {
    const stockItems = await StockItem.find();
    res.status(200).json({ success: true, count: stockItems.length, data: stockItems });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Create a stock item
// @route   POST /api/v1/stock
// @access  Private
export const createStockItem = async (req, res, next) => {
  try {
    const stockItem = await StockItem.create(req.body);
    res.status(201).json({ success: true, data: stockItem });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Update a stock item
// @route   PUT /api/v1/stock/:id
// @access  Private
export const updateStockItem = async (req, res, next) => {
  try {
    const stockItem = await StockItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!stockItem) {
      return res.status(404).json({ success: false });
    }
    res.status(200).json({ success: true, data: stockItem });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Delete a stock item
// @route   DELETE /api/v1/stock/:id
// @access  Private
export const deleteStockItem = async (req, res, next) => {
  try {
    const stockItem = await StockItem.findByIdAndDelete(req.params.id);
    if (!stockItem) {
      return res.status(404).json({ success: false });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};