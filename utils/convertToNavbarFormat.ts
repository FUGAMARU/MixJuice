import { isDefined } from "./isDefined"
import { LocalStorageSpotifySelectedPlaylists } from "@/types/LocalStorageSpotifySelectedPlaylists"
import { NavbarItem } from "@/types/NavbarItem"
import { Provider } from "@/types/Provider"

export const convertToNavbarFormat = (
  provider: Provider,
  localStorageData: string | null
): NavbarItem[] | undefined => {
  if (!isDefined(localStorageData)) return undefined

  switch (provider) {
    case "spotify":
      const parsedSpotify = JSON.parse(
        localStorageData
      ) as LocalStorageSpotifySelectedPlaylists[]

      return parsedSpotify.map(p => ({
        provider: "spotify",
        id: p.id,
        title: p.title,
        color: "spotify",
        checked: false
      }))
    case "webdav":
      const parsedWebDAV = JSON.parse(localStorageData) as string[]

      return parsedWebDAV.map(p => ({
        provider: "webdav",
        id: p,
        title: p,
        color: "webdav",
        checked: false
      }))
  }
}
