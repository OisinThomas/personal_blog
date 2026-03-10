'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getNodeByKey,
  $getNearestNodeFromDOMNode,
} from 'lexical';
import { GripVertical } from 'lucide-react';

const DRAG_DATA_FORMAT = 'application/x-lexical-drag-block';
const GUTTER_LEFT = 40; // how far left of the editor the handle zone extends

function getContentEditableElement(anchorElem: HTMLElement): HTMLElement | null {
  return anchorElem.querySelector('[contenteditable="true"]');
}

function getTopLevelBlockElement(
  contentEditable: HTMLElement,
  y: number
): HTMLElement | null {
  let closestElem: HTMLElement | null = null;
  let closestDistance = Infinity;

  const children = contentEditable.children;
  for (let i = 0; i < children.length; i++) {
    const child = children[i] as HTMLElement;
    const rect = child.getBoundingClientRect();
    const distance = Math.abs(y - (rect.top + rect.height / 2));
    if (distance < closestDistance) {
      closestDistance = distance;
      closestElem = child;
    }
  }

  if (closestElem) {
    const rect = closestElem.getBoundingClientRect();
    if (y < rect.top - 10 || y > rect.bottom + 10) return null;
  }

  return closestElem;
}

export default function DraggableBlockPlugin({
  anchorElem,
}: {
  anchorElem: HTMLElement | null;
}) {
  const [editor] = useLexicalComposerContext();
  const [mounted, setMounted] = useState(false);
  const [handlePosition, setHandlePosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [dragging, setDragging] = useState(false);
  const dragTargetRef = useRef<HTMLElement | null>(null);
  const dragNodeKeyRef = useRef<string | null>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const dropLineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getContentEditable = useCallback(() => {
    if (!anchorElem) return null;
    return getContentEditableElement(anchorElem);
  }, [anchorElem]);

  // Listen on document for mousemove so the handle doesn't vanish
  // when the user moves toward the gutter
  useEffect(() => {
    if (!anchorElem) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (dragging) return;

      // If the mouse is over the handle itself, keep it visible
      if (handleRef.current && handleRef.current.contains(e.target as Node)) {
        return;
      }

      const contentEditable = getContentEditable();
      if (!contentEditable) return;

      const editorRect = contentEditable.getBoundingClientRect();

      // Check if cursor is within the vertical bounds of the editor
      // and horizontally within (editor left - gutter) to (editor right)
      const inVertical = e.clientY >= editorRect.top && e.clientY <= editorRect.bottom;
      const inHorizontal =
        e.clientX >= editorRect.left - GUTTER_LEFT && e.clientX <= editorRect.right;

      if (!inVertical || !inHorizontal) {
        setHandlePosition(null);
        dragTargetRef.current = null;
        return;
      }

      const blockElem = getTopLevelBlockElement(contentEditable, e.clientY);
      if (blockElem) {
        const rect = blockElem.getBoundingClientRect();
        setHandlePosition({
          top: rect.top + rect.height / 2 - 12,
          left: editorRect.left - 28,
        });
        dragTargetRef.current = blockElem;

        // Pre-resolve the Lexical node key so dragstart can use it synchronously
        editor.read(() => {
          const node = $getNearestNodeFromDOMNode(blockElem);
          if (node) {
            let topNode = node;
            while (topNode.getParent() && topNode.getParent()?.getParent()) {
              topNode = topNode.getParent()!;
            }
            dragNodeKeyRef.current = topNode.getKey();
          } else {
            dragNodeKeyRef.current = null;
          }
        });
      } else {
        setHandlePosition(null);
        dragTargetRef.current = null;
        dragNodeKeyRef.current = null;
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [anchorElem, dragging, getContentEditable]);

  const handleDragStart = (e: React.DragEvent) => {
    if (!dragTargetRef.current || !dragNodeKeyRef.current) return;

    setDragging(true);

    e.dataTransfer.setDragImage(dragTargetRef.current, 0, 0);
    e.dataTransfer.setData(DRAG_DATA_FORMAT, dragNodeKeyRef.current);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDragging(false);
    if (dropLineRef.current) {
      dropLineRef.current.style.display = 'none';
    }
  };

  // Drag over and drop
  useEffect(() => {
    if (!anchorElem) return;

    const contentEditable = getContentEditable();
    if (!contentEditable) return;

    const handleDragOver = (e: DragEvent) => {
      if (!e.dataTransfer?.types.includes(DRAG_DATA_FORMAT)) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';

      const blockElem = getTopLevelBlockElement(contentEditable, e.clientY);
      if (blockElem && dropLineRef.current) {
        const rect = blockElem.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        const isAbove = e.clientY < midY;
        dropLineRef.current.style.display = 'block';
        dropLineRef.current.style.top = `${isAbove ? rect.top - 2 : rect.bottom + 2}px`;
        dropLineRef.current.style.left = `${rect.left}px`;
        dropLineRef.current.style.width = `${rect.width}px`;
      }
    };

    const handleDrop = (e: DragEvent) => {
      if (!e.dataTransfer?.types.includes(DRAG_DATA_FORMAT)) return;
      e.preventDefault();

      const draggedNodeKey = e.dataTransfer.getData(DRAG_DATA_FORMAT);
      if (!draggedNodeKey) return;

      const blockElem = getTopLevelBlockElement(contentEditable, e.clientY);
      if (!blockElem) return;

      // Resolve target node key via editor.read()
      let targetNodeKey: string | null = null;
      editor.read(() => {
        const targetDomNode = $getNearestNodeFromDOMNode(blockElem);
        if (!targetDomNode) return;
        let topNode = targetDomNode;
        while (topNode.getParent() && topNode.getParent()?.getParent()) {
          topNode = topNode.getParent()!;
        }
        targetNodeKey = topNode.getKey();
      });

      if (!targetNodeKey || targetNodeKey === draggedNodeKey) {
        setDragging(false);
        if (dropLineRef.current) dropLineRef.current.style.display = 'none';
        return;
      }

      const rect = blockElem.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      const isAbove = e.clientY < midY;

      editor.update(() => {
        const draggedNode = $getNodeByKey(draggedNodeKey);
        const targetNode = $getNodeByKey(targetNodeKey!);
        if (!draggedNode || !targetNode) return;

        draggedNode.remove();
        if (isAbove) {
          targetNode.insertBefore(draggedNode);
        } else {
          targetNode.insertAfter(draggedNode);
        }
      });

      setDragging(false);
      if (dropLineRef.current) {
        dropLineRef.current.style.display = 'none';
      }
    };

    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDrop);
    };
  }, [anchorElem, editor, getContentEditable]);

  if (!mounted) return null;

  return createPortal(
    <>
      {handlePosition && (
        <div
          ref={handleRef}
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          className="fixed z-40 cursor-grab active:cursor-grabbing p-1 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors shadow-sm"
          style={{ top: handlePosition.top, left: handlePosition.left }}
        >
          <GripVertical className="w-4 h-4" />
        </div>
      )}
      <div
        ref={dropLineRef}
        className="fixed z-50 h-0.5 bg-blue-500 pointer-events-none"
        style={{ display: 'none' }}
      />
    </>,
    document.body
  );
}
