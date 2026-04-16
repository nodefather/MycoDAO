import type { PodcastEpisode } from "@/lib/types";

const AUDIO_EXT = /\.(mp3|m4a|aac|opus|wav|ogg)(\?|$)/i;

/** True when episode has a direct audio file URL (not placeholder). */
export function episodeHasAudioFile(ep: PodcastEpisode): boolean {
  const u = ep.audioUrl?.trim() ?? "";
  if (!u || u === "#") return false;
  if (ep.mediaKind === "audio") {
    return /^https?:\/\//i.test(u) || (u.startsWith("/") && AUDIO_EXT.test(u));
  }
  return AUDIO_EXT.test(u);
}

/** Episodes suitable for the VOD / video library tab. */
export function isVodEpisode(ep: PodcastEpisode): boolean {
  return ep.mediaKind === "video" && (Boolean(ep.embedUrl?.trim()) || isDirectVideoFile(ep.audioUrl));
}

function isDirectVideoFile(url: string): boolean {
  const u = url?.trim() ?? "";
  return /\.(mp4|webm|m3u8|mov)(\?|$)/i.test(u);
}

/** Episodes suitable for the audio library (playable audio URL). */
export function isAudioLibraryEpisode(ep: PodcastEpisode): boolean {
  return episodeHasAudioFile(ep);
}
