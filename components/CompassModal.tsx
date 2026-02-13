import React, { useState, useEffect } from 'react';
import { Compass, X, Utensils, Star, MapPin } from 'lucide-react';
import { Shop, BowlLog, CompassResult } from '../types';

interface CompassModalProps {
  isOpen: boolean;
  onClose: () => void;
  shops: Shop[];
  logs: BowlLog[];
  onResult: (result: CompassResult) => void;
}

export const CompassModal: React.FC<CompassModalProps> = ({
  isOpen,
  onClose,
  shops,
  logs,
  onResult
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<CompassResult | null>(null);

  // Filter valid options (Rating >= 4)
  const validLogs = logs.filter(log => log.rating >= 4);
  const hasOptions = validLogs.length > 0;

  const handleSpin = () => {
    if (isSpinning || !hasOptions) return;

    setIsSpinning(true);
    setResult(null);

    // Random rotation logic
    const spins = 5 + Math.random() * 5; // 5 to 10 full spins
    const degrees = spins * 360;
    const randomOffset = Math.random() * 360;
    const finalRotation = degrees + randomOffset;

    setRotation(finalRotation);

    // Calculate result after animation
    setTimeout(() => {
      const randomLog = validLogs[Math.floor(Math.random() * validLogs.length)];
      const shop = shops.find(s => s.id === randomLog.shopId);
      
      if (shop && randomLog) {
        setResult({ shop, bowl: randomLog });
      }
      setIsSpinning(false);
    }, 3000); // Animation duration
  };

  const handleGo = () => {
    if (result) {
      onResult(result);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="compass-modal">
        
        {/* Header */}
        <div className="compass-modal-header">
          <h2 className="compass-modal-title">
            <Compass className="animate-pulse" /> 今天吃哪碗？
          </h2>
          <button onClick={onClose} className="btn-close-compass">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="compass-modal-content">
          {!hasOptions ? (
            <div className="compass-no-options">
              <p>還沒有足夠的 4 星以上美味紀錄！</p>
              <p>快去探索並紀錄更多拉麵吧。</p>
            </div>
          ) : (
            <>
              {/* Compass Wheel Visual */}
              <div className="compass-wheel-container">
                {/* Static Outer Ring */}
                <div className="compass-wheel-outer"></div>
                
                {/* Spinning Inner */}
                <div 
                  className="compass-wheel-inner"
                  style={{ 
                    transform: `rotate(${rotation}deg)`,
                    transitionDuration: '3000ms'
                  }}
                >
                  <div className="compass-wheel-icon">
                    <Utensils />
                  </div>
                </div>

                {/* Arrow */}
                <div className="compass-arrow"></div>
              </div>

              {/* Result Display */}
              <div className="compass-result-area">
                {isSpinning ? (
                  <p className="compass-spinning-text animate-pulse">命運旋轉中...</p>
                ) : result ? (
                  <div className="compass-result animate-fade-in-up">
                    <p className="compass-result-label">神之指引</p>
                    <h3 className="compass-result-shop">{result.shop.name}</h3>
                    <div className="compass-result-item">
                      <Star size={16} fill="currentColor" />
                      <span>{result.bowl.itemName}</span>
                    </div>
                  </div>
                ) : (
                  <p className="compass-idle-text">點擊下方按鈕開始抽籤</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="compass-actions">
                {!result ? (
                  <button
                    onClick={handleSpin}
                    disabled={isSpinning}
                    className="btn-spin"
                  >
                    {isSpinning ? '...' : '開始抽籤'}
                  </button>
                ) : (
                  <button
                    onClick={handleGo}
                    className="btn-go"
                  >
                    <MapPin size={24} /> 前往導航
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};