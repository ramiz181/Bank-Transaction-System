import mongoose from "mongoose";
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required for creating a user'],
    },
    email: {
        type: String,
        required: [true, 'Email is required for creating a user'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required for creating a user'],
        minlength: [8, 'Password should contain more than 8 characters'],
        select: false
    }
}, { timestamps: true })



userSchema.pre('save', async function () {
    // if isModified method not use - to jub bhe document save hoga har dfa pas hash hogay
    // e.g 1st time hash(password)
    // 2nd time hash(hash(password))
    if (!this.isModified('password')) return
    this.password = await bcrypt.hash(this.password, 10)
})


userSchema.methods.comparePassword = async function (password) {
    console.log("loggin pass", this.password);
    return await bcrypt.compare(password, this.password)
}

export const User = mongoose.model('User', userSchema)