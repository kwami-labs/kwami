function formatValue(value: unknown, decimals = 1) {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return '';
  return n.toFixed(decimals);
}

function updateValueDisplay(id: string, value: unknown, decimals = 1) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = formatValue(value, decimals);
  }
}

export function initializeCameraControls() {
  const body = window.kwami?.body;
  if (!body) {
    return;
  }

  const camera = body.getCamera();

  const cameraXSlider = document.getElementById('camera-x') as HTMLInputElement | null;
  if (cameraXSlider) {
    cameraXSlider.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement | null;
      const value = Number.parseFloat(target?.value ?? '0');
      camera.position.x = value;
      camera.lookAt(0, 0, 0);
      updateValueDisplay('camera-x-value', value, 1);
      if (window.kwami?.body?.isBlobImageTransparencyMode?.()) {
        window.kwami.body.refreshBlobImageTransparencyMode?.();
      }
    });
  }

  const cameraYSlider = document.getElementById('camera-y') as HTMLInputElement | null;
  if (cameraYSlider) {
    cameraYSlider.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement | null;
      const value = Number.parseFloat(target?.value ?? '0');
      camera.position.y = value;
      camera.lookAt(0, 0, 0);
      updateValueDisplay('camera-y-value', value, 1);
      if (window.kwami?.body?.isBlobImageTransparencyMode?.()) {
        window.kwami.body.refreshBlobImageTransparencyMode?.();
      }
    });
  }

  const cameraZSlider = document.getElementById('camera-z') as HTMLInputElement | null;
  if (cameraZSlider) {
    cameraZSlider.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement | null;
      const value = Number.parseFloat(target?.value ?? '0');
      camera.position.z = value;
      camera.lookAt(0, 0, 0);
      updateValueDisplay('camera-z-value', value, 1);
      if (window.kwami?.body?.isBlobImageTransparencyMode?.()) {
        window.kwami.body.refreshBlobImageTransparencyMode?.();
      }
    });
  }

  if (cameraXSlider) {
    cameraXSlider.value = camera.position.x.toString();
    updateValueDisplay('camera-x-value', camera.position.x, 1);
  }
  if (cameraYSlider) {
    cameraYSlider.value = camera.position.y.toString();
    updateValueDisplay('camera-y-value', camera.position.y, 1);
  }
  if (cameraZSlider) {
    cameraZSlider.value = camera.position.z.toString();
    updateValueDisplay('camera-z-value', camera.position.z, 1);
  }
}
