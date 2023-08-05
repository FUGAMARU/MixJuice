import Dexie from "dexie"
import { TrackWithPath } from "@/types/Track"

export class WebDAVTrackDatabase extends Dexie {
  tracks!: Dexie.Table<TrackWithPath, string>

  constructor() {
    super("WebDAVTrackDatabase")
    this.version(1).stores({
      tracks:
        "id, &path, provider, title, albumTitle, artist, imgSrc, imgHeight, imgWidth, duration"
    })
  }
}
