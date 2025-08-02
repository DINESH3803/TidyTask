import { useEffect } from 'react';
import { useTaskStore } from '@/stores/taskStore';

export const useNotifications = () => {
  const { addNotification } = useTaskStore();

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const showBrowserNotification = (title: string, body: string, icon?: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: icon || '/vite.svg',
        badge: '/vite.svg',
      });
    }
  };

  const notifyTaskDue = (taskTitle: string) => {
    addNotification(`Task "${taskTitle}" is due today!`, 'info');
    showBrowserNotification('Task Due', `"${taskTitle}" is due today!`);
  };

  const notifyTaskCompleted = (taskTitle: string, xp: number) => {
    addNotification(`Task completed! +${xp} XP`, 'success');
    showBrowserNotification('Task Completed', `"${taskTitle}" completed! +${xp} XP earned`);
  };

  const notifyLevelUp = (newLevel: number) => {
    addNotification(`🎉 Level Up! You're now level ${newLevel}!`, 'achievement');
    showBrowserNotification('Level Up!', `Congratulations! You've reached level ${newLevel}!`);
  };

  const notifyStreakMilestone = (streak: number) => {
    addNotification(`🔥 ${streak} day streak! Keep it up!`, 'achievement');
    showBrowserNotification('Streak Milestone', `Amazing! You've maintained a ${streak} day streak!`);
  };

  return {
    notifyTaskDue,
    notifyTaskCompleted,
    notifyLevelUp,
    notifyStreakMilestone,
    showBrowserNotification,
  };
};