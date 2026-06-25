const { Queue } = require('bullmq');
const IORedis = require('ioredis');

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

const reviewQueue = new Queue('review-queue', { connection });

module.exports = reviewQueue;