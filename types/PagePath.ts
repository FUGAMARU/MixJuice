import { PAGE_PATH } from "../constants/PagePath"

export type PagePath = (typeof PAGE_PATH)[keyof typeof PAGE_PATH]
