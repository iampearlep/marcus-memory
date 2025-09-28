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
      className={`p-4 rounded-lg border-l-4 ${getImportanceColor()} cursor-pointer hover:shadow-md transition-all`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {relationship.photo ? (
            <img
              src={relationship.photo}
              alt={relationship.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
              <RelationIcon size={24} className="text-white" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {relationship.name}
            </h3>
            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
              relationship.importance === 'CRITICAL' ? 'bg-red-100 text-red-800' :
              relationship.importance === 'HIGH' ? 'bg-orange-100 text-orange-800' :
              relationship.importance === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {relationship.importance}
            </span>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium">
            {relationship.relation}
          </p>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Key Facts:
            </h4>
            <ul className="space-y-1">
              {relationship.keyFacts.map((fact, index) => (
                <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>

          {relationship.lastInteraction && (
            <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
              <strong>Last interaction:</strong> {relationship.lastInteraction}
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
    <div className="space-y-4">
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