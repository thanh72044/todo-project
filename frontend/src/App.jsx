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
  const [searchQuery, setSearchQuery] = useState('')
  const [newDueDate, setNewDueDate] = useState(null)
  const [editDueDate, setEditDueDate] = useState('')

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
      const response = await axios.post(API_URL, { title: newTask, category: newCategory, dueDate: newDueDate || null })
      setTask([response.data, ...tasks])
      setNewTask('')
      setNewDueDate(null)
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
    // Cần cắt chuỗi 'T' để html input type=date hiểu được (format yyyy-mm-dd)
    setEditDueDate(task.dueDate ? task.dueDate.split('T')[0] : null)
  }

  const handleCancelTask = () => {
    setEditTask(null)
    setEdititle('')
    setEditDueDate(null)
  }

  const handelSaveTask = async (id) => {
    if (!editTitle.trim()) return
    try {
      setTask(tasks.map(task => task._id === id ? { ...task, title: editTitle, category: editCategory, dueDate: editDueDate || null } : task))
      setEditTask(null)
      await axios.put(`${API_URL}/${id}`, { title: editTitle, category: editCategory, dueDate: editDueDate || null })
    } catch (error) {
      console.error('lỗi khi cập nhật:', error)
      fetchTask()
    }
  }

  const filterTask = tasks.filter(task => {
    const matchCategory = filterCategory === 'All' || task.category === filterCategory
    const matchStatus = filterStatus === 'All' || (filterStatus === 'Completed' && task.isComplete) || (filterStatus === 'Incompleted' && !task.isComplete)
    const matchSearch = task.title.toLowerCase().includes(searchQuery.toLocaleLowerCase())
    return matchCategory && matchStatus && matchSearch
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
        <input
          type="date"
          className="date-input"
          value={newDueDate || ''}
          onChange={(e) => setNewDueDate(e.target.value)}
        />
        <button type="submit" className="btn-add" disabled={!newTask.trim()}>
          <Plus size={24} />
        </button>
      </form>

      <div className="filter-container" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Tìm kiếm công việc..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
          style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }}
        />
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
                  <input
                    type="date"
                    className="edit-input"
                    value={editDueDate || ''}
                    onChange={(e) => setEditDueDate(e.target.value)}
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
                    {task.dueDate && (
                      <span className="due-date-badge" style={{ marginLeft: '10px', fontSize: '0.85rem', color: '#666' }}>
                        ⏳ {new Date(task.dueDate).toLocaleDateString('vi-VN')}
                      </span>
                    )}
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