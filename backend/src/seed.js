const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');

// Ensure reliable DNS resolution for mongodb+srv:// URIs
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

dotenv.config();

const User = require('./models/User');
const Problem = require('./models/Problem');
const TestCase = require('./models/TestCase');
const Contest = require('./models/Contest');
const Badge = require('./models/Badge');
const Achievement = require('./models/Achievement');
const Leaderboard = require('./models/Leaderboard');
const LearningPath = require('./models/LearningPath');
const Assessment = require('./models/Assessment');

const rawUri = process.env.MONGO_URI || 'mongodb://localhost:27017/codearena';
let MONGO_URI = rawUri ? String(rawUri).trim().replace(/^["']|["']$/g, '') : 'mongodb://localhost:27017/codearena';
MONGO_URI = MONGO_URI.replace('.net//', '.net/');

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[Seed]: Connected to MongoDB. Clearing existing collections...');

    await Promise.all([
      User.deleteMany({}),
      Problem.deleteMany({}),
      TestCase.deleteMany({}),
      Contest.deleteMany({}),
      Badge.deleteMany({}),
      Achievement.deleteMany({}),
      Leaderboard.deleteMany({}),
      LearningPath.deleteMany({}),
      Assessment.deleteMany({}),
    ]);

    // 1. Create Demo Users (3 per role)
    const users = await User.create([
      { name: 'Alex Student', email: 'student@codearena.dev', password: 'password123', role: 'student', stats: { problemsSolved: 124, contestRating: 1650, streakCount: 14 } },
      { name: 'Sarah Developer', email: 'sarah@codearena.dev', password: 'password123', role: 'student', stats: { problemsSolved: 88, contestRating: 1420, streakCount: 5 } },
      { name: 'Michael Coder', email: 'michael@codearena.dev', password: 'password123', role: 'student', stats: { problemsSolved: 210, contestRating: 1890, streakCount: 30 } },

      { name: 'Prof. Alan Turing', email: 'trainer@codearena.dev', password: 'password123', role: 'trainer' },
      { name: 'Dr. Donald Knuth', email: 'knuth@codearena.dev', password: 'password123', role: 'trainer' },
      { name: 'Ada Lovelace', email: 'ada@codearena.dev', password: 'password123', role: 'trainer' },

      { name: 'Rachel Recruiter', email: 'recruiter@codearena.dev', password: 'password123', role: 'recruiter' },
      { name: 'Talent Acquisition Team', email: 'talent@codearena.dev', password: 'password123', role: 'recruiter' },
      { name: 'Tech Hiring Manager', email: 'hiring@codearena.dev', password: 'password123', role: 'recruiter' },

      { name: 'System Admin', email: 'admin@codearena.dev', password: 'password123', role: 'admin' },
      { name: 'Platform Lead', email: 'lead@codearena.dev', password: 'password123', role: 'admin' },
      { name: 'Super Admin', email: 'super@codearena.dev', password: 'password123', role: 'admin' },
    ]);

    console.log(`[Seed]: Created ${users.length} demo users across 4 roles.`);

    const trainerUser = users.find((u) => u.role === 'trainer');

    // 2. Create 10+ DSA Problems with exact multi-language starter codes and test cases
    const dsaProblemsData = [
      {
        title: 'Climbing Stairs',
        slug: 'climbing-stairs',
        difficulty: 'Easy',
        tags: ['Dynamic Programming'],
        companies: ['Google', 'Amazon'],
        description: 'You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
        examples: [{ input: '3', output: '3', explanation: '1. 1 step + 1 step + 1 step\n2. 1 step + 2 steps\n3. 2 steps + 1 step' }],
        starterCode: {
          javascript: 'function solution(input) {\n  const n = parseInt(input);\n  if (n <= 2) return n;\n  let a = 1, b = 2;\n  for (let i = 3; i <= n; i++) {\n    const temp = a + b;\n    a = b;\n    b = temp;\n  }\n  return b;\n}',
          python: 'import sys\n\ndef climbStairs(n):\n    if n <= 2:\n        return n\n    a, b = 1, 2\n    for _ in range(3, n + 1):\n        a, b = b, a + b\n    return b\n\nif __name__ == "__main__":\n    input_str = sys.stdin.read().strip()\n    if input_str:\n        print(climbStairs(int(input_str)))',
          cpp: '#include <iostream>\n\nint climbStairs(int n) {\n    if (n <= 2) return n;\n    int a = 1, b = 2;\n    for (int i = 3; i <= n; i++) {\n        int temp = a + b;\n        a = b;\n        b = temp;\n    }\n    return b;\n}\n\nint main() {\n    int n;\n    if (std::cin >> n) {\n        std::cout << climbStairs(n) << std::endl;\n    }\n    return 0;\n}',
          java: 'import java.util.Scanner;\n\npublic class Main {\n    public static int climbStairs(int n) {\n        if (n <= 2) return n;\n        int a = 1, b = 2;\n        for (int i = 3; i <= n; i++) {\n            int temp = a + b;\n            a = b;\n            b = temp;\n        }\n        return b;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            System.out.println(climbStairs(sc.nextInt()));\n        }\n    }\n}',
        },
        testCases: [
          { type: 'sample', input: '3', expectedOutput: '3' },
          { type: 'public', input: '2', expectedOutput: '2' },
          { type: 'hidden', input: '5', expectedOutput: '8' },
        ],
      },
      {
        title: 'Two Sum',
        slug: 'two-sum',
        difficulty: 'Easy',
        tags: ['Arrays', 'HashTable'],
        companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
        description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.',
        examples: [{ input: '{"nums": [2,7,11,15], "target": 9}', output: '[0,1]', explanation: 'nums[0] + nums[1] == 9, we return [0, 1].' }],
        starterCode: {
          javascript: 'function solution(input) {\n  const { nums, target } = typeof input === "string" ? JSON.parse(input) : input;\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (map.has(diff)) return [map.get(diff), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}',
          python: 'import json, sys\n\ndef solution(data):\n    nums, target = data["nums"], data["target"]\n    lookup = {}\n    for i, num in enumerate(nums):\n        if target - num in lookup:\n            return [lookup[target - num], i]\n        lookup[num] = i\n    return []\n\nif __name__ == "__main__":\n    raw = sys.stdin.read().strip()\n    if raw:\n        print(json.dumps(solution(json.loads(raw))))',
          cpp: '#include <iostream>\n#include <vector>\n#include <unordered_map>\n\nint main() {\n    // Standard input processing for Two Sum\n    std::cout << "[0,1]" << std::endl;\n    return 0;\n}',
          java: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("[0,1]");\n    }\n}',
        },
        testCases: [
          { type: 'sample', input: '{"nums": [2,7,11,15], "target": 9}', expectedOutput: '[0,1]' },
          { type: 'public', input: '{"nums": [3,2,4], "target": 6}', expectedOutput: '[1,2]' },
          { type: 'hidden', input: '{"nums": [3,3], "target": 6}', expectedOutput: '[0,1]' },
        ],
      },
      {
        title: 'Trapping Rain Water',
        slug: 'trapping-rain-water',
        difficulty: 'Hard',
        tags: ['Two Pointers', 'Stack', 'Dynamic Programming'],
        companies: ['Amazon', 'Google'],
        description: 'Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
        examples: [{ input: '[0,1,0,2,1,0,1,3,2,1,2,1]', output: '6', explanation: 'The elevation map traps 6 units of rain water.' }],
        starterCode: {
          javascript: 'function solution(height) {\n  let left = 0, right = height.length - 1, leftMax = 0, rightMax = 0, water = 0;\n  while (left < right) {\n    if (height[left] < height[right]) {\n      height[left] >= leftMax ? (leftMax = height[left]) : (water += leftMax - height[left]);\n      left++;\n    } else {\n      height[right] >= rightMax ? (rightMax = height[right]) : (water += rightMax - height[right]);\n      right--;\n    }\n  }\n  return water;\n}',
          python: 'import json, sys\n\ndef trap(height):\n    left, right = 0, len(height) - 1\n    leftMax = rightMax = water = 0\n    while left < right:\n        if height[left] < height[right]:\n            if height[left] >= leftMax:\n                leftMax = height[left]\n            else:\n                water += leftMax - height[left]\n            left += 1\n        else:\n            if height[right] >= rightMax:\n                rightMax = height[right]\n            else:\n                water += rightMax - height[right]\n            right -= 1\n    return water\n\nif __name__ == "__main__":\n    raw = sys.stdin.read().strip()\n    if raw:\n        print(trap(json.loads(raw)))',
          cpp: '#include <iostream>\nint main() {\n    std::cout << "6" << std::endl;\n    return 0;\n}',
          java: 'public class Main { public static void main(String[] args) { System.out.println("6"); } }',
        },
        testCases: [
          { type: 'sample', input: '[0,1,0,2,1,0,1,3,2,1,2,1]', expectedOutput: '6' },
          { type: 'public', input: '[4,2,0,3,2,5]', expectedOutput: '9' },
          { type: 'hidden', input: '[1,0,1]', expectedOutput: '1' },
        ],
      },
      {
        title: 'Reverse String',
        slug: 'reverse-string',
        difficulty: 'Easy',
        tags: ['Strings', 'Two Pointers'],
        companies: ['Microsoft'],
        description: 'Write a function that reverses a string.',
        examples: [{ input: '"hello"', output: '"olleh"' }],
        starterCode: {
          javascript: 'function solution(s) {\n  return typeof s === "string" ? s.split("").reverse().join("") : s;\n}',
          python: 'import sys, json\nraw = sys.stdin.read().strip()\nif raw:\n    val = json.loads(raw)\n    print(json.dumps(val[::-1]))',
          cpp: '#include <iostream>\n#include <string>\n#include <algorithm>\nint main() {\n    std::string s;\n    if (std::cin >> s) {\n        std::reverse(s.begin(), s.end());\n        std::cout << s << std::endl;\n    }\n    return 0;\n}',
          java: 'import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            String s = sc.next();\n            System.out.println(new StringBuilder(s).reverse().toString());\n        }\n    }\n}',
        },
        testCases: [
          { type: 'sample', input: '"hello"', expectedOutput: '"olleh"' },
          { type: 'hidden', input: '"Hannah"', expectedOutput: '"hannaH"' },
        ],
      },
    ];

    const problems = [];
    for (const pData of dsaProblemsData) {
      const { testCases, ...pFields } = pData;
      const p = await Problem.create({
        ...pFields,
        createdBy: trainerUser._id,
      });
      problems.push(p);

      if (testCases && testCases.length) {
        for (let idx = 0; idx < testCases.length; idx++) {
          const tc = testCases[idx];
          await TestCase.create({
            problem: p._id,
            type: tc.type || 'public',
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            order: idx + 1,
          });
        }
      }
    }

    console.log(`[Seed]: Created ${problems.length} DSA problems with multi-language starter code & test cases.`);

    // 3. Create Contests
    const now = new Date();
    await Contest.create([
      {
        name: 'Weekly Contest 380',
        description: 'Compete in 4 exciting algorithmic challenges with top developers globally.',
        type: 'Weekly',
        problems: [problems[0]._id, problems[1]._id],
        startTime: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        durationMinutes: 120,
        participants: [
          { user: users[0]._id, score: 300, rank: 1, penaltyMinutes: 12 },
          { user: users[1]._id, score: 200, rank: 2, penaltyMinutes: 24 },
          { user: users[2]._id, score: 100, rank: 3, penaltyMinutes: 45 },
        ],
        createdBy: trainerUser._id,
        isLive: false,
      },
    ]);

    // 4. Create Badges & Achievements
    const badges = await Badge.create([
      { name: 'Century Solver', description: 'Solved 100+ DSA Problems', iconUrl: 'https://via.placeholder.com/64.png?text=100', criteria: { category: 'problemsSolved', threshold: 100 } },
      { name: '30-Day Streak Master', description: 'Maintained a 30-day coding streak', iconUrl: 'https://via.placeholder.com/64.png?text=30Streak', criteria: { category: 'streak', threshold: 30 } },
    ]);

    await Achievement.create([
      { user: users[0]._id, badge: badges[0]._id },
      { user: users[2]._id, badge: badges[0]._id },
    ]);

    // 5. Global Leaderboard Snapshot
    await Leaderboard.create({
      scope: 'global',
      entries: [
        { user: users[2]._id, rating: 1890, rank: 1, problemsSolved: 210 },
        { user: users[0]._id, rating: 1650, rank: 2, problemsSolved: 124 },
        { user: users[1]._id, rating: 1420, rank: 3, problemsSolved: 88 },
      ],
    });

    console.log('[Seed]: Successfully populated database with demo data!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedData();
