import express from 'express';
import routes from './routes';
import cors from 'cors';
import 'dotenv/config';

const app = express();
app.use(express.json());
const corsOptions = {
  origin: 'https://www.driveready.site', // Replace with your frontend's URL
  optionsSuccessStatus: 200, // For legacy browser support
};
app.use(cors(corsOptions));

app.use('/api', routes);

const PORT = process.env.PORT || 4444;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});