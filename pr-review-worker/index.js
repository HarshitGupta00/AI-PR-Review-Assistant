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
    console.error(`Review ${reviewId} failed (attempt ${job.attemptsMade + 1}/${job.opts.attempts}):`, err.message);

    if (job.attemptsMade >= job.opts.attempts - 1) {
      review.status = 'failed';
      review.errorMessage = err.message;
    } else {
      review.status = 'pending';
    }
    await review.save();

    throw err; // let BullMQ handle retry logic
  }
}

const express = require('express');

// Create a dummy Express app for Render's Health Check
const app = express();
const port = process.env.PORT || 10000;

app.get('/', (req, res) => {
  res.status(200).send('Worker is alive and waiting for jobs...');
});

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

  // Start the dummy HTTP server
  app.listen(port, () => {
    console.log(`Health check server listening on port ${port}`);
    console.log('Worker started, waiting for jobs...');
  });
}

start();