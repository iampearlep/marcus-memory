'use client';

import React from 'react';
import { Hobby } from '@/types';
import { Camera, Mountain, ChefHat, Gamepad2, Music } from 'lucide-react';

interface HobbyCardProps {
  hobby: Hobby;
  onClick?: () => void;
}

export function HobbyCard({ hobby, onClick }: HobbyCardProps) {
  const getImportanceColor = () => {
    switch (hobby.importance) {
      case 'CRITICAL': return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'HIGH': return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'MEDIUM': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'LOW': return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      default: return 'border-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getHobbyIcon = () => {
    const name = hobby.name.toLowerCase();
    if (name.includes('photo')) return Camera;
    if (name.includes('climb') || name.includes('hik')) return Mountain;
    if (name.includes('cook') || name.includes('food')) return ChefHat;
    if (name.includes('game')) return Gamepad2;
    if (name.includes('music')) return Music;
    return Camera;
  };

  const HobbyIcon = getHobbyIcon();

  return (
    <div
      className={`p-4 rounded-xl border-l-4 ${getImportanceColor()} cursor-pointer hover:shadow-lg transition-all transform hover:scale-105`}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        {hobby.image ? (
          <img
            src={hobby.image}
            alt={hobby.name}
            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
            <HobbyIcon size={24} className="text-white" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {hobby.name}
            </h3>
            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
              hobby.importance === 'CRITICAL' ? 'bg-red-100 text-red-800' :
              hobby.importance === 'HIGH' ? 'bg-orange-100 text-orange-800' :
              hobby.importance === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {hobby.importance}
            </span>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {hobby.description}
          </p>

          {hobby.lastEngaged && (
            <p className="text-xs text-blue-600 dark:text-blue-400 mb-2 font-medium">
              Last: {hobby.lastEngaged}
            </p>
          )}

          <div className="space-y-1">
            {hobby.details?.slice(0, 3).map((detail, index) => (
              <p key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>{detail.detail}</span>
              </p>
            ))}
            {(hobby.details?.length || 0) > 3 && (
              <p className="text-xs text-gray-500 italic">
                +{(hobby.details?.length || 0) - 3} more details...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface HobbyListProps {
  hobbies: Hobby[];
  maxItems?: number;
  onHobbyClick?: (hobby: Hobby) => void;
}

export function HobbyList({ hobbies, maxItems, onHobbyClick }: HobbyListProps) {
  const sortedHobbies = [...hobbies]
    .sort((a, b) => {
      const importanceOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      return importanceOrder[b.importance] - importanceOrder[a.importance];
    })
    .slice(0, maxItems);

  if (hobbies.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <Camera size={48} className="mx-auto mb-4 opacity-50" />
        <p>No hobbies recorded yet.</p>
        <p className="text-sm">Add your interests and activities!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {sortedHobbies.map((hobby) => (
        <HobbyCard
          key={hobby.id}
          hobby={hobby}
          onClick={() => onHobbyClick?.(hobby)}
        />
      ))}
    </div>
  );
}