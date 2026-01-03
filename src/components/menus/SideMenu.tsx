import { useDraggable } from '@dnd-kit/core';
import type { IconType } from 'react-icons';
import { useState } from 'react'; // Only for hover states now
import {
  LuLayoutDashboard,
  LuList,
  LuMousePointerClick,
  LuFilter,
  LuSlidersHorizontal,
  LuImageOff,
  LuChartColumnDecreasing,
  LuPanelLeftClose,
  LuPanelRightClose,
} from 'react-icons/lu';
import { SectionTitle } from './sections';
import type { NodeKind } from '../../domain/types';

export type DragData = { kind: NodeKind; title?: string };

// ---- layout constants ----
const SIDEBAR_W = 260;
const TILE_H = 80;
const MARGIN = 7;

type Section = {
  title: string;
  items: Array<{ kind: NodeKind; label: string; Icon: IconType }>;
};

const SECTIONS: Section[] = [
  {
    title: 'Visualization',
    items: [
      { kind: 'Dashboard', label: 'Dashboard', Icon: LuLayoutDashboard },
      {
        kind: 'Visualization',
        label: 'Visualization',
        Icon: LuChartColumnDecreasing,
      },
      { kind: 'Legend', label: 'Legend', Icon: LuList },
    ],
  },
  {
    title: 'Interaction',
    items: [
      { kind: 'Button', label: 'Button', Icon: LuMousePointerClick },
      { kind: 'Filter', label: 'Filter', Icon: LuFilter },
      { kind: 'Parameter', label: 'Parameter', Icon: LuSlidersHorizontal },
    ],
  },
  {
    title: 'Layout',
    items: [{ kind: 'Placeholder', label: 'Placeholder', Icon: LuImageOff }],
  },
];

function PaletteTile({
  payload,
  label,
  Icon,
}: {
  payload: DragData;
  label: string;
  Icon: IconType;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${payload.kind}`,
    data: payload,
  });

  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      type="button"
      title={`Drag ${label}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: '100%',
        height: TILE_H,
        boxSizing: 'border-box',
        cursor: 'grab',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        background: isHovered ? '#f8fafc' : '#ffffff',
        border: isHovered ? '1px solid #94a3b8' : '1px solid #e2e8f0',
        borderRadius: 12,
        boxShadow: isHovered
          ? '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
          : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 12,
        opacity: isDragging ? 0.5 : 1,
        transition: 'all 0.2s ease',
        transform: isHovered && !isDragging ? 'translateY(-1px)' : 'none',
      }}
    >
      <div
        style={{
          color: isHovered ? '#0f172a' : '#64748b',
          transition: 'color 0.2s ease',
        }}
      >
        <Icon size={22} strokeWidth={1.5} />
      </div>
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: '#334155',
          lineHeight: 1.2,
          textAlign: 'center',
        }}
      >
        {label}
      </span>
    </button>
  );
}

// 1. Define Props
type SideMenuProps = {
  isOpen: boolean;
  onToggle: () => void;
};

// 2. Accept Props
export default function SideMenu({ isOpen, onToggle }: SideMenuProps) {
  // 3. Derive internal variables from props
  const collapsed = !isOpen;
  const width = collapsed ? 0 : SIDEBAR_W;

  const toggleButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: 6,
    right: collapsed ? -38 : 8,
    width: 32,
    height: 32,
    borderRadius: 10,
    border: '1px solid #e5e7eb',
    background: '#fff',
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 2000,
  };

  return (
    <>
      <aside
        className="sidebar no-scrollbar"
        style={{
          width,
          height: collapsed ? 0 : `calc(100vh - ${MARGIN * 2}px)`,
          marginTop: collapsed ? 0 : MARGIN,
          marginBottom: collapsed ? 0 : MARGIN,
          marginLeft: collapsed ? 0 : MARGIN,
          background: '#fafafa',
          border: collapsed ? 'none' : '1px solid #e2e8f0',
          borderRadius: collapsed ? 0 : 20,
          display: 'flex',
          flexDirection: 'column',
          overflowY: collapsed ? 'hidden' : 'auto',
          overflowX: 'hidden',
          transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          zIndex: 50,
          boxShadow: collapsed ? 'none' : '0 4px 12px rgba(0,0,0,0.03)',
        }}
      >
        {!collapsed && (
          <div
            style={{
              padding: '20px 24px 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
              position: 'sticky',
              top: 0,
              background: '#fafafa',
              zIndex: 10,
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                letterSpacing: '-0.025em',
                color: '#0f172a',
              }}
            >
              Components
            </div>
            <button
              type="button"
              onClick={onToggle}
              title="Collapse component menu"
              style={toggleButtonStyle}
            >
              <LuPanelLeftClose size={16} />
            </button>
          </div>
        )}

        {!collapsed && (
          <div
            style={{
              padding: '0 24px 20px',
              opacity: collapsed ? 0 : 1,
              transition: 'opacity 150ms ease',
            }}
          >
            {SECTIONS.map((sec) => (
              <div key={sec.title} style={{ marginBottom: 28 }}>
                <SectionTitle>{sec.title}</SectionTitle>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 12,
                  }}
                >
                  {sec.items.map((it) => (
                    <PaletteTile
                      key={it.kind}
                      payload={{ kind: it.kind }}
                      label={it.label}
                      Icon={it.Icon}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </aside>

      {collapsed && (
        <button
          type="button"
          onClick={onToggle}
          title="Expand component menu"
          style={{
            ...toggleButtonStyle,
            position: 'absolute',
            left: MARGIN,
            top: 20,
            zIndex: 50,
          }}
        >
          <LuPanelRightClose size={16} />
        </button>
      )}
    </>
  );
}
