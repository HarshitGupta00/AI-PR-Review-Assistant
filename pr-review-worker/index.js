require('dotenv').config();
const { Worker } = require('bullmq');
const IORedis = require('ioredis');
const connectDB = require('./src/config/db');
const Review = require('./src/models/Review');
const { reviewDiff } = require('./src/services/aiReviewService');

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

async function processJob(job) {
  const { reviewId } = job.data;

  const review = await Review.findById(reviewId);
  if (!review) {
    console.warn(`Review ${reviewId} not found, skipping job`);
    return;
  }

  review.status = 'processing';
  await review.save();

  try {
    // Pass the user's check config so the AI only reviews what was requested
    const checks = review.config?.checks || {};
    const result = await reviewDiff(review.diff, checks);

    review.result = result;
    review.status = 'completed';
    await review.save();

    console.log(
      `Review ${reviewId} completed — score: ${result.score}, ` +
      `risk: ${result.riskLevel}, issues: ${result.issues.length}`
    );
  } catch (err) {
    console.error(`Review ${reviewId} failed:`, err.message);

    review.status = 'failed';
    review.errorMessage = err.message;
    await review.save();

    throw err; // let BullMQ handle retry logic
  }
}

async function start() {
  await connectDB();

  const worker = new Worker('review-queue', processJob, {
    connection,
    concurrency: 3,
  });

  worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed permanently:`, err.message);
  });

  console.log('Worker started, waiting for jobs...');
}

start();