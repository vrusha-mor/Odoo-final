import { useState } from 'react';
import { Mic, MicOff, Send, Loader2 } from 'lucide-react';
import { sendVoice } from '../services/voiceBooking.api';
import VoiceResult from './VoiceResult';

type ParsedItem = {
  product_name: string;
  quantity: number;
};

export default function VoiceRecorder() {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ParsedItem[]>([]);
  const [error, setError] = useState('');

  let mediaRecorder: MediaRecorder;
  let chunks: BlobPart[] = [];

  const startRecording = async () => {
    setError('');
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    chunks = [];

    mediaRecorder.ondataavailable = e => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      setAudioBlob(blob);
    };

    mediaRecorder.start();
    setRecording(true);

    setTimeout(() => {
      mediaRecorder.stop();
      setRecording(false);
    }, 5000);
  };

  const submitVoice = async () => {
    if (!audioBlob) return;

    try {
      setLoading(true);
      const res = await sendVoice(audioBlob);
      setItems(res.items || []);
    } catch (e) {
      setError('Voice processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '60px auto', textAlign: 'center' }}>
      <h1>🎤 Voice Booking</h1>
      <p style={{ color: '#aaa' }}>
        Say something like: <b>“2 dosa and 1 coffee”</b>
      </p>

      <button
        onClick={startRecording}
        disabled={recording || loading}
        style={{
          marginTop: 30,
          background: recording ? '#ef4444' : '#e91e63',
          borderRadius: '50%',
          width: 100,
          height: 100,
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {recording ? <MicOff size={40} /> : <Mic size={40} />}
      </button>

      {audioBlob && !items.length && (
        <div style={{ marginTop: 30 }}>
          <button
            onClick={submitVoice}
            style={{
              background: '#22c55e',
              padding: '12px 24px',
              borderRadius: 30,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {loading ? <Loader2 className="spin" /> : <Send />} Process Voice
          </button>
        </div>
      )}

      {items.length > 0 && <VoiceResult items={items} />}

      {error && <p style={{ color: '#ef4444' }}>{error}</p>}
    </div>
  );
}
