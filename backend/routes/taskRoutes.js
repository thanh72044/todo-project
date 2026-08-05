const express = require('express')
const router = express.Router()

const { getTask, createTask, updateTask, deleteTask, reorderTask, deleteAllTask } = require('../controllers/taskController')
router.get('/', getTask)
router.post('/', createTask)
router.put('/:id', updateTask)
router.delete('/:id', deleteTask)
router.post('/reorder', reorderTask)
router.delete('/', deleteAllTask)

module.exports = router