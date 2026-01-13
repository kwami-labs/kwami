export const WIDGET_STYLES = `
  .kwami-widget-root {
    display: inline-flex;
    align-items: center;
  }

  .kwami-popover-content {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding-bottom: 0.5rem;
  }

  .kwami-section-col {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .kwami-wallet-list {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
  }

  .kwami-error-box {
    display: none;
    padding: 0.75rem 0.9rem;
    border-radius: 14px;
    border: 1px solid rgba(248,113,113,0.35);
    background: rgba(248,113,113,0.08);
    color: rgba(248,113,113,0.95);
    font-size: 0.85rem;
  }

  .kwami-nft-section {
    /* controlled by inline style for visibility */
    width: 100%;
  }

  .kwami-wallet-option-btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    text-align: left;
    padding: 0.75rem;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.05);
    background: rgba(255,255,255,0.02);
    cursor: pointer;
    transition: all 0.2s;
  }
  .kwami-wallet-option-btn:hover:not(:disabled) {
    background: rgba(255,255,255,0.05);
  }
  .kwami-wallet-option-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .kwami-wallet-option-left {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    min-width: 0;
  }

  .kwami-wallet-option-right {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  .kwami-wallet-option-icon {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    background: rgba(255,255,255,0.1);
    color: white;
    overflow: hidden;
  }
  .kwami-wallet-option-icon img {
    width: 20px;
    height: 20px;
    display: block;
  }

  .kwami-wallet-option-meta {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    min-width: 0;
  }

  .kwami-wallet-option-name {
    font-size: 0.9rem;
    font-weight: 500;
  }
  .kwami-wallet-option-subtitle {
    font-size: 0.75rem;
    opacity: 0.7;
  }

  .kwami-wallet-option-pill {
    font-size: 0.75rem;
    padding: 2px 8px;
    border-radius: 10px;
    background: rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.8);
  }
  .kwami-wallet-option-pill--primary {
    background: rgba(99, 102, 241, 0.2);
    color: #818cf8;
  }

  .kwami-info-container {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 0.5rem 0;
  }

  .kwami-row-actions {
    display: flex;
    gap: 0.5rem;
  }

  .kwami-network-chooser {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .kwami-address-copy-msg {
    font-size: 0.78rem;
    padding: 0.2rem 0.45rem;
    text-align: center;
    white-space: nowrap;
  }

  .kwami-nft-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
    max-height: 400px;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 4px;
  }
  
  .kwami-nft-card {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    padding: 0.6rem;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    border: 1px solid transparent;
  }
  .kwami-nft-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.15);
  }
  .kwami-nft-card[data-selected="true"] {
    border: 2px solid rgba(99, 102, 241, 0.8);
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
    transform: scale(1.05);
  }

  .kwami-nft-image-container {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 8px;
    overflow: hidden;
    background: rgba(148,163,184,0.1);
    position: relative;
  }
  .kwami-nft-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  .kwami-nft-card:hover .kwami-nft-image {
    transform: scale(1.1);
  }
  .kwami-nft-card[data-selected="true"] .kwami-nft-image {
    transform: scale(1);
  }

  .kwami-nft-name {
    font-size: 0.8rem;
    font-weight: 600;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .kwami-nft-card[data-selected="true"] .kwami-nft-name {
    color: rgba(99, 102, 241, 1);
  }

  .kwami-nft-checkmark {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: rgba(99, 102, 241, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 14px;
    font-weight: bold;
    animation: kwami-nft-checkmark 0.3s ease;
  }

  .kwami-skeleton-card {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    padding: 0.6rem;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  @keyframes kwami-skeleton-shimmer {
    0% { opacity: 0.5; }
    50% { opacity: 0.8; }
    100% { opacity: 0.5; }
  }
  .kwami-skeleton-pulse {
    animation: kwami-skeleton-shimmer 1.5s ease-in-out infinite;
  }
  
  @keyframes kwami-nft-checkmark {
    0% { transform: scale(0); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }
  .kwami-wallet-list-section-title {
    font-size: 0.85rem;
    padding: 0 0.5rem;
    margin-bottom: 0.2rem;
    opacity: 0.6;
    font-weight: 500;
  }
  .kwami-avatar-mode {
    padding: 0 !important;
    width: 48px !important;
    height: 48px !important;
    min-width: 48px !important;
    border-radius: 50% !important;
    overflow: hidden !important;
  }
  
  .kwami-avatar-mode > span {
    display: none !important;
  }
  
  .kwami-avatar-mode > img.kwami-avatar-img {
    display: block !important;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;
