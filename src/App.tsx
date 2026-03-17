// src/App.tsx
import { useState } from 'react';
import './App.css';
import Editor from './Editor';
import Home from './Home';

function App() {
  const [view, setView] = useState<'home' | 'editor'>('home');
  const [initialData, setInitialData] = useState<any>(null);
  const [projectName, setProjectName] = useState('dashboard-designer');

  const handleStart = (data: any | null, name?: string) => {
    setInitialData(data);
    if (name) setProjectName(name);
    setView('editor');
  };

  const handleGoHome = () => {
    setView('home');
    setInitialData(null);
  };

  if (view === 'editor') {
    return (
      <Editor
        initialData={initialData}
        initialProjectName={projectName}
        onGoHome={handleGoHome}
      />
    );
  }

  return <Home onStart={handleStart} />;
}

export default App;
