import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
    },
    sku: {
        type: String,
        required: [true, "SKU is required"],
        unique: true,
        uppercase: true,
    },
    stock: {
        type: Number,
        required: [true, "Stock is required"]
    },
    cost: {
        type: Number,
        required: [true, "Cost is required"],
        min: [0, "Cost must be greater than 0"],
    },
    stockQuantity: {
        type: Number,
        required: [true, "Stock quantity is required"],
        min: [0, "Stock quantity must be greater than 0"],
        default: 0
    },
    minStockLevel: {
        type: Number,
        required: [true, "Minimum stock level is required"],
        default: 0,
        min: [0, "Minimum stock level must be greater than 0"],
    },

    supplier: {
        type: String,
        trim: true,
    },
    isActive: {
        type: Boolean,
        default: true
    }
},
{
    timestamps: true
});

export default mongoose.model('Product', productSchema);