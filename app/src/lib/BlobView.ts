import { Kwami } from 'kwami';

export class BlobView {
  private container: HTMLElement;
  private kwami: Kwami | null = null;
  private canvas: HTMLCanvasElement;

  constructor(container: HTMLElement) {
    this.container = container;
    
    // Create and append canvas
    this.canvas = document.createElement('canvas');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.container.appendChild(this.canvas);
  }

  public initBlob(config: any) {
    if (this.kwami) {
      this.kwami.dispose();
    }

    // Default configuration if none provided
    // If config is provided (from NFT body), use it as blob config
    const blobConfig = config || {
      skin: { skin: 'tricolor', subtype: 'poles' },
      colors: { x: '#ff0066', y: '#00ff66', z: '#6600ff' }
    };

    // Initialize Kwami
    this.kwami = new Kwami(this.canvas, {
      body: {
        blob: blobConfig,
        scene: {
            background: { type: 'transparent', opacity: 1 }
        }
      }
    });

    // Apply specific settings to match PG app look
    this.kwami.body.setCameraPosition(-0.9, 7.3, -1.8);
    this.kwami.body.blob.setScale(4.0);
    this.kwami.body.setBackgroundTransparent();
    
    // Enable interactions
    this.kwami.enableBlobInteraction();
  }

  public start() {
    // Animation loop is handled internally by Kwami/Blob
  }

  public stop() {
    if (this.kwami) {
      this.kwami.dispose();
      this.kwami = null;
    }
  }
}
