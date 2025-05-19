import React, { useState } from 'react'
import './ContextSelector.scss'

const presetSuggestions = [
  'I am a financial advisor bot that can help you understand and use our SaaS platform for managing investments, budgeting, and financial planning.',
  'I am a customer support assistant ready to help resolve your issues, answer questions about our products/services, and ensure you have the best possible experience.',
  'I am your personal onboarding guide, here to walk you through getting started with our platform, explain key features, and help you achieve your goals.'
]

interface ContextSelectorProps {
  onSelectContext: (ctx: string) => void
}

export const ContextSelector: React.FC<ContextSelectorProps> = ({ onSelectContext }) => {
  const [customContext, setCustomContext] = useState('')
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div className="context-selector-container">
      <h2 className="context-title">Choose a Chatbot Context</h2>
      <p className="context-subtitle">Select one of the suggestions or write your own to personalize your chatbot experience.</p>
      <div className="suggestions-list">
        {presetSuggestions.map((suggestion, idx) => (
          <button
            key={idx}
            className={`suggestion-btn${selected === suggestion ? ' selected' : ''}`}
            onClick={() => {
              setSelected(suggestion)
              setCustomContext('')
              onSelectContext(suggestion)
            }}
          >
            {suggestion}
          </button>
        ))}
      </div>
      <div className="custom-context-section">
        <input
          className="custom-context-input"
          type="text"
          placeholder="Or type your own context..."
          value={customContext}
          onChange={e => {
            setCustomContext(e.target.value)
            setSelected(null)
          }}
        />
        <button
          className="custom-context-btn"
          disabled={!customContext.trim()}
          onClick={() => onSelectContext(customContext.trim())}
        >
          Use this context
        </button>
      </div>
    </div>
  )
} 