const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./server/config/config');
const app = express();

app.use(cors({ origin: config.CORS_ORIGIN }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

const chatRoutes = require('../Backend/server/routes/chat.routes');
const userRoutes = require('../Backend/server/routes/user.routes');
const issueRoutes = require('../Backend/server/routes/issue.routes');
const commentRoutes = require('../Backend/server/routes/comment.routes');

app.use('/api/chats', chatRoutes);
app.use('/api/users',userRoutes);
app.use('/api/issues',issueRoutes);
app.use('/api/issues/:issueId/comments', commentRoutes);


mongoose.connect(config.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

app.listen(config.PORT, () => {
  console.log(`Server is running on port ${config.PORT}`);
});
