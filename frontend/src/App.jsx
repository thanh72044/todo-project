import { useState, useEffect } from "react";
import axios from 'axios'
import { CheckCircle2, Circle, Trash2, Plus, ListTodo, IdCardLanyard, Pencil, Check, X } from 'lucide-react';
import './App.css';
const API_URL = 'http://localhost:5000/api/tasks';

function App() {
  const [tasks, setTask] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState('General')
  const [editTask, setEditTask] = useState(null)
  const [editTitle, setEdititle] = useState('')
  const [editCategory, setEditCategory] = useState('General')
  const [filterCategory, setFilterCategory] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')

  const fetchTask = async () => {
    try {
      const response = await axios.get(API_URL)
      setTask(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu:', error);
    } finally {
      setLoading(false)
    }
  }

  const handelAddTask = async (e) => {
    e.preventDefault()
    if (!newTask.trim()) return;
    try {
      const response = await axios.post(API_URL, { title: newTask, category: newCategory })
      setTask([response.data, ...tasks])
      setNewTask('')
    } catch (error) {
      console.error('Lỗi khi lưu dữ liệu:', error);
    }
  }

  const handelToggleTask = async (id, currentStatus) => {
    try {
      setTask(tasks.map(task => task._id === id ? { ...task, isComplete: !currentStatus } : task))
      await axios.put(`${API_URL}/${id}`, { isComplete: !currentStatus })
    } catch (error) {
      console.error('Lỗi khi cập nhật:', error);
      fetchTask()
    }
  }
  const handelDeleteTask = async (id) => {
    try {
      setTask(tasks.filter(task => task._id !== id))
      await axios.delete(`${API_URL}/${id}`)
    } catch (error) {
      console.error('Lỗi khi xóa:', error);
      fetchTask();
    }
  }

  const handleEditTask = (task) => {
    setEditTask(task._id)
    setEdititle(task.title)
    setEditCategory(task.category)
  }

  const handleCancelTask = () => {
    setEditTask(null)
    setEdititle('')
  }

  const handelSaveTask = async (id) => {
    if (!editTitle.trim()) return
    try {
      setTask(tasks.map(task => task._id === id ? { ...task, title: editTitle, category: editCategory } : task))
      setEditTask(null)
      await axios.put(`${API_URL}/${id}`, { title: editTitle, category: editCategory })
    } catch (error) {
      console.error('lỗi khi cập nhật:', error)
      fetchTask()
    }
  }

  const filterTask = tasks.filter(task => {
    const matchCategory = filterCategory === 'All' || task.category === filterCategory
    const matchStatus = filterStatus === 'All' || (filterStatus === 'Completed' && task.isComplete) || (filterStatus === 'Incompleted' && !task.isComplete)
    return matchCategory && matchStatus
  })

  useEffect(() => {
    fetchTask();
  }, [])
  return (
    <div className="app-container">
      <div className="header">
        <h1>Task Master</h1>
        <p>Quản lý công việc hàng ngày của bạn</p>
      </div>

      <form className="input-container" onSubmit={handelAddTask}>
        <select
          className="category-select"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}>
          <option value="General">Chung</option>
          <option value="Work">Công việc</option>
          <option value="Personal">Cá nhân</option>
          <option value="Shopping">Mua sắm</option>
        </select>
        <input
          type="text"
          placeholder="Thêm công việc mới..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button type="submit" className="btn-add" disabled={!newTask.trim()}>
          <Plus size={24} />
        </button>
      </form>

      <div className="filter-container" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="category-select"
        >
          <option value="All">Tất cả danh mục</option>
          <option value="General">Chung</option>
          <option value="Work">Công việc</option>
          <option value="Personal">Cá nhân</option>
          <option value="Shopping">Mua sắm</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="category-select"
        >
          <option value="All">Tất cả trạng thái</option>
          <option value="Completed">Đã hoàn thành</option>
          <option value="Incompleted">Chưa hoàn thành</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Đang tải dữ liệu...</div>
      ) : filterTask.length === 0 ? (
        <div className="empty-state">
          <ListTodo size={48} strokeWidth={1} />
          <p>Chưa có công việc nào. Hãy thêm công việc mới!</p>
        </div>
      ) : (
        <div className="task-list">
          {filterTask.map((task) => (
            <div
              key={task._id}
              className={`task-item ${task.isComplete ? 'completed' : ''}`}
            >
              {editTask === task._id ? (
                <div className="task-edit-form">
                  <select
                    className="category-select edit-select"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}>
                    <option value="General">Chung</option>
                    <option value="Work">Công việc</option>
                    <option value="Personal">Cá nhân</option>
                    <option value="Shopping">Mua sắm</option>
                  </select>
                  <input
                    type="text"
                    className="edit-input"
                    value={editTitle}
                    onChange={(e) => setEdititle(e.target.value)}
                    autoFocus
                  />
                  <div className="task-actions">
                    <button className="btn-save" onClick={() => handelSaveTask(task._id)} title="Lưu">
                      <Check size={20} />
                    </button>
                    <button className="btn-cancel" onClick={handleCancelTask} title="Hủy">
                      <X size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div
                    className="task-content"
                    onClick={() => handelToggleTask(task._id, task.isComplete)}
                  >
                    {task.isComplete ? (
                      <CheckCircle2 size={24} className="icon-check" />
                    ) : (
                      <Circle size={24} className="icon-uncheck" />
                    )}
                    <span className="task-text">{task.title}</span>
                    <span className={`category-badge ${task.category?.toLowerCase() || 'general'}`}>
                      {task.category || 'General'}
                    </span>
                  </div>
                  <div className="task-actions">
                    <button
                      className="btn-edit"
                      onClick={() => handleEditTask(task)}
                      title="Sửa công việc"
                    >
                      <Pencil size={20} />
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handelDeleteTask(task._id)}
                      title="Xóa công việc"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default App; 