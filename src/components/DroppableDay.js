import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import DraggablePlace from './DraggablePlace';

const DroppableDay = ({ 
  day, 
  isSelected, 
  onDaySelect, 
  onRemovePlace, 
  onAddDay,
  onRemoveDay,
  canRemoveDay
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${day.day}`,
    data: {
      type: 'day',
      dayNumber: day.day
    }
  });

  const placesWithIds = (day.places || []).map((place, index) => ({
    ...place,
    sortableId: `${day.day}-${place._id}`,
    index
  }));

  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center justify-between mb-2">
        <button 
          className={`flex items-center space-x-2 hover:text-gray-900 ${
            isSelected ? 'text-orange-600 font-medium' : 'text-gray-700'
          }`}
          onClick={() => onDaySelect(day.day)}
        >
          <span className="text-sm">{isSelected ? '▼' : '▶'}</span>
          <span className="font-medium">{day.date}</span>
          <span className="text-xs text-gray-500">({day.places?.length || 0} places)</span>
        </button>
        <div className="flex space-x-1">
          <button 
            onClick={onAddDay}
            className="p-1 hover:bg-gray-100 rounded text-xs"
            title="Add new day"
          >
            +
          </button>
          {canRemoveDay && (
            <button 
              onClick={() => onRemoveDay(day.day)}
              className="p-1 hover:bg-red-100 rounded text-xs text-red-600"
              title="Remove this day"
            >
              ×
            </button>
          )}
        </div>
      </div>
      
      {/* Show places for this day when selected */}
      {isSelected && (
        <div className="ml-6">
          <div
            ref={setNodeRef}
            className={`space-y-2 min-h-[40px] p-2 rounded-lg transition-colors ${
              isOver ? 'bg-orange-50 border-2 border-dashed border-orange-300' : 'bg-gray-50'
            }`}
          >
            {day.places && day.places.length > 0 ? (
              <SortableContext 
                items={placesWithIds.map(place => place.sortableId)}
                strategy={verticalListSortingStrategy}
              >
                {placesWithIds.map((place, index) => (
                  <DraggablePlace
                    key={place.sortableId}
                    place={place}
                    index={index}
                    dayNumber={day.day}
                    onRemove={() => onRemovePlace(place._id, day.day)}
                  />
                ))}
              </SortableContext>
            ) : (
              <div className="text-xs text-gray-500 italic text-center py-4">
                {isOver ? 'Drop places here' : 'No places added yet. Use the search above to add places or drag them from other days.'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DroppableDay;