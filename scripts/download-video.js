#!/usr/bin/env node

/**
 * Download Video Script
 * 
 * Downloads a video from YouTube URL or video ID in high quality MP4 format.
 * 
 * Usage:
 *   node scripts/download-video.js <URL or YouTube ID> [output-dir]
 * 
 * Examples:
 *   node scripts/download-video.js https://www.youtube.com/watch?v=dQw4w9WgXcQ
 *   node scripts/download-video.js dQw4w9WgXcQ
 *   node scripts/download-video.js https://www.youtube.com/watch?v=dQw4w9WgXcQ ./downloads
 */

import { createWriteStream, mkdirSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import ytdl from '@distube/ytdl-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Extract YouTube video ID from URL or use the input directly
function extractVideoId(input) {
  if (!input) {
    throw new Error('Please provide a YouTube URL or video ID');
  }

  // If it's already a video ID (11 characters, alphanumeric, hyphens, underscores)
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
    return input;
  }

  // Try to extract from various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  throw new Error('Invalid YouTube URL or video ID');
}

// Get video info
async function getVideoInfo(videoId) {
  try {
    const info = await ytdl.getInfo(videoId);
    return info;
  } catch (error) {
    throw new Error(`Failed to fetch video info: ${error.message}`);
  }
}

// Download video in highest quality MP4
async function downloadVideo(videoId, outputDir) {
  const rootDir = resolve(__dirname, '..');
  const downloadDir = outputDir ? resolve(rootDir, outputDir) : join(rootDir, 'downloads');

  // Create output directory if it doesn't exist
  try {
    mkdirSync(downloadDir, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }

  console.log('📹 Fetching video information...');

  const info = await getVideoInfo(videoId);
  
  // Get the best quality MP4 format (prioritize MP4 containers)
  let format = ytdl.chooseFormat(info.formats, {
    quality: 'highestvideo',
    filter: (f) => f.hasVideo && f.hasAudio && (f.container === 'mp4' || f.container === 'webm'),
  });

  // If no combined format, try video+audio separately
  if (!format) {
    format = ytdl.chooseFormat(info.formats, {
      quality: 'highestvideo',
      filter: 'videoandaudio',
    });
  }

  if (!format) {
    throw new Error('No suitable format found. The video may be unavailable or restricted.');
  }

  const title = info.videoDetails.title.replace(/[<>:"/\\|?*]/g, '_'); // Sanitize filename
  const extension = format.container || 'mp4';
  const filename = `${title}.${extension}`;
  const filepath = join(downloadDir, filename);

  console.log(`📺 Title: ${info.videoDetails.title}`);
  console.log(`👤 Channel: ${info.videoDetails.author.name}`);
  console.log(`⏱️  Duration: ${info.videoDetails.lengthSeconds}s`);
  console.log(`📹 Quality: ${format.qualityLabel || format.quality} (${format.container || 'unknown'})`);
  console.log(`💾 Saving to: ${filepath}`);

  if (format.container !== 'mp4') {
    console.log(`⚠️  Note: Video will be in ${format.container} format. For MP4, ffmpeg may be required to convert.`);
  }

  return new Promise((resolve, reject) => {
    const options = format.hasVideo && format.hasAudio
      ? { quality: 'highestvideo', filter: 'videoandaudio' }
      : { quality: 'highestvideo' };

    const stream = ytdl.downloadFromInfo(info, options);

    const writeStream = createWriteStream(filepath);
    let downloadedBytes = 0;
    const totalBytes = format?.contentLength || info.formats[0]?.contentLength || 0;

    stream.on('data', (chunk) => {
      downloadedBytes += chunk.length;
      if (totalBytes > 0) {
        const percent = ((downloadedBytes / totalBytes) * 100).toFixed(1);
        process.stdout.write(`\r⬇️  Downloaded: ${percent}% (${(downloadedBytes / 1024 / 1024).toFixed(2)} MB)`);
      }
    });

    stream.on('end', () => {
      console.log('\n✅ Download complete!');
      console.log(`📁 File saved: ${filepath}`);
      resolve(filepath);
    });

    stream.on('error', (error) => {
      console.error('\n❌ Download error:', error.message);
      reject(error);
    });

    stream.pipe(writeStream);
  });
}

// Main execution
async function main() {
  try {
    const input = process.argv[2];
    const outputDir = process.argv[3];

    if (!input) {
      console.error('❌ Error: Please provide a YouTube URL or video ID');
      console.log('\nUsage:');
      console.log('  node scripts/download-video.js <URL or YouTube ID> [output-dir]');
      console.log('\nExamples:');
      console.log('  node scripts/download-video.js https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      console.log('  node scripts/download-video.js dQw4w9WgXcQ');
      console.log('  node scripts/download-video.js https://www.youtube.com/watch?v=dQw4w9WgXcQ ./downloads');
      process.exit(1);
    }

    const videoId = extractVideoId(input);
    console.log(`🎬 Video ID: ${videoId}\n`);

    await downloadVideo(videoId, outputDir);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();

