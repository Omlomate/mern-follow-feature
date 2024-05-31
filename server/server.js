const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

mongoose.connect('mongodb://localhost:27017/mern-follow-feature')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const followSchema = new mongoose.Schema({
  follower_id: mongoose.Schema.Types.ObjectId,
  following_id: mongoose.Schema.Types.ObjectId,
  created_at: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const Follow = mongoose.model('Follow', followSchema);

// Follow a user
app.post('/api/follow', async (req, res) => {
  const { follower_id, following_id } = req.body;
  const follow = new Follow({ follower_id, following_id });
  await follow.save();
  res.redirect(`/following/${follower_id}`);
});

// Unfollow a user
app.post('/api/unfollow', async (req, res) => {
  const { follower_id, following_id } = req.body;
  await Follow.deleteOne({ follower_id, following_id });
  res.redirect(`/following/${follower_id}`);
});

// Fetch followers
app.get('/followers/:user_id', async (req, res) => {
  const user_id = req.params.user_id;
  const followers = await Follow.find({ following_id: user_id }).populate('follower_id', 'username');
  res.render('followers', { followers, user_id });
});

// Fetch following
app.get('/following/:user_id', async (req, res) => {
  const user_id = req.params.user_id;
  const following = await Follow.find({ follower_id: user_id }).populate('following_id', 'username');
  res.render('following', { following, user_id });
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
