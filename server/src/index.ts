import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import familyRoutes from './routes/familyRoutes';
import personRoutes from './routes/personRoutes';
import relationshipRoutes from './routes/relationshipRoutes';
import layoutRoutes from './routes/layoutRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
// Photo uploads are currently sent as base64 data URLs in JSON.
// Default limit (~100kb) is too small for that, so increase it.
app.use(express.json({ limit: '10mb' }));

app.use('/api/families', familyRoutes);
app.use('/api/persons', personRoutes);
app.use('/api/relationships', relationshipRoutes);
app.use('/api/layout', layoutRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

