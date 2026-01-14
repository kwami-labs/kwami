import type { KwamiAppsConfig } from 'kwami';

const GCP_OAUTH_CID = (import.meta.env.GCP_OAUTH_CID || '').trim();
const GCP_YOUTUBE_API_KEY = (import.meta.env.GCP_YOUTUBE_API_KEY || '').trim();

const DEFAULT_SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
const DEFAULT_DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'];

export function getKwamiAppsConfig(): KwamiAppsConfig | undefined {
  const apps: KwamiAppsConfig = {};

  if (GCP_OAUTH_CID && GCP_YOUTUBE_API_KEY) {
    apps.youtube = {
      clientId: GCP_OAUTH_CID,
      apiKey: GCP_YOUTUBE_API_KEY,
      scopes: DEFAULT_SCOPES,
      discoveryDocs: DEFAULT_DISCOVERY_DOCS,
    };
  }

  return Object.keys(apps).length ? apps : undefined;
}

export function hasYouTubeCredentials(): boolean {
  return Boolean(GCP_OAUTH_CID && GCP_YOUTUBE_API_KEY);
}


