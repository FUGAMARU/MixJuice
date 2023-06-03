"use client"

import { RecoilRoot } from "recoil"

type Props = {
  children: React.ReactNode
}

const Recoil: React.FC<Props> = ({ children }) => {
  return <RecoilRoot>{children}</RecoilRoot>
}

export default Recoil
