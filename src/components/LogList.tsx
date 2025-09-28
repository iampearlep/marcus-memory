'use client';

import React from 'react';
import { Log } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, Heart, Briefcase, User, Plus, Clock } from 'lucide-react';

interface LogListProps {
  logs: Log[];
  maxItems?: number;
  showTimestamps?: boolean;
}

export function LogList({ logs, maxItems, showTimestamps = true }: LogListProps) {
  const sortedLogs = [...logs]
    .sort((a, b) => {
      // Sort by priority first, then by timestamp (newest first)
      const priorityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.timestamp - a.timestamp;
    })
    .slice(0, maxItems);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'HIGH': return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'MEDIUM': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'LOW': return 'border-l-green-500 bg-green-50 dark:bg-green-900/20';
      default: return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'relationships': return Heart;
      case 'work': return Briefcase;
      case 'medical': return Plus;
      case 'personal': return User;
      case 'emergency': return AlertTriangle;
      default: return User;
    }
  };

  if (logs.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <Clock size={48} className="mx-auto mb-4 opacity-50" />
        <p>No memories logged yet.</p>
        <p className="text-sm">Start logging important information!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedLogs.map((log) => {
        const IconComponent = getCategoryIcon(log.category);

        return (
          <div
            key={log.id}
            className={`p-4 rounded-lg border-l-4 ${getPriorityColor(log.priority)} transition-all hover:shadow-md`}
          >
            <div className="flex items-start gap-3">
              <IconComponent size={20} className="mt-1 flex-shrink-0" />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                    log.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                    log.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                    log.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {log.priority}
                  </span>

                  <span className="text-xs text-gray-500 capitalize">
                    {log.category}
                  </span>

                  {log.isEmergency && (
                    <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                      EMERGENCY
                    </span>
                  )}
                </div>

                <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                  {log.content}
                </p>

                {showTimestamps && (
                  <p className="text-xs text-gray-500 mt-2">
                    {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}