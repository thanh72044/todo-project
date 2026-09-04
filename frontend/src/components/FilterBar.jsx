import useTaskStore from '../useTaskStore';

function FilterBar() {
    const {
        searchQuery, setSearchQuery,
        filterCategory, setFilterCategory,
        filterPriority, setFilterPriority,
        sortOrder, setSortOrder,
        filterStatus, setFilterStatus
    } = useTaskStore();

    return (
        <div className="filter-container" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input
                type="text" placeholder="Tìm kiếm công việc..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input" style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }}
            />
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
    );
}

export default FilterBar;
