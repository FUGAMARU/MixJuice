import { atom } from "recoil"

export const loadingAtom = atom<{
  stateChangedOn:
    | "initial"
    | "MainPage"
    | "ConnectPage"
    | "SpotifyCallbackPage"
    | "SigninPage"
  state: boolean
}>({
  key: "loadingAtom",
  default: {
    stateChangedOn: "initial",
    state: false
  }
})
