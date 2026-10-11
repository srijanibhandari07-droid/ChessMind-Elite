import React from 'react';
import { ScreenId } from '../../types/chess';
import { Mic, Volume2 } from 'lucide-react';

interface NavbarProps {
  activeScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  isVoiceActive?: boolean;
  onOpenVoice: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeScreen,
  onNavigate,
  isVoiceActive = false,
  onOpenVoice,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#0d0f13]/90 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-3.5">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => onNavigate('home')}
          className="text-lg font-serif font-semibold tracking-tight text-zinc-100 hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2.5"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span>ChessMind Elite</span>
        </button>

        {/* Zone 2: 4–5 single-line clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-400">
          <button
            onClick={() => onNavigate('play')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeScreen === 'play'
                ? 'text-zinc-100 font-semibold border-b-2 border-emerald-500'
                : 'hover:text-zinc-200'
            }`}
          >
            Live Studio
          </button>
          <button
            onClick={() => onNavigate('academy')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeScreen === 'academy'
                ? 'text-zinc-100 font-semibold border-b-2 border-emerald-500'
                : 'hover:text-zinc-200'
            }`}
          >
            Academy
          </button>
          <button
            onClick={() => onNavigate('openings')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeScreen === 'openings'
                ? 'text-zinc-100 font-semibold border-b-2 border-emerald-500'
                : 'hover:text-zinc-200'
            }`}
          >
            Openings
          </button>
          <button
            onClick={() => onNavigate('thinking')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeScreen === 'thinking'
                ? 'text-zinc-100 font-semibold border-b-2 border-emerald-500'
                : 'hover:text-zinc-200'
            }`}
          >
            Thinking Lab
          </button>
          <button
            onClick={() => onNavigate('review')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeScreen === 'review'
                ? 'text-zinc-100 font-semibold border-b-2 border-emerald-500'
                : 'hover:text-zinc-200'
            }`}
          >
            Progress
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenVoice}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
              isVoiceActive
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white border border-zinc-700'
            }`}
          >
            {isVoiceActive ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Voice Active</span>
              </>
            ) : (
              <>
                <Mic className="w-3.5 h-3.5 text-zinc-400" />
                <span>Voice Mentor</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
