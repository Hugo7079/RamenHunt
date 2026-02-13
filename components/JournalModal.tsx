import React from 'react';
import { X, Calendar, Star, MapPin } from 'lucide-react';
import { BowlLog, Shop } from '../types';

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: BowlLog[];
  shops: Shop[];
  onLogClick: (shopId: string) => void;
}

export const JournalModal: React.FC<JournalModalProps> = ({
  isOpen,
  onClose,
  logs,
  shops,
  onLogClick
}) => {
  if (!isOpen) return null;

  // Sort logs by date descending
  const sortedLogs = logs.slice().sort((a, b) => b.date - a.date);

  const getShopName = (shopId: string) => {
    return shops.find(s => s.id === shopId)?.name || '未知店家';
  };

  return (
    <div className="journal-modal-overlay animate-fade-in">
      <div className="journal-modal">
        
        {/* Header */}
        <div className="journal-modal-header">
          <div className="journal-title-wrapper">
            <h2 className="journal-modal-title">
               麵簿
            </h2>
            <p className="journal-subtitle">共 {logs.length} 碗完食紀錄</p>
          </div>
          <button 
            onClick={onClose}
            className="btn-close-journal"
          >
            <X size={24} />
          </button>
        </div>

        {/* List Content */}
        <div className="journal-modal-content custom-scrollbar">
          {sortedLogs.length === 0 ? (
            <div className="journal-empty">
              <p>這裡還是一片空白...</p>
              <p>快去吃第一碗麵吧！</p>
            </div>
          ) : (
            <div className="journal-logs-grid">
              {sortedLogs.map(log => (
                <div 
                  key={log.id} 
                  onClick={() => {
                    onLogClick(log.shopId);
                    onClose();
                  }}
                  className="journal-log-card"
                >
                  <div className="journal-log-header">
                    <div className="journal-log-info">
                      <h3 className="journal-log-name">
                        {log.itemName}
                      </h3>
                      <div className="journal-log-meta">
                        <Star size={14} fill="currentColor" />
                        <span>{log.rating}</span>
                        <span className="divider">|</span>
                        <span className="journal-log-shop">
                          <MapPin size={12} /> {getShopName(log.shopId)}
                        </span>
                      </div>
                    </div>
                    <div className="journal-log-date-badge">
                      <Calendar size={12} />
                      {new Date(log.date).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {(log.notes) && (
                    <p className="journal-log-notes">
                      {log.notes}
                    </p>
                  )}

                  <div className="journal-log-tags no-scrollbar">
                     <span className="journal-log-tag">
                        {log.noodleHardness}
                     </span>
                     <span className="journal-log-tag">
                        {log.soupConcentration}
                     </span>
                     <span className="journal-log-tag">
                        ${log.price}
                     </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};