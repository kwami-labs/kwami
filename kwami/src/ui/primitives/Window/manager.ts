/**
 * Window Manager
 * 
 * Manages z-index ordering for multiple windows
 */

export interface ManagedWindow {
  element: HTMLDivElement;
  id: string;
}

class WindowManager {
  private windows: Map<string, ManagedWindow> = new Map();
  private baseZIndex = 9000;
  private nextId = 1;

  /**
   * Register a new window with the manager
   */
  register(element: HTMLDivElement): string {
    const id = `window-${this.nextId++}`;
    const window: ManagedWindow = { element, id };
    
    this.windows.set(id, window);
    this.bringToFront(id);
    
    // Add click listener to bring window to front
    element.addEventListener('mousedown', () => {
      this.bringToFront(id);
    });
    
    return id;
  }

  /**
   * Unregister a window from the manager
   */
  unregister(id: string): void {
    this.windows.delete(id);
    this.reorderWindows();
  }

  /**
   * Bring a window to the front
   */
  bringToFront(id: string): void {
    const window = this.windows.get(id);
    if (!window) return;

    // Move this window to the end of the map (highest z-index)
    this.windows.delete(id);
    this.windows.set(id, window);
    
    this.reorderWindows();
  }

  /**
   * Reorder all windows by their position in the map
   */
  private reorderWindows(): void {
    let zIndex = this.baseZIndex;
    
    this.windows.forEach((window) => {
      window.element.style.zIndex = String(zIndex++);
    });
  }

  /**
   * Get the current number of managed windows
   */
  getWindowCount(): number {
    return this.windows.size;
  }

  /**
   * Get all managed window IDs in order
   */
  getWindowIds(): string[] {
    return Array.from(this.windows.keys());
  }
}

// Singleton instance
let managerInstance: WindowManager | null = null;

/**
 * Get the global window manager instance
 */
export function getWindowManager(): WindowManager {
  if (!managerInstance) {
    managerInstance = new WindowManager();
  }
  return managerInstance;
}
