import { useEffect } from 'react';
import { useTaskStore } from '@/stores/taskStore';
import { useNotifications } from './useNotifications';

export const useTaskScheduler = () => {
  const { tasks, processRepeatingTasks } = useTaskStore();
  const { notifyTaskDue } = useNotifications();

  useEffect(() => {
    // Check for due tasks every minute
    const checkDueTasks = () => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      tasks.forEach(task => {
        if (!task.completed) {
          const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
          
          // Notify for tasks due today
          if (taskDate === today) {
            const notificationKey = `due-${task.id}-${today}`;
            const hasNotified = localStorage.getItem(notificationKey);
            
            if (!hasNotified) {
              notifyTaskDue(task.title);
              localStorage.setItem(notificationKey, 'true');
            }
          }
        }
      });
    };

    // Process repeating tasks daily
    const processRepeats = () => {
      const lastProcessed = localStorage.getItem('lastRepeatingTasksProcessed');
      const today = new Date().toISOString().split('T')[0];
      
      if (lastProcessed !== today) {
        processRepeatingTasks();
        localStorage.setItem('lastRepeatingTasksProcessed', today);
      }
    };

    // Initial checks
    checkDueTasks();
    processRepeats();

    // Set up intervals
    const dueTasksInterval = setInterval(checkDueTasks, 60000); // Every minute
    const repeatingTasksInterval = setInterval(processRepeats, 3600000); // Every hour

    return () => {
      clearInterval(dueTasksInterval);
      clearInterval(repeatingTasksInterval);
    };
  }, [tasks, processRepeatingTasks, notifyTaskDue]);

  return null;
};