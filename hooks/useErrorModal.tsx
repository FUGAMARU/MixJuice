import { useCallback } from "react"
import { useSetRecoilState } from "recoil"
import { errorModalConfigAtom } from "@/atoms/errorModalConfigAtom"

const useErrorModal = () => {
  const setErrorModalConfig = useSetRecoilState(errorModalConfigAtom)

  const showError = useCallback(
    (e: unknown) => {
      setErrorModalConfig(prev => [
        ...prev,
        {
          level: "error",
          instance: e
        }
      ])
    },
    [setErrorModalConfig]
  )

  const showWarning = useCallback(
    (message: string) => {
      setErrorModalConfig(prev => [
        ...prev,
        {
          level: "warning",
          instance: new Error(message)
        }
      ])
    },
    [setErrorModalConfig]
  )

  return { showError, showWarning } as const
}

export default useErrorModal
