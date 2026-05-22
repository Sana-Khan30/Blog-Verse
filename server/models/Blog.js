import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      minlength: [50, 'Content must be at least 50 characters'],
    },
    excerpt: {
      type: String,
      maxlength: [300, 'Excerpt cannot exceed 300 characters'],
    },
    coverImage: {
      type: String,
      default: '',
    },
    // author field User collection se link hai
    // populate() se poora user object aa jaayega
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',          // 'User' model ke saath link
      required: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Technology',
        'Programming',
        'Design',
        'Business',
        'Lifestyle',
        'Health',
        'Travel',
        'Food',
        'Other',
      ],
      default: 'Other',
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    // Likes — array of user IDs
    // Ek user ek baar like kar sakta hai
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // Views count — har baar blog khulne pe +1
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    // SEO friendly URL
    slug: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
    // Virtual fields JSON mein include honge
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── VIRTUAL FIELD — Comments Count ───────────────
// Actual data store nahi hota, on-the-fly calculate hota hai
blogSchema.virtual('commentsCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'blog',
  count: true,            // sirf count chahiye, poore documents nahi
});

// ─── SLUG GENERATE ────────────────────────────────
// Save se pehle title se slug banao
// "My First Blog" → "my-first-blog-1234"
blogSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '')   // special chars remove
      .replace(/\s+/g, '-')             // spaces ko dash se replace
      .concat('-', Date.now().toString().slice(-4)); // unique suffix
  }

  // Auto excerpt banana agar nahi diya
  if (!this.excerpt && this.content) {
    this.excerpt = this.content.substring(0, 200).concat('...');
  }

  next();
});

// ─── INDEXES — Search Fast Karne Ke Liye ──────────
blogSchema.index({ title: 'text', content: 'text', tags: 'text' });
blogSchema.index({ author: 1, createdAt: -1 });
blogSchema.index({ category: 1 });

const Blog = mongoose.model('Blog', blogSchema);
export default Blog;