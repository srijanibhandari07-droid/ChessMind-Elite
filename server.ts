import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Google GenAI initialization
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

// 1. Coaching Advice Endpoint
app.post('/api/coaching/chat', async (req, res) => {
  try {
    const {
      fen,
      turn,
      moveHistory,
      engineEvaluation,
      mentor = 'magnus',
      intensity = 'balanced',
      question = '',
      decisionStep,
    } = req.body;

    const mentorProfiles: Record<string, { name: string; style: string; voice: string }> = {
      magnus: {
        name: 'Magnus Carlsen Mode',
        style: 'Pragmatic, deeply focused on endgame technique, patience, squeezing tiny advantages, avoiding unnecessary risks, and creating enduring positional pressure.',
        voice: 'Zephyr',
      },
      kasparov: {
        name: 'Garry Kasparov Mode',
        style: 'Fiercely dynamic, initiative-driven, energetic calculation, aggressive piece activity, king hunt alertness, and forceful central breaks.',
        voice: 'Fenrir',
      },
      anand: {
        name: 'Viswanathan Anand Mode',
        style: 'Tactically lightning-alert, deep preparation, clean coordination, flexible multi-purpose moves, and razor-sharp calculation.',
        voice: 'Charon',
      },
      polgar: {
        name: 'Judit Polgár Mode',
        style: 'Fearless attacking initiative, calculating sharp piece sacrifices critically, piece harmony, and breaking open opponent kings.',
        voice: 'Kore',
      },
      nakamura: {
        name: 'Hikaru Nakamura Mode',
        style: 'Hyper-resourceful, swindling defense, relentless practical time pressure play, quick tactical spotting, and dynamic queen play.',
        voice: 'Puck',
      },
      capablanca: {
        name: 'José Raúl Capablanca Mode',
        style: 'Crystal-clear simplicity, flawless harmony, simplifying into won endgames, positional economy, and eliminating unnecessary moves.',
        voice: 'Charon',
      },
      fischer: {
        name: 'Bobby Fischer Mode',
        style: 'Objective geometric precision, uncompromising fight for every tempo, classical purity, deep opening principle, and direct purposeful play.',
        voice: 'Fenrir',
      },
      tal: {
        name: 'Mikhail Tal Mode',
        style: 'Romantic imagination, psychological pressure, intuitive piece sacrifices to seize initiative, complex complications, and relentless pressure.',
        voice: 'Puck',
      },
      karpov: {
        name: 'Anatoly Karpov Mode',
        style: 'Prophylactic master, boa-constrictor positional grip, preemptively neutralizing enemy counterplay, and gradual restriction of opponent pieces.',
        voice: 'Zephyr',
      },
    };

    const profile = mentorProfiles[mentor] || mentorProfiles.magnus;

    // Grounded prompt incorporating real engine facts
    const systemPrompt = `You are the ${profile.name} mentor in CHESSMIND ELITE.
Style & Philosophy: ${profile.style}
Coaching Intensity: ${intensity} (Quiet: concise 1-2 sentences. Balanced: 2-3 focused sentences. Intensive: deep question-driven pedagogical inquiry).
IMPORTANT RULES:
1. ALWAYS ground your feedback strictly in the chess facts provided below. Never hallucinate a blunder, win, or checkmate if engine evaluation doesn't verify it.
2. Address the learner respectfully. Prompt them to THINK rather than telling them moves directly.
3. If they asked a question, answer it directly using the board position.
4. Keep the voice natural, dignified, encouraging, and razor-sharp. Never use markdown headers, bullets, or emojis in spoken voice advice.`;

    const userPromptContent = `Position FEN: ${fen}
Side to move: ${turn === 'w' ? 'White' : 'Black'}
Engine Evaluation: Centipawns = ${engineEvaluation?.score ?? 0}, Best move suggested = ${engineEvaluation?.bestMove ?? 'N/A'}, Depth = ${engineEvaluation?.depth ?? 4}
Key tactical observations from engine: ${engineEvaluation?.tacticsSummary || 'Normal positional tension'}
Last moves played: ${Array.isArray(moveHistory) ? moveHistory.slice(-4).join(', ') : 'Opening phase'}
Learner's prompt/question: "${question || 'What should I pay attention to right now?'}"
${decisionStep ? `Current Decision Loop Step: ${decisionStep}` : ''}

Generate a concise, thoughtful mentor response (under 60 words for quick voice delivery).`;

    if (aiClient) {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userPromptContent,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        },
      });

      const responseText = response.text?.trim() || '';
      return res.json({
        mentor: profile.name,
        text: responseText,
        source: 'gemini',
      });
    }

    // Graceful pedagogical fallback when offline or no API key
    let fallbackText = '';
    if (question.toLowerCase().includes('threat') || question.toLowerCase().includes('threaten')) {
      fallbackText = `Notice your opponent's last piece placement. What diagonals or files did that move open, and which of your pieces is now under-defended?`;
    } else if (engineEvaluation && Math.abs(engineEvaluation.score) > 300) {
      fallbackText = `There is a decisive dynamic shift here. Calculate forcing moves: checks, captures, and direct threats before committing your next tempo.`;
    } else {
      fallbackText = `Pause before moving. Ask yourself what your opponent wants to accomplish next, and find the candidate move that restricts their most active piece.`;
    }

    return res.json({
      mentor: profile.name,
      text: fallbackText,
      source: 'offline-rule-engine',
    });
  } catch (error: any) {
    console.error('Coaching chat error:', error);
    return res.status(500).json({
      error: 'Failed to generate coaching advice',
      text: 'Take a deep breath and review piece coordination. Which of your pieces currently has the least influence?',
    });
  }
});

// 2. Speech Synthesis Endpoint (Gemini 3.8 Flash Lite TTS or client fallback)
app.post('/api/coaching/speech', async (req, res) => {
  try {
    const { text, voiceName = 'Zephyr' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Missing text to synthesize' });
    }

    if (aiClient) {
      try {
        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash-lite-tts',
          contents: [
            {
              role: 'user',
              parts: [{ text: text.slice(0, 300) }],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: voiceName || 'Zephyr' },
              },
            },
          },
        });

        const base64Audio =
          response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        if (base64Audio) {
          return res.json({
            audioBase64: base64Audio,
            mimeType: 'audio/wav',
          });
        }
      } catch (ttsErr) {
        console.warn('Gemini TTS failed or unavailable, falling back to Web Speech API:', ttsErr);
      }
    }

    // Tell client to use browser Web Speech API
    return res.json({ useClientSpeech: true, text });
  } catch (error: any) {
    console.error('Speech endpoint error:', error);
    return res.json({ useClientSpeech: true, text: req.body?.text });
  }
});

// 3. Health & Status Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'ChessMind Elite',
    hasGemini: !!aiClient,
    timestamp: new Date().toISOString(),
  });
});

// Vite Middleware for development or static serving for production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ChessMind Elite full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
