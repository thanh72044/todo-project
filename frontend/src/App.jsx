import { CheckCircle2, Circle, Trash2, Plus, ListTodo, Pencil, Check, X, GripVertical, AwardIcon, Sun, Download, Moon } from 'lucide-react';
import { useState, useEffect } from "react";
import axios from 'axios'
import toast, { Toaster } from "react-hot-toast"
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
  task, editTask, editCategory, editTitle, editDueDate, editPriority,
  setEditCategory, setEdititle, setEditDueDate, setEditPriority,
  handelSaveTask, handleCancelTask, handelToggleTask, handleEditTask, handelDeleteTask, isDragEnabled,
  editSubTask, setEditSubTask, newSubTask, setNewSubTask, handleToggleSubTask
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id, disabled: !isDragEnabled
  });

  const style = { transform: CSS.Transform.toString(transform), transition };

  const handleAddSubTask = (e) => {
    e.preventDefault();
    if (!newSubTask.trim()) return;
    setEditSubTask([...editSubTask, { title: newSubTask, isComplete: false }]);
    setNewSubTask('');
  };

  const handleRemoveSubTask = (index) => {
    const updated = [...editSubTask];
    updated.splice(index, 1);
    setEditSubTask(updated);
  };

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
        <div className="task-edit-form-container" style={{ width: '100%' }}>
          <div className="task-edit-form">
            <select className="category-select edit-select" value={editCategory} onChange={(e) => setEditCategory(e.target.value)}>
              <option value="General">Chung</option>
              <option value="Work">Công việc</option>
              <option value="Personal">Cá nhân</option>
              <option value="Shopping">Mua sắm</option>
            </select>
            <select className="category-select edit-select" value={editPriority} onChange={(e) => setEditPriority(e.target.value)}>
              <option value="None">Không ưu tiên</option>
              <option value="High">🔴 Quan trọng</option>
              <option value="Medium">🟡 Vừa phải</option>
              <option value="Low">🟢 Thấp</option>
            </select>
            <input type="text" className="edit-input" value={editTitle} onChange={(e) => setEdititle(e.target.value)} autoFocus />
            <input type="date" className="edit-input" value={editDueDate || ''} onChange={(e) => setEditDueDate(e.target.value)} />
            <div className="task-actions">
              <button className="btn-save" onClick={() => handelSaveTask(task._id)} title="Lưu"><Check size={20} /></button>
              <button className="btn-cancel" onClick={handleCancelTask} title="Hủy"><X size={20} /></button>
            </div>
          </div>

          <div className="edit-subtasks-container" style={{ marginTop: '10px', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#94a3b8' }}>Công việc con:</h4>
            {editSubTask.map((sub, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ color: 'white', flex: 1 }}>{sub.title}</span>
                <button type="button" onClick={() => handleRemoveSubTask(index)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={16} /></button>
              </div>
            ))}
            <form onSubmit={handleAddSubTask} style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <input type="text" className="edit-input" placeholder="Nhập việc con và ấn Thêm..." value={newSubTask} onChange={(e) => setNewSubTask(e.target.value)} style={{ height: '36px' }} />
              <button type="submit" className="btn-save" style={{ padding: '0 10px', height: '36px' }}>Thêm</button>
            </form>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="task-content" onClick={() => handelToggleTask(task._id, task.isComplete)} style={{ flex: 1 }}>
              {task.isComplete ? <CheckCircle2 size={24} className="icon-check" /> : <Circle size={24} className="icon-uncheck" />}
              <span className="task-text">{task.title}</span>
              {task.dueDate && (
                <span className="due-date-badge" style={{ marginLeft: '10px', fontSize: '0.85rem', color: '#666' }}>
                  ⏳ {new Date(task.dueDate).toLocaleDateString('vi-VN')}
                </span>
              )}
              {task.priority && task.priority !== 'None' && (
                <span className={`priority-badge ${task.priority.toLowerCase()}`} style={{ marginLeft: '10px', fontSize: '0.8rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                  {task.priority === 'High' ? '🔴 Quan trọng' : task.priority === 'Medium' ? '🟡 Vừa phải' : '🟢 Thấp'}
                </span>
              )}
              <span className={`category-badge ${task.category?.toLowerCase() || 'general'}`}>{task.category || 'General'}</span>
            </div>
            <div className="task-actions">
              <button className="btn-edit" onClick={() => handleEditTask(task)} title="Sửa công việc"><Pencil size={20} /></button>
              <button className="btn-delete" onClick={() => handelDeleteTask(task._id)} title="Xóa công việc"><Trash2 size={20} /></button>
            </div>
          </div>

          {task.subTasks && task.subTasks.length > 0 && (
            <div className="read-subtasks-container" style={{ marginTop: '10px', paddingLeft: '40px' }}>
              {task.subTasks.map((sub, index) => (
                <div key={sub._id || index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', cursor: 'pointer' }} onClick={() => handleToggleSubTask(task._id, sub._id, sub.isComplete)}>
                  {sub.isComplete ? <CheckCircle2 size={16} className="icon-check" /> : <Circle size={16} className="icon-uncheck" />}
                  <span style={{ fontSize: '0.9rem', color: sub.isComplete ? '#64748b' : '#cbd5e1', textDecoration: sub.isComplete ? 'line-through' : 'none' }}>{sub.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
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
  const [newPriority, setNewPriority] = useState('None')
  const [editPriority, setEditPriority] = useState('None')
  const [filterPriority, setFilterPriority] = useState('All')
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saveTheme = localStorage.getItem('theme')
    return saveTheme === 'dark'
  })
  const [editSubTask, setEditSubTask] = useState([])
  const [newSubTask, setNewSubTask] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const taskPerPage = 10
  useEffect(() => {
    setCurrentPage(1);
  }, [filterCategory, filterStatus, filterPriority, searchQuery, sortOrder]);



  const indexOfLastTask = taskPerPage * currentPage
  const indexOfFirstTask = indexOfLastTask - taskPerPage

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode')
      localStorage.setItem('theme', 'dark')
    } else {
      document.body.classList.remove('dark-mode')
      localStorage.setItem('theme', 'light')
    }
  }, [isDarkMode])

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
      const response = await axios.post(API_URL, { title: newTask, category: newCategory, dueDate: newDueDate || null, priority: newPriority })
      setTask([response.data, ...tasks])
      setNewTask('')
      setNewDueDate(null)
      setNewPriority('None')
      toast.success('thêm task thành công')
    } catch (error) { toast.error('Lỗi khi lưu dữ liệu:', error); }
  }

  const handelToggleTask = async (id, currentStatus) => {
    try {
      setTask(tasks.map(task => task._id === id ? { ...task, isComplete: !currentStatus } : task))
      await axios.put(`${API_URL}/${id}`, { isComplete: !currentStatus })
    } catch (error) {
      toast.error('Lỗi khi cập nhật:', error); fetchTask();
    }
  }

  const handelDeleteTask = async (id) => {
    try {
      setTask(tasks.filter(task => task._id !== id))
      await axios.delete(`${API_URL}/${id}`)
      toast.success('xóa task thành công')
    } catch (error) {
      toast.error('Lỗi khi xóa:', error); fetchTask();
    }
  }

  const handleEditTask = (task) => {
    setEditTask(task._id)
    setEdititle(task.title)
    setEditCategory(task.category)
    setEditDueDate(task.dueDate ? task.dueDate.split('T')[0] : null)
    setEditPriority(task.priority || 'None')
    setEditSubTask(task.subTasks || [])
  }

  const handleCancelTask = () => {
    setEditTask(null)
    setEdititle('')
    setEditDueDate(null)
    setEditPriority('None')
    setEditSubTask([])
    setNewSubTask('')
  }

  const handelSaveTask = async (id) => {
    if (!editTitle.trim()) return
    try {
      setTask(tasks.map(task => task._id === id ? { ...task, title: editTitle, category: editCategory, dueDate: editDueDate || null, priority: editPriority, subTasks: editSubTask } : task))
      setEditTask(null)
      await axios.put(`${API_URL}/${id}`, { title: editTitle, category: editCategory, dueDate: editDueDate || null, priority: editPriority, subTasks: editSubTask })
      toast.success('cập nhật task thành công')
    } catch (error) {
      toast.error('lỗi khi cập nhật:', error); fetchTask();
    }
  }

  const handleToggleSubTask = async (taskId, subTaskId, currentStatus) => {
    try {
      // Tìm task hiện tại
      const taskIndex = tasks.findIndex(t => t._id === taskId);
      if (taskIndex === -1) return;

      const currentTask = tasks[taskIndex];
      // Tạo mảng subTask mới với trạng thái đảo ngược
      const updatedSubTasks = currentTask.subTasks.map(sub =>
        sub._id === subTaskId ? { ...sub, isComplete: !currentStatus } : sub
      );

      // Cập nhật giao diện lập tức
      setTask(tasks.map(t => t._id === taskId ? { ...t, subTasks: updatedSubTasks } : t));

      // Gọi API lên backend (tái sử dụng hàm update)
      await axios.put(`${API_URL}/${taskId}`, { ...currentTask, subTasks: updatedSubTasks });
    } catch (error) {
      toast.error('Lỗi khi cập nhật sub-task');
      fetchTask();
    }
  }



  const handleDeleteAllTasks = async () => {
    if (tasks === 0) return
    if (window.confirm('bạn có chắc là xóa chứ ?')) {
      try {
        await axios.delete(`${API_URL}`)
        setTask([])
        toast.success('đã xóa hết task')
      } catch (error) {
        toast.error('lỗi khi xóa tất cả', error)
        fetchTask([])
      }
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
    const matchPriority = filterPriority === 'All' || task.priority === filterPriority
    const matchSearch = task.title.toLowerCase().includes(searchQuery.toLocaleLowerCase())
    return matchCategory && matchStatus && matchPriority && matchSearch
  }).sort((a, b) => {
    // 4. Ưu tiên sort bằng biến order nếu đang ở chế độ Mặc định
    if (sortOrder === 'Newest') return (a.order || 0) - (b.order || 0)
    if (sortOrder === 'Oldest') return new Date(a.createdAt) - new Date(b.createdAt)
    if (sortOrder === 'DueDate') {
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return new Date(a.dueDate) - new Date(b.dueDate)
    }
    if (sortOrder === 'Priority') {
      const priorityWeight = { 'High': 3, 'Medium': 2, 'Low': 1, 'None': 0 };
      return (priorityWeight[b.priority || 'None'] || 0) - (priorityWeight[a.priority || 'None'] || 0);
    }
    return 0
  })

  const currentTasks = filterTask.slice(indexOfFirstTask, indexOfLastTask)
  const totalPages = Math.ceil(filterTask.length / taskPerPage)

  // 5. Chỉ cho kéo thả khi không có filter và sort ở Mặc định
  const isDragEnabled = sortOrder === 'Newest' && filterCategory === 'All' && filterPriority === 'All' && filterStatus === 'All' && !searchQuery;

  const totalTask = tasks.length
  const completedTask = tasks.filter(task => task.isComplete).length
  const pendingTask = totalTask - completedTask
  const progress = totalTask === 0 ? 0 : Math.round((completedTask / totalTask) * 100)

  const handleExportData = () => {
    const JsonString = JSON.stringify(tasks, null, 2)
    const blob = new Blob([JsonString], { type: 'application/json' })
    const filUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = filUrl
    link.download = 'danh sách công việc.json'
    document.body.appendChild(link)
    link.click()

    document.body.removeChild(link)
    URL.revokeObjectURL(filUrl)
    toast.success('Đã tải dữ liệu về máy!');
  }

  useEffect(() => { fetchTask(); }, [])

  return (
    <div className="app-container">
      <div className="header">
        <h1>Task Master</h1>
        <p>Quản lý công việc hàng ngày của bạn</p>
        <button onClick={() => setIsDarkMode(!isDarkMode)} className="theme-toggle-btn">
          {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
        </button>
        <Toaster position="bottom-right" reverseOrder={false} />
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
            <span className="progress-text" style={{ margin: 0 }}>{progress}% tiến độ</span>
            {tasks.length > 0 && (
              <button
                onClick={handleDeleteAllTasks}
                className="btn-delete-all"
                title="Xóa toàn bộ danh sách"
              >
                <Trash2 size={16} /> Xóa tất cả
              </button>

            )}
          </div>
        </div>
      </div>
      {/* ... code cũ (thanh tiến độ) ... */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
        <span className="progress-text" style={{ margin: 0 }}>{progress}% tiến độ</span>
        {tasks.length > 0 && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleExportData}
              className="btn-delete-all"
              style={{ color: '#60a5fa', borderColor: 'rgba(96, 165, 250, 0.3)', backgroundColor: 'rgba(96, 165, 250, 0.1)' }}
              title="Tải về máy"
            >
              <Download size={16} /> Xuất file
            </button>

            <button
              onClick={handleDeleteAllTasks}
              className="btn-delete-all"
              title="Xóa toàn bộ danh sách"
            >
              <Trash2 size={16} /> Xóa tất cả
            </button>
          </div>
        )}
      </div>
      {/* ... code cũ (thẻ form bên dưới) ... */}


      <form className="input-container" onSubmit={handelAddTask}>
        <select className="category-select" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
          <option value="General">Chung</option>
          <option value="Work">Công việc</option>
          <option value="Personal">Cá nhân</option>
          <option value="Shopping">Mua sắm</option>
        </select>
        <select className="category-select" value={newPriority} onChange={(e) => setNewPriority(e.target.value)}>
          <option value="None">Độ ưu tiên</option>
          <option value="High">🔴 Quan trọng</option>
          <option value="Medium">🟡 Vừa phải</option>
          <option value="Low">🟢 Thấp</option>
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
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="category-select">
          <option value="All">Tất cả ưu tiên</option>
          <option value="High">🔴 Quan trọng</option>
          <option value="Medium">🟡 Vừa phải</option>
          <option value="Low">🟢 Thấp</option>
          <option value="None">Không ưu tiên</option>
        </select>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="category-select">
          <option value="Newest">Mặc định (Kéo thả)</option>
          <option value="Oldest">Cũ nhất</option>
          <option value="DueDate">Ngày đến hạn</option>
          <option value="Priority">Độ ưu tiên cao nhất</option>
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
          <SortableContext items={currentTasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
            <div className="task-list" style={{ minHeight: '750px' }}>
              {currentTasks.map((task) => (
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
                  editPriority={editPriority}
                  setEditPriority={setEditPriority}
                  editSubTask={editSubTask}
                  setEditSubTask={setEditSubTask}
                  newSubTask={newSubTask}
                  setNewSubTask={setNewSubTask}
                  handleToggleSubTask={handleToggleSubTask}
                />
              ))}
            </div>
          </SortableContext>

          {/* Giao diện Phân trang đã được chuyển xuống dưới */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.max(prev - 1, 1)); }}
                disabled={currentPage === 1}
              >
                Trang trước
              </button>

              <span className="pagination-info">
                Trang {currentPage} / {totalPages}
              </span>

              <button
                className="pagination-btn"
                onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.min(prev + 1, totalPages)); }}
                disabled={currentPage === totalPages}
              >
                Trang sau
              </button>
            </div>
          )}
        </DndContext>
      )}
    </div>
  );
}

export default App;
