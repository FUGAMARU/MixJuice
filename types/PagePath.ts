import { PAGE_PATH } from "../constants/PagePath"

export type PagePath = (typeof PAGE_PATH)[keyof typeof PAGE_PATH]

export const isPagePath = (path: string): path is PagePath =>
  Object.values(PAGE_PATH).includes(path as PagePath)
