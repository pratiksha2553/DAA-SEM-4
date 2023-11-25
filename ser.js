const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const cookieParser = require('cookie-parser');
const PORT = 8080;

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Passport setup
passport.use(new GoogleStrategy({
    clientID: 415495562108,
    clientSecret:'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',
    callbackURL: '/auth/google/callback' // This callback URL should match the one configured in Google Developer Console
  },
  (accessToken, refreshToken, profile, done) => {
    // Verify user profile and create/find user in your database
    // Example:
    User.findOne({ googleId: profile.id }, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        // Create a new user with details from Google profile
        const newUser = new User({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value
          // Additional fields as needed
        });
        // Save the new user to the database
        newUser.save((err) => {
          if (err) {
            return done(err);
          }
          return done(null, newUser);
        });
      } else {
        // If user already exists, return the user
        return done(null, user);
      }
    });
  }
));

// Route for initiating Google OAuth login
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback route after Google authentication
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Redirect to the logged-in page or perform other actions upon successful login
    res.redirect('/logged-in');
  }
);



app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());h:
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/pratiksha', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    contact: String,
    city: String,
    address: String,
    tokens: [{ token: String }] // Define 'tokens' as an array of objects with 'token' field
    // Other fields as per your schema
});

        // You can add more fields based on your requirements
    



const User = mongoose.model('User', userSchema);

const locationsSchema = new mongoose.Schema({
    email: String,
    flat: String,
    landmark: String,
    searchedLocation: {
        center: {
            lat: Number,
            lng: Number,
        },
    },
});





const Location = mongoose.model('Location', locationsSchema);


const generateToken = (userId) => {
    const token = jwt.sign({ userId }, 'your-secret-key', { expiresIn: '30d' }); // Set expiration for 30 days
    return token;
};

const authenticateUser = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    try {
        const decoded = jwt.verify(token, 'your-secret-key'); // Verify the token

        // Add user information to the request object
        req.userId = decoded.userId;
        next(); // Proceed to the next middleware
    } catch (error) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};


// Login endpoint
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = generateToken(user._id);
        user.tokens.push({ token });
        await user.save();

        
            res.cookie('token', token, {
            httpOnly: true,
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Expires in 30 days
            secure: true, // Set to true if your app is served over HTTPS
            sameSite: 'strict', // Adjust based on your requirements
            // Add other necessary options: domain, path, etc.
        });
        
        // Construct the response object with required fields
        const response = {
            _id: user._id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            token
        };
        
        res.cookie('token', token, { httpOnly: true });
        res.status(200).json({ message: 'Login successful', user: response });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Error logging in' });
    }
});
// Token verification middleware
const verifyToken = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const secretKey = process.env.JWT_SECRET || 'defaultSecretKey';

jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
        console.error('Token verification failed:', err);
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    req.userId = decoded.userId;
    next();
    // Verify token logic
});

};

// Protected route example
app.get('/protected', verifyToken, (req, res) => {
    res.json({ message: 'Protected route accessed successfully' });
});


// Login endpoint
// Login endpoint


// Registration endpoint
// Registration endpoint
app.post('/registration', async (req, res) => {
    const { name, email, password, contact, city, address } = req.body;

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ error: 'Email is already in use' });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        const newUser = new User({
            name: name,
            email: email,
            password: hashedPassword,
            contact: contact,
            city: city,
            address: address,
            tokens: [] // Ensure tokens array is initialized for new users
        });

        const savedUser = await newUser.save();
        const token = generateToken(savedUser._id);
        savedUser.tokens.push({ token });
        await savedUser.save();

        res.cookie('token', token, {
            httpOnly: true,
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Expires in 30 days
            secure: true, // Set to true if your app is served over HTTPS
            sameSite: 'strict', // Adjust based on your requirements
            // Add other necessary options: domain, path, etc.
        });

        console.log('User registered successfully:', savedUser.email); // Log successful registration
        
        // Construct the response object with required fields
        const response = {
            _id: savedUser._id,
            name: savedUser.name,
            email: savedUser.email,
            createdAt: savedUser.createdAt,
            updatedAt: savedUser.updatedAt,
            token
        };
        
        res.status(200).json({ message: 'Registration successful', user: response });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Error registering user' });
    }
});

// ... (existing code)

// ... (existing code)

// Feedback endpoint
app.post('/submit_feedback', authenticateUser, async (req, res) => {
    // Accessible only for authenticated users due to authenticateUser middleware

    const { name, email, feedback, rating } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or user not found' });
        }

        console.log('Retrieved User:', user.name);

        // Process the feedback and save it to the database or perform other actions

        res.status(200).json({ message: 'Feedback submitted successfully' });
    } catch (error) {
        console.error('Error finding user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ... (existing code)




app.post('/saveLocation', async (req, res) => {
    try {
        console.log('Received location data:', req.body);
        const { email, flat, landmark, searchedLocation } = req.body;

        const newLocation = new Location({
            email: email,
            flat: flat,
            landmark: landmark,
            searchedLocation: searchedLocation,
        });

        newLocation.save()
            .then(() => {
                console.log('Location saved successfully');
                res.status(200).json({ message: 'Location saved successfully' });
            })
            .catch((error) => {
                console.error('Error saving location:', error);
                res.status(500).json({ error: 'Error saving location: ' + error.message });
            });
    } catch (error) {
        console.error('Error in /saveLocation endpoint:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.post('/add_to_cart', async (req, res) => {
    try {
        const { email, itemName, itemPrice, quantity } = req.body;

        // Find the user based on the provided email
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Add the item to the user's cart
        const cartItem = {
            itemName: itemName,
            itemPrice: itemPrice,
            quantity: quantity,
        };

        user.cart.push(cartItem);

        // Save the updated user with the new cart information
        await user.save();

        res.status(200).json({ message: 'Item added to cart successfully', cartItem: cartItem });
    } catch (error) {
        console.error('Error adding item to cart:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get(
    '/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        // Successful authentication, redirect to a different route or send a response
        res.redirect('/location');
    }
);





app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});