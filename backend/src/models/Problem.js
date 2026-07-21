const mongoose = require('mongoose');

const exampleSchema = new mongoose.Schema({
  input: { type: String, required: true },
  output: { type: String, required: true },
  explanation: { type: String, default: '' },
});

const problemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    tags: [{ type: String, index: true }],
    constraints: [{ type: String }],
    examples: [exampleSchema],
    starterCode: {
      javascript: { type: String, default: '// Write your code here\nfunction solution(input) {\n  return input;\n}' },
      python: { type: String, default: '# Write your solution here\ndef solution(input_str):\n    return input_str' },
      cpp: { type: String, default: '#include <iostream>\nusing namespace std;\nint main() {\n  return 0;\n}' },
      java: { type: String, default: 'public class Main {\n  public static void main(String[] args) {\n  }\n}' },
      c: { type: String, default: '#include <stdio.h>\nint main() {\n  return 0;\n}' },
      go: { type: String, default: 'package main\nfunc main() {\n}' },
      csharp: { type: String, default: 'using System;\nclass Solution {\n  static void Main() {\n  }\n}' },
      php: { type: String, default: '<?php\nfunction solution($input) {\n  return $input;\n}' },
    },
    timeLimitMs: { type: Number, default: 2000 },
    memoryLimitKb: { type: Number, default: 128000 },
    companies: [{ type: String }],
    stats: {
      totalSubmissions: { type: Number, default: 0 },
      acceptedSubmissions: { type: Number, default: 0 },
      acceptanceRate: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      dislikes: { type: Number, default: 0 },
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

problemSchema.index({ difficulty: 1, tags: 1 });

module.exports = mongoose.model('Problem', problemSchema);
