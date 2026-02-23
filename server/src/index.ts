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
app.use(express.json());

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

