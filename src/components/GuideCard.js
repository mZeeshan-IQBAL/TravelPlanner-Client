import React from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from './Avatar';

/**
 * GuideCard - displays a travel guide summary card
 * Props:
 *  - guide: {
 *      id, title, excerpt, cover, author: { name, avatarUrl },
 *      stats: { likes, comments, views }, tags: string[], location
 *    }
 */
const GuideCard = ({ guide }) => {
  const navigate = useNavigate();
  
  if (!guide) return null;
  const { id, title, excerpt, cover, author, stats = {}, location } = guide;
  
  const handleClick = () => {
    navigate(`/guides/${id}`);
  };
  
  return (
    <div 
      onClick={handleClick}
      className="group bg-white dark:bg-secondary-800 rounded-3xl overflow-hidden border border-secondary-100 dark:border-secondary-700 shadow-soft hover:shadow-large transition-all duration-300 cursor-pointer transform hover:scale-[1.02]">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={cover}
          alt={title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-medium text-secondary-700 dark:bg-secondary-900/80 dark:text-secondary-200 shadow">
          {location}
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-secondary-900 dark:text-secondary-100 line-clamp-1">
          {title}
        </h3>
        {excerpt && (
          <p className="mt-1 text-sm text-secondary-600 dark:text-secondary-300 line-clamp-2">
            {excerpt}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar src={author?.avatarUrl} alt={author?.name} size="small" />
            <div>
              <div className="text-sm font-medium text-secondary-800 dark:text-secondary-200">{author?.name}</div>
              <div className="text-xs text-secondary-500 dark:text-secondary-400">Guide author</div>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-xs text-secondary-500 dark:text-secondary-300">
            <span className="inline-flex items-center space-x-1"><span>❤️</span><span>{stats.likes ?? 0}</span></span>
            <span className="inline-flex items-center space-x-1"><span>💬</span><span>{stats.comments ?? 0}</span></span>
            <span className="inline-flex items-center space-x-1"><span>👁️</span><span>{stats.views ?? 0}</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideCard;
