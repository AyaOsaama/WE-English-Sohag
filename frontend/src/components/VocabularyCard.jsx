import { hasArabic } from '../utils/format.js';

// Two-sided flip card (front: word, back: meaning). Visual design carried over from the prototype.
export default function VocabularyCard({ word, flipped, onFlip, onSpeak }) {
  return (
    <div className="perspective-1000 w-full max-w-2xl mx-auto py-4">
      <div
        role="button"
        tabIndex={0}
        aria-label={flipped ? 'Flip card back to the word' : 'Reveal the meaning'}
        onClick={onFlip}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onFlip())}
        className={`relative w-full min-h-[380px] rounded-3xl transition-transform duration-500 transform-style-3d cursor-pointer shadow-xl ${flipped ? 'rotate-y-180' : ''}`}
      >
        <div className="absolute inset-0 w-full h-full bg-white rounded-3xl p-8 border-2 border-purple-100 flex flex-col justify-between backface-hidden">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-purple-50 text-we-600">{word.category}</span>
            <span className="text-xs text-slate-400">Click card to reveal meaning ↻</span>
          </div>
          <div className="text-center my-auto py-6">
            <h2 className="text-4xl sm:text-5xl font-black text-we-900 tracking-tight uppercase break-words">{word.word}</h2>
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="text-slate-400 font-mono text-sm">{word.phonetic}</span>
              <button type="button" onClick={(e) => { e.stopPropagation(); onSpeak(); }} className="w-8 h-8 rounded-full bg-purple-50 text-we-600 hover:bg-we-600 hover:text-white transition-colors flex items-center justify-center" aria-label="Listen to pronunciation">🔊</button>
            </div>
          </div>
          <div className="text-center text-xs text-slate-400 border-t border-slate-100 pt-4">WE Applied Technology School • Sohag Core Tech Deck</div>
        </div>

        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-we-900 to-we-700 text-white rounded-3xl p-8 flex flex-col justify-between backface-hidden rotate-y-180">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-purple-200 font-bold">Definition & Context</span>
            <span className="text-xs text-purple-300 font-cairo">الترجمة العربية</span>
          </div>
          <div className="my-auto space-y-4">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-purple-200 font-bold">English:</div>
              <p className="text-sm sm:text-base font-medium leading-relaxed mt-0.5">{word.definition}</p>
            </div>
            {word.arabicMeaning && (
              <div className="bg-white/10 p-3.5 rounded-2xl border border-white/15">
                <div className="text-[11px] uppercase tracking-wider text-purple-200 font-bold font-cairo">المعنى بالعربية:</div>
                <p dir={hasArabic(word.arabicMeaning) ? 'rtl' : 'ltr'} className="text-xl font-bold font-cairo text-amber-300 mt-0.5">{word.arabicMeaning}</p>
              </div>
            )}
            {word.example && (
              <div>
                <div className="text-[11px] uppercase tracking-wider text-purple-200 font-bold">Example in Lab:</div>
                <p className="text-xs sm:text-sm italic text-purple-100 mt-0.5 font-light">“{word.example}”</p>
              </div>
            )}
          </div>
          <div className="text-center text-xs text-purple-300 border-t border-white/10 pt-3">Tap anywhere to flip back</div>
        </div>
      </div>
    </div>
  );
}
