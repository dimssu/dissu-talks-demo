import React from 'react';
import './FloatingChangeContextButton.scss';

interface FloatingChangeContextButtonProps {
  onClick: () => void;
}

export const FloatingChangeContextButton: React.FC<FloatingChangeContextButtonProps> = ({ onClick }) => (
  <button
    className="floating-change-context-btn"
    onClick={onClick}
    title="Change Chatbot Context"
    aria-label="Change Chatbot Context"
    type="button"
  >
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8e24aa" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
  </button>
); 