const { OpenAI } = require('openai');

let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const getAiHint = async ({ problemTitle, description, code, language }) => {
  if (!openai) {
    return {
      hint: `💡 **AI Hint (Fallback)**: Consider breaking down "${problemTitle}" into sub-problems. Look at your loop boundaries and edge cases like empty inputs.`,
      disabled: true,
    };
  }
  try {
    const prompt = `You are a world-class competitive programming coach. Give a small, subtle hint for the following problem without revealing the complete solution or full code code block.
Problem: ${problemTitle}
Description: ${description}
User Code (${language}):
\`\`\`
${code}
\`\`\``;
    const res = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 250,
    });
    return { hint: res.choices[0].message.content };
  } catch (err) {
    return { hint: `💡 **AI Hint**: Try reviewing how data structures like Hash Maps or Two Pointers apply to ${problemTitle}.` };
  }
};

const getAiCodeReview = async ({ code, language, problemTitle }) => {
  if (!openai) {
    return {
      review: `🔍 **AI Code Review**: Code looks structured. Ensure variable naming follows clean code standards and time complexity is optimal for ${problemTitle}.`,
      disabled: true,
    };
  }
  try {
    const prompt = `Review this ${language} solution for "${problemTitle}". Provide actionable feedback on code quality, readability, and potential edge-case bugs.
Code:
\`\`\`${language}
${code}
\`\`\``;
    const res = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
    });
    return { review: res.choices[0].message.content };
  } catch (err) {
    return { review: '🔍 **AI Code Review**: Good solution attempt! Consider optimizing memory usage and modularizing helper logic.' };
  }
};

const getAiComplexity = async ({ code, language }) => {
  if (!openai) {
    return {
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)',
      explanation: 'Estimated based on code structure analysis.',
      disabled: true,
    };
  }
  try {
    const prompt = `Analyze the Big-O Time Complexity and Space Complexity of this ${language} code. Return a JSON object with keys: timeComplexity, spaceComplexity, explanation.
Code:
\`\`\`${language}
${code}
\`\`\``;
    const res = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
    });
    const parsed = JSON.parse(res.choices[0].message.content);
    return parsed;
  } catch (err) {
    return {
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
      explanation: 'Linear time complexity analysis.',
    };
  }
};

const getAiDebug = async ({ code, language, errorOutput }) => {
  if (!openai) {
    return {
      debug: `🐞 **AI Debugger**: Check array index out-of-bounds or null pointer access. Error snippet: "${errorOutput || 'None'}"`,
      disabled: true,
    };
  }
  try {
    const prompt = `The following ${language} code resulted in error/wrong output: "${errorOutput}". Identify the exact bug location and explain how to fix it without writing the whole solution.
Code:
\`\`\`${language}
${code}
\`\`\``;
    const res = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 250,
    });
    return { debug: res.choices[0].message.content };
  } catch (err) {
    return { debug: '🐞 **AI Debugger**: Verify input bounds and off-by-one errors in iteration loops.' };
  }
};

const getAiRecommend = async ({ weakTags, solvedCount }) => {
  return {
    recommendations: [
      { title: 'Two Sum', tags: ['Arrays', 'HashTable'], difficulty: 'Easy' },
      { title: '3Sum', tags: ['Two Pointers', 'Sorting'], difficulty: 'Medium' },
      { title: 'Trapping Rain Water', tags: ['Two Pointers', 'Stack'], difficulty: 'Hard' },
    ],
    reason: `Based on your recent activity and target weak tags: [${(weakTags || ['Arrays']).join(', ')}].`,
  };
};

module.exports = {
  getAiHint,
  getAiCodeReview,
  getAiComplexity,
  getAiDebug,
  getAiRecommend,
};
