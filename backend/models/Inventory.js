import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
        unique: true
    },
    currentStock: {
        type: Number,
        required: [true, 'Current stock is required'],
        min: [0, 'Stock cannot be negative']
    },
    lastRestockDate: {
        type: Date,
        default: Date.now
    },
    movements: [{
        type: {
            type: String,
            enum: ['IN', 'OUT'],
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, 'Quantity must be at least 1']
        },
        reference: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        },
        notes: {
            type: String,
            trim: true
        }
    }],
    lowStockAlert: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Update low stock alert
inventorySchema.pre('save', function(next) {
    const Product = mongoose.model('Product');
    Product.findById(this.product).then(product => {
        if (product) {
            this.lowStockAlert = this.currentStock <= product.minStockLevel;
        }
        next();
    }).catch(err => next(err));
});

export default mongoose.model('Inventory', inventorySchema);