import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Flag, Tag, CheckCircle, Clock, Edit, Trash2, Star } from 'lucide-react';
import { Task } from '@/pages/Tasks';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onToggleComplete, 
  onEdit, 
  onDelete, 
  onToggleFavorite 
}) => {
  const priorityConfig = {
    low: { color: 'from-emerald-500 to-green-500', border: 'border-emerald-200 dark:border-emerald-800' },
    medium: { color: 'from-amber-500 to-orange-500', border: 'border-amber-200 dark:border-amber-800' },
    high: { color: 'from-red-500 to-pink-500', border: 'border-red-200 dark:border-red-800' },
  };

  const isOverdue = new Date(task.dueDate) < new Date() && !task.completed;
  const config = priorityConfig[task.priority];

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`glass rounded-2xl p-6 border transition-all duration-300 group ${
        task.completed 
          ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/20' 
          : config.border
      } ${isOverdue ? 'ring-2 ring-red-500 animate-pulse' : ''}`}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {task.favorite && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-amber-500"
              >
                <Star className="w-4 h-4 fill-current text-amber-500" />
              </motion.div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onToggleFavorite && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onToggleFavorite(task.id)}
                className={`p-1.5 rounded-lg transition-colors ${
                  task.favorite 
                    ? 'bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-amber-500'
                }`}
              >
              <Star className={`w-4 h-4 ${task.favorite ? 'fill-current text-amber-500' : ''}`} />
              </motion.button>
            )}
            
            {onEdit && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onEdit(task)}
                className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-orange-500 transition-colors"
              >
                <Edit className="w-4 h-4" />
              </motion.button>
            )}
            
            {onDelete && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDelete(task.id)}
                className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Task Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {task.tags.map((tag, index) => (
              <span key={index} className="px-2 py-1 text-xs bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className={`font-semibold text-lg ${
              task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
            }`}>
              {task.title}
            </h3>
            <p className={`text-sm mt-1 ${
              task.completed ? 'line-through text-muted-foreground' : 'text-muted-foreground'
            }`}>
              {task.description}
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onToggleComplete(task.id)}
            className={`p-2 rounded-lg transition-colors ${
              task.completed
                ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-emerald-500'
            }`}
          >
            <CheckCircle className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Priority Indicator */}
        <div className="flex items-center space-x-2">
          <Flag className="w-4 h-4 text-muted-foreground" />
          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${config.color}`} />
          <span className="text-sm text-muted-foreground capitalize">{task.priority} Priority</span>
        </div>

        {/* Category */}
        <div className="flex items-center space-x-2">
          <Tag className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm bg-amber-100 dark:bg-amber-800 px-2 py-1 rounded-lg text-muted-foreground">
            {task.category}
          </span>
        </div>

        {/* Due Date */}
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className={`text-sm ${
            isOverdue ? 'text-red-500 font-medium' : 'text-muted-foreground'
          }`}>
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </span>
          {isOverdue && <Clock className="w-4 h-4 text-red-500" />}
        </div>

        {/* XP Reward */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
          <span className="text-sm text-muted-foreground">XP Reward</span>
          <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${config.color} text-white text-sm font-bold`}>
            +{task.xpReward} XP
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;