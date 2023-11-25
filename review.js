const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const app = express();
const PORT = 8080;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/pratiksha', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
// Apply CORS middleware with the specified options
const corsOptions = {
    origin: 'http://localhost:8080', // Frontend URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
};

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    contact: String,
    city: String,
    address: String,
});

const User = mongoose.model('User', userSchema);

app.post('/registration', async (req, res) => {
    const { name, email, password, contact, city, address } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        name: name,
        email: email,
        password: hashedPassword,
        contact: contact,
        city: city,
        address: address,
    });

    try {
        await newUser.save();
        console.log('User registered successfully');
        res.status(200).json({ message: 'Registration successful' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Error registering user: '+ error.message });
    }
});

app.post('/submit', async (req, res) => {
    const { name, email,feedback } = req.body;

    console.log('received form:', email); // Log the received email

    try {
        // Find user in the database
        const user = await User.findOne({ email: email });

        if (user && bcrypt.compareSync(email, user.email)) {
            console.log('User found:', user); // Log the user if found
            res.status(200).json({ message: 'form submitted' });
        } else {
            console.log('User not found'); // Log if user is not found
            res.status(401).json({ error: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Error finding user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});