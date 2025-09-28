'use client';

import React from 'react';
import { Place } from '@/types';
import { Home, MapPin, Coffee, Building, Trees, Utensils } from 'lucide-react';

interface PlaceCardProps {
  place: Place;
  onClick?: () => void;
}

export function PlaceCard({ place, onClick }: PlaceCardProps) {
  const getImportanceColor = () => {
    switch (place.importance) {
      case 'CRITICAL': return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'HIGH': return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'MEDIUM': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'LOW': return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      default: return 'border-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getPlaceIcon = () => {
    const name = place.name.toLowerCase();
    if (name.includes('home') || name.includes('apartment')) return Home;
    if (name.includes('office') || name.includes('work')) return Building;
    if (name.includes('coffee') || name.includes('cafe') || name.includes('bakery')) return Coffee;
    if (name.includes('restaurant') || name.includes('food')) return Utensils;
    if (name.includes('park') || name.includes('garden')) return Trees;
    return MapPin;
  };

  const PlaceIcon = getPlaceIcon();

  return (
    <div
      className={`p-4 rounded-xl border-l-4 ${getImportanceColor()} cursor-pointer hover:shadow-lg transition-all transform hover:scale-105`}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        {place.image ? (
          <img
            src={place.image}
            alt={place.name}
            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
            <PlaceIcon size={24} className="text-white" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {place.name}
            </h3>
            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
              place.importance === 'CRITICAL' ? 'bg-red-100 text-red-800' :
              place.importance === 'HIGH' ? 'bg-orange-100 text-orange-800' :
              place.importance === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {place.importance}
            </span>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {place.description}
          </p>

          {place.address && (
            <p className="text-xs text-blue-600 dark:text-blue-400 mb-2 font-medium flex items-center gap-1">
              <MapPin size={12} />
              {place.address}
            </p>
          )}

          {place.lastVisited && (
            <p className="text-xs text-green-600 dark:text-green-400 mb-2 font-medium">
              Last visited: {place.lastVisited}
            </p>
          )}

          <div className="space-y-1">
            {place.keyDetails.slice(0, 3).map((detail, index) => (
              <p key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>{detail}</span>
              </p>
            ))}
            {place.keyDetails.length > 3 && (
              <p className="text-xs text-gray-500 italic">
                +{place.keyDetails.length - 3} more details...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface PlaceListProps {
  places: Place[];
  maxItems?: number;
  onPlaceClick?: (place: Place) => void;
}

export function PlaceList({ places, maxItems, onPlaceClick }: PlaceListProps) {
  const sortedPlaces = [...places]
    .sort((a, b) => {
      const importanceOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      return importanceOrder[b.importance] - importanceOrder[a.importance];
    })
    .slice(0, maxItems);

  if (places.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <MapPin size={48} className="mx-auto mb-4 opacity-50" />
        <p>No places recorded yet.</p>
        <p className="text-sm">Add important locations!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {sortedPlaces.map((place) => (
        <PlaceCard
          key={place.id}
          place={place}
          onClick={() => onPlaceClick?.(place)}
        />
      ))}
    </div>
  );
}