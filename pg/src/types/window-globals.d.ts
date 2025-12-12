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

    // export/import
    exportConfig?: () => void;
    importConfig?: (file: File) => Promise<void>;
    quickSave?: () => void;
    quickLoad?: () => void;

    // keyboard shortcuts + randomizers
    showKeyboardShortcuts?: () => void;
    randomizeBlob?: () => void;
    randomizeBackground?: () => void;

    // theme
    toggleTheme?: () => void;

    // media loading manager
    mediaLoadingManager?: any;

    // misc (legacy)
    __KWAMI_PLAYGROUND__?: any;
    mindConfig?: any;
    skillDefinitions?: any;
  }
}

export {};
