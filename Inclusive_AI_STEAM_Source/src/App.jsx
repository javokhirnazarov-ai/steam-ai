import React, { useState } from 'react';
import SmartOnboarding from './components/SmartOnboarding';
import GestureInterface from './components/GestureInterface';
import VoiceInterface from './components/VoiceInterface';
import AudioInterface from './components/AudioInterface';
import Dashboard from './components/Dashboard';

function App() {
  const [currentInterface, setCurrentInterface] = useState('onboarding');

  const renderInterface = () => {
    switch (currentInterface) {
      case 'onboarding':
        return <SmartOnboarding onComplete={setCurrentInterface} />;
      case 'gesture':
        return <GestureInterface onSwitch={setCurrentInterface} />;
      case 'voice':
        return <VoiceInterface onSwitch={setCurrentInterface} />;
      case 'audio':
        return <AudioInterface onSwitch={setCurrentInterface} />;
      case 'standard':
        return <Dashboard onSwitch={setCurrentInterface} />;
      default:
        return <SmartOnboarding onComplete={setCurrentInterface} />;
    }
  };

  return (
    <div className="app-container">
      {renderInterface()}
    </div>
  );
}

export default App;
