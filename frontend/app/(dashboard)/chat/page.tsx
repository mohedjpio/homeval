'use client'
export const dynamic = 'force-dynamic'
import { useState, useRef, useEffect } from 'react'
import { sendChat, getChatSessions } from '@/lib/api'
import { cn } from '@/lib/utils'

interface Message { role: 'user'|'assistant'; content: string }

const SUGGESTIONS = [
  'What are the most expensive areas in Cairo?',
  'Average price per m² in New Cairo?',
  'Is Sheikh Zayed a good investment?',
  'Rental yield estimate for Maadi?',
]

export default function ChatPage() {
  const [messages,   setMessages]   = useState<Message[]>([])
  const [input,      setInput]      = useState('')
  const [sessionId,  setSessionId]  = useState<string|undefined>()
  const [loading,    setLoading]    = useState(false)
  const [sessions,   setSessions]   = useState<any[]>([])
  const [sidebarOpen,setSidebar]    = useState(false)
  const bottomRef  = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getChatSessions().then(setSessions).catch(()=>{})
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [messages])

  async function send() {
    if (!input.trim() || loading) return
    const userMsg = input.trim(); setInput('')
    setMessages(m => [...m, { role:'user', content:userMsg }])
    setLoading(true)
    try {
      const res = await sendChat(userMsg, sessionId)
      setSessionId(res.session_id)
      setMessages(m => [...m, { role:'assistant', content:res.reply }])
      if (!sessions.find((s:any)=>s.id===res.session_id)) {
        getChatSessions().then(setSessions).catch(()=>{})
      }
    } catch {
      setMessages(m => [...m, { role:'assistant', content:'Sorry, I encountered an error. Please check your Groq API key in Settings.' }])
    } finally { setLoading(false) }
  }

  function newChat() { setMessages([]); setSessionId(undefined); setInput(''); setSidebar(false) }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    // Full height minus top-bar on mobile, full on desktop
    <div className="w-full max-w-4xl mx-auto animate-fade-up flex flex-col" style={{height:'calc(100dvh - 3.5rem - 2rem)'}}>

      <div className="flex gap-4 h-full min-h-0">

        {/* ── Session sidebar — hidden on mobile unless toggled ── */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden" onClick={()=>setSidebar(false)}>
            <div className="absolute inset-0 bg-black/30"/>
            <div className="absolute left-0 top-14 bottom-0 w-56 bg-white border-r border-sand-200 flex flex-col z-50" onClick={e=>e.stopPropagation()}>
              <div className="p-3 border-b border-sand-100">
                <button onClick={newChat}
                  className="w-full py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-colors">
                  + New chat
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {(sessions||[]).map((s:any)=>(
                  <button key={s.id} onClick={()=>{ setSessionId(s.id); setMessages([]); setSidebar(false) }}
                    className={cn('w-full text-left text-xs px-3 py-2 rounded-lg truncate transition-colors min-h-[36px]',
                      sessionId===s.id?'bg-brand-50 text-brand-700':'text-sand-600 hover:bg-sand-100')}>
                    {s.title||'Chat session'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Desktop sidebar ── */}
        <div className="hidden lg:flex flex-col gap-2 w-44 flex-shrink-0">
          <button onClick={newChat}
            className="w-full py-2.5 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-colors">
            + New chat
          </button>
          <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
            {(sessions||[]).map((s:any)=>(
              <button key={s.id} onClick={()=>{ setSessionId(s.id); setMessages([]) }}
                className={cn('w-full text-left text-xs px-3 py-2 rounded-lg truncate transition-colors min-h-[36px]',
                  sessionId===s.id?'bg-brand-50 text-brand-700':'text-sand-600 hover:bg-sand-100')}>
                {s.title||'Chat session'}
              </button>
            ))}
          </div>
        </div>

        {/* ── Chat window ── */}
        <div className="flex-1 bg-white rounded-2xl border border-sand-200 flex flex-col min-h-0 overflow-hidden">

          {/* Header */}
          <div className="px-4 py-3 sm:py-4 border-b border-sand-100 flex items-center gap-3 flex-shrink-0">
            {/* Mobile: sessions toggle */}
            <button onClick={()=>setSidebar(v=>!v)}
              className="lg:hidden w-8 h-8 rounded-lg border border-sand-200 flex items-center justify-center text-sand-500 hover:bg-sand-50 flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M2 3h12M2 8h12M2 13h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 flex-shrink-0">◇</div>
            <div className="min-w-0">
              <p className="font-medium text-sm text-sand-900 truncate">HomeVal AI Assistant</p>
              <p className="text-xs text-sand-400 hidden sm:block">Powered by Groq · llama-3.3-70b</p>
            </div>
            <button onClick={newChat} className="ml-auto text-xs text-sand-400 hover:text-sand-600 px-2 py-1 rounded-lg hover:bg-sand-50 flex-shrink-0">
              New
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 sm:py-5 space-y-3 sm:space-y-4 min-h-0">
            {messages.length===0 && (
              <div className="flex flex-col items-center justify-center h-full text-center py-8 sm:py-12 px-4">
                <div className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center text-3xl mb-4">◇</div>
                <p className="font-display text-lg sm:text-xl text-brand-800 mb-2">Ask me anything</p>
                <p className="text-sand-500 text-sm max-w-xs mb-6">About Egyptian real estate prices, areas, investment opportunities, or market trends.</p>
                <div className="w-full max-w-xs space-y-2">
                  {SUGGESTIONS.map(q=>(
                    <button key={q} onClick={()=>{ setInput(q); inputRef.current?.focus() }}
                      className="w-full text-xs text-left text-sand-600 bg-sand-50 hover:bg-sand-100 active:bg-sand-200 px-3 py-2.5 rounded-lg transition-colors border border-sand-200 min-h-[44px] leading-snug">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(messages||[]).map((m,i)=>(
              <div key={i} className={cn('flex gap-2', m.role==='user'?'justify-end':'justify-start')}>
                {m.role==='assistant' && (
                  <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs flex-shrink-0 mt-1">H</div>
                )}
                <div className={cn(
                  'max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm leading-relaxed',
                  m.role==='user'
                    ? 'bg-brand-500 text-white rounded-tr-md'
                    : 'bg-sand-50 text-sand-900 rounded-tl-md border border-sand-200'
                )}>
                  {m.content.split('\n').map((line,j,arr)=>(
                    <span key={j}>{line}{j<arr.length-1&&<br/>}</span>
                  ))}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start gap-2">
                <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs flex-shrink-0 mt-1">H</div>
                <div className="bg-sand-50 border border-sand-200 rounded-2xl rounded-tl-md px-4 py-3">
                  <div className="flex gap-1 items-center h-4">
                    {[0,1,2].map(i=>(
                      <div key={i} className="w-1.5 h-1.5 bg-sand-400 rounded-full animate-bounce" style={{animationDelay:`${i*0.15}s`}}/>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Input */}
          <div className="px-3 sm:px-4 py-3 sm:py-4 border-t border-sand-100 flex-shrink-0 safe-bottom">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={e=>setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about Egyptian real estate…"
                disabled={loading}
                className="flex-1 min-w-0 text-sm"
                style={{fontSize:'16px'}} // prevent iOS zoom
              />
              <button onClick={send} disabled={loading||!input.trim()}
                className="px-3 sm:px-4 py-2 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 flex-shrink-0 min-w-[60px]">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
