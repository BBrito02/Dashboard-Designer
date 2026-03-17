import EdgesMenu from './EdgesMenu';
import { SectionTitle, TypeField } from '../menus/sections';
import {
  LuMousePointer2,
  LuDatabase,
  LuSettings2,
  LuTag,
} from 'react-icons/lu';
import type { Edge as RFEdge } from 'reactflow';

export default function TooltipEdgeMenu({
  edge,
  sourceTitle,
  targetTitle,
  onDelete,
}: {
  edge: RFEdge<any>;
  sourceTitle: string;
  targetTitle: string;
  onDelete?: () => void;
}) {
  const data = edge.data || {};
  const activation = data.activation || 'hover';
  const attachRef = data.attachRef || 'viz';
  const attachValue = data.attachValue;

  // Format the activation text (e.g., 'hover' -> 'Hover')
  const formattedActivation =
    activation.charAt(0).toUpperCase() + activation.slice(1);

  // Strict labels for the attachment point
  const attachedToLabel = attachRef === 'viz' ? 'Component' : 'Data Attribute';

  const TriggerIcon = LuMousePointer2;
  const SourceIcon = LuTag;
  const TargetIcon = LuTag;
  const RefIcon = attachRef === 'viz' ? LuSettings2 : LuDatabase;

  return (
    <EdgesMenu>
      <div
        style={{
          fontWeight: 700,
          textAlign: 'center',
          marginBottom: 16,
          color: '#333',
          fontSize: '15px',
          padding: '0 36px',
          lineHeight: '1.3',
        }}
      >
        Tooltip Edge
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <SectionTitle>Configuration</SectionTitle>
        <TypeField
          value={formattedActivation}
          label="Trigger"
          icon={TriggerIcon}
        />
        <TypeField value={attachedToLabel} label="Attached To" icon={RefIcon} />
        {attachValue && (
          <TypeField
            value={attachValue}
            label="Required Value"
            icon={LuSettings2}
          />
        )}

        <SectionTitle>Connection Targets</SectionTitle>
        <TypeField value={sourceTitle} label="From" icon={SourceIcon} />
        <TypeField value={targetTitle} label="To" icon={TargetIcon} />
      </div>

      {onDelete && (
        <div style={{ marginTop: 'auto', paddingTop: 12 }}>
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
            Delete tooltip edge
          </button>
        </div>
      )}
    </EdgesMenu>
  );
}
