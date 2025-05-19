import './App.css'
import { useState, useEffect } from 'react'
import { ChatBot } from 'dissu-talks/src/components/ChatBot'
import { ContextSelector } from './ContextSelector'
import { FloatingChangeContextButton } from './components/FloatingChangeContextButton'
import { LottieChatbotArrow } from './components/LottieChatbotArrow'

function App() {
  const [context, setContext] = useState('')
  const [hasClickedChatbot, setHasClickedChatbot] = useState(false)
  const [dummySiteHtml, setDummySiteHtml] = useState<string | null>(null)
  const [loadingDummySite, setLoadingDummySite] = useState(false)
  const [dummySiteError, setDummySiteError] = useState<string | null>(null)

  useEffect(() => {
    const seen = sessionStorage.getItem('hasClickedChatbot')
    if (seen === 'true') {
      setHasClickedChatbot(true)
    }
  }, [])

  const handleSelectContext = async (ctx: string) => {
    setContext(ctx)
    setHasClickedChatbot(true)
    sessionStorage.setItem('hasClickedChatbot', 'true')
    setLoadingDummySite(true)
    setDummySiteError(null)
    setDummySiteHtml(null)
    try {
      // Call Gemini LLM to generate dummy HTML
      const prompt = `Generate a simple, visually appealing HTML homepage for a website whose purpose is: "${ctx}". Only return the HTML code, no markdown or explanation. Use inline CSS for basic styling.`
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
              maxOutputTokens: 1200
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
    } catch (err: any) {
      setDummySiteError('Failed to generate dummy website. Please try again.')
    } finally {
      setLoadingDummySite(false)
    }
  }

  const handleChangeContext = () => {
    setContext('')
    setDummySiteHtml(null)
    setDummySiteError(null)
    setLoadingDummySite(false)
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
            context={context === '' ? 'This is a chatbot for application which is a guide for a user to use the chat bot application, ask the user for context about their chat bot.' : context}
            responseType="formal"
            position="bottom-right"
            welcomeMessage="Welcome! Ask me anything."
            styling={{ widgetColor: "#8e24aa", textColor: "#ffffff" }}
            theme="light"
            placeholderText="Ask your question..."
          />
        </div>
      )}
    </>
  )
}

export default App
