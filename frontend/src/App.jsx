import { useState, useEffect } from "react";
import axios from 'axios'
import { CheckCircle2, Circle, Trash2, Plus, ListTodo, Pencil, Check, X, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './App.css';
const API_URL = 'http://localhost:5000/api/tasks';

// 1. Component con cho mỗi Task
function SortableTaskItem({
  task, editTask, editCategory, editTitle, editDueDate,
  setEditCategory, setEdititle, setEditDueDate,
  handelSaveTask, handleCancelTask, handelToggleTask, handleEditTask, handelDeleteTask, isDragEnabled
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id, disabled: !isDragEnabled
  });

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-item ${task.isComplete ? 'completed' : ''} ${isDragging ? 'is-dragging' : ''}`}
    >
      {isDragEnabled && (
        <div className="drag-handle" {...attributes} {...listeners}>
          <GripVertical size={20} />
        </div>
      )}

      {editTask === task._id ? (
        <div className="task-edit-form">
          <select className="category-select edit-select" value={editCategory} onChange={(e) => setEditCategory(e.target.value)}>
            <option value="General">Chung</option>
            <option value="Work">Công việc</option>
            <option value="Personal">Cá nhân</option>
            <option value="Shopping">Mua sắm</option>
          </select>
          <input type="text" className="edit-input" value={editTitle} onChange={(e) => setEdititle(e.target.value)} autoFocus />
          <input type="date" className="edit-input" value={editDueDate || ''} onChange={(e) => setEditDueDate(e.target.value)} />
          <div className="task-actions">
            <button className="btn-save" onClick={() => handelSaveTask(task._id)} title="Lưu"><Check size={20} /></button>
            <button className="btn-cancel" onClick={handleCancelTask} title="Hủy"><X size={20} /></button>
          </div>
        </div>
      ) : (
        <>
          <div className="task-content" onClick={() => handelToggleTask(task._id, task.isComplete)}>
            {task.isComplete ? <CheckCircle2 size={24} className="icon-check" /> : <Circle size={24} className="icon-uncheck" />}
            <span className="task-text">{task.title}</span>
            {task.dueDate && (
              <span className="due-date-badge" style={{ marginLeft: '10px', fontSize: '0.85rem', color: '#666' }}>
                ⏳ {new Date(task.dueDate).toLocaleDateString('vi-VN')}
              </span>
            )}
            <span className={`category-badge ${task.category?.toLowerCase() || 'general'}`}>{task.category || 'General'}</span>
          </div>
          <div className="task-actions">
            <button className="btn-edit" onClick={() => handleEditTask(task)} title="Sửa công việc"><Pencil size={20} /></button>
            <button className="btn-delete" onClick={() => handelDeleteTask(task._id)} title="Xóa công việc"><Trash2 size={20} /></button>
          </div>
        </>
      )}
    </div>
  );
}


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
  const [sortOrder, setSortOrder] = useState('Newest')
  const [editDueDate, setEditDueDate] = useState('')

  // 2. Cài đặt cảm biến kéo thả
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchTask = async () => {
    try {
      const response = await axios.get(API_URL)
      setTask(response.data);
    } catch (error) { console.error('Lỗi khi lấy dữ liệu:', error); }
    finally { setLoading(false) }
  }

  const handelAddTask = async (e) => {
    e.preventDefault()
    if (!newTask.trim()) return;
    try {
      const response = await axios.post(API_URL, { title: newTask, category: newCategory, dueDate: newDueDate || null })
      setTask([response.data, ...tasks])
      setNewTask('')
      setNewDueDate(null)
    } catch (error) { console.error('Lỗi khi lưu dữ liệu:', error); }
  }

  const handelToggleTask = async (id, currentStatus) => {
    try {
      setTask(tasks.map(task => task._id === id ? { ...task, isComplete: !currentStatus } : task))
      await axios.put(`${API_URL}/${id}`, { isComplete: !currentStatus })
    } catch (error) {
      console.error('Lỗi khi cập nhật:', error); fetchTask();
    }
  }

  const handelDeleteTask = async (id) => {
    try {
      setTask(tasks.filter(task => task._id !== id))
      await axios.delete(`${API_URL}/${id}`)
    } catch (error) {
      console.error('Lỗi khi xóa:', error); fetchTask();
    }
  }

  const handleEditTask = (task) => {
    setEditTask(task._id)
    setEdititle(task.title)
    setEditCategory(task.category)
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
      console.error('lỗi khi cập nhật:', error); fetchTask();
    }
  }

  // 3. Hàm xử lý logic khi thả chuột
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setTask((items) => {
        const oldIndex = items.findIndex((i) => i._id === active.id);
        const newIndex = items.findIndex((i) => i._id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);

        // Cập nhật lại số thứ tự
        const updatedItems = newItems.map((item, index) => ({ ...item, order: index }));

        // Gọi API cập nhật backend
        axios.post(`${API_URL}/reorder`, {
          items: updatedItems.map(item => ({ id: item._id, order: item.order }))
        }).catch(err => console.error(err));

        return updatedItems;
      });
    }
  }

  const filterTask = tasks.filter(task => {
    const matchCategory = filterCategory === 'All' || task.category === filterCategory
    const matchStatus = filterStatus === 'All' || (filterStatus === 'Completed' && task.isComplete) || (filterStatus === 'Incompleted' && !task.isComplete)
    const matchSearch = task.title.toLowerCase().includes(searchQuery.toLocaleLowerCase())
    return matchCategory && matchStatus && matchSearch
  }).sort((a, b) => {
    // 4. Ưu tiên sort bằng biến order nếu đang ở chế độ Mặc định
    if (sortOrder === 'Newest') return (a.order || 0) - (b.order || 0)
    if (sortOrder === 'Oldest') return new Date(a.createdAt) - new Date(b.createdAt)
    if (sortOrder === 'DueDate') {
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return new Date(a.dueDate) - new Date(b.dueDate)
    }
    return 0
  })

  // 5. Chỉ cho kéo thả khi không có filter và sort ở Mặc định
  const isDragEnabled = sortOrder === 'Newest' && filterCategory === 'All' && filterStatus === 'All' && !searchQuery;

  const totalTask = tasks.length
  const completedTask = tasks.filter(task => task.isComplete).length
  const pendingTask = totalTask - completedTask
  const progress = totalTask === 0 ? 0 : Math.round((completedTask / totalTask) * 100)

  useEffect(() => { fetchTask(); }, [])

  return (
    <div className="app-container">
      <div className="header">
        <h1>Task Master</h1>
        <p>Quản lý công việc hàng ngày của bạn</p>
      </div>

      {/* ... Phần header Dashboard và Form input ... */}
      <div className="dashboard-container">
        <div className="dashboard-stats">
          <div className="stat-card total"><span className="stat-value">{totalTask}</span><span className="stat-label">Tổng cộng</span></div>
          <div className="stat-card completed"><span className="stat-value">{completedTask}</span><span className="stat-label">Hoàn thành</span></div>
          <div className="stat-card pending"><span className="stat-value">{pendingTask}</span><span className="stat-label">Chưa xong</span></div>
        </div>
        <div className="progress-container">
          <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${progress}%` }}></div></div>
          <span className="progress-text">{progress}% tiến độ</span>
        </div>
      </div>

      <form className="input-container" onSubmit={handelAddTask}>
        <select className="category-select" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
          <option value="General">Chung</option>
          <option value="Work">Công việc</option>
          <option value="Personal">Cá nhân</option>
          <option value="Shopping">Mua sắm</option>
        </select>
        <input type="text" placeholder="Thêm công việc mới..." value={newTask} onChange={(e) => setNewTask(e.target.value)} />
        <input type="date" className="date-input" value={newDueDate || ''} onChange={(e) => setNewDueDate(e.target.value)} />
        <button type="submit" className="btn-add" disabled={!newTask.trim()}><Plus size={24} /></button>
      </form>

      <div className="filter-container" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input type="text" placeholder="Tìm kiếm công việc..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="search-input" style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }} />
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="category-select">
          <option value="All">Tất cả danh mục</option>
          <option value="General">Chung</option>
          <option value="Work">Công việc</option>
          <option value="Personal">Cá nhân</option>
          <option value="Shopping">Mua sắm</option>
        </select>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="category-select">
          <option value="Newest">Mặc định (Kéo thả)</option>
          <option value="Oldest">Cũ nhất</option>
          <option value="DueDate">Ngày đến hạn</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="category-select">
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
        /* 6. Bọc DndContext quanh danh sách task */
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filterTask.map(t => t._id)} strategy={verticalListSortingStrategy}>
            <div className="task-list">
              {filterTask.map((task) => (
                <SortableTaskItem
                  key={task._id}
                  task={task}
                  editTask={editTask}
                  editCategory={editCategory}
                  editTitle={editTitle}
                  editDueDate={editDueDate}
                  setEditCategory={setEditCategory}
                  setEdititle={setEdititle}
                  setEditDueDate={setEditDueDate}
                  handelSaveTask={handelSaveTask}
                  handleCancelTask={handleCancelTask}
                  handelToggleTask={handelToggleTask}
                  handleEditTask={handleEditTask}
                  handelDeleteTask={handelDeleteTask}
                  isDragEnabled={isDragEnabled}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

export default App;
