'use client';

import React from 'react';
import { Relationship } from '@/types';
import { Heart, User, Phone, MapPin } from 'lucide-react';

interface RelationshipCardProps {
  relationship: Relationship;
  onClick?: () => void;
}

export function RelationshipCard({ relationship, onClick }: RelationshipCardProps) {
  const getImportanceColor = () => {
    switch (relationship.importance) {
      case 'CRITICAL': return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'HIGH': return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'MEDIUM': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'LOW': return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      default: return 'border-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getRelationIcon = () => {
    const relation = relationship.relation.toLowerCase();
    if (relation.includes('wife') || relation.includes('husband') || relation.includes('spouse')) {
      return Heart;
    }
    if (relation.includes('doctor') || relation.includes('dr.')) {
      return User; // Could use a medical icon if available
    }
    return User;
  };

  const RelationIcon = getRelationIcon();

  return (
    <div
      className={`p-4 rounded-xl border-l-4 ${getImportanceColor()} cursor-pointer hover:shadow-lg transition-all transform hover:scale-[1.02] h-fit`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {relationship.photo ? (
            <img
              src={relationship.photo}
              alt={relationship.name}
              className="w-16 h-16 rounded-full object-cover shadow-md"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
              <RelationIcon size={24} className="text-white" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
              {relationship.name}
            </h3>
            <span className={`text-xs px-2 py-1 rounded-full font-semibold shrink-0 ${
              relationship.importance === 'CRITICAL' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
              relationship.importance === 'HIGH' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
              relationship.importance === 'MEDIUM' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
              'bg-slate-100 text-slate-800 border border-slate-200'
            }`}>
              {relationship.importance}
            </span>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium truncate">
            {relationship.relation}
          </p>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Key Facts:
            </h4>
            <ul className="space-y-1 max-h-24 overflow-y-auto">
              {relationship.facts?.slice(0, 3).map((fact, index) => (
                <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                  <span className="text-blue-500 mt-1 shrink-0">•</span>
                  <span className="break-words">{fact.fact}</span>
                </li>
              ))}
              {(relationship.facts?.length || 0) > 3 && (
                <li className="text-xs text-gray-500 italic">
                  +{(relationship.facts?.length || 0) - 3} more...
                </li>
              )}
            </ul>
          </div>

          {relationship.lastInteraction && (
            <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm border border-blue-200">
              <strong className="text-blue-800 dark:text-blue-200">Last:</strong>{' '}
              <span className="text-gray-700 dark:text-gray-300 break-words">
                {relationship.lastInteraction}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface RelationshipListProps {
  relationships: Relationship[];
  maxItems?: number;
  onRelationshipClick?: (relationship: Relationship) => void;
}

export function RelationshipList({
  relationships,
  maxItems,
  onRelationshipClick
}: RelationshipListProps) {
  const sortedRelationships = [...relationships]
    .sort((a, b) => {
      const importanceOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      return importanceOrder[b.importance] - importanceOrder[a.importance];
    })
    .slice(0, maxItems);

  if (relationships.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <User size={48} className="mx-auto mb-4 opacity-50" />
        <p>No relationships recorded yet.</p>
        <p className="text-sm">Add important people in your life!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {sortedRelationships.map((relationship) => (
        <RelationshipCard
          key={relationship.id}
          relationship={relationship}
          onClick={() => onRelationshipClick?.(relationship)}
        />
      ))}
    </div>
  );
}