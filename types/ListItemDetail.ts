import { ImageInfo } from "./ImageInfo"

export type ListItemDetail = {
  id: string
  image: ImageInfo | undefined
  title: string
  caption?: string
}
