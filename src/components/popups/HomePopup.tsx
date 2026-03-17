interface HomePopupProps {
  onCancel: () => void;
  onConfirm: () => void;
}

export default function HomePopup({ onCancel, onConfirm }: HomePopupProps) {
  return (
    <div
      style={{ padding: '20px 10px', maxWidth: '360px', textAlign: 'center' }}
    >
      {/* Optional: A little visual indicator */}
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏠</div>

      <h3 style={{ margin: '0 0 12px 0', color: '#1e293b', fontSize: '18px' }}>
        Return to Home?
      </h3>

      <p
        style={{
          margin: '0 0 28px 0',
          fontSize: '14px',
          color: '#64748b',
          lineHeight: '1.5',
        }}
      >
        Are you sure you want to leave the editor? <br />
        <strong
          style={{
            color: '#ef4444',
            display: 'inline-block',
            marginTop: '8px',
            padding: '4px 8px',
            background: '#fef2f2',
            borderRadius: '4px',
          }}
        >
          Any unsaved changes will be lost.
        </strong>
      </p>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button
          onClick={onCancel}
          style={{
            flex: 1, // Makes the button take up equal space
            padding: '10px 16px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            background: '#fff',
            color: '#475569',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '13px',
          }}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          style={{
            flex: 1, // Makes the button take up equal space
            padding: '10px 16px',
            borderRadius: '8px',
            border: 'none',
            background: '#ef4444',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '13px',
          }}
        >
          Exit to Home
        </button>
      </div>
    </div>
  );
}
