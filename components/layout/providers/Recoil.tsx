"use client"

import { memo } from "react"
import { RecoilRoot } from "recoil"
import { Children } from "@/types/Children"

const Recoil = ({ children }: Children) => {
  return <RecoilRoot>{children}</RecoilRoot>
}

export default memo(Recoil)
