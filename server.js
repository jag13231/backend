import express from 'express';
import { Sequelize } from 'sequelize';
import ProductModel from './models/Product.js';
import { defaultProducts } from './defaultData/defaultProducts.js';
import { getAllDeliveryOptions } from './models/DeliveryOption.js'; // Update import for ES module
import { getCart, addToCart, updateCartItem } from './models/Cartitem.js'; // Import cart functions

const app = express();
const PORT = 3000;


// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite' // Path to SQLite database file
});

// Test database connection
sequelize.authenticate()
  .then(() => console.log('Database connected successfully.'))
  .catch(err => console.error('Unable to connect to the database:', err));

// Initialize models
const Product = ProductModel(sequelize);

// Middleware
app.use(express.json());
app.use('/images', express.static('images')); // Serve static files from the images folder

// Routes
app.get('/', (req, res) => {
  res.send('Hello, Express with ES Modules!');
});

app.get('/products', async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/delivery-options', (req, res) => {
  try {
    const deliveryOptions = getAllDeliveryOptions();
    res.json(deliveryOptions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch delivery options' });
  }
});

app.get('/cart-items', async (req, res) => {
  try {
    const expand = req.query.expand;
    const cartItems = getCart().map(async (item) => {
      const baseItem = {
        ...item,
        createdAt: new Date().toISOString(), // Add createdAt field
        updatedAt: new Date().toISOString()  // Add updatedAt field
      };

      if (expand === 'product') {
        const product = await Product.findOne({ where: { id: item.productId } });
        return { ...baseItem, product };
      }

      return baseItem;
    });

    const resolvedCartItems = await Promise.all(cartItems);
    res.json(resolvedCartItems);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cart items' });
  }
});

app.post('/cart-items', async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // Validate quantity
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      return res.status(400).json({ error: 'Quantity must be a number between 1 and 10.' });
    }

    // Check if product exists in the database
    const product = await Product.findOne({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    // Check if product already exists in the cart
    const cart = getCart();
    const existingCartItem = cart.find(item => item.productId === productId);

    let cartItem;
    if (existingCartItem) {
      // Update quantity if product already exists in the cart
      updateCartItem(productId, { quantity: existingCartItem.quantity + quantity });
      cartItem = { ...existingCartItem, quantity: existingCartItem.quantity + quantity };
    } else {
      // Add new product to the cart with default deliveryOptionId
      cartItem = { productId, quantity, deliveryOptionId: "1" };
      addToCart(cartItem);
    }

    res.status(200).json({ message: 'Product added to cart successfully.', cartItem });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add product to cart.' });
  }
});

app.put('/cart-items/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity, deliveryOptionId } = req.body;

    // Validate quantity if provided
    if (quantity !== undefined) {
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
        return res.status(400).json({ error: 'Quantity must be a number between 1 and 10.' });
      }
    }

    // Validate deliveryOptionId if provided
    if (deliveryOptionId !== undefined) {
      const deliveryOptions = getAllDeliveryOptions();
      const isValidOption = deliveryOptions.some(option => option.id === deliveryOptionId);
      if (!isValidOption) {
        return res.status(400).json({ error: 'Invalid delivery option ID.' });
      }
    }

    // Check if product exists in the cart
    const cart = getCart();
    const existingCartItem = cart.find(item => item.productId === productId);
    if (!existingCartItem) {
      return res.status(404).json({ error: 'Product not found in the cart.' });
    }

    // Update cart item
    const updatedCartItem = {
      ...existingCartItem,
      ...(quantity !== undefined && { quantity }),
      ...(deliveryOptionId !== undefined && { deliveryOptionId })
    };
    updateCartItem(productId, updatedCartItem);

    res.status(200).json({ message: 'Cart item updated successfully.', cartItem: updatedCartItem });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update cart item.' });
  }
});

app.delete('/cart-items/:productId', (req, res) => {
  try {
    const { productId } = req.params;

    // Check if product exists in the cart
    const cart = getCart();
    const existingCartItem = cart.find(item => item.productId === productId);
    if (!existingCartItem) {
      return res.status(404).json({ error: 'Product not found in the cart.' });
    }

    // Remove product from the cart
    const updatedCart = cart.filter(item => item.productId !== productId);
    // Update the cart storage with the filtered cart
    updateCartItem(productId, { remove: true }); // Assuming `remove: true` removes the item from storage

    res.status(200).json({ message: 'Product removed from cart successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove product from cart.' });
  }
});

// Sync database and create tables
sequelize.sync().then(async () => {
  const productCount = await Product.count();
  if (productCount === 0) {
    await Product.bulkCreate(defaultProducts.map(product => ({
      id: product.id,
      image: product.image,
      name: product.name,
      ratingStars: product.rating.stars,
      ratingCount: product.rating.count,
      priceCents: product.priceCents,
      keywords: product.keywords
    })));
    console.log('Default products have been added to the database.');
  } else {
    console.log('Products already exist in the database.');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});