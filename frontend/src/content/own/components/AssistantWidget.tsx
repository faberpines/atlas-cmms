import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  Avatar,
  Box,
  CircularProgress,
  Fab,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import AssistantTwoToneIcon from '@mui/icons-material/AssistantTwoTone';
import SendTwoToneIcon from '@mui/icons-material/SendTwoTone';
import MicTwoToneIcon from '@mui/icons-material/MicTwoTone';
import MicOffTwoToneIcon from '@mui/icons-material/MicOffTwoTone';
import CloseTwoToneIcon from '@mui/icons-material/CloseTwoTone';
import VolumeUpTwoToneIcon from '@mui/icons-material/VolumeUpTwoTone';
import VolumeOffTwoToneIcon from '@mui/icons-material/VolumeOffTwoTone';
import api from '../../../utils/api';
import useAuth from '../../../hooks/useAuth';
import { useTranslation } from 'react-i18next';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Find best Irish / British English female voice for TTS
function getIrishVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis?.getVoices() ?? [];
  // Priority order: Irish English, British English female, any English female
  return (
    voices.find((v) => v.lang === 'en-IE') ||
    voices.find((v) => v.lang.startsWith('en-') && /female|woman|fiona|samantha|victoria|karen|moira|tessa/i.test(v.name)) ||
    voices.find((v) => v.lang === 'en-GB') ||
    voices.find((v) => v.lang.startsWith('en-')) ||
    null
  );
}

function speak(text: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  const voice = getIrishVoice();
  if (voice) utter.voice = voice;
  utter.lang = voice?.lang ?? 'en-IE';
  utter.rate = 0.95;
  utter.pitch = 1.1;
  window.speechSynthesis.speak(utter);
}

// SpeechRecognition requires a secure context (HTTPS) or localhost
// On HTTP LAN deployments we gracefully disable it
const isSecureContext = window.isSecureContext || window.location.hostname === 'localhost';
const SpeechRecognitionAPI =
  isSecureContext
    ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    : null;

export default function AssistantWidget() {
  const { user } = useAuth();
  const { i18n }: { i18n: any } = useTranslation();
  const theme = useTheme();
  const isSpanish = i18n.language?.startsWith('es');

  const greeting = isSpanish
    ? "¡Hola! Soy tu asistente de mantenimiento de Bay Baby Produce. Pregúntame sobre activos, stock de piezas, órdenes de trabajo, ¡o déjame ayudarte a programar el mantenimiento!"
    : "Hello! I'm your Bay Baby Produce maintenance assistant. Ask me about assets, parts stock, work orders, or let me help schedule maintenance!";

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: greeting, timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Reset greeting when language changes
  useEffect(() => {
    setMessages([{ role: 'assistant', content: greeting, timestamp: new Date() }]);
  }, [isSpanish]);

  // Only render for ADMIN and LIMITED_ADMIN
  const roleCode = user?.role?.code;
  if (roleCode !== 'ADMIN' && roleCode !== 'LIMITED_ADMIN') return null;

  // Load voices (Chrome loads them async)
  useEffect(() => {
    if (window.speechSynthesis) {
      const load = () => setVoicesLoaded(true);
      window.speechSynthesis.addEventListener('voiceschanged', load);
      if (window.speechSynthesis.getVoices().length > 0) setVoicesLoaded(true);
      return () => window.speechSynthesis.removeEventListener('voiceschanged', load);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Send last 10 turns as history for multi-turn context
      const history = messages.slice(-10).map((m) => ({ role: m.role, content: m.content }));
      const result = await api.post<{ response: string }>('assistant/chat', {
        message: text,
        history,
        language: isSpanish ? 'es' : 'en'
      });
      const reply = result.response;
      const assistantMsg: Message = { role: 'assistant', content: reply, timestamp: new Date() };
      setMessages((prev) => [...prev, assistantMsg]);
      if (voiceEnabled) speak(reply);
    } catch (e: any) {
      const errMsg = e?.message ?? 'Failed to reach assistant.';
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `⚠️ ${errMsg}`, timestamp: new Date() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const startListening = () => {
    if (!SpeechRecognitionAPI) {
      alert(
        'Voice input requires a secure connection (HTTPS).\n\n' +
        'To enable it in Chrome:\n' +
        '1. Open chrome://flags/#unsafely-treat-insecure-origin-as-secure\n' +
        '2. Add: http://192.168.1.122:3000\n' +
        '3. Enable the flag and relaunch Chrome'
      );
      return;
    }
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
      sendMessage(transcript);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!open && (
        <Tooltip title="Maintenance Assistant" placement="left">
          <Fab
            color="primary"
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 1300,
              background: 'linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)',
              '&:hover': { transform: 'scale(1.08)' },
              transition: 'transform 0.2s'
            }}
            onClick={() => setOpen(true)}
          >
            <AssistantTwoToneIcon />
          </Fab>
        </Tooltip>
      )}

      {/* Chat Panel */}
      {open && (
        <Paper
          elevation={12}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 400,
            height: 580,
            zIndex: 1300,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)',
              px: 2,
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5
            }}
          >
            <AssistantTwoToneIcon sx={{ color: 'white', fontSize: 28 }} />
            <Box flex={1}>
              <Typography variant="subtitle1" fontWeight="bold" color="white" lineHeight={1}>
                Maintenance Assistant
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Powered by AI · Admin Only
              </Typography>
            </Box>
            <Tooltip title={voiceEnabled ? 'Mute voice' : 'Enable voice'}>
              <IconButton size="small" onClick={() => {
                setVoiceEnabled((v) => !v);
                if (voiceEnabled) window.speechSynthesis?.cancel();
              }} sx={{ color: 'white' }}>
                {voiceEnabled ? <VolumeUpTwoToneIcon fontSize="small" /> : <VolumeOffTwoToneIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <IconButton size="small" onClick={() => { setOpen(false); window.speechSynthesis?.cancel(); }} sx={{ color: 'white' }}>
              <CloseTwoToneIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Messages */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: 'background.default' }}>
            <Stack spacing={1.5}>
              {messages.map((msg, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    gap: 1,
                    alignItems: 'flex-end'
                  }}
                >
                  {msg.role === 'assistant' && (
                    <Avatar
                      sx={{
                        width: 28,
                        height: 28,
                        bgcolor: 'success.main',
                        fontSize: 14
                      }}
                    >
                      <AssistantTwoToneIcon sx={{ fontSize: 16 }} />
                    </Avatar>
                  )}
                  <Box
                    sx={{
                      maxWidth: '78%',
                      px: 1.5,
                      py: 1,
                      borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      bgcolor: msg.role === 'user' ? 'primary.main' : 'background.paper',
                      color: msg.role === 'user' ? 'white' : 'text.primary',
                      boxShadow: 1,
                      border: msg.role === 'assistant' ? `1px solid ${theme.palette.divider}` : 'none'
                    }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                      {msg.content}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.6, display: 'block', textAlign: 'right', mt: 0.25 }}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                </Box>
              ))}
              {loading && (
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar sx={{ width: 28, height: 28, bgcolor: 'success.main' }}>
                    <AssistantTwoToneIcon sx={{ fontSize: 16 }} />
                  </Avatar>
                  <Box sx={{ px: 1.5, py: 1, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1, border: `1px solid ${theme.palette.divider}` }}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <CircularProgress size={12} />
                      <Typography variant="caption" color="text.secondary">Thinking...</Typography>
                    </Stack>
                  </Box>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Stack>
          </Box>

          {/* Input */}
          <Box sx={{ p: 1.5, borderTop: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
            {listening && (
              <Typography variant="caption" color="error" sx={{ display: 'block', mb: 0.5, textAlign: 'center' }}>
                🎤 Listening... speak now
              </Typography>
            )}
            <TextField
              fullWidth
              size="small"
              placeholder="Ask about assets, parts, maintenance..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              multiline
              maxRows={3}
              disabled={loading || listening}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Stack direction="row" spacing={0.5}>
                      {SpeechRecognitionAPI ? (
                        <Tooltip title={listening ? 'Stop listening' : 'Voice input'}>
                          <IconButton
                            size="small"
                            color={listening ? 'error' : 'default'}
                            onClick={listening ? stopListening : startListening}
                          >
                            {listening ? <MicOffTwoToneIcon fontSize="small" /> : <MicTwoToneIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Voice input requires HTTPS. See assistant help for setup.">
                          <span>
                            <IconButton size="small" disabled onClick={startListening}>
                              <MicTwoToneIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}
                      <Tooltip title="Send (Enter)">
                        <span>
                          <IconButton
                            size="small"
                            color="primary"
                            disabled={!input.trim() || loading}
                            onClick={() => sendMessage(input)}
                          >
                            <SendTwoToneIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Stack>
                  </InputAdornment>
                )
              }}
            />
          </Box>
        </Paper>
      )}
    </>
  );
}
