import React, { useState, useEffect } from 'react';
import { Location } from '../types';

interface AddShopModalProps {
  location: Location | null;
  initialName?: string;
  initialAddress?: string;
  onConfirm: (name: string, address: string) => void;
  onCancel: () => void;
}

export const AddShopModal: React.FC<AddShopModalProps> = ({ location, initialName, initialAddress, onConfirm, onCancel }) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  // Update local state when props change
  useEffect(() => {
    if (location) {
      setName(initialName || '');
      setAddress(initialAddress || '');
    }
  }, [location, initialName, initialAddress]);

  if (!location) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onConfirm(name, address || '地址未填寫');
      setName('');
      setAddress('');
    }
  };

  return (
    <div className="add-shop-modal-overlay">
      <div className="add-shop-modal animate-fade-in-up">
        <h3 className="add-shop-title">發現新大陸？</h3>
        <p className="add-shop-subtitle">
          新增店家資訊
        </p>
        
        <form onSubmit={handleSubmit} className="add-shop-form">
          <div>
            <label className="add-shop-label">店名</label>
            <input
              autoFocus
              className="add-shop-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="輸入店名..."
              required
            />
          </div>
          <div>
            <label className="add-shop-label">地址/位置描述</label>
            <input
              className="add-shop-input"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="例如：中山北路巷內..."
            />
          </div>
          
          <div className="add-shop-buttons">
            <button
              type="button"
              onClick={onCancel}
              className="btn-cancel-add"
            >
              取消
            </button>
            <button
              type="submit"
              className="btn-confirm-add"
            >
              確認新增
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};