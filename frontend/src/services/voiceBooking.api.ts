import axios from 'axios';

export const sendVoice = async (audio: Blob) => {
  const fd = new FormData();
  fd.append('audio', audio);

  const token = localStorage.getItem('token');

  const res = await axios.post(
    'http://localhost:4000/voice-booking',
    fd,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return res.data;
};
