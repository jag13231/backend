import express from 'express';
import { Sequelize } from 'sequelize';
import UserModel from './models/User.js';
import ProductModel from './models/Product.js';
import { defaultProducts } from './defaultData/defaultProducts.js';

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
const User = UserModel(sequelize);
const Product = ProductModel(sequelize);

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Hello, Express with ES Modules!');
});

app.get('/users', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    const newUser = await User.create({ name, email });
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create user' });
  }
});

app.get('/products', async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
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