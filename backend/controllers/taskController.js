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
        const { title, category, dueDate } = req.body
        const newTask = new Task({ title, category, dueDate })
        await newTask.save()
        res.status(200).json(newTask)
    } catch (error) {
        res.status(500).json({ message: 'không lưu được dữ liệu', error })
    }
}

const updateTask = async (req, res) => {
    try {
        const { id } = req.params
        const { title, isComplete, category, dueDate } = req.body
        const updateTask = await Task.findByIdAndUpdate(id, { title, isComplete, category, dueDate }, { new: true })
        res.status(200).json({ message: 'cập nhật thành công', updateTask })
    } catch (error) {
        res.status(500).json({ message: 'đã xảy ra lỗi', error })
    }
}

const deleteTask = async (req, res) => {
    try {
        const { id } = req.params
        const deleteTask = await Task.findByIdAndDelete(id)
        res.status(200).json({ message: 'đã xóa task:', id })
    } catch (error) {
        res.status(500).json({ message: 'có lỗi xảy ra', error })
    }
}

module.exports = {
    getTask,
    createTask,
    updateTask,
    deleteTask
}