/**
 * Window Component Types
 * 
 * Type definitions for the Window primitive component
 */

export type WindowContent = string | Node | Node[] | (() => Node | Node[]);

export interface WindowPosition {
  x: number;
  y: number;
}

export interface WindowSize {
  width: number;
  height: number;
}

export interface WindowBounds {
  minWidth: number;
  minHeight: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface WindowOptions {
  title?: string;
  content?: WindowContent;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  resizable?: boolean;
  draggable?: boolean;
  closable?: boolean;
  maximizable?: boolean;
  enableSnapToSidebar?: boolean;
  className?: string;
  onClose?: () => void;
  onMaximize?: () => void;
  onRestore?: () => void;
  onMove?: (position: WindowPosition) => void;
  onResize?: (size: WindowSize) => void;
  onSnapToSidebar?: (side: 'left' | 'right') => void;
  onUnsnapFromSidebar?: () => void;
}

export interface WindowHandle {
  element: HTMLDivElement;
  setTitle: (title: string) => void;
  setContent: (content: WindowContent) => void;
  setPosition: (x: number, y: number) => void;
  setSize: (width: number, height: number) => void;
  maximize: () => void;
  restore: () => void;
  close: () => void;
  destroy: () => void;
  isMaximized: () => boolean;
  isSnappedToSidebar: () => boolean;
  unsnapFromSidebar: () => void;
}

export interface WindowState {
  position: WindowPosition;
  size: WindowSize;
  isMaximized: boolean;
  isSnapped: boolean;
  snappedSide?: 'left' | 'right';
  beforeMaximize?: {
    position: WindowPosition;
    size: WindowSize;
  };
  beforeSnap?: {
    position: WindowPosition;
    size: WindowSize;
  };
}
