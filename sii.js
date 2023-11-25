const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Body parser middleware
app.use(bodyParser.json())
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/pratiksha', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

// Create a schema for CartItem
const cartItemSchema = new mongoose.Schema({
  name: String,
  price: String,
  total:String,
   
})
  


const CartItem = mongoose.model('CartItems', cartItemSchema);



// Route to get all items in the cart
app.get('/getCartItems', async (req, res) => {
  try {
    const cartItems = await CartItem.find();
    res.status(200).json(cartItems);
  } catch (err) {
    res.status(500).json({ error: 'Unable to fetch cart items' });
  }
});

app.post('/addToCartitems', async (req, res) => {
  console.log(req.body)
  // CartItem.create(
  //   req.body
  // )

  

// try {
//     const cartItems = await CartItem.find();
//     res.status(200).json(cartItems);
//   } catch (err) {
//     res.status(500).json({ error: 'Unable to fetch cart items' });
//   }
});


 
// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
