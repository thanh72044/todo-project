import { useEffect, useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { ListTodo } from 'lucide-react';
import axios from 'axios';
import useTaskStore from '../useTaskStore';
import SortableTaskItem from './SortableTaskItem';

const API_URL = 'http://localhost:5000/api/tasks';

function TaskList() {
  const {
    tasks, setTasks, loading,
    filterCategory, filterStatus, filterPriority, searchQuery, sortOrder
  } = useTaskStore();

  const [currentPage, setCurrentPage] = useState(1);
  const taskPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [filterCategory, filterStatus, filterPriority, searchQuery, sortOrder]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const oldIndex = tasks.findIndex((i) => i._id === active.id);
      const newIndex = tasks.findIndex((i) => i._id === over.id);
      const newItems = arrayMove(tasks, oldIndex, newIndex);
      
      // Cập nhật lại số thứ tự
      const updatedItems = newItems.map((item, index) => ({ ...item, order: index }));

      // Cập nhật UI ngay lập tức để không bị giật lag
      setTasks(updatedItems);

      // Gọi API cập nhật backend ngầm ở dưới
      axios.post(`${API_URL}/reorder`, {
        items: updatedItems.map(item => ({ id: item._id, order: item.order }))
      }).catch(err => console.error(err));
    }
  };

  const filterTask = tasks.filter(task => {
    const matchCategory = filterCategory === 'All' || task.category === filterCategory;
    const matchStatus = filterStatus === 'All' || (filterStatus === 'Completed' && task.isComplete) || (filterStatus === 'Incompleted' && !task.isComplete);
    const matchPriority = filterPriority === 'All' || task.priority === filterPriority;
    const matchSearch = task.title.toLowerCase().includes(searchQuery.toLocaleLowerCase());
    return matchCategory && matchStatus && matchPriority && matchSearch;
  }).sort((a, b) => {
    if (sortOrder === 'Newest') return (a.order || 0) - (b.order || 0);
    if (sortOrder === 'Oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortOrder === 'DueDate') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    if (sortOrder === 'Priority') {
      const priorityWeight = { 'High': 3, 'Medium': 2, 'Low': 1, 'None': 0 };
      return (priorityWeight[b.priority || 'None'] || 0) - (priorityWeight[a.priority || 'None'] || 0);
    }
    return 0;
  });

  const indexOfLastTask = taskPerPage * currentPage;
  const indexOfFirstTask = indexOfLastTask - taskPerPage;
  const currentTasks = filterTask.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(filterTask.length / taskPerPage);

  const isDragEnabled = sortOrder === 'Newest' && filterCategory === 'All' && filterPriority === 'All' && filterStatus === 'All' && !searchQuery;

  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  if (filterTask.length === 0) {
    return (
      <div className="empty-state">
        <ListTodo size={48} strokeWidth={1} />
        <p>Chưa có công việc nào. Hãy thêm công việc mới!</p>
      </div>
    );
  }

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={currentTasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
          <div className="task-list" style={{ minHeight: '750px' }}>
            {currentTasks.map((task) => (
              <SortableTaskItem
                key={task._id}
                task={task}
                isDragEnabled={isDragEnabled}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

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
    </>
  );
}

export default TaskList;
