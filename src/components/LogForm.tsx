'use client';

import React, { useState } from 'react';
import { Priority, Category } from '@/types';
import { useMemory } from '@/context/MemoryContext';
import { AlertTriangle, Heart, Briefcase, User, Plus } from 'lucide-react';

interface LogFormProps {
  onClose?: () => void;
  isEmergency?: boolean;
}

export function LogForm({ onClose, isEmergency = false }: LogFormProps) {
  const { addLog, state } = useMemory();
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<Priority>(isEmergency ? 'CRITICAL' : 'MEDIUM');
  const [category, setCategory] = useState<Category>('personal');
  const [isPersistent, setIsPersistent] = useState(isEmergency || false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    addLog({
      content: content.trim(),
      priority,
      category,
      isEmergency,
      isPersistent: isPersistent || priority === 'CRITICAL'
    });

    setContent('');
    if (onClose) onClose();
  };

  const priorityColors = {
    CRITICAL: 'bg-red-500 text-white',
    HIGH: 'bg-orange-500 text-white',
    MEDIUM: 'bg-yellow-500 text-black',
    LOW: 'bg-green-500 text-white'
  };

  const categoryIcons = {
    relationships: Heart,
    work: Briefcase,
    medical: Plus,
    personal: User,
    emergency: AlertTriangle
  };

  const getPhaseStyle = () => {
    switch (state.currentPhase) {
      case 'critical':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'urgency':
        return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20';
      default:
        return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`p-6 rounded-lg border-2 space-y-4 ${getPhaseStyle()}`}>
      {isEmergency && (
        <div className="flex items-center gap-2 text-red-600 font-semibold">
          <AlertTriangle size={20} />
          Emergency Log
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">
          What do you need to remember?
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type your memory here..."
          className="w-full p-3 border rounded-lg min-h-[100px] text-lg"
          required
          autoFocus
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="w-full p-2 border rounded-lg"
          >
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full p-2 border rounded-lg"
          >
            <option value="relationships">Relationships</option>
            <option value="work">Work</option>
            <option value="medical">Medical</option>
            <option value="personal">Personal</option>
            <option value="emergency">Emergency</option>
            <option value="hobbies">Hobbies</option>
            <option value="places">Places</option>
          </select>
        </div>
      </div>

      {/* Persistent Memory Checkbox */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isPersistent"
          checked={isPersistent}
          onChange={(e) => setIsPersistent(e.target.checked)}
          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
        />
        <label htmlFor="isPersistent" className="text-sm text-gray-700 dark:text-gray-300">
          Remember across memory resets (persistent memory)
        </label>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className={`flex-1 py-3 px-4 rounded-lg font-semibold ${priorityColors[priority]}`}
        >
          Save Memory
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}