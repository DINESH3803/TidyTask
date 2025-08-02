import React from 'react';
import { motion } from 'framer-motion';
import { Task } from '@/pages/Tasks';
import TaskCard from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ 
  tasks, 
  onToggleComplete, 
  onEdit, 
  onDelete, 
  onToggleFavorite 
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  if (tasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="glass rounded-2xl p-8 border border-white/20 dark:border-white/10">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No tasks found</h3>
          <p className="text-muted-foreground">
            Create your first task to get started on your productivity journey!
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
    >
      {tasks.map((task) => (
        <motion.div key={task.id} variants={itemVariants}>
          <TaskCard 
            task={task} 
            onToggleComplete={onToggleComplete}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleFavorite={onToggleFavorite}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default TaskList;