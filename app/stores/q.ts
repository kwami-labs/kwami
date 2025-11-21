import { Kwami } from '@kwami';
import audioFiles from '~/assets/aud';

const useQStore = defineStore('q', {
  persist: false,
  state: () => ({
    body: null as Kwami | null,
    kwamiBackup: null as Kwami | null,
    isInit: false,
  }),
  actions: {
    init(canvas: HTMLCanvasElement): void {
      if (this.kwamiBackup) {
        this.body = this.kwamiBackup;
        return;
      }
      this.body = new Kwami(canvas, {
        body: {
          audioFiles,
          initialSkin: 'tricolor',
          blob: {
            resolution: 180,
          },
        },
      });
      this.isInit = true;
    },
    save(kwami: Kwami): void {
      if (kwami) {
        this.kwamiBackup = kwami;
      }
    },
  },
});

export default useQStore;
