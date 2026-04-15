import type { AudioAsset } from "@/lib/types";

export function AudioPlayer({ audio }: { audio?: AudioAsset | null }) {
  if (!audio?.url) {
    return <p className="muted">Audio will appear here once an audio asset is attached.</p>;
  }

  return (
    <div className="audioPlayer">
      <div>
        <p className="eyebrow">Listen</p>
        <strong>{audio.title}</strong>
        {audio.description ? <p className="muted">{audio.description}</p> : null}
      </div>
      <audio controls preload="none" src={audio.url} className="audioElement">
        <track kind="captions" />
      </audio>
    </div>
  );
}
