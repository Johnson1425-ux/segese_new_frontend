import Invoice from '../models/Invoice.js';
import StockItem from '../models/StockItem.js';

// @desc    Get all invoices
// @route   GET /api/v1/item-receiving/invoices
// @access  Public
export const getInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find();
    res.status(200).json({ success: true, count: invoices.length, data: invoices });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Add an invoice
// @route   POST /api/v1/item-receiving/invoices
// @access  Private
export const addInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.create(req.body);
    res.status(201).json({ success: true, data: invoice });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Receive an item
// @route   POST /api/v1/item-receiving
// @access  Private
export const receiveItem = async (req, res, next) => {
  try {
    // This is a simplified example. You'd likely have more complex logic here
    // to handle creating a new stock item or updating an existing one.
    const { medicine, qty } = req.body;
    // For simplicity, let's assume this just adds to the stock
    // A more robust solution would check if the item exists and update it.
    const stockItem = await StockItem.findOneAndUpdate(
      { name: medicine },
      { $inc: { quantity: qty } },
      { new: true, upsert: true, runValidators: true }
    );
    res.status(201).json({ success: true, data: stockItem });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};