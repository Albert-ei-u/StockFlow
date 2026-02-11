import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/salesflow")
    .then(() => console.log("Database connected"))
    .catch((err) => console.log(err));

// Routes
app.use('/api/products', (await import('./routes/products.js')).default);
app.use('/api/sales', (await import('./routes/sales.js')).default);
app.use('/api/inventory', (await import('./routes/inventory.js')).default);
app.use('/api/reports', (await import('./routes/reports.js')).default);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));