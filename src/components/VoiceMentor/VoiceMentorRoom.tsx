import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { MentorId, CoachingIntensity, EngineEvaluationResult } from '../../types/chess';
import { GRANDMASTER_PROFILES } from '../../data/grandmasters';
import { voiceController, soundManager } from '../../lib/audio';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Settings,
  HelpCircle,
  Radio,
  X,
  Play,
  Square as StopSquare,
} from 'lucide-react';

interface VoiceMentorRoomProps {
  chess: Chess;
  engineEvaluation: EngineEvaluationResult | null;
  moveHistory: string[];
  activeMentor: MentorId;
  onSelectMentor: (mentor: MentorId) => void;
  intensity: CoachingIntensity;
  onChangeIntensity: (intensity: CoachingIntensity) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceMentorRoom: React.FC<VoiceMentorRoomProps> = ({
  chess,
  engineEvaluation,
  moveHistory,
  activeMentor,
  onSelectMentor,
  intensity,
  onChangeIntensity,
  isOpen,
  onClose,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [captions, setCaptions] = useState<string>(
    'Welcome to ChessMind Elite voice mentoring. Speak or tap any inquiry below.'
  );
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isLoading, setIsLoading] = useState(false);
  const [handsFree, setHandsFree] = useState(false);
  const [micPermissionState, setMicPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');

  const recognitionRef = useRef<any>(null);
  const currentMentor = GRANDMASTER_PROFILES[activeMentor] || GRANDMASTER_PROFILES.magnus;

  // Track speech state
  useEffect(() => {
    voiceController.setOnStateChange((speaking) => {
      setIsSpeaking(speaking);
    });
    return () => {
      voiceController.stop();
    };
  }, []);

  // Initialize SpeechRecognition if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          setMicPermissionState('granted');
        };

        recognition.onresult = (event: any) => {
          let currentText = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentText += event.results[i][0].transcript;
          }
          setTranscript(currentText);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsListening(false);
          if (event.error === 'not-allowed') {
            setMicPermissionState('denied');
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          if (transcript.trim()) {
            handleSendQuestion(transcript);
          }
        };

        recognitionRef.current = recognition;
      }
    }
  }, [transcript, chess.fen(), activeMentor, intensity]);

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      voiceController.stop();
      setTranscript('');
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          console.warn('Could not start recognition:', e);
        }
      } else {
        // Fallback prompt
        const promptInput = window.prompt('Speech recognition not available. Type your question to the coach:');
        if (promptInput) {
          handleSendQuestion(promptInput);
        }
      }
    }
  };

  const handleSendQuestion = async (questionText: string) => {
    if (!questionText.trim()) return;
    setIsLoading(true);
    setTranscript('');
    voiceController.stop();

    try {
      const res = await fetch('/api/coaching/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fen: chess.fen(),
          turn: chess.turn(),
          moveHistory,
          engineEvaluation,
          mentor: activeMentor,
          intensity,
          question: questionText,
        }),
      });

      const data = await res.json();
      const reply = data.text || 'Evaluate piece harmony and defend any vulnerable files.';
      setCaptions(reply);

      // Play synthesized audio
      await voiceController.speak(reply, playbackSpeed, currentMentor.voiceName);
    } catch (e) {
      console.error('Coaching query error:', e);
      const fallback = `Take a breath. Review your king safety and your opponent's most active piece.`;
      setCaptions(fallback);
      await voiceController.speak(fallback, playbackSpeed, currentMentor.voiceName);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInterrupt = () => {
    voiceController.stop();
    setIsSpeaking(false);
  };

  const handleRepeat = () => {
    if (captions) {
      voiceController.speak(captions, playbackSpeed, currentMentor.voiceName);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[#13161c] border-l border-zinc-800 z-50 flex flex-col shadow-2xl">
      {/* Drawer Header */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              Voice Mentor Room
              <span className="text-[10px] font-sans font-normal text-zinc-400 px-1.5 py-0.5 rounded bg-zinc-800">
                {currentMentor.name}
              </span>
            </h3>
            <p className="text-xs text-zinc-400">Real-time chess-grounded pedagogical dialogue</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded-md hover:bg-zinc-800 transition-colors"
          aria-label="Close Voice Room"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Mentor Dialogue Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Active Grandmaster Mentor Card */}
        <div className="bg-[#181c24] border border-zinc-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Mentor Persona
            </span>
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${currentMentor.colorScheme.badge}`}>
              {currentMentor.era}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-lg font-serif font-bold text-zinc-200">
              {currentMentor.name.charAt(0)}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-zinc-100">{currentMentor.name}</h4>
              <p className="text-xs text-zinc-400 italic">"{currentMentor.quote.slice(0, 75)}..."</p>
            </div>
          </div>

          {/* Persona Selector Tabs */}
          <div className="pt-2">
            <label className="text-[11px] text-zinc-400 block mb-1.5">Switch Teaching Mode:</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  'magnus',
                  'kasparov',
                  'anand',
                  'polgar',
                  'nakamura',
                  'capablanca',
                  'fischer',
                  'tal',
                  'karpov',
                ] as MentorId[]
              ).map((id) => (
                <button
                  key={id}
                  onClick={() => onSelectMentor(id)}
                  className={`px-2 py-1.5 text-[11px] font-medium rounded transition-colors truncate ${
                    activeMentor === id
                      ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
                      : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800'
                  }`}
                >
                  {GRANDMASTER_PROFILES[id].name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Audio & Synchronized Captions Panel */}
        <div className="bg-[#181c24] border border-zinc-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              {isSpeaking ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-emerald-400 font-medium">Mentor Speaking</span>
                </>
              ) : isListening ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                  <span className="text-rose-400 font-medium">Listening to You...</span>
                </>
              ) : (
                <span>Synchronized Audio & Captions</span>
              )}
            </span>

            {/* Playback Controls */}
            <div className="flex items-center gap-1">
              {isSpeaking ? (
                <button
                  onClick={handleInterrupt}
                  className="px-2 py-0.5 text-[11px] bg-rose-950/60 text-rose-300 border border-rose-800/50 rounded hover:bg-rose-900/60 flex items-center gap-1"
                >
                  <StopSquare className="w-3 h-3" /> Stop
                </button>
              ) : (
                <button
                  onClick={handleRepeat}
                  className="px-2 py-0.5 text-[11px] bg-zinc-800 text-zinc-300 rounded hover:bg-zinc-700 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Repeat
                </button>
              )}
            </div>
          </div>

          {/* Voice Wave Animation */}
          <div className="h-10 bg-zinc-900/80 rounded-lg flex items-center justify-center px-4 gap-1 overflow-hidden border border-zinc-800">
            {isSpeaking ? (
              Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-emerald-400 rounded-full transition-all duration-150 animate-pulse"
                  style={{
                    height: `${Math.max(15, Math.sin((i + Date.now() / 150) * 0.7) * 90)}%`,
                    animationDelay: `${(i % 5) * 100}ms`,
                  }}
                />
              ))
            ) : isListening ? (
              Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-rose-400 rounded-full transition-all duration-150 animate-pulse"
                  style={{
                    height: `${Math.max(20, Math.cos(i * 0.5) * 80)}%`,
                    animationDelay: `${(i % 4) * 80}ms`,
                  }}
                />
              ))
            ) : (
              <div className="text-xs text-zinc-500 font-sans">Voice standby · Microphone ready</div>
            )}
          </div>

          {/* Caption Text Box */}
          <div className="p-3 bg-zinc-900/70 border border-zinc-800/80 rounded-lg min-h-[90px] text-sm leading-relaxed text-zinc-200">
            {isLoading ? (
              <div className="text-xs text-zinc-400 flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span>Mentor analyzing board state and formulating instruction...</span>
              </div>
            ) : transcript ? (
              <p className="text-xs italic text-emerald-400">"{transcript}"</p>
            ) : (
              <p>{captions}</p>
            )}
          </div>
        </div>

        {/* Quick Question Prompts */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Quick Inquiries
          </span>
          <div className="grid grid-cols-1 gap-1.5">
            {[
              'What is my opponent currently threatening?',
              'Which of my pieces is worst-placed?',
              'Should I trade pieces or maintain tension?',
              'What pawn break unlocks this structure?',
              'Help me calculate the critical candidate line.',
            ].map((q) => (
              <button
                key={q}
                onClick={() => handleSendQuestion(q)}
                disabled={isLoading}
                className="text-left px-3 py-2 text-xs bg-[#181c24] hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 border border-zinc-800 rounded-lg transition-colors flex items-center justify-between group disabled:opacity-50"
              >
                <span>{q}</span>
                <span className="text-zinc-500 group-hover:text-emerald-400 transition-colors text-xs">→</span>
              </button>
            ))}
          </div>
        </div>

        {/* Coaching Intensity & Voice Settings */}
        <div className="bg-[#181c24] border border-zinc-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Coaching Intensity</span>
            <span className="font-semibold text-zinc-200 capitalize">{intensity}</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(['quiet', 'balanced', 'intensive'] as CoachingIntensity[]).map((mode) => (
              <button
                key={mode}
                onClick={() => onChangeIntensity(mode)}
                className={`py-1.5 px-2 text-xs rounded font-medium capitalize transition-colors ${
                  intensity === mode
                    ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
                    : 'bg-zinc-900/60 text-zinc-400 hover:bg-zinc-800 border border-zinc-800'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Speech Rate Controls */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-xs">
            <span className="text-zinc-400">Speed:</span>
            <div className="flex items-center gap-1.5">
              {[0.8, 1.0, 1.2, 1.5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-2 py-0.5 rounded text-[11px] ${
                    playbackSpeed === speed
                      ? 'bg-zinc-700 text-white font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Privacy & Permissions Disclosure */}
        <div className="text-[11px] text-zinc-500 leading-normal p-3 bg-zinc-900/40 border border-zinc-800/60 rounded-lg">
          <p className="font-medium text-zinc-400 mb-0.5">Microphone & Privacy Notice</p>
          Microphone input is captured strictly for real-time pedagogical chess interaction. Audio is processed directly in-session, never permanently stored or shared.
        </div>
      </div>

      {/* Push-to-Talk Footer Action */}
      <div className="p-4 border-t border-zinc-800 bg-[#13161c]">
        <button
          onClick={toggleListening}
          className={`w-full py-3 px-4 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2.5 shadow-lg ${
            isListening
              ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-4 h-4" />
              <span>Tap to Stop Speaking</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              <span>Push to Speak with {currentMentor.name.split(' ')[0]}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
