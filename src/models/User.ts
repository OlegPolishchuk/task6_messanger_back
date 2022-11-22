import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      required: true,
    },
    messages: [
      {
        from: {
          type: String,
          required: true,
        },
        subject: String,
        message: String,
        date: Date,
      }
    ]
  }, {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
)

export default mongoose.model('User', UserSchema);