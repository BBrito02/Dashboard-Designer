// src/Home.tsx
import React, { useRef, useState } from 'react';
import { FaPlus, FaUpload, FaChartPie } from 'react-icons/fa';
import { loadProjectFromZip } from './utils/fileUtils';

const TEMPLATES = [
  {
    id: 'analise-partidas',
    name: 'Análise Partidas por Estação',
    file: 'analise-partidas-estacao.json.dashboard',
    description:
      'Detailed breakdown of departure statistics by individual stations.',
  },
  {
    id: 'exec-overview',
    name: 'Executive Overview',
    file: 'exec-overview.json.dashboard',
    description:
      'High-level business metrics, KPIs, and overall performance summary.',
  },
  {
    id: 'analise-global',
    name: 'Análise Global de Zonas',
    file: 'analise-global-zonas.json.dashboard',
    description: 'Geographical and structural analysis across different zones.',
  },
  {
    id: 'sensores-estacao',
    name: 'Sensores por Estação',
    file: 'sensores-por-estacao.json.dashboard',
    description:
      'Monitoring and visualization of sensor data distributed per station.',
  },
];

interface HomeProps {
  onStart: (initialData: any | null, projectName?: string) => void;
}

export default function Home({ onStart }: HomeProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  // 1. Start Blank Project
  const handleBlank = () => {
    onStart(null, 'dashboard-designer');
  };

  // 2. Load from Device
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      let data;
      if (file.name.endsWith('.json')) {
        const text = await file.text();
        data = JSON.parse(text);
      } else {
        data = await loadProjectFromZip(file);
      }
      onStart(data, file.name.replace(/\.[^.]+$/, ''));
    } catch (err) {
      console.error(err);
      alert('Failed to load the project file.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Load from Template
  const handleTemplateLoad = async (templateFile: string) => {
    try {
      setLoading(true);

      const baseUrl = import.meta.env.BASE_URL;
      const response = await fetch(
        `${baseUrl}saved_dashboards/${templateFile}`,
      );

      if (!response.ok)
        throw new Error(`Template not found: ${response.statusText}`);

      const blob = await response.blob();
      const file = new File([blob], templateFile);

      const data = await loadProjectFromZip(file);

      // --- CHANGE THIS LINE ---
      // BEFORE: onStart(data, templateName);
      // AFTER: We pass the file string and remove the extension
      onStart(data, templateFile.replace('.json.dashboard', ''));
    } catch (err) {
      console.error(err);
      alert('Failed to load template. Check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        backgroundColor: '#aedbe6ff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          maxWidth: '800px',
          width: '100%',
        }}
      >
        <h1
          style={{ textAlign: 'center', marginBottom: '10px', color: '#333' }}
        >
          Dashboard Designer
        </h1>
        <p style={{ textAlign: 'center', marginBottom: '40px', color: '#666' }}>
          What would you like to do?
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            Loading project...
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              gap: '20px',
              marginBottom: '40px',
              justifyContent: 'center',
            }}
          >
            {/* Blank Project Button */}
            <button onClick={handleBlank} style={cardStyle}>
              <FaPlus
                size={32}
                color="#007bff"
                style={{ marginBottom: '16px' }}
              />
              <h3 style={{ margin: 0 }}>Blank Project</h3>
              <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#666' }}>
                Start from scratch
              </p>
            </button>

            {/* Load File Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              style={cardStyle}
            >
              <FaUpload
                size={32}
                color="#28a745"
                style={{ marginBottom: '16px' }}
              />
              <h3 style={{ margin: 0 }}>Load File</h3>
              <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#666' }}>
                Open from your device
              </p>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json,.dashboard"
              style={{ display: 'none' }}
            />
          </div>
        )}

        {/* Templates Section */}
        {!loading && (
          <div>
            <h3
              style={{
                borderBottom: '1px solid #eee',
                paddingBottom: '10px',
                marginBottom: '20px',
              }}
            >
              Start from a Template
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
              }}
            >
              {TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => handleTemplateLoad(tpl.file)}
                  style={{
                    ...cardStyle,
                    padding: '16px',
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    gap: '16px',
                    textAlign: 'left', // Ensures the text aligns nicely to the left
                  }}
                >
                  <FaChartPie
                    size={32}
                    color="#6f42c1"
                    style={{ flexShrink: 0 }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span
                      style={{
                        fontWeight: 'bold',
                        fontSize: '16px',
                        color: '#333',
                      }}
                    >
                      {tpl.name}
                    </span>
                    <span
                      style={{
                        fontSize: '13px',
                        color: '#666',
                        marginTop: '4px',
                        lineHeight: '1.4',
                      }}
                    >
                      {tpl.description}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '30px 20px',
  border: '2px solid #e9ecef',
  borderRadius: '8px',
  backgroundColor: '#f8f9fa',
  cursor: 'pointer',
  transition: 'all 0.2s',
  color: 'inherit',
};
