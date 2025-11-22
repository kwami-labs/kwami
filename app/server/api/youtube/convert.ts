import ytdl from 'ytdl-core';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const videoUrl = query.url as string;
    if (!videoUrl) {
      throw new Error('Missing YouTube URL');
    }
    if (!ytdl.validateURL(videoUrl)) {
      throw new Error('Invalid YouTube URL');
    }
    const info = await ytdl.getInfo(videoUrl);
    const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
    return { mp3Url: format.url };
  } catch (err) {
    return err;
  }
});
