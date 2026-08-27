import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Template name is required'],
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  category: {
    type: String,
    required: true,
    enum: [
      'ganpati',
      'janmashtami',
      'navratri',
      'wedding',
      'birthday',
      'griha-pravesh',
      'engagement',
      'haldi',
    ],
  },
  subcategory: {
    type: String,
    default: '',
  },
  previewImage: {
    type: String,
    required: true,
  },
  backgroundImage: {
    type: String,
    default: '',
  },
  htmlTemplate: {
    type: String,
    default: '',
  },
  customizableFields: {
    type: [
      {
        key: String,
        label: String,
        type: { type: String, enum: ['text', 'date', 'color', 'font'], default: 'text' },
        defaultValue: String,
        required: { type: Boolean, default: false },
      },
    ],
    default: [
      { key: 'hostName', label: 'Host Name', type: 'text', defaultValue: '', required: true },
      { key: 'guestName', label: 'Guest Name', type: 'text', defaultValue: '', required: true },
      { key: 'eventName', label: 'Event Name', type: 'text', defaultValue: '' },
      { key: 'date', label: 'Date', type: 'date', defaultValue: '' },
      { key: 'time', label: 'Time', type: 'text', defaultValue: '' },
      { key: 'venue', label: 'Venue', type: 'text', defaultValue: '' },
      { key: 'message', label: 'Custom Message', type: 'text', defaultValue: '' },
    ],
  },
  themeColors: {
    primary: { type: String, default: '#FF6B35' },
    secondary: { type: String, default: '#FFD700' },
    background: { type: String, default: '#FFF8F0' },
    text: { type: String, default: '#333333' },
  },
  fonts: {
    type: [String],
    default: ['Playfair Display', 'Poppins', 'Dancing Script', 'Noto Sans Devanagari'],
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  price: {
    type: Number,
    default: 0,
    min: 0,
  },
  tags: {
    type: [String],
    default: [],
  },
  language: {
    type: String,
    enum: ['english', 'hindi', 'marathi'],
    default: 'english',
  },
  hasVideo: {
    type: Boolean,
    default: false,
  },
  videoUrl: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

templateSchema.index({ category: 1, isActive: 1 });
templateSchema.index({ slug: 1 });
templateSchema.index({ tags: 1 });

export default mongoose.model('Template', templateSchema);
