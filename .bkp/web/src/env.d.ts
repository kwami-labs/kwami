interface ImportMetaEnv {
  readonly GCP_OAUTH_CID?: string;
  readonly GCP_YOUTUBE_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export {};

