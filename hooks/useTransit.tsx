import { useRouter } from "next/navigation"
import { useCallback } from "react"
import { useSetRecoilState } from "recoil"
import { loadingAtom } from "@/atoms/loadingAtom"
import { PagePath } from "@/types/PagePath"

const useTransit = () => {
  const router = useRouter()
  const setIsLoading = useSetRecoilState(loadingAtom)

  const onTransit = useCallback(
    async (from: PagePath, to: PagePath) => {
      setIsLoading({
        stateChangedOn: from,
        state: true
      })
      await new Promise(resolve => setTimeout(resolve, 1000))
      router.push(to)
    },
    [router, setIsLoading]
  )

  return { onTransit } as const
}

export default useTransit
