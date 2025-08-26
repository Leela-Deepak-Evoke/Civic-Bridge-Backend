const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        comment: { type: String, required: true }
    },
    { timestamps: true }
);

const issueSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    imageUrl: { type: String, required: true },
    status: {
        type: String,
        enum: ['Pending', 'Ongoing', 'Resolved'],
        default: 'Pending'
    },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    comments: [commentSchema],
    flags: {
        isCritical: { type: Boolean, default: false },
        isDuplicate: { type: Boolean, default: false },
        notes: { type: String }
    }
},
    { timestamps: true }
);

module.exports = mongoose.model("Issue", issueSchema);