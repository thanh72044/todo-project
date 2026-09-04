import { useState } from 'react';
import { Plus } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useTaskStore from '../useTaskStore';

const API_URL = 'http://localhost:5000/api/tasks';

function TaskForm() {
    // Những state này CHỈ dùng tạm thời trong lúc điền form nên dùng useState là chuẩn nhất
    const [newTask, setNewTask] = useState('');
    const [newCategory, setNewCategory] = useState('General');
    const [newDueDate, setNewDueDate] = useState('');
    const [newPriority, setNewPriority] = useState('None');

    // Lấy danh sách tasks và hàm fetchTasks để cập nhật lại danh sách sau khi thêm thành công
    const { tasks, fetchTasks } = useTaskStore();

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        try {
            // Gửi data lên backend
            await axios.post(API_URL, {
                title: newTask,
                category: newCategory,
                dueDate: newDueDate || null,
                priority: newPriority
            });

            // Xóa trắng form sau khi thêm
            setNewTask('');
            setNewDueDate('');
            setNewPriority('None');
            toast.success('Thêm task thành công');

            // Gọi lại API để tải danh sách mới nhất về Store
            fetchTasks();
        } catch (error) {
            toast.error('Lỗi khi lưu dữ liệu:', error);
        }
    };

    return (
        <form className="input-container" onSubmit={handleAddTask}>
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
    );
}

export default TaskForm;
