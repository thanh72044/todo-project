//File này định nghĩa cấu trúc dữ liệu sẽ được lưu xuống cơ sở dữ liệu MongoDB.
const mongoose = require('mongoose')
const TaskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        isComplete: {
            type: Boolean,
            default: false
        },
        category: {
            type: String,
            default: 'General'
        },
        dueDate: {
            type: Date,
            default: null
        },
        order: {
            type: Number,
            default: Date.now
        }
    },
    { timestamps: true }
)
const Task = mongoose.model('Task', TaskSchema)
module.exports = Task;