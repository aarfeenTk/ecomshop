import mongoose, { Schema, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserDocument } from '../types';

const userSchema = new Schema<UserDocument>({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  cart: [{
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
  }],
  refreshToken: {
    type: String,
    select: false,
  },
  refreshTokenExpires: {
    type: Date,
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.getSignedJwtToken = function (): string {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET as string,
    { expiresIn: process.env.JWT_EXPIRE || '30d' } as any
  );
};

userSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateRefreshToken = function (): string {
  const refreshToken = crypto.randomBytes(40).toString('hex');
  const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  
  this.refreshToken = refreshTokenHash;
  this.refreshTokenExpires = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)); // 7 days
  
  return refreshToken;
};

userSchema.methods.clearRefreshToken = async function (): Promise<void> {
  this.refreshToken = undefined;
  this.refreshTokenExpires = undefined;
  await this.save({ validateBeforeSave: false });
};

userSchema.methods.isRefreshTokenValid = function (): boolean {
  if (!this.refreshToken || !this.refreshTokenExpires) {
    return false;
  }
  return this.refreshTokenExpires > new Date();
};

export default mongoose.model<UserDocument>('User', userSchema);
