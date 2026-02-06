import { useDraggable, useDroppable } from '@dnd-kit/core';
import type { IconType } from 'react-icons';
import { useState, useMemo } from 'react';
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
  LuMessageSquare,
  LuCheck,
  LuTrash2,
} from 'react-icons/lu';
import { SectionTitle } from './sections';
import type { NodeKind, Review } from '../../domain/types';

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
  disabled,
}: {
  payload: DragData;
  label: string;
  Icon: IconType;
  disabled?: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${payload.kind}`,
    data: payload,
    disabled,
  });

  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      type="button"
      disabled={disabled}
      title={disabled ? 'Locked in Review Mode' : `Drag ${label}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: '100%',
        height: TILE_H,
        boxSizing: 'border-box',
        cursor: disabled ? 'not-allowed' : 'grab',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        background: disabled ? '#f8fafc' : isHovered ? '#f8fafc' : '#ffffff',
        border: disabled
          ? '1px dashed #cbd5e1'
          : isHovered
            ? '1px solid #94a3b8'
            : '1px solid #e2e8f0',
        borderRadius: 12,
        boxShadow: disabled
          ? 'none'
          : isHovered
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
            : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 12,
        opacity: isDragging ? 0.5 : disabled ? 0.6 : 1,
        transition: 'all 0.2s ease',
        transform:
          isHovered && !isDragging && !disabled ? 'translateY(-1px)' : 'none',
      }}
    >
      <div
        style={{
          color: disabled ? '#94a3b8' : isHovered ? '#0f172a' : '#64748b',
          transition: 'color 0.2s ease',
        }}
      >
        <Icon size={22} strokeWidth={1.5} />
      </div>
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: disabled ? '#94a3b8' : '#334155',
          lineHeight: 1.2,
          textAlign: 'center',
        }}
      >
        {label}
      </span>
    </button>
  );
}

// --- NEW COMPONENT: TRASH ZONE ---
function TrashZone() {
  const { setNodeRef, isOver } = useDroppable({
    id: 'TRASH_ZONE',
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        margin: '12px 24px 20px',
        height: 140, // Increased height (was 64)
        borderRadius: 12,
        border: '2px dashed',
        borderColor: isOver ? '#ef4444' : '#cbd5e1',
        background: isOver ? '#fef2f2' : 'transparent',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        color: isOver ? '#ef4444' : '#94a3b8',
        fontSize: 12,
        fontWeight: 600,
        transition: 'all 0.2s ease',
        flexShrink: 0,
      }}
    >
      <LuTrash2 size={24} />
      <span>{isOver ? 'Release to Cancel' : 'Drop here to cancel'}</span>
    </div>
  );
}

type SideMenuProps = {
  isOpen: boolean;
  onToggle: () => void;
  reviewMode?: boolean;
  reviewsByTarget?: Record<string, Review[]>;
  nodeNames?: Record<string, string>;
  onSelectTarget?: (id: string) => void;
  nodes?: any[];
  edges?: any[];
  isDragging?: boolean;
};

export default function SideMenu({
  isOpen,
  onToggle,
  reviewMode,
  reviewsByTarget = {},
  nodeNames = {},
  onSelectTarget,
  nodes = [],
  edges = [],
  isDragging = false,
}: SideMenuProps) {
  const collapsed = !isOpen;
  const width = collapsed ? 0 : SIDEBAR_W;

  const allReviews = useMemo(() => {
    if (!reviewMode) return [];

    const list: {
      review: Review;
      targetId: string;
      targetName: string;
    }[] = [];

    Object.entries(reviewsByTarget).forEach(([targetId, reviews]) => {
      let name = nodeNames[targetId] || 'Unknown';

      // 1. Check if it's a Node to add context
      const node = nodes.find((n) => n.id === targetId);
      if (node) {
        if (node.data.kind === 'Graph' && node.data.graphType) {
          name = `${name} • ${node.data.graphType}`;
        }
      }
      // 2. Check if it's an Edge
      else {
        const edge = edges.find((e) => e.id === targetId);
        if (edge) {
          const type = edge.type
            ? edge.type.charAt(0).toUpperCase() + edge.type.slice(1)
            : 'Generic';
          name = `Edge • ${type}`;
        }
      }

      reviews.forEach((r) => {
        list.push({
          review: r,
          targetId,
          targetName: name,
        });
      });
    });

    return list.sort((a, b) => {
      if (a.review.resolved !== b.review.resolved) {
        return a.review.resolved ? 1 : -1;
      }
      return b.review.createdAt - a.review.createdAt;
    });
  }, [reviewMode, reviewsByTarget, nodeNames, nodes, edges]);

  const stopEvents = (e: React.SyntheticEvent) => {
    e.stopPropagation();
  };

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
        onClick={stopEvents}
        onMouseDown={stopEvents}
        onPointerDown={stopEvents}
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
          overflow: 'hidden', // Changed from auto to hidden to manage flex children
          transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          zIndex: 50,
          boxShadow: collapsed ? 'none' : '0 4px 12px rgba(0,0,0,0.03)',
          pointerEvents: 'auto',
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
              flexShrink: 0,
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                letterSpacing: '-0.025em',
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {reviewMode ? (
                <>
                  <LuMessageSquare size={20} color="#64748b" />
                  <span>Review List</span>
                </>
              ) : (
                'Components'
              )}
            </div>
            <button
              type="button"
              onClick={onToggle}
              title="Collapse menu"
              style={toggleButtonStyle}
            >
              <LuPanelLeftClose size={16} />
            </button>
          </div>
        )}

        {/* Content Area - Scrollable */}
        {!collapsed && (
          <div
            style={{
              padding: '0 24px 20px',
              opacity: collapsed ? 0 : 1,
              transition: 'opacity 150ms ease',
              flex: 1, // Takes remaining height
              overflowY: 'auto', // Scroll happens here
            }}
          >
            {reviewMode ? (
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
              >
                {allReviews.length === 0 && (
                  <div
                    style={{
                      padding: 20,
                      textAlign: 'center',
                      color: '#94a3b8',
                      fontSize: 13,
                      fontStyle: 'italic',
                      border: '1px dashed #e2e8f0',
                      borderRadius: 12,
                    }}
                  >
                    No reviews yet. Click on any component to leave a comment.
                  </div>
                )}

                {allReviews.map(({ review, targetId, targetName }) => (
                  <button
                    key={review.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTarget?.(targetId);
                    }}
                    style={{
                      appearance: 'none',
                      background: '#fff',
                      border: review.resolved
                        ? '1px solid #86efac'
                        : '1px solid #fca5a5',
                      borderLeft: review.resolved
                        ? '4px solid #22c55e'
                        : '4px solid #ef4444',
                      borderRadius: 8,
                      padding: '12px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      transition: 'transform 0.1s, box-shadow 0.1s',
                      width: '100%',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow =
                        '0 4px 6px rgba(0,0,0,0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow =
                        '0 1px 2px rgba(0,0,0,0.05)';
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          overflow: 'hidden',
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: '#64748b',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {targetName}
                        </span>
                      </div>
                      {review.resolved && (
                        <LuCheck
                          size={14}
                          color="#22c55e"
                          title="Resolved"
                          style={{ flexShrink: 0 }}
                        />
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: '#334155',
                        fontWeight: 500,
                        lineHeight: 1.4,
                      }}
                    >
                      {review.text}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: '#94a3b8',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>{review.author || 'Anonymous'}</span>
                      <span>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              SECTIONS.map((sec) => (
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
                        disabled={reviewMode}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* --- TRASH ZONE (Visible in Editor Mode) --- */}
        {!collapsed && !reviewMode && isDragging && <TrashZone />}
      </aside>

      {collapsed && (
        <button
          type="button"
          onClick={onToggle}
          title={reviewMode ? 'Show Reviews' : 'Expand component menu'}
          style={{
            ...toggleButtonStyle,
            position: 'absolute',
            left: MARGIN,
            top: 20,
            zIndex: 50,
          }}
        >
          {reviewMode ? (
            <LuMessageSquare size={16} color="#64748b" />
          ) : (
            <LuPanelRightClose size={16} />
          )}
        </button>
      )}
    </>
  );
}
