import express from 'express';
import { Sequelize } from 'sequelize';
import ProductModel from './models/Product.js';
import { defaultProducts } from './defaultData/defaultProducts.js';
import { getAllDeliveryOptions } from './models/DeliveryOption.js'; // Update import for ES module

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