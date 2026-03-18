import React, { useState, useEffect, useRef } from 'react';
import './SmartOnboarding.css';

const STEPS = {
  INTRO: 'intro',
  PERMISSION: 'permission',
  TESTING: 'testing',
  RESULT: 'result'
};

const SmartOnboarding = ({ onComplete }) => {
  const [step, setStep] = useState(STEPS.INTRO);
  const [testProgress, setTestProgress] = useState(0);
  const [testStage, setTestStage] = useState('');
  const [recommended, setRecommended] = useState('');
  const videoRef = useRef(null);

  useEffect(() => {
    // Cleanup media tracks when unmounting so GestureInterface can use them
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  const startOnboarding = () => {
    setStep(STEPS.PERMISSION);
  };

  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setStep(STEPS.TESTING);
      runTests();
    } catch (err) {
      console.warn("Permission denied or error:", err);
      // Fallback for demo purposes if no camera/mic
      setStep(STEPS.TESTING);
      runTests();
    }
  };

  const runTests = () => {
    const stages = [
      { name: "Ovozli buyruqlar tahlili...", duration: 2000 },
      { name: "Imo-ishoralarni aniqlash...", duration: 2500 },
      { name: "Matnli va audio o'zlashtirish...", duration: 2000 },
      { name: "Natijalarni shakllantirish...", duration: 1500 }
    ];

    let currentProgress = 0;
    
    stages.forEach((stage, i) => {
      setTimeout(() => {
        setTestStage(stage.name);
      }, currentProgress);
      
      const interval = setInterval(() => {
        setTestProgress(p => Math.min(p + (100 / (stages.length * 20)), 100));
      }, 50);

      currentProgress += stage.duration;
      
      setTimeout(() => clearInterval(interval), currentProgress);
    });

    setTimeout(() => {
      // Simulate recommendation: random or predefined
      setRecommended('gesture');
      setStep(STEPS.RESULT);
    }, currentProgress);
  };

  return (
    <div className="onboarding-container flex-center">
      {/* Background decorations */}
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>

      <div className="glass-panel onboarding-card animate-fade-in">
        
        {step === STEPS.INTRO && (
          <div className="intro-step text-center">
            <h1 className="text-gradient">Inclusive STEAM AI</h1>
            <p className="subtitle">Barchaga moslashtirilgan ta'lim platformasiga xush kelibsiz.</p>
            <div className="feature-list" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', width: '100%', marginBottom: '2.5rem' }}>
              <div className="feat-card">
                 <span style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🧠</span>
                 <span style={{ fontWeight: '600', color: '#fff' }}>Aqlli tahlil paneli</span>
                 <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '5px' }}>Holatni AI orqali aniqlash</span>
              </div>
              <div className="feat-card">
                 <span style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🗣️</span>
                 <span style={{ fontWeight: '600', color: '#fff' }}>Ovozli interfeys</span>
                 <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '5px' }}>Gapirib boshqarish imkoni</span>
              </div>
              <div className="feat-card">
                 <span style={{ fontSize: '2.5rem', marginBottom: '10px' }}>✋</span>
                 <span style={{ fontWeight: '600', color: '#fff' }}>Imo-ishora</span>
                 <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '5px' }}>Harakatlar orqali boshqaruv</span>
              </div>
              <div className="feat-card">
                 <span style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🎧</span>
                 <span style={{ fontWeight: '600', color: '#fff' }}>Audio / Eshitish</span>
                 <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '5px' }}>Ko'zi ojizlar uchun darslar</span>
              </div>
            </div>
            <button className="btn-primary start-btn" onClick={startOnboarding} style={{ width: '100%', padding: '18px', fontSize: '1.2rem' }}>
              Boshlash
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
            </button>
          </div>
        )}

        {step === STEPS.PERMISSION && (
          <div className="permission-step text-center">
            <div className="icon-container">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/></svg>
            </div>
            <h2>Foydalanish ruxsatlari</h2>
            <p>Eng qulay interfeysni aniqlashimiz uchun kamera va mikrofonga ruxsat bering. Tizim avtomatik tarzda tahlil qiladi va moslashtiradi.</p>
            <div className="btn-group">
              <button className="btn-primary" onClick={requestPermissions}>Ruxsat berish</button>
              <button className="btn-secondary" onClick={() => { setStep(STEPS.TESTING); runTests(); }}>O'tkazib yuborish</button>
            </div>
          </div>
        )}

        {step === STEPS.TESTING && (
          <div className="testing-step text-center">
            <div className="video-container">
              <video ref={videoRef} autoPlay playsInline muted className="scanner-video"></video>
              <div className="scanner-overlay"></div>
            </div>
            <h3 className="pulse-text">{testStage || "Tizim tayyorlanmoqda..."}</h3>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${testProgress}%` }}></div>
            </div>
            <p className="hint">Maksimal qulaylik uchun interfeys analiz qilinmoqda...</p>
          </div>
        )}

        {step === STEPS.RESULT && (
          <div className="result-step">
            <h2 className="text-center">Tahlil yakunlandi! 🎉</h2>
            <p className="text-center subtitle">Siz uchun tavsiya etilgan eng qulay interfeys:</p>
            
            <div className="recommended-badge mb-6">
              <div className="badge-icon">🎧</div>
              <div className="badge-info">
                <h4>Audio Interfeys</h4>
                <span>To'liq ovozli va audio yordamchi tizimi</span>
              </div>
            </div>

            <p className="text-center mb-4 text-sm text-secondary">
              * Bu shunchaki tavsiya. O'zingizga mos bo'lgan boshqa ixtiyoriy interfeysni tanlashingiz mumkin.
            </p>

            <div className="interface-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <button className={`interface-card ${recommended === 'gesture' ? 'recommended-highlight' : ''}`} onClick={() => onComplete('gesture')}>
                <span className="emoji">✋</span>
                <span>Imo-ishora</span>
              </button>
              <button className={`interface-card ${recommended === 'voice' || recommended === 'audio' ? 'recommended-highlight' : ''}`} onClick={() => onComplete('voice')}>
                <span className="emoji">🎧</span>
                <span>Audio Interfeys (Ko'zi ojizlar)</span>
              </button>
              <button className={`interface-card ${recommended === 'standard' ? 'recommended-highlight' : ''}`} onClick={() => onComplete('standard')} style={{ gridColumn: 'span 2' }}>
                <span className="emoji">🖱️</span>
                <span>Standart boshqaruv</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SmartOnboarding;
