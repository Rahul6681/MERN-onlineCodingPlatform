const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true },
    iconUrl: { type: String, default: 'https://via.placeholder.com/64.png?text=Badge' },
    criteria: {
      category: { type: String, required: true }, // e.g. 'problemsSolved', 'streak', 'contestRating'
      threshold: { type: Number, required: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Badge', badgeSchema);
