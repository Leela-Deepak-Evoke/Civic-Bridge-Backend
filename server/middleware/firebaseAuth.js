// middleware/firebaseAuth.js
const admin = require('./firebase'); // initialized Firebase Admin SDK
const User = require('../models/User.model');

const authenticate = async (req, res, next) => {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) return res.status(401).json({ message: "Missing token" });

    try {
        const decoded = await admin.auth().verifyIdToken(token);
        req.firebaseUid = decoded.uid;

        // Fetch user role from DB
        const user = await User.findOne({ firebaseUid: decoded.uid });
        if (!user) return res.status(404).json({ message: "User not found in database" });

        req.user = user; // attach full user
        next();
    } catch (error) {
        console.error("Auth error:", error);
        res.status(401).json({ message: "Invalid token" });
    }
};

// Optional middleware to check roles
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access Denied" });
        }
        next();
    };
};

module.exports = { authenticate, authorizeRoles };
