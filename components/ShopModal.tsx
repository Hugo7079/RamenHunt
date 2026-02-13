import React, { useState } from 'react';
import { X, Star, Plus, ChefHat, Pencil, ChevronDown } from 'lucide-react';
import { Shop, BowlLog, NOODLE_HARDNESS_OPTIONS, SOUP_OPTIONS, FAT_OPTIONS } from '../types';

interface ShopModalProps {
  shop: Shop | null;
  logs: BowlLog[];
  onClose: () => void;
  onAddLog: (log: Omit<BowlLog, 'id' | 'shopId' | 'date'>) => void;
  onUpdateLog: (logId: string, log: Omit<BowlLog, 'id' | 'shopId' | 'date'>) => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({ shop, logs, onClose, onAddLog, onUpdateLog }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    itemName: '',
    rating: 5,
    noodleHardness: '普通',
    soupConcentration: '普通',
    backFat: '普通',
    price: 250,
    queueTime: 0,
    notes: '',
    hasKaedama: false,
  });

  if (!shop) return null;

  const shopLogs = logs.filter(l => l.shopId === shop.id).sort((a, b) => b.date - a.date);
  const averageRating = shopLogs.length > 0 
    ? (shopLogs.reduce((acc, curr) => acc + curr.rating, 0) / shopLogs.length).toFixed(1)
    : 'New';

  const resetForm = () => {
    setFormData({
      itemName: '',
      rating: 5,
      noodleHardness: '普通',
      soupConcentration: '普通',
      backFat: '普通',
      price: 250,
      queueTime: 0,
      notes: '',
      hasKaedama: false,
    });
    setEditingLogId(null);
    setIsFormOpen(false);
  };

  const handleEditClick = (log: BowlLog) => {
    setFormData({
      itemName: log.itemName,
      rating: log.rating,
      noodleHardness: log.noodleHardness,
      soupConcentration: log.soupConcentration,
      backFat: log.backFat,
      price: log.price,
      queueTime: log.queueTime,
      notes: log.notes,
      hasKaedama: log.hasKaedama,
    });
    setEditingLogId(log.id);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLogId) {
      onUpdateLog(editingLogId, formData);
    } else {
      onAddLog(formData);
    }
    resetForm();
  };

  return (
    <div className="shop-modal">
      {/* Header */}
      <div className="shop-modal-header">
        <div className="shop-modal-header-top">
          <div className="shop-modal-title-wrapper">
            <h2 className="shop-modal-title">{shop.name}</h2>
            <p className="shop-modal-address">
              <span className="address-dot"></span>
              {shop.address}
            </p>
          </div>
          <button onClick={onClose} className="btn-close-modal">
            <X size={20} />
          </button>
        </div>
        
        <div className="shop-modal-stats">
          <div className="shop-rating-badge">
            <Star size={14} fill="currentColor" />
            {averageRating}
          </div>
          <div className="shop-log-count">{shopLogs.length} 碗紀錄</div>
        </div>
      </div>

      {/* Content Area */}
      <div className="shop-modal-content custom-scrollbar">
        {isFormOpen ? (
          <form onSubmit={handleSubmit} className="shop-modal-form animate-fade-in">
            <div className="form-header">
              <h3 className="form-title">
                {editingLogId ? '編輯紀錄' : '新增一碗紀錄'}
              </h3>
              <button 
                type="button" 
                onClick={resetForm}
                className="btn-cancel-form"
              >
                取消
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">品項名稱</label>
              <input 
                required
                className="form-input"
                placeholder="例如：特濃豚骨拉麵"
                value={formData.itemName}
                onChange={e => setFormData({...formData, itemName: e.target.value})}
              />
            </div>

            {/* Layout Fix: Flex container to manage width better */}
            <div className="form-row">
              {/* Rating Section - Takes natural width */}
              <div className="form-col-auto">
                <label className="form-label">評分</label>
                <div className="rating-stars">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({...formData, rating: star})}
                      className={`star-button ${formData.rating >= star ? 'active' : ''}`}
                    >
                      <Star fill={formData.rating >= star ? 'currentColor' : 'none'} size={26} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Queue Section - Pushed to right, with fixed max width to prevent overlap */}
              <div className="form-col-grow">
                 <label className="form-label form-label-right">排隊 (分)</label>
                 <div className="queue-input-wrapper">
                   <input 
                    type="number"
                    className="queue-input"
                    value={formData.queueTime}
                    onChange={e => setFormData({...formData, queueTime: parseInt(e.target.value) || 0})}
                   />
                 </div>
              </div>
            </div>

            <div className="form-grid">
              {[
                { label: '麵條硬度', key: 'noodleHardness', options: NOODLE_HARDNESS_OPTIONS },
                { label: '湯頭濃度', key: 'soupConcentration', options: SOUP_OPTIONS },
                { label: '背脂量', key: 'backFat', options: FAT_OPTIONS }
              ].map((field: any) => (
                <div key={field.key} className="form-group">
                  <label className="form-label">{field.label}</label>
                  <div className="form-select-wrapper">
                    <select 
                      className="form-select"
                      value={(formData as any)[field.key]}
                      onChange={e => setFormData({...formData, [field.key]: e.target.value})}
                    >
                      {field.options.map((o: string) => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <div className="select-arrow">
                      <ChevronDown size={14} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="price-kaedama-row">
               <div className="price-input-group">
                 <label className="price-label">價格</label>
                 <div className="price-input-wrapper">
                    <span className="price-currency">$</span>
                    <input 
                      type="number"
                      className="price-input"
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: parseInt(e.target.value) || 0})}
                    />
                 </div>
               </div>
               <div className="divider-vertical"></div>
               <div className="checkbox-group">
                 <input 
                  type="checkbox"
                  id="kaedama"
                  checked={formData.hasKaedama}
                  onChange={e => setFormData({...formData, hasKaedama: e.target.checked})}
                  className="form-checkbox"
                 />
                 <label htmlFor="kaedama" className="checkbox-label">有加麵/替玉</label>
               </div>
            </div>

            <div className="form-group">
              <label className="form-label">筆記</label>
              <textarea 
                className="form-textarea"
                rows={3}
                placeholder="紀錄一下這碗麵的靈魂..."
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
              />
            </div>

            <button type="submit" className="btn-submit">
              {editingLogId ? '更新紀錄' : '儲存這碗美味'}
            </button>
          </form>
        ) : (
          <div className="logs-list">
            {shopLogs.length === 0 ? (
               <div className="empty-state">
                 <div className="empty-icon">
                    <ChefHat size={32} style={{opacity: 0.5}} />
                 </div>
                 <p className="empty-title">還是一張白紙</p>
                 <p className="empty-subtitle">這家店的味道，等你來定義。</p>
               </div>
            ) : (
              shopLogs.map(log => (
                <div key={log.id} className="log-card">
                  <div className="log-card-header">
                    <h4 className="log-item-name">{log.itemName}</h4>
                    <div className="log-card-actions">
                      <div className="log-rating-badge">
                        <Star size={14} fill="currentColor" />
                        <span>{log.rating}</span>
                      </div>
                      <button 
                        onClick={() => handleEditClick(log)}
                        className="btn-edit-log"
                        title="編輯紀錄"
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="log-tags">
                    <span className="log-tag">麵: {log.noodleHardness}</span>
                    <span className="log-tag">湯: {log.soupConcentration}</span>
                    <span className="log-tag">${log.price}</span>
                    <span className="log-tag">排: {log.queueTime}分</span>
                  </div>

                  {log.notes && (
                    <div className="log-notes">
                      <p className="log-notes-text">
                        {log.notes}
                      </p>
                    </div>
                  )}
                  
                  <div className="log-footer">
                     <div className="log-badges">
                        {log.hasKaedama && (
                          <span className="kaedama-badge">替玉</span>
                        )}
                     </div>
                    <div className="log-date">
                      {new Date(log.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button for Adding */}
      {!isFormOpen && (
        <div className="floating-add-button-wrapper">
          <button 
            onClick={() => {
              resetForm();
              setIsFormOpen(true);
            }}
            className="btn-add-log"
          >
            <Plus size={24} /> 
            <span>新增一碗紀錄</span>
          </button>
        </div>
      )}
    </div>
  );
};