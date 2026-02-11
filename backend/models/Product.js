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
    category: {
        type: String,
        required: [true, "Category is required"],
        enum: ['electronics', 'clothing', 'home', 'furniture']
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
    price: {
        type: Number,
        required: [true, "Price is required"],
        min: [0, "Price must be greater than 0"],
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

//virtual for profit margin 
productSchema.virtual('profitMargin').get(function() {
    return (this.price - this.cost) / this.price;
});

export default mongoose.model('Product', productSchema);