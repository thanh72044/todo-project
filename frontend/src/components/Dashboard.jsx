import { Trash2, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import useTaskStore from '../useTaskStore';

function Dashboard() {
    // Lấy danh sách tasks và hàm xóa từ Store
    const { tasks, deleteAllTasks } = useTaskStore();

    // Tự động tính toán các con số thống kê
    const totalTask = tasks.length;
    const completedTask = tasks.filter(task => task.isComplete).length;
    const pendingTask = totalTask - completedTask;
    const progress = totalTask === 0 ? 0 : Math.round((completedTask / totalTask) * 100);

    // Hàm xuất file có thể đặt ngay trong component vì nó không làm thay đổi State chung
    const handleExportData = () => {
        const JsonString = JSON.stringify(tasks, null, 2);
        const blob = new Blob([JsonString], { type: 'application/json' });
        const filUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = filUrl;
        link.download = 'danh_sach_cong_viec.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(filUrl);
        toast.success('Đã tải dữ liệu về máy!');
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-stats">
                <div className="stat-card total"><span className="stat-value">{totalTask}</span><span className="stat-label">Tổng cộng</span></div>
                <div className="stat-card completed"><span className="stat-value">{completedTask}</span><span className="stat-label">Hoàn thành</span></div>
                <div className="stat-card pending"><span className="stat-value">{pendingTask}</span><span className="stat-label">Chưa xong</span></div>
            </div>

            <div className="progress-container">
                <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${progress}%` }}></div></div>
            </div>

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
                            onClick={deleteAllTasks}
                            className="btn-delete-all"
                            title="Xóa toàn bộ danh sách"
                        >
                            <Trash2 size={16} /> Xóa tất cả
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
