import { Sun, Moon } from 'lucide-react';
import useTaskStore from '../useTaskStore';

function Header() {
    // Bạn thấy đấy, thay vì nhận props từ App.jsx, 
    // Header tự chạy vào Store (Ngân hàng) để lấy isDarkMode và hàm toggleTheme ra dùng!
    const { isDarkMode, toggleTheme } = useTaskStore();

    return (
        <div className="header">
            <h1>Task Master</h1>
            <p>Quản lý công việc hàng ngày của bạn</p>

            <button onClick={toggleTheme} className="theme-toggle-btn">
                {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
        </div>
    );
}

export default Header;
