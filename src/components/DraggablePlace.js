import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const DraggablePlace = ({ 
  place, 
  index, 
  dayNumber, 
  onRemove,
  isDragging = false 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ 
    id: `${dayNumber}-${place._id}`,
    data: {
      type: 'place',
      place,
      dayNumber,
      index
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`flex items-center justify-between p-2 bg-white rounded border ${
        isDragging || isSortableDragging ? 'shadow-lg border-orange-300' : 'border-gray-200'
      } hover:shadow-sm transition-all cursor-move`}
    >
      <div className="flex items-center space-x-2 flex-1" {...listeners}>
        <div className="flex items-center space-x-2">
          {/* Drag handle */}
          <div className="flex flex-col space-y-0.5 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
            <div className="w-1 h-1 bg-current rounded-full"></div>
            <div className="w-1 h-1 bg-current rounded-full"></div>
            <div className="w-1 h-1 bg-current rounded-full"></div>
            <div className="w-1 h-1 bg-current rounded-full"></div>
          </div>
          
          {/* Place number */}
          <span className="w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
            {index + 1}
          </span>
          
          {/* Place info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{place.name}</p>
            {place.type && (
              <p className="text-xs text-gray-500 capitalize">{place.type}</p>
            )}
            {place.address && (
              <p className="text-xs text-gray-400 truncate">{place.address}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Remove button */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onRemove(place._id);
        }}
        className="p-1 hover:bg-red-100 rounded text-xs text-red-600 ml-2 flex-shrink-0"
        title="Remove place"
      >
        ×
      </button>
    </div>
  );
};

export default DraggablePlace;