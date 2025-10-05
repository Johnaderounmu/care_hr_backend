import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/documents', (req, res) => {
  res.json({ ok: true, documents: [], message: 'Minimal server working' });
});

app.get('/jobs', (req, res) => {
  res.json({ ok: true, jobs: [], message: 'Minimal server working' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

const port = Number(process.env.PORT) || 4000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Minimal Care HR backend running on http://0.0.0.0:${port}`);
});