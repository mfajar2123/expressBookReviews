const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Session middleware to handle session management
app.use("/customer", session({
    secret: "fingerprint_customer", 
    resave: true, 
    saveUninitialized: true
}));

// Middleware to authenticate the user using JWT
app.use("/customer/auth/*", function auth(req, res, next) {
    if (req.session.authorization) {
        let token = req.session.authorization['accessToken'];

        // Verify the JWT token (make sure the secret matches)
        jwt.verify(token, "acces", (err, user) => { // Updated to 'acces' to match token signing
            if (!err) {
                req.user = user; // Store the decoded user information
                next(); // Proceed to the next middleware or route
            } else {
                return res.status(403).json({ message: "User not authenticated" });
            }
        });
    } else {
        return res.status(403).json({ message: "User not logged in" });
    }
});

// Define routes
app.use("/customer", customer_routes);
app.use("/", genl_routes);

// Start the server
const PORT = 5000;
app.listen(PORT, () => console.log("Server is running on port " + PORT));