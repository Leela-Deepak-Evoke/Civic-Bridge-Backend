const Issue = require('../models/Issue.model');

// Create new issue
const createIssue = async (req, res) => {
    try {
        const {
            title,
            description,
            location,
            imageUrl,
            userId,
            status,
            flags = {}
        } = req.body;

        if (!userId || !title || !description || !location || !imageUrl) {
            return res.status(400).json({ success: false, message: "All fields are required including userId" });
        }

        const issueData = {
            title,
            description,
            location,
            imageUrl,
            reportedBy: userId,
            status: status || "Pending",
            flags: {
                isCritical: flags.isCritical || false,
                isDuplicate: flags.isDuplicate || false,
                notes: flags.notes || ""
            }
        };

        const newIssue = await Issue.create(issueData);
        return res.status(201).json({ success: true, data: newIssue });
    } catch (err) {
        console.error("Issue creation error:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
};


// Update an issue (only owner or admin)
const updateIssue = async (req, res) => {
    try {
        const { id } = req.params;
        const { flags, ...updates } = req.body;
        const { _id: userId, role } = req.user; // ✅ Get from authenticated user

        const issue = await Issue.findById(id);
        if (!issue) return res.status(404).json({ success: false, message: "Issue not found" });

        if (String(issue.reportedBy) !== String(userId) && role !== 'admin') {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        // Handle optional flags update
        if (flags) {
            updates.flags = {
                isCritical: flags.isCritical ?? issue.flags.isCritical,
                isDuplicate: flags.isDuplicate ?? issue.flags.isDuplicate,
                notes: flags.notes ?? issue.flags.notes
            };
        }

        const updatedIssue = await Issue.findByIdAndUpdate(id, updates, { new: true });
        return res.json({ success: true, data: updatedIssue });
    } catch (err) {
        console.error("Update error:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
};


// View all issues
const getAllIssues = async (req, res) => {
    try {
        const issues = await Issue.find()
            .sort({ createdAt: -1 })
            .populate('reportedBy', 'name email');

        return res.json({ success: true, data: issues });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};


// Get issues by location
const getIssuesByLocation = async (req, res) => {
    const { location } = req.params;

    if (!location) {
        return res.status(400).json({ success: false, message: "Location parameter is required" });
    }

    try {
        const issues = await Issue.find({ location })
            .sort({ createdAt: -1 })
            .populate('reportedBy', 'name email');

        return res.json({ success: true, data: issues });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};


// Get issues reported by user
const getUserIssues = async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, message: "userId is required in query" });
    }

    try {
        const issues = await Issue.find({ reportedBy: userId })
            .sort({ createdAt: -1 })
            .populate('reportedBy', 'name email');

        return res.json({ success: true, data: issues });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};


// Get issues by status
const getIssuesByStatus = async (req, res) => {
    const { status } = req.params;

    if (!['Pending', 'Ongoing', 'Resolved'].includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    try {
        const issues = await Issue.find({ status })
            .sort({ createdAt: -1 })
            .populate('reportedBy', 'name email');

        return res.json({ success: true, data: issues });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};


// Get issues by flag
const getIssuesByFlag = async (req, res) => {
    const { flagType } = req.params;

    const validFlags = ['isCritical', 'isDuplicate'];
    if (!validFlags.includes(flagType)) {
        return res.status(400).json({ success: false, message: 'Invalid flag type' });
    }

    try {
        const filter = {};
        filter[`flags.${flagType}`] = true;

        const issues = await Issue.find(filter)
            .sort({ createdAt: -1 })
            .populate('reportedBy', 'name email');

        return res.json({ success: true, data: issues });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};


// Delete an issue (owner or admin)
const deleteIssue = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id: userId, role } = req.user;  // get from auth middleware

        const issue = await Issue.findById(id);
        if (!issue) {
            return res.status(404).json({ success: false, message: "Issue not found" });
        }

        if (String(issue.reportedBy) !== String(userId) && role !== 'admin') {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        await Issue.findByIdAndDelete(id);
        return res.json({ success: true, message: "Issue deleted successfully" });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};


module.exports = {
    createIssue,
    updateIssue,
    getAllIssues,
    getUserIssues,
    deleteIssue,
    getIssuesByLocation,
    getIssuesByStatus,
    getIssuesByFlag
};
