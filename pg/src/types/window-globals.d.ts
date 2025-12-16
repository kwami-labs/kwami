import type { Kwami } from 'kwami';

declare global {
  interface Window {
    kwami: Kwami | null;

    // messages
    updateStatus?: (message: string) => void;
    showError?: (message: string) => void;
    updateError?: (message: string) => void;

    // sidebar html handlers
    toggleMenus?: () => void;
    swapLeftSidebar?: () => void;
    swapRightSidebar?: () => void;
    switchMobileSidebarTab?: (section: string) => void;

    // audio modal html handlers
    openAudioLoaderModal?: () => void;
    closeAudioLoaderModal?: () => void;

    // media loaders
    initializeMediaLoaders?: () => void;

    // background media controls (used by media-loaders)
    resolveMediaPath?: (value: string) => string;
    setMediaType?: (type: 'none' | 'image' | 'video', opts?: { silent?: boolean }) => void;
    setBackgroundImage?: (value: string, opts?: { silent?: boolean }) => void;
    setBackgroundVideo?: (value: string, opts?: { silent?: boolean }) => void;

    // background helpers (used by UI buttons)
    randomizeGradientColors?: () => void;
    randomizeBackground?: () => void;
    randomizeMediaSelection?: (type: 'image' | 'video') => void;
    clearMediaSelection?: (type: 'image' | 'video') => void;
    uploadMediaFile?: (type: 'image' | 'video') => void;
    resetBackground?: () => void;
    randomizeBackgroundWithGlass?: () => void;

    // export/import
    exportConfig?: () => void;
    importConfig?: (file: File) => Promise<void>;
    quickSave?: () => void;
    quickLoad?: () => void;

    // keyboard shortcuts + randomizers
    showKeyboardShortcuts?: () => void;
    randomizeBlob?: () => void;
    randomizeBackground?: () => void;

    // blob surface media
    setBlobMediaType?: (type: 'none' | 'image' | 'video') => void;
    randomizeBlobMedia?: (type: 'image' | 'video') => void;
    clearBlobMedia?: () => void;
    randomize3DTexture?: () => void;

    // theme
    toggleTheme?: () => void;

    // media loading manager
    mediaLoadingManager?: any;

    // misc (legacy)
    __KWAMI_PLAYGROUND__?: any;
    mindConfig?: any;
    conversationCallbacks?: any;

    // mind / conversation
    initializeMind?: () => Promise<void>;
    applyVoiceSettings?: () => void;
    loadAvailableVoices?: () => Promise<void>;
    selectUserVoice?: () => void;
    applyVoicePreset?: (preset: string) => void;
    applyVoicePresetV2?: (preset: string) => void;
    previewVoice?: () => Promise<void>;
    toggleConversation?: () => Promise<void>;
    startConversation?: () => Promise<void>;
    stopConversation?: () => Promise<void>;
    testMicrophone?: () => Promise<void>;
    applyPronunciation?: () => void;
    checkUsage?: () => Promise<void>;
    exportMindConfig?: () => void;
    importMindConfig?: () => void;

    skillDefinitions?: any;
  }
}

export {};
