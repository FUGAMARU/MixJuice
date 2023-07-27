import Dexie from "dexie"
import { Track } from "@/types/Track"

export class TrackDatabase extends Dexie {
  tracks!: Dexie.Table<Track, string>

  constructor() {
    super("TrackDatabase")
    this.version(1).stores({
      tracks:
        "id, &path, provider, title, albumTitle, artist, imgSrc, imgHeight, imgWidth, duration"
    })
  }
}
