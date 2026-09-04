import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import useTaskStore from "./useTaskStore";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import TaskForm from "./components/TaskForm";
import FilterBar from "./components/FilterBar";
import TaskList from "./components/TaskList";
import './App.css';

function App() {
  const { fetchTasks, isDarkMode } = useTaskStore();

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return (
    <div className="app-container">
      <Header />
      <Toaster position="bottom-right" reverseOrder={false} />
      <Dashboard />
      <TaskForm />
      <FilterBar />
      <TaskList />
    </div>
  );
}

export default App;
