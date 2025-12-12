declare module 'kwami' {
  interface KwamiBody {
    setState?: (state: string) => void;
    getParams?: () => any;
    updateParams?: (params: any) => void;

    pauseResizeDetection?: () => void;
    resumeResizeDetection?: () => void;

    clearBackgroundMedia?: () => void;
    setGradientOverlayEnabled?: (enabled: boolean) => void;

    isBlobImageTransparencyMode?: () => boolean;
    refreshBlobImageTransparencyMode?: () => void;
    setBlobImageTransparencyMode?: (...args: any[]) => void;
  }
}

export {};
