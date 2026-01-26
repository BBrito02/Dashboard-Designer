import React, { useMemo, useState } from 'react';
import type { DataItem, GraphType } from '../../domain/types';
import { ShowMeHint } from './ShowMeHint';

// Marks updated to string[] to support multiple attributes
type Marks = {
  color?: string[];
  size?: string[];
  shape?: string[];
  text?: string[];
};

type Props = {
  available: (string | DataItem)[];
  initial: any;
  onCancel: () => void;
  onSave: (next: Marks) => void;
  graphType?: GraphType;
};

// --- Shared Styles (Copied from GraphFieldsPopup) ---
const field: React.CSSProperties = {
  height: 36,
  borderRadius: 10,
  border: '1px solid #e5e7eb',
  padding: '0 12px',
  fontWeight: 600,
  width: '100%',
  boxSizing: 'border-box',
};

const pill: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '4px 8px',
  borderRadius: 999,
  background: '#eef2ff',
  border: '1px solid #c7d2fe',
  fontSize: 12,
};

const row: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '110px 1fr 80px',
  gap: 10,
  alignItems: 'center',
};

const label: React.CSSProperties = {
  fontWeight: 700,
  color: '#0f172a',
  opacity: 0.85,
};

// --- Helpers ---
function asArray(val: string | string[] | undefined | null): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return [val];
}

function namesFrom(av: (string | DataItem)[]): string[] {
  const out: string[] = [];
  for (const it of av ?? []) {
    const n = typeof it === 'string' ? it : it?.name;
    if (n && !out.includes(n)) out.push(n);
  }
  return out;
}

export default function GraphMarkPopup({
  available,
  initial,
  onCancel,
  onSave,
  graphType,
}: Props) {
  // 1. Committed State (Arrays)
  const [color, setColor] = useState<string[]>(asArray(initial?.color));
  const [size, setSize] = useState<string[]>(asArray(initial?.size));
  const [shape, setShape] = useState<string[]>(asArray(initial?.shape));
  const [text, setText] = useState<string[]>(asArray(initial?.text));

  // 2. Picker State (Single Strings)
  const [colorPick, setColorPick] = useState('');
  const [sizePick, setSizePick] = useState('');
  const [shapePick, setShapePick] = useState('');
  const [textPick, setTextPick] = useState('');

  const names = useMemo(() => namesFrom(available), [available]);

  // Derived Options
  const colorOpts = useMemo(
    () => names.filter((n) => !color.includes(n)),
    [names, color],
  );
  const sizeOpts = useMemo(
    () => names.filter((n) => !size.includes(n)),
    [names, size],
  );
  const shapeOpts = useMemo(
    () => names.filter((n) => !shape.includes(n)),
    [names, shape],
  );
  const textOpts = useMemo(
    () => names.filter((n) => !text.includes(n)),
    [names, text],
  );

  // Handlers
  const addColor = () => {
    if (!colorPick) return;
    setColor((p) => [...p, colorPick]);
    setColorPick('');
  };
  const addSize = () => {
    if (!sizePick) return;
    setSize((p) => [...p, sizePick]);
    setSizePick('');
  };
  const addShape = () => {
    if (!shapePick) return;
    setShape((p) => [...p, shapePick]);
    setShapePick('');
  };
  const addText = () => {
    if (!textPick) return;
    setText((p) => [...p, textPick]);
    setTextPick('');
  };

  const removeColor = (i: number) =>
    setColor((p) => p.filter((_, idx) => idx !== i));
  const removeSize = (i: number) =>
    setSize((p) => p.filter((_, idx) => idx !== i));
  const removeShape = (i: number) =>
    setShape((p) => p.filter((_, idx) => idx !== i));
  const removeText = (i: number) =>
    setText((p) => p.filter((_, idx) => idx !== i));

  // Helper to render sections consistently
  const renderSection = (
    title: string,
    options: string[],
    pickerValue: string,
    setPicker: (v: string) => void,
    onAdd: () => void,
    items: string[],
    onRemove: (i: number) => void,
  ) => {
    return (
      <div>
        <div style={row}>
          <div style={label}>{title}</div>
          <select
            value={pickerValue}
            onChange={(e) => setPicker(e.target.value)}
            style={field}
          >
            <option value="">Select a field…</option>
            {options.map((n) => (
              <option key={`${title}-${n}`} value={n}>
                {n}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onAdd}
            disabled={!pickerValue}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #38bdf8',
              background: pickerValue ? '#38bdf8' : '#93c5fd',
              color: '#fff',
              cursor: pickerValue ? 'pointer' : 'not-allowed',
            }}
          >
            Add
          </button>
        </div>
        <div
          style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}
        >
          {items.length === 0 ? (
            <div style={{ fontSize: 12, opacity: 0.6 }}>
              (no {title.toLowerCase()} yet)
            </div>
          ) : (
            items.map((val, i) => (
              <span key={`${title}-item-${val}-${i}`} style={pill}>
                {val}
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  title="Remove"
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: 14,
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'grid', gap: 14, minWidth: 480 }}>
      {renderSection(
        'Color',
        colorOpts,
        colorPick,
        setColorPick,
        addColor,
        color,
        removeColor,
      )}
      {renderSection(
        'Size',
        sizeOpts,
        sizePick,
        setSizePick,
        addSize,
        size,
        removeSize,
      )}
      {renderSection(
        'Shape',
        shapeOpts,
        shapePick,
        setShapePick,
        addShape,
        shape,
        removeShape,
      )}
      {renderSection(
        'Text',
        textOpts,
        textPick,
        setTextPick,
        addText,
        text,
        removeText,
      )}

      {/* --- Show Me Hint --- */}
      <div
        style={{
          marginTop: 4,
          padding: 10,
          border: '1px solid #e5e7eb',
          borderRadius: 10,
          background: '#f8fafc',
        }}
      >
        <div
          style={{
            fontWeight: 700,
            fontSize: 13,
            color: '#0f172a',
            marginBottom: 6,
          }}
        >
          Show me{graphType ? ` — ${graphType}` : ''}
        </div>
        <ShowMeHint type={graphType} />
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button
          onClick={onCancel}
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            background: '#fff',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          onClick={() => onSave({ color, size, shape, text })}
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #38bdf8',
            background: '#38bdf8',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Save marks…
        </button>
      </div>
    </div>
  );
}
