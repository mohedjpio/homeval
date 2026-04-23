'use client'
export const dynamic = 'force-dynamic'
import { useState, useRef, useEffect } from 'react'
import { sendChat, getChatSessions } from '@/lib/api'
import { cn } from '@/lib/utils'

interface Message { role: 'user' | 'assistant'; content: string }

export default function ChatPage() {
  const [messages, setMessages]     = useState<Message[]>([])
  const [input, setInput]           = useState('')
  const [sessionId, setSessionId]   = useState<string | undefined>()
  const [loading, setLoading]       = useState(false)
  const [sessions, setSessions]     = useState<any[]>([])
  const bottomRef                   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getChatSessions().then(setSessions).catch(() => {})
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send() {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(m => [...m, { role: 'user', content: userMsg }])
    setLoading(true)
    try {
      const res = await sendChat(userMsg, sessionId)
      setSessionId(res.session_id)
      setMessages(m => [...m, { role: 'assistant', content: res.reply }])
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Sorry, I encountered an error. Please check your Groq API key in Settings.' }])
    } finally {
      setLoading(false)
    }
  }

  function newChat() {
    setMessages([]); setSessionId(undefined); setInput('')
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-up h-[calc(100vh-6rem)] flex gap-5">
      {/* Session sidebar */}
      <div className="w-48 flex-shrink-0 hidden lg:flex flex-col gap-2">
        <button
          onClick={newChat}
          className="w-full py-2.5 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-colors"
        >
          + New chat
        </button>
        <div className="flex-1 overflow-y-auto space-y-1">
          {sessions.map((s: any) => (
            <button
              key={s.id}
              onClick={() => { setSessionId(s.id); setMessages([]) }}
              className={cn(
                'w-full text-left text-xs px-3 py-2 rounded-lg truncate transition-colors',
                sessionId === s.id ? 'bg-brand-50 text-brand-700' : 'text-sand-600 hover:bg-sand-100'
              )}
            >
              {s.title || 'Chat session'}
            </button>
          ))}
        </div>
      </div>

      {/* Chat window */}
      <div className="flex-1 bg-white rounded-2xl border border-sand-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-sand-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">◇</div>
          <div>
            <p className="font-medium text-sm text-sand-900">HomeVal AI Assistant</p>
            <p className="text-xs text-sand-400">Powered by Groq · llama-3.3-70b</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center text-3xl mb-5">◇</div>
              <p className="font-display text-xl text-brand-800 mb-2">Ask me anything</p>
              <p className="text-sand-500 text-sm max-w-xs">About Egyptian real estate prices, areas, investment opportunities, or market trends.</p>
              <div className="mt-6 grid grid-cols-1 gap-2 w-full max-w-xs">
                {[
                  'What are the most expensive areas in Cairo?',
                  'What is the avg price per m² in New Cairo?',
                  'Is Sheikh Zayed a good investment?',
                ].map(q => (
                  <button
                    key={q}
                    onClick={() => { setInput(q); }}
                    className="text-xs text-left text-sand-600 bg-sand-50 hover:bg-sand-100 px-3 py-2.5 rounded-lg transition-colors border border-sand-200"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs mr-2 mt-1 flex-shrink-0">H</div>
              )}
              <div className={cn(
                'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                m.role === 'user'
                  ? 'bg-brand-500 text-white rounded-tr-md'
                  : 'bg-sand-50 text-sand-900 rounded-tl-md border border-sand-200'
              )}>
                {m.content.split('\n').map((line, j) => (
                  <span key={j}>{line}{j < m.content.split('\n').length - 1 && <br/>}</span>
                ))}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs mr-2 mt-1 flex-shrink-0">H</div>
              <div className="bg-sand-50 border border-sand-200 rounded-2xl rounded-tl-md px-4 py-3">
                <div className="flex gap-1 items-center h-4">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 bg-sand-400 rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-4 border-t border-sand-100">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Ask about Egyptian real estate…"
              className="flex-1"
              disabled={loading}
            />
            <button
              onClick={send} disabled={loading || !input.trim()}
              className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 flex-shrink-0"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
