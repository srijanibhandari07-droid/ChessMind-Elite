import React, { useState } from 'react';
import { Chess, Square } from 'chess.js';
import { EngineEvaluationResult, DecisionStep } from '../../types/chess';
import { GRANDMASTER_DECISION_STEPS } from '../../data/challenges';
import { soundManager } from '../../lib/audio';
import { Brain, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react';

interface DecisionLoopModalProps {
  chess: Chess;
  engineEvaluation: EngineEvaluationResult | null;
  isOpen: boolean;
  onClose: () => void;
  onApplyMove?: (san: string) => void;
}

export const DecisionLoopModal: React.FC<DecisionLoopModalProps> = ({
  chess,
  engineEvaluation,
  isOpen,
  onClose,
  onApplyMove,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [reflectionRevealed, setReflectionRevealed] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentStepData = GRANDMASTER_DECISION_STEPS[currentStepIndex];
  const totalSteps = GRANDMASTER_DECISION_STEPS.length;
  const isFinalStep = currentStepIndex === totalSteps - 1;

  const handleSelectOption = (opt: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentStepIndex]: opt,
    }));
  };

  const handleNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      setReflectionRevealed(true);
      soundManager.playSuccess();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setSelectedAnswers({});
    setReflectionRevealed(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#14171d] border border-zinc-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-[#181c24]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-zinc-100">
                The Grandmaster Decision Loop
              </h3>
              <p className="text-xs text-zinc-400">
                Independent 7-step calculation framework
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded-md hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Indicators */}
        <div className="px-6 py-3 bg-[#111317] border-b border-zinc-800 flex items-center justify-between">
          {GRANDMASTER_DECISION_STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIndex || reflectionRevealed;
            const isCurrent = idx === currentStepIndex && !reflectionRevealed;
            return (
              <button
                key={step.step}
                onClick={() => setCurrentStepIndex(idx)}
                className="flex items-center gap-1.5 group focus:outline-hidden"
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-zinc-100 text-zinc-900 ring-2 ring-emerald-500'
                      : 'bg-zinc-800 text-zinc-500 group-hover:text-zinc-300'
                  }`}
                >
                  {idx + 1}
                </div>
                <span
                  className={`hidden sm:inline text-xs font-medium whitespace-nowrap ${
                    isCurrent ? 'text-zinc-100' : 'text-zinc-500'
                  }`}
                >
                  {step.step}
                </span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {!reflectionRevealed ? (
            <>
              {/* Step Title & Instruction */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  {currentStepData.subtitle}
                </span>
                <h4 className="text-xl font-serif font-bold text-zinc-100 mt-1">
                  {currentStepData.title}
                </h4>
                <p className="text-sm text-zinc-300 mt-2 leading-relaxed">
                  {currentStepData.instruction}
                </p>
              </div>

              {/* Inquiry Question & Options */}
              <div className="bg-[#191d26] border border-zinc-800 rounded-xl p-4 space-y-3">
                <p className="text-sm font-medium text-zinc-200">
                  {currentStepData.question}
                </p>

                <div className="space-y-2 pt-1">
                  {currentStepData.options?.map((opt, optIdx) => {
                    const isSelected = selectedAnswers[currentStepIndex] === opt;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(opt)}
                        className={`w-full text-left p-3 rounded-lg text-xs leading-relaxed transition-all flex items-start gap-3 border ${
                          isSelected
                            ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                            : 'bg-zinc-900/60 hover:bg-zinc-800 border-zinc-800 text-zinc-300 hover:text-zinc-100'
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-emerald-400 bg-emerald-500 text-black'
                              : 'border-zinc-600'
                          }`}
                        >
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-zinc-950" />}
                        </span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Contextual Board Hint */}
              <div className="p-3 bg-zinc-900/50 border border-zinc-800/80 rounded-lg flex items-center justify-between text-xs text-zinc-400">
                <span>Side to move: <strong className="text-zinc-200">{chess.turn() === 'w' ? 'White' : 'Black'}</strong></span>
                <span>Active pieces: <strong className="text-zinc-200">{chess.moves().length} legal options</strong></span>
              </div>
            </>
          ) : (
            /* Completed Reflection & Engine Truth Reveal */
            <div className="space-y-5">
              <div className="text-center py-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-serif font-bold text-zinc-100">
                  Decision Loop Completed
                </h4>
                <p className="text-xs text-zinc-400 mt-1">
                  You completed all 7 cognitive evaluation checkpoints before checking the engine.
                </p>
              </div>

              {/* Engine Truth Comparison */}
              <div className="bg-[#1a1e28] border border-zinc-700 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    Objective Engine Verification
                  </span>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-200">
                    Eval: {engineEvaluation?.displayScore || '0.00'}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-zinc-300">
                  <p>
                    <strong className="text-zinc-100">Best Engine Move:</strong>{' '}
                    <span className="font-mono text-emerald-400 font-bold text-sm">
                      {engineEvaluation?.bestMoveSan || 'N/A'}
                    </span>
                  </p>
                  <p>
                    <strong className="text-zinc-100">Tactical Summary:</strong>{' '}
                    {engineEvaluation?.tacticsSummary || 'Balanced positional tension.'}
                  </p>
                  <p>
                    <strong className="text-zinc-100">Top Candidate Lines:</strong>
                  </p>
                  <div className="space-y-1.5 pl-2 border-l-2 border-emerald-500/40">
                    {engineEvaluation?.candidateMoves.map((cand, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="font-mono font-semibold text-zinc-200">
                          {i + 1}. {cand.san}
                        </span>
                        <span className="text-zinc-400">{cand.explanation}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {onApplyMove && engineEvaluation?.bestMoveSan && (
                  <button
                    onClick={() => {
                      onApplyMove(engineEvaluation.bestMoveSan!);
                      onClose();
                    }}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors mt-2"
                  >
                    Play Engine Recommended Move ({engineEvaluation.bestMoveSan})
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="p-4 border-t border-zinc-800 bg-[#14171d] flex items-center justify-between">
          {!reflectionRevealed ? (
            <>
              <button
                onClick={handlePrev}
                disabled={currentStepIndex === 0}
                className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Previous Step
              </button>

              <button
                onClick={handleNext}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span>{isFinalStep ? 'Reveal Engine Truth' : 'Next Step'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-between">
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              >
                Restart Loop
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg text-xs font-semibold"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
