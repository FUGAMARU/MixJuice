"use client"

import { memo } from "react"
import { RecoilRoot } from "recoil"

type Props = {
  children: React.ReactNode
}

const Recoil = ({ children }: Props) => {
  return <RecoilRoot>{children}</RecoilRoot>
}

export default memo(Recoil)
