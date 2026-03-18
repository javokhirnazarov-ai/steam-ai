import React, { useState, useEffect, useRef } from 'react';
import './SharedDashboard.css';

const VoiceInterface = ({ onSwitch }) => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState('');
  const [hasSupport, setHasSupport] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Bo'limlar holati: 'menu', 'lesson_hub', 'mikro', 'lab', 'task'
  const [currentView, setCurrentView] = useState('menu');

  const recognitionRef = useRef(null);

  // Ovozli xabar berish (TTS) - O'ZBEKCHA TABIIY OVOZ
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance();
      msg.text = text;
      
      // Brauzerdagi ovozlar orasidan eng yaxshi O'zbekchaga mosini tanlash
      const voices = window.speechSynthesis.getVoices();
      
      // O'zbek tili uchun 'uz-UZ' yoki 'tr-TR' (turk tili ohangi o'zbekchaga juda o'xshash)
      let bestVoice = voices.find(v => v.lang.includes('uz')) || 
                      voices.find(v => v.lang.includes('tr')) || 
                      voices.find(v => v.lang.includes('ru'));
      
      if (bestVoice) msg.voice = bestVoice;
      
      msg.pitch = 1.0; // Tabiiy ohang
      msg.rate = 1.0;  // Tabiiy tezlik
      msg.lang = 'uz-UZ';
      
      window.speechSynthesis.speak(msg);
    }
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setHasSupport(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'uz-UZ';

    recognition.onstart = () => {
      setListening(true);
      setErrorMsg('');
    };

    recognition.onresult = (event) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      
      const lowerTranscript = currentTranscript.toLowerCase().trim();
      setTranscript(lowerTranscript);
      handleVoiceCommand(lowerTranscript);
    };

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') setErrorMsg("Mikrofonga ruxsat yo'q.");
      setListening(false);
    };

    recognition.onend = () => {
      if (listening && recognitionRef.current) {
        try { recognitionRef.current.start(); } catch(e) {}
      }
    };
    
    recognitionRef.current = recognition;

    // Uzunlikni bir marta chaqirib qo'yish
    speak("Ovozli navigatsiya tayyor. Darsni boshlash uchun 'Darsni boshla' deb ayting.");

    return () => {
      if (recognitionRef.current) {
         recognitionRef.current.onend = null;
         recognitionRef.current.stop();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleVoiceCommand = (text) => {
    setLastCommand(text);

    // ORQAGA buyrug'i
    if (text.includes('orqaga') || text.includes('qaytish') || text.includes('chiqish')) {
      if (currentView === 'mikro' || currentView === 'lab' || currentView === 'task') {
        setCurrentView('lesson_hub');
        speak("Darslar ro'yxatiga qaytdingiz.");
      } else if (currentView === 'lesson_hub') {
        setCurrentView('menu');
        speak("Asosiy menyuga qaytdingiz.");
      } else {
        onSwitch('onboarding');
      }
      return;
    }

    if (currentView === 'menu') {
      if (text.includes('dars') && (text.includes('boshla') || text.includes('boshlaymiz'))) {
        setCurrentView('lesson_hub');
        speak("Darslar oynasi ochildi. Birinchi, Ikkinchi yoki Uchinchi bo'limni tanlang.");
      }
    } 
    
    else if (currentView === 'lesson_hub') {
      if (text.includes('birinchi') || text.includes('mikro') || text.includes('1')) {
        setCurrentView('mikro');
        speak("Birinchi bo'lim ochildi. Mikro kurslar portali.");
      } else if (text.includes('ikkinchi') || text.includes('virtual') || text.includes('lab') || text.includes('2')) {
        setCurrentView('lab');
        speak("Ikkinchi bo'lim ochildi. Virtual laboratoriya.");
      } else if (text.includes('uchinchi') || text.includes('topshiriq') || text.includes('3')) {
        setCurrentView('task');
        speak("Uchinchi bo'lim ochildi. Topshiriqlar oynasi.");
      }
    }
  };

  const toggleListen = () => {
    if (listening) {
      setListening(false);
      recognitionRef.current.stop();
    } else {
      setTranscript('');
      try {
        recognitionRef.current.start();
        setListening(true);
      } catch (err) {}
    }
  };

  return (
    <div className="dashboard-wrapper animate-fade-in">
      <header className="header" style={{ paddingBottom: '20px' }}>
        <div>
          <h1 className="title text-gradient">Audio Portal</h1>
          <p className="text-secondary">Tabiiy O'zbek tilidagi yordamchi tizim</p>
        </div>
        <div className="flex-center" style={{ gap: '16px' }}>
          <span className="interface-badge" style={{ borderColor: listening ? '#00e676' : 'rgba(255,255,255,0.2)', color: listening ? '#00e676' : 'var(--text-secondary)' }}>
            {listening ? "🎙️ Eshitmoqdaman" : "🔇 Mikrofon o'chiq"}
          </span>
          <button className="back-btn" onClick={() => onSwitch('onboarding')}>Chiqish</button>
        </div>
      </header>

      <div className="content-section" style={{ gridTemplateColumns: '1fr 300px', gap: '20px' }}>
        <div className="main-panel" style={{ minHeight: '500px', background: 'rgba(255,255,255,0.02)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
          
          {currentView === 'menu' && (
            <div className="view-page animate-fade-in" style={{ textAlign: 'center', padding: '80px 20px' }}>
               <div onClick={toggleListen} style={{ width: '160px', height: '160px', borderRadius: '50%', background: listening ? 'rgba(0, 210, 255, 0.1)' : 'rgba(255,255,255,0.03)', border: '4px solid var(--accent-secondary)', margin: '0 auto 30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <span style={{ fontSize: '4rem' }}>{listening ? '🎤' : '🎙️'}</span>
               </div>
               <h2 style={{ fontSize: '2.2rem' }}>{listening ? "Sizni eshityapman" : "Mikrofonni yoqing"}</h2>
               <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginTop: '10px' }}>"Darsni boshla" deb ayting</p>
            </div>
          )}

          {currentView === 'lesson_hub' && (
            <div className="view-page animate-fade-in" style={{ padding: '30px' }}>
               <h1 style={{ color: 'var(--accent-secondary)', marginBottom: '30px' }}>📚 Darslar Ro'yxati</h1>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                  <div className="hub-card" style={{ padding: '40px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
                     <span style={{ fontSize: '3rem', display: 'block', marginBottom: '15px' }}>📖</span>
                     <h3>Birinchi bo'lim</h3>
                  </div>
                  <div className="hub-card" style={{ padding: '40px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
                     <span style={{ fontSize: '3rem', display: 'block', marginBottom: '15px' }}>⚡</span>
                     <h3>Ikkinchi bo'lim</h3>
                  </div>
                  <div className="hub-card" style={{ padding: '40px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
                     <span style={{ fontSize: '3rem', display: 'block', marginBottom: '15px' }}>🎯</span>
                     <h3>Uchinchi bo'lim</h3>
                  </div>
               </div>
               <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(0,210,255,0.1)', borderRadius: '15px', textAlign: 'center' }}>
                 <p style={{ fontSize: '1.2rem' }}>Buyruq: <b>"{transcript || "..."}"</b></p>
               </div>
            </div>
          )}

          {currentView === 'mikro' && (
            <div className="view-page animate-fade-in" style={{ padding: '40px', background: 'rgba(108, 99, 255, 0.05)', height: '100%', borderRadius: '32px' }}>
               <h1 style={{ color: 'var(--accent-primary)' }}>📖 Mikro Kurslar</h1>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '30px' }}>
                  <div style={{ padding: '25px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', borderLeft: '6px solid var(--accent-primary)' }}>
                     <h3>🤖 Robototexnika</h3>
                     <p>Asosiy tushunchalar.</p>
                  </div>
                  <div style={{ padding: '25px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', borderLeft: '6px solid var(--accent-primary)' }}>
                     <h3>🧠 AI Dunyosi</h3>
                     <p>Sun'iy intellekt asoslari.</p>
                  </div>
               </div>
            </div>
          )}

          {currentView === 'lab' && (
            <div className="view-page animate-fade-in" style={{ padding: '40px', textAlign: 'center' }}>
               <h1 style={{ color: 'var(--accent-secondary)' }}>⚡ Virtual Laboratoriya</h1>
               <div style={{ fontSize: '8rem', margin: '30px 0' }}>🔋</div>
               <h2>Simulyatsiya yuklanmoqda...</h2>
            </div>
          )}

          {currentView === 'task' && (
            <div className="view-page animate-fade-in" style={{ padding: '40px' }}>
               <h1 style={{ color: 'var(--success)' }}>🎯 Topshiriqlar</h1>
               <div style={{ padding: '40px', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px dashed var(--success)', marginTop: '30px', textAlign: 'center' }}>
                  <h2 style={{ fontSize: '1.8rem' }}>"Nega robotlar kerak?"</h2>
                  <p style={{ marginTop: '20px', color: 'var(--success)' }}>Javobingizni tinglayapman...</p>
               </div>
            </div>
          )}

        </div>

        <div className="side-panel">
          <h3 className="panel-title">Audio Yo'riqnoma</h3>
          <div className="course-list">
             <div className="course-item">
                <p>🗣️ <b>Buyruqlar:</b> "Darsni boshla", "Birinchi", "Orqaga"</p>
             </div>
          </div>
          <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(123, 97, 255, 0.1)', borderRadius: '12px', fontSize: '0.85rem' }}>
             💡 Tizim endi haqiqiy O'zbek tiliga yaqinroq ovozda gapiradi.
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceInterface;
