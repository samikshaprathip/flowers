import mongoose from 'mongoose'

const flowerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    color: { type: String, required: true },
    stemLength: { type: Number, required: true },
    quantity: { type: Number, required: true }
  },
  { _id: false }
)

const bouquetSchema = new mongoose.Schema(
  {
    shareId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    palette: { type: String, required: true },
    wrapStyle: { type: String, required: true },
    flowers: { type: [flowerSchema], default: [] },
    arrangement: {
      shape: { type: String, required: true },
      size: { type: String, required: true },
      density: { type: Number, required: true },
      layers: { type: Number, required: true }
    },
    note: { type: String, default: '' },
    signature: { type: String, default: '' },
    selected: { type: [String], default: [] },
    arrangementIndex: { type: Number, default: 0 },
    greeneryStyle: { type: Number, default: 0 },
    isMono: { type: Boolean, default: false }
  },
  { timestamps: true }
)

export const Bouquet = mongoose.model('Bouquet', bouquetSchema)
