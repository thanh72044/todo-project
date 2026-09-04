import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CheckCircle2, Circle, Trash2, Pencil, Check, X, GripVertical } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useTaskStore from '../useTaskStore';

const API_URL = 'http://localhost:5000/api/tasks';

function SortableTaskItem({ task, isDragEnabled }) {
    const { fetchTasks } = useTaskStore();

    // Component tự quản lý State "đang chỉnh sửa" của chính nó!
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);
    const [editCategory, setEditCategory] = useState(task.category || 'General');
    const [editPriority, setEditPriority] = useState(task.priority || 'None');
    const [editDueDate, setEditDueDate] = useState(task.dueDate ? task.dueDate.split('T')[0] : '');

    const [editSubTask, setEditSubTask] = useState(task.subTasks || []);
    const [newSubTask, setNewSubTask] = useState('');

    // Setup cho thư viện kéo thả dnd-kit
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: task._id, disabled: !isDragEnabled
    });

    const style = { transform: CSS.Transform.toString(transform), transition };

    // --- CÁC HÀM XỬ LÝ API ---
    const handleToggleTask = async () => {
        try {
            // Cập nhật lên backend
            await axios.put(`${API_URL}/${task._id}`, { ...task, isComplete: !task.isComplete });
            // Tải lại dữ liệu mới từ Store
            fetchTasks();
        } catch (error) { toast.error('Lỗi khi cập nhật'); }
    };

    const handleDeleteTask = async () => {
        try {
            await axios.delete(`${API_URL}/${task._id}`);
            toast.success('Xóa task thành công');
            fetchTasks();
        } catch (error) { toast.error('Lỗi khi xóa'); }
    };

    const handleSaveTask = async () => {
        if (!editTitle.trim()) return;
        try {
            await axios.put(`${API_URL}/${task._id}`, {
                title: editTitle, category: editCategory,
                dueDate: editDueDate || null, priority: editPriority,
                subTasks: editSubTask
            });
            setIsEditing(false);
            toast.success('Cập nhật thành công');
            fetchTasks();
        } catch (error) { toast.error('Lỗi cập nhật'); }
    };

    const handleToggleSubTask = async (subTaskId, currentStatus) => {
        try {
            const updatedSubTasks = task.subTasks.map(sub =>
                sub._id === subTaskId ? { ...sub, isComplete: !currentStatus } : sub
            );
            await axios.put(`${API_URL}/${task._id}`, { ...task, subTasks: updatedSubTasks });
            fetchTasks();
        } catch (error) { toast.error('Lỗi cập nhật sub-task'); }
    };

    // --- CÁC HÀM XỬ LÝ FORM SUBTASK ---
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

    const handleCancelEdit = () => {
        setIsEditing(false);
        // Khôi phục lại giá trị cũ nếu người dùng ấn hủy
        setEditTitle(task.title);
        setEditCategory(task.category || 'General');
        setEditPriority(task.priority || 'None');
        setEditDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
        setEditSubTask(task.subTasks || []);
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

            {isEditing ? (
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
                        <input type="text" className="edit-input" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} autoFocus />
                        <input type="date" className="edit-input" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} />
                        <div className="task-actions">
                            <button className="btn-save" onClick={handleSaveTask} title="Lưu"><Check size={20} /></button>
                            <button className="btn-cancel" onClick={handleCancelEdit} title="Hủy"><X size={20} /></button>
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
                        <div className="task-content" onClick={handleToggleTask} style={{ flex: 1 }}>
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
                            <button className="btn-edit" onClick={() => setIsEditing(true)} title="Sửa công việc"><Pencil size={20} /></button>
                            <button className="btn-delete" onClick={handleDeleteTask} title="Xóa công việc"><Trash2 size={20} /></button>
                        </div>
                    </div>

                    {task.subTasks && task.subTasks.length > 0 && (
                        <div className="read-subtasks-container" style={{ marginTop: '10px', paddingLeft: '40px' }}>
                            {task.subTasks.map((sub, index) => (
                                <div key={sub._id || index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', cursor: 'pointer' }} onClick={() => handleToggleSubTask(sub._id, sub.isComplete)}>
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

export default SortableTaskItem;
