const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 8080;

app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());

// Connect to MongoDB using Mongoose
mongoose.connect('mongodb://localhost:27017/pratiksha', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
const corsOptions = {
    origin: 'http://localhost:8080', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));


app.use(cors(corsOptions));


// MongoDB schema setup
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    contact: String,
    city: String,
    address: String,
});

const User = mongoose.model('User', userSchema);

// POST request handling for registration endpoint
app.post('/registration', (req, res) => {
    const { name, email, password, contact, city, address } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = new User({
        name: name,
        email: email,
        password: hashedPassword,
        contact: contact,
        city: city,
        address: address,
    });

    newUser.save((err) => {
        if (err) {
            console.error('Error registering user:', err);
            res.status(500).send('Error registering user: ' + err.message);
            return;
        }

        console.log('User registered successfully');
        res.send('Registration successful');
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
