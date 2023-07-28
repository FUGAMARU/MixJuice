import Dexie from "dexie"
import { TrackWithPath } from "@/types/Track"

export class TrackDatabase extends Dexie {
  tracks!: Dexie.Table<TrackWithPath, string>

  constructor() {
    super("TrackDatabase")
    this.version(1).stores({
      tracks:
        "id, &path, provider, title, albumTitle, artist, imgSrc, imgHeight, imgWidth, duration"
    })
  }
}
