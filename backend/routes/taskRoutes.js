const express = require('express')
const router = express.Router()

const { getTask, createTask, updateTask, deleteTask } = require('../controllers/taskController')
router.get('/', getTask)
router.post('/', createTask)
router.put('/:id', updateTask)
router.delete('/:id', deleteTask)

module.exports = router