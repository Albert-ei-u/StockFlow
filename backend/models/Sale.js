import mongoose from 'mongoose';

const saleItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be at least 1']
    },
    unitPrice: {
        type: Number,
        required: [true, 'Unit price is required'],
        min: [0, 'Unit price cannot be negative']
    },
    subtotal: {
        type: Number,
        required: true
    }
});

const saleSchema = new mongoose.Schema({
    saleNumber: {
        type: String,
        required: true,
        unique: true
    },
    items: [saleItemSchema],
    totalAmount: {
        type: Number,
        required: [true, 'Total amount is required'],
        min: [0, 'Total amount cannot be negative']
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['Cash', 'Card', 'Mobile Money', 'Bank Transfer', 'Debt', 'Partial']
    },
    isDebt: {
        type: Boolean,
        default: false
    },
    paidAmount: {
        type: Number,
        default: 0
    },
    remainingDebt: {
        type: Number,
        default: 0
    },
    customerName: {
        type: String,
        trim: true
    },
    customerEmail: {
        type: String,
        trim: true,
        lowercase: true
    },
    customerPhone: {
        type: String,
        trim: true
    },
    salesperson: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Cancelled', 'Refunded'],
        default: 'Completed'
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Generate sale number before saving
// saleSchema.pre('save', async function(next) {
//     if (this.isNew) {
//         const count = await this.constructor.countDocuments();
//         this.saleNumber = `SALE-${String(count + 1).padStart(6, '0')}`;
//     }
//     next();
// });

export default mongoose.model('Sale', saleSchema);