import VoiceRecorder from '../../components/VoiceRecorder';
import Navbar from '../../components/Navbar';

export default function VoiceBookingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#121212', color: 'white' }}>
      <Navbar />
      <VoiceRecorder />
    </div>
  );
}
