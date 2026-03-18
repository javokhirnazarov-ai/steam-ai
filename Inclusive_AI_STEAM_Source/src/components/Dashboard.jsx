import React from 'react';
import './SharedDashboard.css';

const Dashboard = ({ onSwitch }) => {
  return (
    <div className="dashboard-wrapper animate-fade-in">
      <header className="header">
        <div>
          <h1 className="title text-gradient">Asosiy panel</h1>
          <p className="text-secondary">Standart boshqaruv interfeysi</p>
        </div>
        <div className="flex-center" style={{ gap: '16px' }}>
          <span className="interface-badge">🖱️ Standart tizim</span>
          <button className="back-btn" onClick={() => onSwitch('onboarding')}>
            Qayta sozlash
          </button>
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">O'zlashtirish</span>
          <span className="stat-value">78%</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Tugallangan darslar</span>
          <span className="stat-value">12 / 24</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Davomiylik</span>
          <span className="stat-value">14 soat</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Yakuniy Test</span>
          <span className="stat-value text-accent">Kutilmoqda</span>
        </div>
      </div>

      <div className="content-section">
        <div className="main-panel">
          <h2 className="panel-title">Mening kurslarim</h2>
          <div className="course-list">
            <div className="course-item">
              <div className="course-info">
                <h4>Sun'iy Intelekt asoslari</h4>
                <p>Modul 3: Neyron tarmoqlar qanday ishlaydi?</p>
              </div>
              <div className="progress-circle">
                <div className="progress-inner">70%</div>
              </div>
            </div>
            <div className="course-item">
              <div className="course-info">
                <h4>Robototexnika va Mexanika</h4>
                <p>Modul 1: Arduino platformasi bilan tanishuv</p>
              </div>
              <div className="progress-circle" style={{ background: 'conic-gradient(var(--accent-secondary) 25%, rgba(255,255,255,0.1) 0)' }}>
                <div className="progress-inner">25%</div>
              </div>
            </div>
            <div className="course-item">
              <div className="course-info">
                <h4>Dasturlash mantig'i</h4>
                <p>Tugallangan kurs</p>
              </div>
              <div className="progress-circle" style={{ background: 'conic-gradient(var(--success) 100%, rgba(255,255,255,0.1) 0)' }}>
                <div className="progress-inner">✓</div>
              </div>
            </div>
          </div>
        </div>

        <div className="side-panel">
          <h2 className="panel-title">Haftalik maqsad</h2>
          <div className="flex-center" style={{ flexDirection: 'column', gap: '16px' }}>
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(123, 97, 255, 0.4)' }}>
              <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>3/5</span>
            </div>
            <p className="text-secondary text-center">Bu hafta uchun belgilangan 5 ta darsdan 3 tasi yakunlandi.</p>
            <button className="btn-primary" style={{ width: '100%' }}>Darsni davom ettirish</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
