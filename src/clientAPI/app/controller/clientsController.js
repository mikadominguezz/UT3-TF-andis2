require('dotenv').config();

const express = require('express');
const router = express.Router();
const { authenticateJWT, authorizeCustomersOnly } = require('../middleware/auth');
const ClientsService = require('../service/clientsService');

const SECRET = process.env.JWT_SECRET;

// Get products for clients
router.get('/products', authenticateJWT(SECRET), async (req, res) => {
  try {
    const products = await ClientsService.getProducts();
    res.json(products);
  } catch (error) {
    console.error('Controller Error - getProducts:', error);
    res.status(500).json({ error: 'Error fetching products' });
  }
});

// Create order (only for customers, not admins)
router.post('/orders', authenticateJWT(SECRET), authorizeCustomersOnly(), async (req, res) => {
  try {
    const { productId, quantity, notes } = req.body;
    if (!productId || !quantity) {
      return res.status(400).json({ error: 'ProductId and quantity are required' });
    }

    const orderData = {
      clientId: req.user.id,
      productId,
      quantity: parseInt(quantity),
      notes: notes || '',
      createdBy: req.user.username
    };

    const newOrder = await ClientsService.createOrder(orderData);
    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Controller Error - createOrder:', error);
    res.status(500).json({ error: 'Error creating order' });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'Clients API is healthy' });
});

module.exports = router;
