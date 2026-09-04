import { create } from 'zustand';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api/tasks';

const useTaskStore = create((set, get) => ({
    // 1. Các State (dữ liệu)
    tasks: [],
    loading: true,

    // Các state cho bộ lọc và giao diện
    filterCategory: 'All',
    filterStatus: 'All',
    filterPriority: 'All',
    searchQuery: '',
    sortOrder: 'Newest',

    // Theme state
    isDarkMode: localStorage.getItem('theme') === 'dark',

    // 2. Các Actions (hàm thay đổi dữ liệu)

    // Lấy dữ liệu từ API
    fetchTasks: async () => {
        set({ loading: true });
        try {
            const response = await axios.get(API_URL);
            set({ tasks: response.data, loading: false });
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu:', error);
            set({ loading: false });
        }
    },

    // Dùng để update list UI tức thời khi kéo thả
    setTasks: (newTasks) => set({ tasks: newTasks }),

    // Xóa toàn bộ công việc
    deleteAllTasks: async () => {
        const { tasks, fetchTasks } = get();
        if (tasks.length === 0) return;
        if (window.confirm('Bạn có chắc là muốn xóa tất cả chứ?')) {
            try {
                await axios.delete(API_URL);
                set({ tasks: [] });
                toast.success('Đã xóa hết task');
            } catch (error) {
                toast.error('Lỗi khi xóa tất cả');
                fetchTasks();
            }
        }
    },


    // Toggle Dark Mode
    toggleTheme: () => {
        const newTheme = !get().isDarkMode;
        set({ isDarkMode: newTheme });
        localStorage.setItem('theme', newTheme ? 'dark' : 'light');
        if (newTheme) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    },

    // Cập nhật các bộ lọc
    setFilterCategory: (category) => set({ filterCategory: category }),
    setFilterStatus: (status) => set({ filterStatus: status }),
    setFilterPriority: (priority) => set({ filterPriority: priority }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setSortOrder: (order) => set({ sortOrder: order }),

    // Thêm task (để lại cho bạn điền thêm nếu cần sau này, tạm thời cứ giữ các action cũ ở App.jsx hoặc chuyển dần vào đây)
    // ... mình sẽ chuyển logic CRUD API vào đây ở các bước sau nếu bạn muốn.
}));

export default useTaskStore;
