import { useState, useRef } from 'react';
import type { Dispatch, SetStateAction, RefObject } from 'react';
import {
  useSensors,
  useSensor,
  PointerSensor,
  type DragStartEvent,
  type DragMoveEvent,
  type DragCancelEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { nanoid } from 'nanoid';
import type { ReactFlowInstance, Node as RFNode } from 'reactflow';
import type { NodeData, NodeKind } from '../domain/types';
import { allowedChildKinds } from '../domain/rules';
import { nextBadgeFor } from '../domain/types';
import type { DragData } from '../components/menus/SideMenu';
import { depthOf, getAbsolutePosition } from '../domain/layoutUtils';

type AppNode = RFNode<NodeData>;

function nodeTypeFor(kind: NodeKind): string {
  switch (kind) {
    case 'Dashboard':
      return 'dashboard';
    case 'Visualization':
      return 'visualization';
    case 'Tooltip':
      return 'tooltip';
    case 'Legend':
      return 'legend';
    case 'Button':
      return 'button';
    case 'Filter':
      return 'filter';
    case 'Parameter':
      return 'parameter';
    case 'Placeholder':
      return 'placeholder';
    case 'Graph':
      return 'graph';
    default:
      return 'visualization';
  }
}

export function useCanvasDrag(
  nodes: AppNode[],
  setNodes: Dispatch<SetStateAction<AppNode[]>>,
  takeSnapshot: () => void,
  rf: ReactFlowInstance | null,
  wrapperRef: RefObject<HTMLDivElement | null>,
  onDropInParent: (
    parentId: string,
    kind: NodeKind,
    position?: { x: number; y: number },
  ) => void,
) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const [isDraggingFromPalette, setIsDraggingFromPalette] = useState(false);
  const [dragPreview, setDragPreview] = useState<DragData | null>(null);
  const [dragStartPoint, setDragStartPoint] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [, setCursorPoint] = useState<{ x: number; y: number } | null>(null);
  const [dragTargetParentId, setDragTargetParentId] = useState<string | null>(
    null,
  );
  const [dragAllowed, setDragAllowed] = useState(false);
  const [cachedContainers, setCachedContainers] = useState<AppNode[]>([]);

  // Track the last dispatched target to prevent redundant event firings
  const lastTargetRef = useRef<{ id: string | null; allowed: boolean }>({
    id: null,
    allowed: false,
  });

  function getPointFromEvent(ev: Event): { x: number; y: number } | null {
    if ('clientX' in ev && 'clientY' in ev) {
      const e = ev as unknown as { clientX: number; clientY: number };
      return { x: e.clientX, y: e.clientY };
    }
    if ('touches' in ev && (ev as TouchEvent).touches[0]) {
      const t = (ev as TouchEvent).touches[0];
      return { x: t.clientX, y: t.clientY };
    }
    return null;
  }

  function getDragCenter(e: DragEndEvent): { x: number; y: number } | null {
    const { current } = e.active.rect;
    if (current.translated) {
      const { left, top, width, height } = current.translated;
      return { x: left + width / 2, y: top + height / 2 };
    }
    if (current.initial) {
      const { left, top, width, height } = current.initial;
      return {
        x: left + e.delta.x + width / 2,
        y: top + e.delta.y + height / 2,
      };
    }
    return null;
  }

  const handleDragStart = (e: DragStartEvent) => {
    setIsDraggingFromPalette(true);
    setDragPreview((e.active.data.current as DragData) ?? null);
    const p = getPointFromEvent(e.activatorEvent);
    setDragStartPoint(p);
    setCursorPoint(p);

    const targetableNodes = nodes.filter((n) => !n.hidden);
    setCachedContainers(targetableNodes);
  };

  const handleDragMove = (e: DragMoveEvent) => {
    if (!dragStartPoint) return;

    const nextCursor = {
      x: dragStartPoint.x + e.delta.x,
      y: dragStartPoint.y + e.delta.y,
    };
    setCursorPoint(nextCursor);
    if (!rf || !wrapperRef.current) return;

    const flowPt = rf.screenToFlowPosition({
      x: nextCursor.x,
      y: nextCursor.y,
    });

    let best: { id: string; kind: NodeKind; depth: number } | null = null;

    for (const n of cachedContainers) {
      const abs = getAbsolutePosition(n, nodes);
      const w = n.width ?? (n.style?.width as number) ?? 0;
      const h = n.height ?? (n.style?.height as number) ?? 0;

      if (
        flowPt.x >= abs.x &&
        flowPt.x <= abs.x + w &&
        flowPt.y >= abs.y &&
        flowPt.y <= abs.y + h
      ) {
        const d = depthOf(n, nodes);
        if (!best || d >= best.depth) {
          best = { id: n.id, kind: n.data.kind!, depth: d };
        }
      }
    }

    const payload = e.active?.data?.current as DragData | undefined;
    const childKind = payload?.kind as NodeKind | undefined;

    let targetParentId: string | null = null;
    let isAllowed = false;

    if (best && childKind) {
      let currentId: string | undefined = best.id;
      let foundAllowed = false;

      while (currentId) {
        const currentNode = cachedContainers.find((n) => n.id === currentId);
        if (!currentNode) break;

        const currentKind = currentNode.data.kind;
        if (currentKind && allowedChildKinds(currentKind).includes(childKind)) {
          targetParentId = currentId;
          foundAllowed = true;
          break;
        }
        currentId = currentNode.parentNode;
      }

      if (foundAllowed) {
        isAllowed = true;
      } else {
        targetParentId = best.id;
        isAllowed = false;
      }
    }

    // Dispatch event to inform specific nodes of their drag-over status
    if (
      lastTargetRef.current.id !== targetParentId ||
      lastTargetRef.current.allowed !== isAllowed
    ) {
      lastTargetRef.current = { id: targetParentId, allowed: isAllowed };
      window.dispatchEvent(
        new CustomEvent('designer:drag-target', {
          detail: { targetId: targetParentId, allowed: isAllowed },
        }),
      );
    }

    setDragTargetParentId(targetParentId);
    setDragAllowed(isAllowed);

    if (targetParentId) {
      document.body.style.cursor = isAllowed ? 'copy' : 'not-allowed';
    } else {
      document.body.style.cursor = 'grabbing';
    }
  };

  const clearDragState = () => {
    setIsDraggingFromPalette(false);
    setDragPreview(null);
    setDragStartPoint(null);
    setCursorPoint(null);
    setDragTargetParentId(null);
    setDragAllowed(false);
    document.body.style.cursor = '';

    if (lastTargetRef.current.id !== null) {
      lastTargetRef.current = { id: null, allowed: false };
      window.dispatchEvent(
        new CustomEvent('designer:drag-target', {
          detail: { targetId: null, allowed: false },
        }),
      );
    }
  };

  const handleDragCancel = (_e: DragCancelEvent) => {
    clearDragState();
  };

  const handleDragEnd = (e: DragEndEvent) => {
    if (e.over && e.over.id === 'TRASH_ZONE') {
      clearDragState();
      return;
    }

    const payload = e.active.data.current as DragData | undefined;
    const parentId = dragTargetParentId;
    const allowed = dragAllowed;

    clearDragState(); // Resets tracking state, events, and cursors

    if (!payload || !rf || !wrapperRef.current) return;

    const viewportPt = dragStartPoint
      ? { x: dragStartPoint.x + e.delta.x, y: dragStartPoint.y + e.delta.y }
      : getDragCenter(e) || { x: 0, y: 0 };

    const flowCenter = rf.screenToFlowPosition({
      x: viewportPt.x,
      y: viewportPt.y,
    });

    if (parentId) {
      if (allowed) {
        const parentNode = nodes.find((n) => n.id === parentId);
        if (parentNode) {
          const abs = getAbsolutePosition(parentNode, nodes);
          const relX = flowCenter.x - abs.x;
          const relY = flowCenter.y - abs.y;
          onDropInParent(parentId, payload.kind as NodeKind, {
            x: relX,
            y: relY,
          });
        } else {
          onDropInParent(parentId, payload.kind as NodeKind);
        }
      }
      return;
    }

    takeSnapshot();

    let data: NodeData;
    if (payload.kind === 'Graph') {
      data = {
        kind: 'Graph',
        title: payload.title ?? 'Graph',
        graphType: 'Line',
      };
    } else {
      data = {
        kind: payload.kind,
        title: payload.title ?? payload.kind,
      } as NodeData;
    }

    const defaultSizeFor = (kind: NodeKind) => {
      if (kind === 'Dashboard') return { width: 700, height: 380 };
      if (kind === 'Visualization') return { width: 320, height: 200 };
      return { width: 180, height: 100 };
    };
    const size = defaultSizeFor(data.kind);

    const position = {
      x: flowCenter.x - size.width / 2,
      y: flowCenter.y - size.height / 2,
    };

    setNodes((nds) =>
      nds.concat({
        id: nanoid(),
        type: nodeTypeFor(data.kind) as any,
        position,
        data: { ...data, badge: nextBadgeFor(data.kind, nds) },
        style: size,
      } as AppNode),
    );
  };

  return {
    sensors,
    isDraggingFromPalette,
    dragPreview,
    handleDragStart,
    handleDragMove,
    handleDragCancel,
    handleDragEnd,
    dragTargetParentId,
  };
}
