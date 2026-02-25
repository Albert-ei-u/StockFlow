import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Import middlewares
import {
  securityHeaders,
  corsOptions,
  sanitizeData,
  preventXSS,
  preventHPP,
  requestLogger,
  generalLimiter,
  errorHandler,
  notFound
} from './middleware/index.js';

// Import routes directly
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import productRoutes from './routes/products.js';
import saleRoutes from './routes/sales.js';
import inventoryRoutes from './routes/inventory.js';
import reportRoutes from './routes/reports.js';

dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename); 
const publicPath = join(__dirname, "public");

// Security middlewares
app.use(securityHeaders);
app.use(cors(corsOptions));

// Rate limiting
app.use(generalLimiter);

// Body parsing middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization and security
app.use(sanitizeData);
app.use(preventXSS);
app.use(preventHPP);

// Request logging
app.use(requestLogger);

// Static files
app.use(express.static(publicPath));

// Database connection
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/salesflow")
    .then(() => console.log("Database connected"))
    .catch((err) => console.log(err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reports', reportRoutes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));