import express from 'express';
import AWS from 'aws-sdk';

const router = express.Router();

const s3 = new AWS.S3({
  signatureVersion: 'v4',
  region: process.env.S3_REGION || 'us-east-1',
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY,
});

router.get('/presign', async (req, res) => {
  const { key, contentType } = req.query as any;
  if (!key) return res.status(400).json({ error: 'key is required' });

  const params = {
    Bucket: process.env.S3_BUCKET || '',
    Key: key,
    Expires: 60,
    ContentType: contentType || 'application/octet-stream',
  };

  try {
    const url = await s3.getSignedUrlPromise('putObject', params);
    res.json({ url });
  } catch (err) {
    console.error('presign error', err);
    res.status(500).json({ error: 'failed to presign' });
  }
});

export default router;
