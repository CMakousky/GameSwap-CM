import { Schema, model, type Document } from 'mongoose';
import bcrypt from 'bcrypt';

// import schema from Book.js
import gameSchema from './Game.js';
import type { GameDocument } from './Game.js';

export interface UserDocument extends Document {
  id: string;
  username: string;
  email: string;
  password: string;
  savedGames: GameDocument[];
  isCorrectPassword(password: string): Promise<boolean>;
  gameCount: number;
}

const userSchema = new Schema<UserDocument>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+@.+\..+/, 'Must use a valid email address'],
    },
    password: {
      type: String,
      required: true,
    },
    // set savedGames to be an array of data that adheres to the gameSchema
    savedGames: [gameSchema],
  },
  // set this to use virtual below
  {
    toJSON: {
      virtuals: true,
    },
  }
);

// hash user password
userSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('password')) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});

// custom method to compare and validate password for logging in
userSchema.methods.isCorrectPassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

// when we query a user, we'll also get another field called `gameCount` with the number of saved games we have
userSchema.virtual('bookCount').get(function () {
  return this.savedGames.length;
});

const User = model<UserDocument>('User', userSchema);

export default User;
