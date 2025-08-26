const admin = require('../middleware/firebase');
const User = require('../models/User.model');
const axios = require('axios');
const config = require('../config/config');

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.status(400).json({ message: "Email and password are required" });

    try {
        const url = config.LOGIN_URL;
        const response = await axios.post(url, {
            email,
            password,
            returnSecureToken: true
        });

        const { idToken, refreshToken, expiresIn, localId } = response.data;

        // 🔎 Find the user in your DB by Firebase UID or email
        const user = await User.findOne({ firebaseUid: localId }) || await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found in database" });
        }

        res.status(200).json({
            message: "Login successful",
            id: user._id,
            firebaseUid: localId,
            idToken,
            refreshToken,
            expiresIn
        });

    } catch (error) {
        console.error("Login error:", error.response?.data || error.message);
        res.status(401).json({ message: "Invalid credentials", error: error.response?.data?.error });
    }
};


const logoutUser = async (req, res) => {
    try {
        const firebaseUid = req.user.firebaseUid; // or wherever you store it after authentication

        if (!firebaseUid || typeof firebaseUid !== 'string' || firebaseUid.length > 128) {
            return res.status(400).json({
                message: 'Invalid Firebase UID provided for logout.',
                uid: firebaseUid
            });
        }

        // Revoke refresh tokens (forces sign-out)
        await admin.auth().revokeRefreshTokens(firebaseUid);

        res.status(200).json({ message: 'Logout successful. Tokens revoked.' });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ message: 'Server error during logout' });
    }
};

const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Check if already exists in MongoDB
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: "User already exists in DB" });
        }

        // Create user in Firebase
        const firebaseUser = await admin.auth().createUser({
            email,
            password,
            displayName: name,
            emailVerified: false,
            disabled: false
        });

        // Save to MongoDB
        const user = new User({
            name,
            email,
            firebaseUid: firebaseUser.uid,
            role
        });

        await user.save();

        res.status(201).json({
            message: "User created in Firebase and MongoDB",
            user
        });

    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Error creating user", error: error.message });
    }
};


const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        console.log("Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

const singleUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) return res.status(404).json({ message: "User Not Found" });

        res.status(200).json(user);
    } catch (error) {
        console.log("Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

const updateUser = async (req, res) => {
    try {
        const { name, email, role } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User Not Found" });

        // Update Firebase user
        await admin.auth().updateUser(user.firebaseUid, {
            displayName: name,
            email: email
        });

        // Update MongoDB user
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, role },
            { new: true }
        );

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User Not Found" });

        // Delete from Firebase Auth
        await admin.auth().deleteUser(user.firebaseUid);

        // Delete from MongoDB
        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "User successfully deleted" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Server Error" });
    }
};


module.exports = { loginUser, logoutUser, createUser, getUsers, singleUser, updateUser, deleteUser };
