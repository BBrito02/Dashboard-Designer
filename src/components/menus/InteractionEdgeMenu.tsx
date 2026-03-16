// src/components/menus/InteractionEdgeMenu.tsx
import type { Edge as RFEdge } from 'reactflow';
import EdgesMenu from './EdgesMenu';
import { TypeField, SectionTitle } from './sections';
import type { IconType } from 'react-icons';
import {
  // Visualization
  LuLayoutDashboard,
  LuChartColumnDecreasing,
  LuInfo,
  LuList,
  // Interaction
  LuMousePointerClick,
  LuFilter,
  LuSlidersHorizontal,
  LuZap,
  // Layout
  LuImageOff,
  // Extras for logic
  LuMousePointer2, // Hover
  LuTag, // Fallback
  LuArrowRight, // Navigate result
  LuRefreshCw, // Reset/Update result
} from 'react-icons/lu';

import { FaHighlighter } from 'react-icons/fa';

type AppEdge = RFEdge<any>;

type Props = {
  edge: AppEdge;
  sourceTitle?: string;
  targetTitle?: string;
  onDelete?: () => void;
};

// Map based on your SideMenu items + common Result types
const ICON_MAP: Record<string, IconType> = {
  // --- SideMenu Types ---
  Dashboard: LuLayoutDashboard,
  Visualization: LuChartColumnDecreasing,
  Tooltip: LuInfo,
  Legend: LuList,
  Button: LuMousePointerClick,
  Filter: LuFilter,
  Highlight: FaHighlighter,
  Parameter: LuSlidersHorizontal,
  Action: LuZap,
  Placeholder: LuImageOff,

  // --- Interaction Results ---
  Navigate: LuArrowRight,
  Reset: LuRefreshCw,
  // 'Filter' matches the SideMenu type above
  // 'Action' matches the SideMenu type above
};

// Simple helper to capitalize the first letter
const capitalize = (s: string) =>
  typeof s === 'string' && s.length > 0
    ? s.charAt(0).toUpperCase() + s.slice(1)
    : s;

export default function InteractionEdgeMenu({
  edge,
  sourceTitle,
  targetTitle,
  onDelete,
}: Props) {
  const data = (edge.data || {}) as any;

  const label = data.label ?? '';
  const trigger = capitalize(data.trigger ?? data.activation ?? 'click');
  const sourceHandle = data.sourceHandle ?? '';
  const sourceDataRef = data.sourceDataRef ?? '';
  const result = capitalize(data.result ?? 'filter');

  const fromLabel = sourceTitle ?? edge.source;
  const toLabel = targetTitle ?? edge.target;

  // --- Icon Logic ---

  // Helper to find icon by string (e.g. "Button")
  const getIcon = (text: string): IconType => {
    // try exact match, then capitalized match, then default
    return ICON_MAP[text] || ICON_MAP[capitalize(text)] || LuTag;
  };

  const SourceIcon = getIcon(fromLabel);
  const TargetIcon = getIcon(toLabel);
  const ResultIcon = getIcon(result);

  // Special logic for Trigger (Click vs Hover)
  const TriggerIcon =
    trigger.toLowerCase() === 'hover' ? LuMousePointer2 : LuMousePointerClick;

  // ------------------

  const technicalItems: string[] = [`Edge id · ${edge.id}`];
  if (label) technicalItems.push(`Label · ${label}`);
  if (sourceHandle) technicalItems.push(`Source handle · ${sourceHandle}`);
  if (sourceDataRef) technicalItems.push(`Source data attr · ${sourceDataRef}`);

  return (
    <EdgesMenu>
      <div
        style={{
          fontWeight: 700,
          textAlign: 'center',
          marginBottom: 16, // slightly increased bottom margin for breathing room
          color: '#333',
          fontSize: '15px',
          padding: '0 36px', // <-- THIS is the fix: adds 36px of empty space on the left and right
          lineHeight: '1.3', // Keeps the spacing looking good if the title wraps to two lines
        }}
      >
        {label ? label : 'Interaction Edge'}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <SectionTitle>Configuration</SectionTitle>

        {/* Shows the custom name of the interaction if it exists */}
        {label && <TypeField value={label} label="Name" icon={LuTag} />}

        <TypeField value={trigger} label="Trigger" icon={TriggerIcon} />
        <TypeField value={result} label="Result" icon={ResultIcon} />

        <SectionTitle>Connection Targets</SectionTitle>
        <TypeField value={fromLabel} label="From" icon={SourceIcon} />
        <TypeField value={toLabel} label="To" icon={TargetIcon} />
      </div>

      {onDelete && (
        <div
          style={{
            marginTop: 'auto',
            paddingTop: 12,
          }}
        >
          <button
            type="button"
            onClick={onDelete}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: 8,
              border: '1px solid #ef4444',
              background: 'white',
              color: '#ef4444',
              fontSize: 13,
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Delete interaction edge
          </button>
        </div>
      )}
    </EdgesMenu>
  );
}
