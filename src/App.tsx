import './App.css'
import { useState, useEffect } from 'react'
import { ContextSelector } from './ContextSelector'
import { FloatingChangeContextButton } from './components/FloatingChangeContextButton'
import { LottieChatbotArrow } from './components/LottieChatbotArrow'
import { extractAccentColor, getContrastTextColor } from './utils/color'
import ChatBot from 'cha-ai'

function App() {
  const [context, setContext] = useState('')
  const [hasClickedChatbot, setHasClickedChatbot] = useState(false)
  const [dummySiteHtml, setDummySiteHtml] = useState<string | null>(null)
  const [loadingDummySite, setLoadingDummySite] = useState(false)
  const [dummySiteError, setDummySiteError] = useState<string | null>(null)
  const [chatbotColor, setChatbotColor] = useState<string>('#8e24aa')
  const [chatbotTextColor, setChatbotTextColor] = useState<string>('#fff')

  useEffect(() => {
    const seen = sessionStorage.getItem('hasClickedChatbot')
    if (seen === 'true') {
      setHasClickedChatbot(true)
    }
  }, [])

  // Helper to build the full context for the bot
  function buildBotContext(userContext: string) {
    if (!userContext) return ''
    return `You are an expert AI assistant for a website with the following purpose: "${userContext}". Always answer as if you are the assistant for this website, using its features and purpose to help the user.\n` + userContext
  }

  const handleSelectContext = async (ctx: string) => {
    setContext(ctx)
    setHasClickedChatbot(true)
    sessionStorage.setItem('hasClickedChatbot', 'true')
    setLoadingDummySite(true)
    setDummySiteError(null)
    setDummySiteHtml(null)
    try {
      // Call Gemini LLM to generate dummy HTML
      const prompt = `Generate a modern, beautiful, and responsive HTML landing page for a website whose purpose is: "${ctx}". The page should include a hero section with a catchy headline and subheadline, a visually appealing background, a features section with at least three features (with icons or emojis), and a clear call-to-action button. Use attractive, modern inline CSS (including gradients, rounded corners, and good font choices). Only return the HTML code, no markdown or explanation. Do not use external CSS or JS.`
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              { role: 'user', parts: [{ text: prompt }] }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1800
            }
          })
        }
      )
      if (!response.ok) throw new Error('Failed to generate dummy site')
      const data = await response.json()
      // Try to extract HTML from the response
      let html = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      // Remove markdown code block if present
      html = html.replace(/^```html|```$/gm, '').trim()
      setDummySiteHtml(html)
      // Extract color for chatbot
      const color = extractAccentColor(html) || '#8e24aa'
      setChatbotColor(color)
      setChatbotTextColor(getContrastTextColor(color))
    } catch (err: any) {
      setDummySiteError('Failed to generate dummy website. Please try again.')
      setChatbotColor('#8e24aa')
      setChatbotTextColor('#fff')
    } finally {
      setLoadingDummySite(false)
    }
  }

  const handleChangeContext = () => {
    setContext('')
    setDummySiteHtml(null)
    setDummySiteError(null)
    setLoadingDummySite(false)
    setChatbotColor('#8e24aa')
    setChatbotTextColor('#fff')
  }

  const showContextSelector = context === ''
  const showLottieArrow = showContextSelector && !hasClickedChatbot
  const showDummySite = !!dummySiteHtml && !showContextSelector

  return (
    <>
      {showContextSelector && (
        <>
          <ContextSelector onSelectContext={handleSelectContext} />
          {showLottieArrow && <LottieChatbotArrow />}
        </>
      )}
      {loadingDummySite && (
        <div style={{
          position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh',
          background: 'rgba(20, 10, 30, 0.85)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#fff',
        }}>
          <div style={{ fontSize: 28, marginBottom: 16 }}>Getting your page ready...</div>
          <div className="spinner" style={{ width: 60, height: 60, border: '6px solid #eee', borderTop: '6px solid #8e24aa', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
        </div>
      )}
      {dummySiteError && (
        <div style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>{dummySiteError}</div>
      )}
      {showDummySite && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, width: '100vw', height: '100vh', overflow: 'hidden' }}>
          <iframe
            title="Dummy Website"
            srcDoc={dummySiteHtml || ''}
            style={{ width: '100vw', height: '100vh', border: 'none', position: 'absolute', inset: 0, zIndex: 100 }}
            sandbox="allow-scripts allow-same-origin"
          />
          <FloatingChangeContextButton onClick={handleChangeContext} />
          {/* Using chatbot from cha-ai */}
          <ChatBot
            directLlmConfig={{
              apiEndpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
              apiKey: import.meta.env.VITE_GEMINI_API_KEY, 
              headers: {
                "Content-Type": "application/json"
              },
              formatMessages: (messages, newMessage, context) => ({
                contents: [
                  ...(context ? [{ role: "user", parts: [{ text: context }] }] : []),
                  ...messages.map(msg => ({
                    role: msg.sender === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.content }]
                  })),
                  { role: 'user', parts: [{ text: newMessage }] }
                ],
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 1000
                }
              }),
              parseResponse: (data) => data.candidates[0].content.parts[0].text
            }}
            context={context === '' ? 'This is a chatbot for application which is a guide for a user to use the chat bot application, ask the user for context about their chat bot.' : buildBotContext(context)}
            responseType="formal"
            position="bottom-right"
            welcomeMessage="Welcome! Ask me anything."
            styling={{ widgetColor: chatbotColor, textColor: chatbotTextColor }}
            theme="light"
            placeholderText="Ask your question..."
          />
        </div>
      )}
    </>
  )
}

export default App
