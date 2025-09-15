const Issue = require('../models/Issue.model');

// Add comment to an issue
exports.addComment = async (req, res) => {
    try {
        const { issueId } = req.params;
        const { userId, comment } = req.body;

        if (!userId || !comment) {
            return res.status(400).json({ success: false, message: "userId and comment are required" });
        }

        const issue = await Issue.findById(issueId);
        if (!issue) return res.status(404).json({ success: false, message: "Issue not found" });

        issue.comments.push({ user: userId, comment });
        await issue.save();

        res.status(201).json({ success: true, message: "Comment added", data: issue.comments });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


// Update comment (by user or admin)
exports.updateComment = async (req, res) => {
    try {
        const { issueId, commentId } = req.params;
        const { userId, comment, role } = req.body;

        const issue = await Issue.findById(issueId);
        if (!issue) return res.status(404).json({ success: false, message: "Issue not found" });

        const com = issue.comments.id(commentId);
        if (!com) return res.status(404).json({ success: false, message: "Comment not found" });

        // Allow admin OR the comment owner
        if (role !== 'admin' && String(com.user) !== userId) {
            return res.status(403).json({ success: false, message: "Unauthorized to update this comment" });
        }

        com.comment = comment;
        await issue.save();

        res.json({ success: true, message: "Comment updated", data: com });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};



// Delete comment (by admin only)
exports.deleteComment = async (req, res) => {
    try {
        const { issueId, commentId } = req.params;
        const { userId, role } = req.body;

        const issue = await Issue.findById(issueId);
        if (!issue) return res.status(404).json({ success: false, message: "Issue not found" });

        const comment = issue.comments.id(commentId);
        if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });

        // Only admin or comment owner can delete
        if (role !== 'admin' && String(comment.user) !== userId) {
            return res.status(403).json({ success: false, message: "Unauthorized to delete this comment" });
        }

        // Remove comment
        issue.comments = issue.comments.filter((c) => String(c._id) !== commentId);
        await issue.save();

        res.json({ success: true, message: "Comment deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

