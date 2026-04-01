import express from 'express';
import cors from 'cors';
import checkoutHandler from './api/checkout.js';
import shippingHandler from './api/shipping.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Mocking Vercel Serverless Function (Req/Res wrapper)
const vercelWrapper = (handler: any) => async (req: express.Request, res: express.Response) => {
  try {
    // Vercel handles json natively, Express does too via express.json()
    await handler(req, res);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Map Vercel API files to Express routes
app.post('/api/checkout', vercelWrapper(checkoutHandler));
app.post('/api/shipping', vercelWrapper(shippingHandler));

const PORT = process.env.VITE_API_PORT || 3001;

app.listen(PORT, () => {
  console.log(`[Local Vercel Runtime] API Server running on port ${PORT}`);
});
