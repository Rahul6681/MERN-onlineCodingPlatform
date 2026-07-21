const { Queue } = require('bullmq');
const redisService = require('../config/redis');

let submissionQueue = null;

try {
  const connection = redisService.getClient();
  if (connection) {
    submissionQueue = new Queue('submissionEvaluationQueue', { connection });
    console.log('[BullMQ]: Submission queue initialized');
  }
} catch (e) {
  console.warn('[BullMQ]: Redis connection unavailable, falling back to direct async execution');
}

const addSubmissionJob = async (submissionData) => {
  if (submissionQueue) {
    return await submissionQueue.add('evaluateSubmission', submissionData);
  }
  // Synchronous fallback execution if BullMQ/Redis not running
  const { processSubmissionJob } = require('./submissionWorker');
  setTimeout(() => processSubmissionJob(submissionData), 50);
  return { id: `local_job_${Date.now()}` };
};

module.exports = { submissionQueue, addSubmissionJob };
