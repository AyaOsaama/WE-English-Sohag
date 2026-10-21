import { useEffect, useRef, useState } from 'react';
import { aiApi } from '../../services/aiApi.js';
import { useRewards } from '../../hooks/useRewards.js';
import { useToast } from '../../context/ToastContext.jsx';
import { PageHeader } from '../../components/States.jsx';
import Markdown from '../../utils/Markdown.jsx';
import { readAloud } from '../../utils/speech.js';
import { timeAgo } from '../../utils/format.js';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const MODES = [
  { id: 'conversation', icon: '💬', label: 'Practice conversation', starter: "Let's practice a conversation about my future job in telecom." },
  { id: 'grammar', icon: '✍️', label: 'Grammar correction', starter: 'Please correct my grammar: "Yesterday I go to the lab and fix the router."' },
  { id: 'arabic', icon: '🇪🇬', label: 'Explain in Arabic', starter: 'Explain the word "bandwidth" in simple English and in Arabic.' },
  { id: 'interview', icon: '🎤', label: 'Practice interview', starter: 'Start a mock interview for a junior network technician job.' },
  { id: 'technical', icon: '🛠️', label: 'Technical English', starter: 'Teach me 5 useful English words about fiber optics.' },
  { id: 'quiz', icon: '❓', label: 'Quiz', starter: 'Give me a short quiz about networking vocabulary.' },
];

export default function AITutor() {
  const rewards = useRewards();
  const { toast } = useToast();
  const [level, setLevel] = useState('Intermediate');
  const [mode, setMode] = useState('conversation');
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState('');
  const endRef = useRef(null);

  const loadHistory = () => aiApi.conversations().then((d) => setHistory(d.conversations)).catch(() => {});
  useEffect(() => { loadHistory(); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, sending]);

  const send = async (content, chosenMode = mode) => {
    const message = content.trim();
    if (!message || sending) return;
    setText('');
    setNotice('');
    setMessages((m) => [...m, { _id: `tmp-${Date.now()}`, sender: 'user', content: message }]);
    setSending(true);
    try {
      const res = await aiApi.chat({ conversationId, message, mode: chosenMode, level });
      setConversationId(res.conversation._id);
      setMessages((m) => [...m.filter((x) => !String(x._id).startsWith('tmp-')), res.userMessage, res.aiMessage]);
      if (res.provider === 'dev-fallback') setNotice('Development fallback reply: set AI_API_KEY on the server for the real AI Tutor.');
      rewards(res);
      loadHistory();
    } catch (err) {
      setMessages((m) => m.filter((x) => !String(x._id).startsWith('tmp-')));
      setText(message);
      toast(err.message, 'error');
    } finally {
      setSending(false);
    }
  };

  const pickMode = (m) => { setMode(m.id); setConversationId(null); setMessages([]); send(m.starter, m.id); };
  const newChat = () => { setConversationId(null); setMessages([]); setNotice(''); };
  const open = async (id) => {
    try {
      const d = await aiApi.conversation(id);
      setConversationId(d.conversation._id); setMode(d.conversation.mode); setLevel(d.conversation.level); setMessages(d.messages);
    } catch (err) { toast(err.message, 'error'); }
  };
  const remove = async (id) => {
    try { await aiApi.remove(id); if (id === conversationId) newChat(); loadHistory(); } catch (err) { toast(err.message, 'error'); }
  };

  return (
    <div className="space-y-6">
      <PageHeader badge="AI" title="AI English Tutor" subtitle="Conversation practice with instant corrections. Your conversations are saved.">
        <div role="group" aria-label="Level" className="flex bg-slate-100 rounded-xl p-1">
          {LEVELS.map((l) => <button key={l} onClick={() => setLevel(l)} aria-pressed={level === l} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${level === l ? 'bg-we-600 text-white' : 'text-slate-600'}`}>{l}</button>)}
        </div>
      </PageHeader>

      <div className="grid lg:grid-cols-4 gap-6">
        <aside className="space-y-3 lg:order-2">
          <button onClick={newChat} className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-we-700 hover:border-we-400">+ New conversation</button>
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3 max-h-80 overflow-y-auto">
            <div className="text-[11px] font-bold uppercase text-slate-400 mb-2">History</div>
            {history.length === 0 ? <p className="text-xs text-slate-400">No conversations yet.</p> : history.map((c) => (
              <div key={c._id} className={`flex items-center justify-between gap-2 px-2 py-2 rounded-lg ${c._id === conversationId ? 'bg-we-50' : 'hover:bg-slate-50'}`}>
                <button onClick={() => open(c._id)} className="text-left min-w-0"><div className="text-xs font-semibold text-slate-700 truncate">{c.title}</div><div className="text-[10px] text-slate-400">{timeAgo(c.updatedAt)}</div></button>
                <button onClick={() => remove(c._id)} className="text-slate-300 hover:text-rose-500 text-xs" aria-label="Delete conversation">✕</button>
              </div>
            ))}
          </div>
        </aside>

        <section className="lg:col-span-3 lg:order-1 bg-white rounded-3xl border border-slate-200/80 shadow-we-card flex flex-col min-h-[520px]">
          <div className="flex flex-wrap gap-2 p-4 border-b border-slate-100">
            {MODES.map((m) => <button key={m.id} onClick={() => pickMode(m)} disabled={sending} className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all disabled:opacity-50 ${mode === m.id ? 'bg-we-50 border-we-400 text-we-700' : 'bg-white border-slate-200 text-slate-600 hover:border-we-300'}`}><span aria-hidden="true">{m.icon}</span> {m.label}</button>)}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[60vh]" aria-live="polite">
            {messages.length === 0 && !sending && <div className="text-center text-sm text-slate-400 py-16">Pick a mode above or type a message to start.</div>}
            {messages.map((m) => (
              <div key={m._id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${m.sender === 'user' ? 'bg-we-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                  {m.sender === 'ai' ? <><Markdown text={m.content} /><button onClick={() => readAloud(m.content)} className="mt-2 text-[11px] font-bold text-we-600 hover:underline">🔊 Listen</button></> : <p dir="auto" className="whitespace-pre-wrap">{m.content}</p>}
                </div>
              </div>
            ))}
            {sending && <div className="flex justify-start"><div className="bg-slate-100 rounded-2xl px-4 py-3 text-xs text-slate-500">Tutor is typing…</div></div>}
            <div ref={endRef} />
          </div>

          {notice && <p className="mx-4 mb-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">{notice}</p>}
          <form onSubmit={(e) => { e.preventDefault(); send(text); }} className="p-4 border-t border-slate-100 flex gap-2">
            <label htmlFor="ai-input" className="sr-only">Message</label>
            <input id="ai-input" value={text} onChange={(e) => setText(e.target.value)} maxLength={2000} dir="auto" placeholder="Type your message in English or Arabic…" className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-we-600 focus:ring-2 focus:ring-we-100 outline-none text-sm" />
            <button type="submit" disabled={sending || !text.trim()} className="px-5 rounded-xl bg-we-600 hover:bg-we-700 disabled:opacity-50 text-white text-sm font-bold">Send</button>
          </form>
        </section>
      </div>
    </div>
  );
}
