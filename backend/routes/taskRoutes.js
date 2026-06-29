const express = require('express')
const router = express.Router()

const { getTask, createTask } = require('../controllers/taskController')
router.get('/', getTask)
router.post('/', createTask)
module.exports = router