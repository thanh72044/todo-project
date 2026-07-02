import { useState, useEffect } from "react";
import axios from 'axios'
import { CheckCircle2, Circle, Trash2, Plus, ListTodo, IdCardLanyard } from 'lucide-react';
import './App.css';
const API_URL = 'http://localhost:5000/api/tasks';

function App() {
  const [tasks, setTask] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);
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
      const response = await axios.post(API_URL, { title: newTask })
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

      {loading ? (
        <div className="loading">Đang tải dữ liệu...</div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <ListTodo size={48} strokeWidth={1} />
          <p>Chưa có công việc nào. Hãy thêm công việc mới!</p>
        </div>
      ) : (
        <div className="task-list">
          {tasks.map((task) => (
            <div
              key={task._id}
              className={`task-item ${task.isComplete ? 'completed' : ''}`}
            >
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
              </div>
              <button
                className="btn-delete"
                onClick={() => handelDeleteTask(task._id)}
                title="Xóa công việc"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default App; 