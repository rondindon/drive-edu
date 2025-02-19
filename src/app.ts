import express from 'express';
import routes from './routes';
import cors from 'cors';
import 'dotenv/config';
import path from 'path';

const app = express();
app.use(express.json());
const corsOptions = {
  origin: ['https://www.driveready.site','https://drive-edu.vercel.app','http://localhost:3000'],
  optionsSuccessStatus: 200, // For legacy browser support
};
app.use(cors(corsOptions));

const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

app.use('/api', routes);

const PORT = process.env.PORT || 4444;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});