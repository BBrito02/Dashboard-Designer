import { useState, useMemo, useRef, useEffect } from 'react';
import type { Review } from '../../domain/types';
import {
  SectionTitle,
  NameField,
  ListSection,
  type StyledListItem,
} from '../menus/sections';
import {
  LuCheck,
  LuTrash2,
  LuPencil,
  LuX,
  LuSave,
  LuCornerDownRight,
  LuSend,
  LuUser,
} from 'react-icons/lu';

// --- PILL COMPONENTS ---
function PriorityPill({ level }: { level: Review['priority'] }) {
  const norm = String(level || '').toLowerCase();
  const styles =
    norm === 'high'
      ? { bg: '#fef2f2', br: '#fecaca', fg: '#991b1b' }
      : norm === 'medium'
        ? { bg: '#fffbeb', br: '#fde68a', fg: '#92400e' }
        : { bg: '#ecfdf5', br: '#a7f3d0', fg: '#065f46' };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 6px',
        fontSize: 9,
        fontWeight: 700,
        borderRadius: 999,
        background: styles.bg,
        border: `1px solid ${styles.br}`,
        color: styles.fg,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
        whiteSpace: 'nowrap',
      }}
    >
      {level}
    </span>
  );
}

export default function ReviewMenu({
  targetLabel,
  reviews,
  node,
  nodeNames,
  onCreate,
  onToggle,
  onDelete,
  onUpdate,
  onReply,
  onDeleteReply,
}: {
  targetLabel?: string;
  sourceLabel?: string;
  reviews: Review[];
  node?: any;
  nodeNames?: Record<string, string>;
  onNavigate?: (id: string) => void;
  onCreate: (
    text: string,
    priority: Review['priority'],
    author: string,
  ) => void;
  onToggle: (id: string, nextResolved: boolean) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, patch: Partial<Review>) => void;
  onReply: (reviewId: string, text: string, author: string) => void;
  onDeleteReply: (reviewId: string, replyId: string) => void;
}) {
  const [currentUser, setCurrentUser] = useState('');
  const [replyAuthor, setReplyAuthor] = useState('');

  // Add Form State
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<Review['priority']>('Medium');

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editPriority, setEditPriority] =
    useState<Review['priority']>('Medium');

  // Reply State
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Textarea Refs for Auto-resize
  const newReviewRef = useRef<HTMLTextAreaElement>(null);
  const editReviewRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize New Review Textarea
  useEffect(() => {
    if (newReviewRef.current) {
      newReviewRef.current.style.height = 'auto'; // Reset height to calculate scroll height
      newReviewRef.current.style.height = `${newReviewRef.current.scrollHeight}px`;
    }
  }, [text]);

  // Auto-resize Edit Review Textarea
  useEffect(() => {
    if (editReviewRef.current) {
      editReviewRef.current.style.height = 'auto';
      editReviewRef.current.style.height = `${editReviewRef.current.scrollHeight}px`;
    }
  }, [editText, editingId]); // Run when text changes or when entering edit mode

  const sorted = useMemo(() => {
    const list = [...reviews];
    list.sort((a, b) => {
      if (!!a.resolved !== !!b.resolved) return a.resolved ? 1 : -1;
      return b.createdAt - a.createdAt;
    });
    return list;
  }, [reviews]);

  const fieldLabel: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    fontWeight: 600,
    color: '#64748b',
    marginBottom: 4,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '6px 8px',
    borderRadius: 6,
    border: '1px solid #cbd5e1',
    fontSize: 12,
    background: '#fff',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const canSubmit = !!text.trim();

  // Edit Logic
  const startEdit = (r: Review) => {
    setEditingId(r.id);
    setEditPriority(r.priority || 'Medium');
    setEditText(r.text || '');
    setReplyingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
    setEditPriority('Medium');
  };

  const saveEdit = () => {
    if (!editingId) return;
    const t = editText.trim();
    if (!t) return;

    onUpdate(editingId, {
      text: t,
      priority: editPriority,
    });
    cancelEdit();
  };

  const submitReply = (reviewId: string) => {
    if (!replyText.trim()) return;
    onReply(reviewId, replyText, replyAuthor || 'Anonymous');
    setReplyText('');
    setReplyAuthor('');
    setReplyingId(null);
  };

  const canSaveEdit = !!editText.trim();

  // --- FORMAT INTERACTIONS FOR LIST SECTION ---
  const interactions = Array.isArray(node?.data?.interactions)
    ? (node.data.interactions as any[])
    : [];

  const interactionListItems: (StyledListItem & {
    _interactionId: string;
    _targetId?: string;
    _targetDataRef?: string;
  })[] = [];

  interactions.forEach((ix) => {
    if (ix.targetDetails && ix.targetDetails.length > 0) {
      ix.targetDetails.forEach((detail: any) => {
        const targetName =
          nodeNames?.[detail.targetId] || detail.targetId || 'Unknown';
        let subtitle = `Target: ${targetName}`;
        if (detail.targetDataRef) subtitle += ' (Data)';
        interactionListItems.push({
          name: ix.name,
          badge: ix.result,
          subtitle,
          _interactionId: ix.id,
          _targetId: detail.targetId,
          _targetDataRef: detail.targetDataRef,
        });
      });
    } else if (ix.targets && ix.targets.length > 0) {
      ix.targets.forEach((targetId: string) => {
        const targetName = nodeNames?.[targetId] || targetId;
        interactionListItems.push({
          name: ix.name,
          badge: ix.result,
          subtitle: `Target: ${targetName}`,
          _interactionId: ix.id,
          _targetId: targetId,
        });
      });
    } else {
      interactionListItems.push({
        name: ix.name,
        badge: ix.result,
        subtitle: '(No target)',
        _interactionId: ix.id,
      });
    }
  });

  return (
    <div style={{ paddingBottom: 20, width: '100%', boxSizing: 'border-box' }}>
      <div style={{ fontWeight: 700, textAlign: 'center', marginBottom: 12 }}>
        REVIEWS
      </div>

      <SectionTitle>Details</SectionTitle>
      <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
        <NameField
          label="Component"
          placeholder=""
          value={targetLabel ?? ''}
          onChange={() => {}}
          disabled
        />
      </div>

      {/* --- REPLACED WITH LIST SECTION --- */}
      {interactionListItems.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <ListSection
            title="Interaction list"
            items={interactionListItems}
            // --- DELETED onAdd and addTooltip PROPS FROM HERE ---

            onItemClick={(i) => {
              const item = interactionListItems[i];
              if (item) {
                window.dispatchEvent(
                  new CustomEvent('designer:select-interaction', {
                    detail: {
                      interactionId: item._interactionId,
                      targetId: item._targetId,
                      targetDataRef: item._targetDataRef,
                    },
                  }),
                );
              }
            }}
          />
        </div>
      )}

      <SectionTitle>Add Review</SectionTitle>
      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          padding: 12,
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'grid', gap: 10 }}>
          {/* Author Input */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <LuUser size={14} style={{ color: '#64748b', flexShrink: 0 }} />
            <input
              placeholder="Your Name (Optional)"
              value={currentUser}
              onChange={(e) => setCurrentUser(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                fontSize: 12,
                width: '100%',
                outline: 'none',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: 2,
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
            <div style={{ minWidth: 0 }}>
              <label style={fieldLabel}>Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                style={inputStyle}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
          </div>

          <textarea
            ref={newReviewRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="What should be improved?"
            style={{
              ...inputStyle,
              resize: 'none',
              overflow: 'hidden',
              fontFamily: 'inherit',
            }}
          />

          <button
            onClick={() => {
              const t = text.trim();
              if (!t) return;

              onCreate(t, priority, currentUser || 'Anonymous');
              setText('');
            }}
            disabled={!canSubmit}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: 6,
              border: 'none',
              background: canSubmit ? '#3b82f6' : '#93c5fd',
              color: '#fff',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              fontWeight: 600,
              fontSize: 12,
              boxSizing: 'border-box',
            }}
          >
            Add Review
          </button>
        </div>
      </div>

      <SectionTitle>Discussion</SectionTitle>
      <div style={{ display: 'grid', gap: 12 }}>
        {sorted.length === 0 && (
          <div
            style={{
              padding: 16,
              border: '1px dashed #cbd5e1',
              borderRadius: 10,
              background: '#fff',
              color: '#64748b',
              fontSize: 12,
              textAlign: 'center',
            }}
          >
            No reviews yet. Be the first!
          </div>
        )}

        {sorted.map((r) => {
          const isEditing = editingId === r.id;
          const isReplying = replyingId === r.id;

          return (
            <div
              key={r.id}
              style={{
                background: r.resolved ? '#f0fdf4' : '#fff',
                border: r.resolved ? '1px solid #86efac' : '1px solid #e2e8f0',
                borderRadius: 12,
                padding: 12,
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                transition: 'all 200ms ease',
                boxSizing: 'border-box',
                width: '100%',
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  gap: 6,
                  alignItems: 'center',
                  marginBottom: 8,
                  flexWrap: 'wrap',
                }}
              >
                <strong style={{ fontSize: 12, color: '#1e293b' }}>
                  {r.author || 'Anonymous'}
                </strong>
                {!isEditing && (
                  <>
                    <span style={{ color: '#cbd5e1' }}>•</span>
                    {r.priority && <PriorityPill level={r.priority} />}
                  </>
                )}
                <span
                  style={{ marginLeft: 'auto', fontSize: 10, color: '#94a3b8' }}
                >
                  {new Date(r.createdAt).toLocaleString(undefined, {
                    month: 'numeric',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {/* === MAIN CONTENT === */}
              {!isEditing ? (
                <div
                  style={{
                    color: r.resolved ? '#15803d' : '#334155',
                    fontSize: 13,
                    lineHeight: 1.5,
                    overflowWrap: 'anywhere',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {r.text}
                </div>
              ) : (
                // EDIT MODE UI
                <div
                  style={{
                    background: '#f8fafc',
                    padding: 8,
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    display: 'grid',
                    gap: 8,
                    boxSizing: 'border-box',
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr',
                      gap: 8,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <label style={fieldLabel}>Priority</label>
                      <select
                        value={editPriority}
                        onChange={(e) => setEditPriority(e.target.value as any)}
                        style={inputStyle}
                      >
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                      </select>
                    </div>
                  </div>

                  <textarea
                    ref={editReviewRef}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={3}
                    style={{
                      ...inputStyle,
                      resize: 'none',
                      overflow: 'hidden',
                    }}
                  />

                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <button
                      onClick={saveEdit}
                      disabled={!canSaveEdit}
                      style={{
                        flex: 1,
                        background: canSaveEdit ? '#3b82f6' : '#93c5fd',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        padding: '6px',
                        fontSize: 12,
                        cursor: canSaveEdit ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                      }}
                    >
                      <LuSave size={14} /> Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      style={{
                        flex: 1,
                        background: '#fff',
                        color: '#64748b',
                        border: '1px solid #cbd5e1',
                        borderRadius: 6,
                        padding: '6px',
                        fontSize: 12,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                      }}
                    >
                      <LuX size={14} /> Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* REPLIES SECTION */}
              {r.replies && r.replies.length > 0 && (
                <div
                  style={{
                    marginTop: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  {r.replies.map((reply) => (
                    <div
                      key={reply.id}
                      style={{
                        position: 'relative',
                        alignSelf: 'stretch',
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          background: '#f1f5f9',
                          color: '#334155',
                          padding: '8px 12px',
                          paddingRight: 24,
                          borderRadius: '12px',
                          borderTopLeftRadius: '2px',
                          fontSize: 12,
                          lineHeight: 1.4,
                          overflowWrap: 'anywhere',
                          wordBreak: 'break-word',
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        <strong
                          style={{
                            color: '#475569',
                            marginRight: 4,
                            fontSize: 11,
                          }}
                        >
                          {reply.author || 'User'}:
                        </strong>
                        {reply.text}
                      </div>
                      <button
                        onClick={() => onDeleteReply(r.id, reply.id)}
                        title="Delete reply"
                        style={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          border: 'none',
                          background: 'transparent',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          padding: 2,
                        }}
                      >
                        <LuX size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* REPLY INPUT */}
              {isReplying && (
                <div
                  style={{
                    marginTop: 10,
                    padding: 8,
                    background: '#f8fafc',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    boxSizing: 'border-box',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      marginBottom: 6,
                    }}
                  >
                    <LuUser size={12} color="#94a3b8" flex-shrink="0" />
                    <input
                      value={replyAuthor}
                      onChange={(e) => setReplyAuthor(e.target.value)}
                      placeholder="Your Name..."
                      style={{
                        border: 'none',
                        background: 'transparent',
                        fontSize: 11,
                        width: '100%',
                        outline: 'none',
                        color: '#334155',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      autoFocus
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a reply..."
                      style={{
                        flex: 1,
                        fontSize: 12,
                        padding: '6px 8px',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        outline: 'none',
                        boxSizing: 'border-box',
                        minWidth: 0,
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && submitReply(r.id)}
                    />
                    <button
                      onClick={() => submitReply(r.id)}
                      style={{
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        padding: '0 10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <LuSend size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* FOOTER ACTIONS */}
              {!isEditing && (
                <div
                  style={{
                    display: 'flex',
                    gap: 4,
                    marginTop: 12,
                    paddingTop: 8,
                    borderTop: '1px solid #f1f5f9',
                    flexWrap: 'wrap',
                  }}
                >
                  <button
                    onClick={() => onToggle(r.id, !r.resolved)}
                    style={{
                      flex: 1,
                      minWidth: '80px',
                      padding: '4px 8px',
                      borderRadius: 6,
                      border: r.resolved
                        ? '1px solid #86efac'
                        : '1px solid #cbd5e1',
                      background: r.resolved ? '#dcfce7' : '#fff',
                      color: r.resolved ? '#166534' : '#475569',
                      fontSize: 11,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      boxSizing: 'border-box',
                    }}
                  >
                    <LuCheck size={14} /> {r.resolved ? 'Resolved' : 'Resolve'}
                  </button>

                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      onClick={() => {
                        setReplyingId(isReplying ? null : r.id);
                        setReplyText('');
                        setReplyAuthor('');
                      }}
                      style={{
                        padding: 6,
                        borderRadius: 6,
                        border: '1px solid transparent',
                        background: isReplying ? '#f1f5f9' : 'transparent',
                        cursor: 'pointer',
                      }}
                      title="Reply"
                    >
                      <LuCornerDownRight size={16} color="#64748b" />
                    </button>

                    <button
                      onClick={() => startEdit(r)}
                      style={{
                        padding: 6,
                        borderRadius: 6,
                        border: '1px solid transparent',
                        background: 'transparent',
                        cursor: 'pointer',
                      }}
                      title="Edit"
                    >
                      <LuPencil size={15} color="#64748b" />
                    </button>

                    <button
                      onClick={() => onDelete(r.id)}
                      style={{
                        padding: 6,
                        borderRadius: 6,
                        border: '1px solid transparent',
                        background: 'transparent',
                        cursor: 'pointer',
                      }}
                      title="Delete"
                    >
                      <LuTrash2 size={16} color="#ef4444" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
