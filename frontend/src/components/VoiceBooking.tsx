import { useState, useRef } from 'react';
import axios from 'axios';
import { Mic, MicOff, Send, Loader2 } from 'lucide-react';
import Navbar from './Navbar';

type VoiceOrderResponse = {
  success: boolean;
  orderId: number;
  items: {
    name: string;
    quantity: number;
  }[];
  transcription?: string;
};

export default function VoiceBooking() {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VoiceOrderResponse | null>(null);
  const [error, setError] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  // 🎙️ Start Recording
  const startRecording = async () => {
    try {
      setError('');
      setResult(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = e => audioChunksRef.current.push(e.data);

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
      };

      recorder.start();
      setRecording(true);

      setTimeout(() => {
        recorder.stop();
        setRecording(false);
      }, 5000);
    } catch (err) {
      console.error(err);
      setError('Microphone access denied');
    }
  };

  // 🚀 Send voice to backend
  const submitVoice = async () => {
    if (!audioBlob) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setError('You are not logged in');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const formData = new FormData();
      // ✅ FIX: use audioBlob (NOT blob)
      formData.append('audio', audioBlob, 'voice.wav');

      const res = await axios.post(
        'http://localhost:5000/api/voice-booking',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // Let axios set multipart boundary automatically
          }
        }
      );

      setResult(res.data);
    } catch (err: any) {
      console.error('VOICE ERROR:', err.response?.data || err.message);
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Voice processing failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <Navbar />

      <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>
        <div className="glass-card" style={{ maxWidth: '600px', textAlign: 'center', padding: '60px 40px' }}>
          
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '10px' }}>
            <span style={{ color: 'var(--primary)' }}>Voice</span> Booking
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '50px', fontSize: '1.1rem' }}>
            Tap the microphone and say something like:<br/>
            <strong>“2 dosa and 1 coffee”</strong>
          </p>

          <div style={{ position: 'relative', height: '140px', marginBottom: '40px' }}>
            {/* Mic Button with Pulse Effect */}
            <button
              onClick={startRecording}
              disabled={recording || loading}
              style={{
                background: recording ? 'var(--error)' : 'var(--primary)',
                border: 'none',
                borderRadius: '50%',
                width: '120px',
                height: '120px',
                cursor: 'pointer',
                boxShadow: recording ? '0 0 30px rgba(239, 68, 68, 0.4)' : '0 10px 30px var(--primary-glow)',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                position: 'relative',
                zIndex: 2,
                margin: '0 auto'
              }}
            >
              {recording ? <MicOff size={50} /> : <Mic size={50} />}
            </button>
            
            {recording && (
                 <div className="animate-ping" style={{
                     position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                     width: '120px', height: '120px', borderRadius: '50%', background: 'var(--error)', opacity: 0.3, zIndex: 1,
                     animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite'
                 }} />
            )}
          </div>

          {/* Send Button */}
          {audioBlob && !result && (
            <div style={{ marginTop: '10px', animation: 'slideUp 0.3s ease-out' }}>
              <button
                onClick={submitVoice}
                className="btn-primary"
                style={{ 
                    maxWidth: '250px', 
                    margin: '0 auto', 
                    background: 'var(--success)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                }}
              >
                {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />} 
                {loading ? 'Processing...' : 'Process Order'}
              </button>
            </div>
          )}

          {/* Success Result */}
          {result && (
            <div
              style={{
                marginTop: '40px',
                background: '#f8fafc',
                padding: '30px',
                borderRadius: '20px',
                textAlign: 'left',
                border: '1px solid var(--surface-border)',
                animation: 'slideUp 0.4s ease-out'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '50%', color: 'var(--success)' }}>
                    <Send size={24} />
                </div>
                <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)' }}>Order Created!</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Order ID: <strong>#{result.orderId}</strong></p>
                </div>
              </div>

              <div style={{ background: 'white', borderRadius: '12px', padding: '15px', border: '1px solid var(--surface-border)' }}>
                {result.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < result.items.length - 1 ? '1px solid #eee' : 'none' }}>
                        <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{item.name}</span>
                        <span style={{ color: 'var(--primary)', fontWeight: '700' }}>x{item.quantity}</span>
                    </div>
                ))}
              </div>

              <p style={{ marginTop: '20px', color: 'var(--success)', textAlign: 'center', fontWeight: '600', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%' }}></span>
                Sent to Kitchen Display
              </p>
            </div>
          )}

          {error && (
              <div style={{ marginTop: '25px', padding: '15px', background: '#fef2f2', color: 'var(--error)', borderRadius: '12px', fontSize: '0.95rem', border: '1px solid #fecaca' }}>
                  {error}
              </div>
          )}
        </div>
      </div>
      
      {/* CSS Animation for Ping */}
      <style>{`
        @keyframes ping {
            75%, 100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
