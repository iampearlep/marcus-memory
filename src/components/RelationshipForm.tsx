'use client';

import React, { useState } from 'react';
import { Priority, Relationship } from '@/types';
import { useMemory } from '@/context/MemoryContext';
import { Heart, User, Phone, Calendar, Save, X } from 'lucide-react';

interface RelationshipFormProps {
  onClose: () => void;
  editingRelationship?: Relationship;
}

export function RelationshipForm({ onClose, editingRelationship }: RelationshipFormProps) {
  const { addRelationship, updateRelationship } = useMemory();

  const [formData, setFormData] = useState({
    name: editingRelationship?.name || '',
    relation: editingRelationship?.relation || '',
    photo: editingRelationship?.photo || '',
    contactInfo: editingRelationship?.contactInfo || '',
    birthday: editingRelationship?.birthday || '',
    relationship: editingRelationship?.relationshipType || 'other' as const,
    importance: editingRelationship?.importance || 'MEDIUM' as Priority,
    keyFacts: editingRelationship?.facts?.map(f => f.fact).join('\n') || '',
    lastInteraction: editingRelationship?.lastInteraction || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.relation.trim()) return;

    const facts = formData.keyFacts
      .split('\n')
      .map(fact => fact.trim())
      .filter(fact => fact.length > 0)
      .map(fact => ({
        id: 0,
        relationshipId: editingRelationship?.id || '',
        fact,
        createdAt: new Date().toISOString()
      }));

    if (editingRelationship) {
      const relationshipData: Relationship = {
        ...editingRelationship,
        name: formData.name.trim(),
        relation: formData.relation.trim(),
        photo: formData.photo.trim() || undefined,
        contactInfo: formData.contactInfo.trim() || undefined,
        birthday: formData.birthday.trim() || undefined,
        relationshipType: formData.relationship,
        importance: formData.importance,
        facts,
        lastInteraction: formData.lastInteraction.trim() || undefined,
        updatedAt: new Date().toISOString()
      };
      updateRelationship(relationshipData);
    } else {
      const relationshipData = {
        name: formData.name.trim(),
        relation: formData.relation.trim(),
        photo: formData.photo.trim() || undefined,
        contactInfo: formData.contactInfo.trim() || undefined,
        birthday: formData.birthday.trim() || undefined,
        relationshipType: formData.relationship,
        importance: formData.importance,
        facts,
        lastInteraction: formData.lastInteraction.trim() || undefined
      };
      addRelationship(relationshipData);
    }

    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getImportanceColor = (priority: Priority) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-500 text-white';
      case 'HIGH': return 'bg-orange-500 text-white';
      case 'MEDIUM': return 'bg-yellow-500 text-black';
      case 'LOW': return 'bg-green-500 text-white';
    }
  };

  const relationshipTypes = [
    { value: 'family', label: 'Family', icon: Heart },
    { value: 'friend', label: 'Friend', icon: User },
    { value: 'medical', label: 'Medical', icon: Phone },
    { value: 'work', label: 'Work', icon: User },
    { value: 'other', label: 'Other', icon: User }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {editingRelationship ? 'Edit Person' : 'Add New Person'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Full name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Relation *
                </label>
                <input
                  type="text"
                  value={formData.relation}
                  onChange={(e) => handleInputChange('relation', e.target.value)}
                  placeholder="e.g., Wife, Best Friend, Doctor"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Photo URL */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Photo URL
              </label>
              <input
                type="url"
                value={formData.photo}
                onChange={(e) => handleInputChange('photo', e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {formData.photo && (
                <div className="mt-2">
                  <img
                    src={formData.photo}
                    alt="Preview"
                    className="w-20 h-20 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  <Phone size={16} className="inline mr-1" />
                  Contact Info
                </label>
                <input
                  type="text"
                  value={formData.contactInfo}
                  onChange={(e) => handleInputChange('contactInfo', e.target.value)}
                  placeholder="Phone number or email"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  <Calendar size={16} className="inline mr-1" />
                  Birthday
                </label>
                <input
                  type="text"
                  value={formData.birthday}
                  onChange={(e) => handleInputChange('birthday', e.target.value)}
                  placeholder="e.g., May 15"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Relationship Type & Importance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Relationship Type
                </label>
                <select
                  value={formData.relationship}
                  onChange={(e) => handleInputChange('relationship', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {relationshipTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Importance Level
                </label>
                <select
                  value={formData.importance}
                  onChange={(e) => handleInputChange('importance', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
            </div>

            {/* Key Facts */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Key Facts (one per line)
              </label>
              <textarea
                value={formData.keyFacts}
                onChange={(e) => handleInputChange('keyFacts', e.target.value)}
                placeholder="Important things to remember about this person..."
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Last Interaction */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Last Interaction
              </label>
              <input
                type="text"
                value={formData.lastInteraction}
                onChange={(e) => handleInputChange('lastInteraction', e.target.value)}
                placeholder="What you last did together..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className={`flex-1 py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${getImportanceColor(formData.importance)}`}
              >
                <Save size={20} />
                {editingRelationship ? 'Update Person' : 'Add Person'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}