/**
 * Window Component Test
 * 
 * Test and demo for the new Window primitive component
 */

import { createWindow, createButton } from 'kwami/ui';

export function initWindowTest() {
  // Create a button to open test windows
  const openButton = createButton({
    label: 'Open Test Window',
    variant: 'primary',
    onClick: () => openTestWindow(),
  });

  // Position button in top-right
  Object.assign(openButton.element.style, {
    position: 'fixed',
    top: '200px',
    right: '200px',
    zIndex: '10000',
  });

  document.body.appendChild(openButton.element);
}

function openTestWindow() {
  // Create test content
  const contentDiv = document.createElement('div');
  contentDiv.innerHTML = `
    <h3 style="margin: 0 0 1em 0;">Window Component Demo</h3>
    <p>This is a fully functional window component with:</p>
    <ul style="margin: 1em 0; padding-left: 1.5em;">
      <li>✓ Drag to move (grab the title bar)</li>
      <li>✓ Resize handles on all edges and corners</li>
      <li>✓ Maximize/restore button</li>
      <li>✓ Close button</li>
      <li>✓ Boundary constraints (stays on screen)</li>
      <li>✓ Minimum size constraints</li>
      <li>✓ Snap to sidebar (NEW!)</li>
    </ul>
    <p style="margin-top: 1.5em;"><strong>Try it out:</strong></p>
    <ul style="padding-left: 1.5em;">
      <li>Drag the window around by the title bar</li>
      <li>Resize from any edge or corner</li>
      <li>Click maximize (□) to fill the screen</li>
      <li>Click restore (⊡) to return to original size</li>
      <li>Click close (✕) to close the window</li>
    </ul>
    <p style="margin-top: 1.5em; padding: 1em; background: rgba(100, 255, 150, 0.1); border-radius: 8px;">
      <strong>🎯 Snap to Sidebar:</strong> Drag the window to the <strong>left</strong> or 
      <strong>right edge</strong> of the screen and hold for 2 seconds. Watch the visual 
      preview with rotating indicator, then see it expand and snap into a sidebar!
    </p>
  `;

  // Create test buttons inside window
  const buttonsDiv = document.createElement('div');
  Object.assign(buttonsDiv.style, {
    display: 'flex',
    gap: '10px',
    marginTop: '1.5em',
    flexWrap: 'wrap',
  });

  // Button to create another window
  const newWindowBtn = createButton({
    label: 'Open Another Window',
    variant: 'secondary',
    onClick: () => openAnotherWindow(),
  });
  buttonsDiv.appendChild(newWindowBtn.element);

  // Button to log window state
  const logStateBtn = createButton({
    label: 'Log Window State',
    variant: 'secondary',
    // onClick: () => {
    //   console.log('Window maximized:', window1.isMaximized());
    //   console.log('Window snapped:', window1.isSnappedToSidebar());
    //   console.log('Window element:', window1.element);
    // },
  });
  buttonsDiv.appendChild(logStateBtn.element);

  // Button to unsnap from sidebar
  const unsnapBtn = createButton({
    label: 'Unsnap from Sidebar',
    variant: 'secondary',
    onClick: () => {
      window1.unsnapFromSidebar();
    },
  });
  buttonsDiv.appendChild(unsnapBtn.element);

  contentDiv.appendChild(buttonsDiv);

  // Create window with all features enabled
  const window1 = createWindow({
    title: 'Test Window',
    content: contentDiv,
    x: 150,
    y: 150,
    width: 600,
    height: 500,
    minWidth: 400,
    minHeight: 300,
    resizable: true,
    draggable: true,
    closable: true,
    maximizable: true,
    // onClose: () => {
    //   console.log('Window closed');
    // },
    // onMaximize: () => {
    //   console.log('Window maximized');
    // },
    // onRestore: () => {
    //   console.log('Window restored');
    // },
    // onMove: (pos) => {
    //   console.log('Window moved to:', pos);
    // },
    // onResize: (size) => {
    //   console.log('Window resized to:', size);
    // },
    // onSnapToSidebar: (side) => {
    //   console.log('Window snapped to', side, 'sidebar');
    // },
    // onUnsnapFromSidebar: () => {
    //   console.log('Window unsnapped from sidebar');
    // },
  });

  return window1;
}

function openAnotherWindow() {
  const content = document.createElement('div');
  content.innerHTML = `
    <h3 style="margin: 0 0 1em 0;">Another Window</h3>
    <p>You can have multiple windows open at the same time!</p>
    <p>Each window is independent and can be:</p>
    <ul style="margin: 1em 0; padding-left: 1.5em;">
      <li>Moved independently</li>
      <li>Resized independently</li>
      <li>Maximized independently</li>
    </ul>
    <p style="margin-top: 1.5em; padding: 1em; background: rgba(100, 150, 255, 0.1); border-radius: 8px;">
      <strong>Z-Index Demo:</strong> Click on any window to bring it to the front!
      Try clicking this window and then clicking another one behind it.
    </p>
    <p style="margin-top: 1em; padding: 1em; background: rgba(255, 150, 100, 0.1); border-radius: 8px;">
      <strong>Tip:</strong> Open several windows and experiment with clicking
      different ones to see the automatic z-index management in action.
    </p>
  `;

  const window2 = createWindow({
    title: 'Another Window',
    content,
    x: 200,
    y: 200,
    width: 500,
    height: 350,
    minWidth: 350,
    minHeight: 250,
  });

  return window2;
}

// Test specific window configurations
export function testWindowConfigurations() {
  // Test 1: Non-resizable window
  const fixedWindow = createWindow({
    title: 'Fixed Size Window',
    content: 'This window cannot be resized.',
    x: 100,
    y: 100,
    width: 300,
    height: 200,
    resizable: false,
  });

  setTimeout(() => fixedWindow.close(), 3000);

  // Test 2: Non-draggable window
  setTimeout(() => {
    const staticWindow = createWindow({
      title: 'Static Window',
      content: 'This window cannot be moved.',
      x: 400,
      y: 100,
      width: 300,
      height: 200,
      draggable: false,
    });

    setTimeout(() => staticWindow.close(), 3000);
  }, 500);

  // Test 3: Minimal window (no controls)
  setTimeout(() => {
    const minimalWindow = createWindow({
      title: 'Minimal Window',
      content: 'No controls, will auto-close.',
      x: 700,
      y: 100,
      width: 300,
      height: 150,
      closable: false,
      maximizable: false,
    });

    setTimeout(() => minimalWindow.destroy(), 3000);
  }, 1000);
}
