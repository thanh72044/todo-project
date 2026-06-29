const Task = require('../models/task')
const getTask = async (req, res) => {
    try {
        const tasks = await Task.find().sort({ createdAt: -1 })
        res.status(200).json(tasks)
    } catch (error) {
        res.status(500).json({ message: 'lỗi khi lấy dữ liệu', error })
    }
}

const createTask = async (req, res) => {
    try {
        const { title } = req.body
        const newTask = new Task({ title })
        await newTask.save()
        res.status(200).json(newTask)
    } catch (error) {
        res.status(500).json({ message: 'không lưu được dữ liệu', error })
    }
}
module.exports = {
    getTask,
    createTask
}