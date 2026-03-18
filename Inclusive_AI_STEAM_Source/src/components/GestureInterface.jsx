import React, { useEffect, useRef, useState } from 'react';
import './SharedDashboard.css';

const GestureInterface = ({ onSwitch }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [debugMsg, setDebugMsg] = useState('Neyron tarmoq yuklanmoqda... (Kutib turing)');
  const [rawWords, setRawWords] = useState([]);
  const [logicalSentence, setLogicalSentence] = useState("");
  const [recentWord, setRecentWord] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [lessonMode, setLessonMode] = useState(false);
  const [lessonStep, setLessonStep] = useState(0);

  const lastGestureRef = useRef("");
  const gestureCountRef = useRef(0);
  const sentenceRef = useRef([]);

  // Barcha aniqlanadigan so'zlar lug'ati
  const [vocabulary, setVocabulary] = useState([
    { id: 'salom', icon: '👋', rule: 'Barcha 5 barmoq ochiq', word: "Salom" },
    { id: 'chiqish', icon: '✊', rule: 'Barcha barmoq yopiq (Musht)', word: "Chiqish" },
    { id: 'ajoyib', icon: '👍', rule: 'Faqat bosh barmoq yuqori', word: "Ajoyib" },
    { id: 'yomon', icon: '👎', rule: 'Bosh barmoq pastga', word: "Yomon / Yo'q" },
    { id: 'galaba', icon: '✌️', rule: 'Ko\'rsatkich va o\'rta', word: "G'alaba" },
    { id: 'men', icon: '☝️', rule: 'Ko\'rsatkich yuqoriga', word: "Men / Siz" },
    { id: 'tushundim', icon: '🔫', rule: 'Bosh + Ko\'rsatkich', word: "Tushundim" },
    { id: 'qongiroq', icon: '🤙', rule: 'Bosh + Jimgiloq', word: "Telefon qiling" },
    { id: 'sevgi', icon: '🤟', rule: 'Bosh + Ko\'rsatkich + Jimgiloq', word: "Yaxshi ko'raman" },
    { id: 'kichik', icon: '🤏', rule: 'Jimgiloq yuqori', word: "Kichik / Ozgina" },
    { id: 'uch', icon: '3️⃣', rule: 'Ko\'rsatkich, o\'rta, nomsiz', word: "Uchta" },
    { id: 'tort', icon: '4️⃣', rule: 'Bosh barmoq yopiq, qolgani ochiq', word: "To'rtta" },
    { id: 'qasam', icon: '🤞', rule: 'Ko\'rsatkich va o\'rta tutash/kesishgan', word: "Umid qilaman" },
  ]);

  useEffect(() => {
    let stream = null;
    let cameraAnimationId = null;
    let isRunning = true;
    let handsObj = null;

    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve(); return;
        }
        const script = document.createElement('script');
        script.src = src; script.crossOrigin = "anonymous";
        script.onload = () => resolve(); script.onerror = () => reject(new Error(src));
        document.body.appendChild(script);
      });
    };

    const initDetector = async () => {
      try {
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');

        const { Hands } = window;
        handsObj = new Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        handsObj.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.75,
          minTrackingConfidence: 0.75
        });

        handsObj.onResults(onResults);

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
               videoRef.current.play();
               setDebugMsg("Neyron tarmoq tayyor. Kamera o'chiq.");
               processVideoFrame();
            };
          }
        }
      } catch (err) {
        setDebugMsg("Xatolik: " + err.message);
      }
    };

    const processVideoFrame = async () => {
      if (!isRunning || !handsObj) return;
      if (videoRef.current && videoRef.current.readyState >= 2) {
        try { await handsObj.send({ image: videoRef.current }); } catch (e) {}
      }
      cameraAnimationId = requestAnimationFrame(processVideoFrame);
    };

    const onResults = (results) => {
      if (!canvasRef.current || !videoRef.current) return;
      const canvasCtx = canvasRef.current.getContext('2d');
      const cvs = canvasRef.current;
      
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, cvs.width, cvs.height);
      canvasCtx.translate(cvs.width, 0); canvasCtx.scale(-1, 1);
      canvasCtx.drawImage(results.image, 0, 0, cvs.width, cvs.height);

      let detectedWord = null;

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        for (const landmarks of results.multiHandLandmarks) {
          if (window.drawConnectors && window.drawLandmarks && window.HAND_CONNECTIONS) {
            window.drawConnectors(canvasCtx, landmarks, window.HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 3 });
            window.drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', lineWidth: 1, radius: 3 });
          }
          
          const isThumbUp = landmarks[4].y < landmarks[3].y && landmarks[4].y < landmarks[5].y && landmarks[4].y < landmarks[9].y;
          const isThumbDown = landmarks[4].y > landmarks[3].y && landmarks[4].y > landmarks[5].y + 0.1;
          const isIndexOpen = landmarks[8].y < landmarks[6].y;
          const isMiddleOpen = landmarks[12].y < landmarks[10].y;
          const isRingOpen = landmarks[16].y < landmarks[14].y;
          const isPinkyOpen = landmarks[20].y < landmarks[18].y;

          // Musht (Chiqish) buyrug'i (hamma barmoq yopiq)
          const allClosed = !isIndexOpen && !isMiddleOpen && !isRingOpen && !isPinkyOpen && !isThumbUp;

          if (allClosed) {
            detectedWord = "Chiqish";
          } else if (isIndexOpen && isMiddleOpen && isRingOpen && isPinkyOpen && !isThumbUp && !isThumbDown) {
            detectedWord = "Salom";
          } else if (isThumbUp && !isIndexOpen && !isMiddleOpen && !isRingOpen && !isPinkyOpen) {
            detectedWord = "Ajoyib";
          } else if (isThumbDown && !isIndexOpen && !isMiddleOpen && !isRingOpen && !isPinkyOpen) {
            detectedWord = "Yomon / Yo'q";
          } else if (isIndexOpen && !isMiddleOpen && !isRingOpen && !isPinkyOpen && !isThumbUp) {
             detectedWord = "Bir";
          } else if (isIndexOpen && isMiddleOpen && !isRingOpen && !isPinkyOpen && !isThumbUp) {
             detectedWord = "Ikki";
          }
        }
      }
      canvasCtx.restore();

      if (detectedWord) {
         if (lastGestureRef.current === detectedWord) {
             gestureCountRef.current += 1;
             if (gestureCountRef.current === 25) { // 25 ta frame davomida o'zgarmasa aniq bo'ladi
                setRecentWord(detectedWord);
                
                // BO'LIMLARNI BOSHQARISH
                if (detectedWord === 'Salom' && !lessonMode) {
                   setLessonMode(true);
                   setDebugMsg("Dars oynasi ochildi.");
                } else if (detectedWord === 'Chiqish' && lessonMode) {
                   setLessonMode(false);
                   setLessonStep(0);
                   setDebugMsg("Darsdan chiqildi.");
                } else if (lessonMode && (detectedWord === "Bir" || detectedWord === "Ikki")) {
                   setLessonStep(1); // Testni "to'ldirish" simulatsiyasi
                }

                sentenceRef.current.push(detectedWord);
                if (sentenceRef.current.length > 5) sentenceRef.current.shift();
                setRawWords([...sentenceRef.current]);
                generateLogicalSentence([...sentenceRef.current]);
             }
         } else {
             lastGestureRef.current = detectedWord;
             gestureCountRef.current = 1;
         }
      }
    };

    initDetector();

    return () => {
      isRunning = false;
      if (cameraAnimationId) cancelAnimationFrame(cameraAnimationId);
      if (stream) stream.getTracks().forEach(track => track.stop());
      if (handsObj && typeof handsObj.close === 'function') handsObj.close();
    };
  }, [lessonMode]);

  const generateLogicalSentence = (words) => {
    setIsTranslating(true);
    setTimeout(() => {
      let text = words.join(" ");
      let result = text;
      if (text.includes("Salom")) result = "Salom! Darsni boshlaymiz.";
      if (text.includes("Chiqish")) result = "Darsni yakunladik va orqaga qaytdik.";
      setLogicalSentence(result);
      setIsTranslating(false);
    }, 600);
  };

  const clearText = () => {
    sentenceRef.current = [];
    setRawWords([]);
    setLogicalSentence("");
    setRecentWord("");
  };

  return (
    <div className="dashboard-wrapper animate-fade-in">
      <header className="header" style={{ paddingBottom: '10px' }}>
        <div>
          <h1 className="title text-gradient">Inclusive STEAM (Imo-ishora)</h1>
          <p className="text-secondary">Qo'l harakatlari orqali darsni boshqarish tizimi</p>
        </div>
        <div className="flex-center" style={{ gap: '16px' }}>
          <span className="interface-badge" style={{ borderColor: '#6C63FF', color: '#6C63FF', background: 'rgba(108, 99, 255, 0.1)' }}>✋ Kamera aktiv</span>
          <button className="back-btn" onClick={() => onSwitch('onboarding')}>Qayta sozlash</button>
        </div>
      </header>

      <div className="content-section" style={{ gridTemplateColumns: lessonMode ? '1fr' : '1.2fr 1fr' }}>
        <div className="main-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {lessonMode ? (
            <div className="lesson-window animate-fade-in" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '2px solid var(--primary)', borderRadius: '24px', padding: '40px', position: 'relative' }}>
               <h2 style={{ marginBottom: '30px' }}>🤖 Robototexnika - Savol-javob oynasi</h2>
               <div style={{ display: 'flex', gap: '40px' }}>
                  <div style={{ flex: 1 }}>
                     {lessonStep === 0 ? (
                        <div>
                           <h3>Savol: Robotning markaziy boshqaruv qismi nima?</h3>
                           <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              <p style={{ padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>1-bor: Sensorlar</p>
                              <p style={{ padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid var(--primary)' }}>2-bar: Mikro-protsessor</p>
                           </div>
                           <p style={{ marginTop: '30px', color: 'var(--text-secondary)' }}>💡 Orqaga qaytish uchun ✊ <b>MUSHT (Musht)</b> ishorasini ko'rsating.</p>
                        </div>
                     ) : (
                        <div style={{ textAlign: 'center' }}>
                           <h1 style={{ fontSize: '5rem' }}>🎯</h1>
                           <h2 style={{ color: 'var(--success)' }}>Juda ajoyib! Javob to'g'ri.</h2>
                           <p style={{ marginTop: '20px' }}>Musht (✊) ko'rsatib asosiy oynaga qayting.</p>
                        </div>
                     )}
                  </div>

                  <div className="mini-cam" style={{ width: '280px', height: '210px', borderRadius: '16px', overflow: 'hidden', border: '3px solid var(--primary)' }}>
                     <video ref={videoRef} autoPlay playsInline muted style={{ display: 'none' }}></video>
                     <canvas ref={canvasRef} width="640" height="480" style={{ width: '100%', height: '100%', objectFit: 'cover' }}></canvas>
                     <div style={{ position: 'absolute', bottom: '20px', left: '20px', background: 'var(--primary)', padding: '5px 15px', borderRadius: '10px' }}>{recentWord}</div>
                  </div>
               </div>
            </div>
          ) : (
            <>
              <div className="camera-feed" style={{ position: 'relative', overflow: 'hidden', height: '380px', backgroundColor: '#000', borderRadius: '24px' }}>
                <video ref={videoRef} autoPlay playsInline muted style={{ display: 'none' }}></video>
                <canvas ref={canvasRef} width="640" height="480" style={{ width: '100%', height: '100%', objectFit: 'cover' }}></canvas>
                <div style={{ position: 'absolute', top: '20px', left: '20px', background: 'rgba(0,0,0,0.6)', padding: '8px 16px', borderRadius: '20px', color: '#fff' }}>{debugMsg}</div>
              </div>
              
              <div style={{ background: 'rgba(0,0,0,0.5)', padding: '25px', borderRadius: '24px', border: '1px solid rgba(108, 99, 255, 0.3)' }}>
                 <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>TARJIMA:</p>
                 <h2 style={{ color: '#fff', marginTop: '10px' }}>{logicalSentence || "Darsni boshlash uchun 👋 Salom ishorasini ko'rsating..."}</h2>
              </div>
            </>
          )}

        </div>

        {!lessonMode && (
        <div className="side-panel">
          <h3 className="panel-title">Imo-ishora bo'yicha yordam</h3>
          <div className="course-list">
             <div className="course-item">
                <span>👋 <b>Salom</b> - Darsni ochadi</span>
             </div>
             <div className="course-item">
                <span>✊ <b>Musht</b> - Har qanday joydan orqaga qaytadi</span>
             </div>
             <div className="course-item">
                <span>☝️ <b>Bir</b> - Birinchi javob</span>
             </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default GestureInterface;
