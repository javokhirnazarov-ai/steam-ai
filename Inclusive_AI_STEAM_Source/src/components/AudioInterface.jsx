import React, { useEffect } from 'react';
import './SharedDashboard.css';

const AudioInterface = ({ onSwitch }) => {
  // Mock function to play audio prompts
  const playPrompt = (text) => {
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance();
      msg.text = text;
      msg.lang = 'uz-UZ'; // Prefer Uzbek if supported, otherwise falback
      window.speechSynthesis.speak(msg);
    }
  };

  useEffect(() => {
    // Announce entry
    setTimeout(() => {
      playPrompt("Audio interfeysga xush kelibsiz. Tugmalarni tanlash uchun klaviaturangizdan foydalanishingiz mumkin.");
    }, 1000);

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="dashboard-wrapper animate-fade-in" style={{ 
      background: '#000', // high contrast black
      color: '#fff', 
      minHeight: '100vh',
      padding: '5vh 5vw'
    }}>
      
      <header className="header" style={{ marginBottom: '60px' }}>
        <div>
          <h1 className="title" style={{ fontSize: '3rem', color: '#ffb300' }}>Audio Interfeys</h1>
          <p style={{ fontSize: '1.5rem', color: '#fff' }}>Ko'zi ojizlar va ekran o'quvchi orqali foydalanuvchilar maxsus tartibi</p>
        </div>
      </header>

      <div className="content-section" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <p className="sr-only" aria-live="polite">
          Mavjud bo'limlarni tanlash uchun tab yoki yo'nalish tugmalaridan foydalaning.
        </p>

        <button 
          className="audio-btn" 
          onClick={() => playPrompt("Birinchi dars, Sun'iy intellekt kelajagi, boshlandi")}
          onFocus={() => playPrompt("Birinchi dars, Sun'iy intellekt kelajagi")}
        >
          <span style={{ color: '#ffea00', fontSize: '2rem', marginRight: '16px' }}>1.</span> 
          Darsni tinglash: Sun'iy intellekt kelajagi
        </button>

        <button 
          className="audio-btn" 
          onClick={() => playPrompt("Ikkinchi modul, interaktiv mashqlar")}
          onFocus={() => playPrompt("Ikkinchi modul, mashqlar")}
        >
          <span style={{ color: '#00e676', fontSize: '2rem', marginRight: '16px' }}>2.</span> 
          Audio Mashqlar
        </button>

        <button 
          className="audio-btn" 
          onClick={() => playPrompt("Darslik lug'atini ochish")}
          onFocus={() => playPrompt("Lug'atlar")}
        >
          <span style={{ color: '#00d2ff', fontSize: '2rem', marginRight: '16px' }}>3.</span> 
          Atamalar lug'ati (Ovozli)
        </button>
        
        <button 
          className="audio-btn" 
          style={{ marginTop: 'auto', border: '2px solid #ff3d00' }}
          onClick={() => {
            playPrompt("Asosiy panelga qaytilmoqda");
            setTimeout(() => onSwitch('onboarding'), 1500);
          }}
          onFocus={() => playPrompt("Sozlamalarga qaytish. Bosish orqali tahlil paneliga o'tasiz.")}
        >
          <span style={{ color: '#ff3d00', fontSize: '2rem', marginRight: '16px' }}>🔙</span>
          Tizim sozlamalariga qaytish
        </button>

      </div>
    </div>
  );
};

export default AudioInterface;
