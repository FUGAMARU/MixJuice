import { Flex, Box } from "@mantine/core"
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  memo,
  useEffect,
  useMemo,
  useState
} from "react"
import { Rnd } from "react-rnd"
import { useRecoilValue } from "recoil"
import { navbarAtom } from "@/atoms/navbarAtom"
import LayoutNavbar from "@/components/layout/LayoutNavbar"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { HEADER_HEIGHT } from "@/constants/Styling"
import { ZINDEX_NUMBERS } from "@/constants/ZIndexNumbers"
import useBreakPoints from "@/hooks/useBreakPoints"
import { Track } from "@/types/Track"

type Props = {
  isPlaying: boolean
  onPlay: (track: Track) => Promise<void>
  setIsPreparingPlayback: Dispatch<SetStateAction<boolean>>
  children: ReactNode
}

const MainPageLayout = ({
  isPlaying,
  onPlay,
  setIsPreparingPlayback,
  children
}: Props) => {
  const { breakPoint } = useBreakPoints()
  const isNavbarOpened = useRecoilValue(navbarAtom)

  const [navbarDraggedWidth, setNavbarDraggedWidth] = useState(0)
  useEffect(() => {
    const data = localStorage.getItem(LOCAL_STORAGE_KEYS.NAVBAR_DRAGGED_WIDTH)
    if (data) setNavbarDraggedWidth(Number(data))
  }, [])

  const defaultNavbarWidth = useMemo(() => {
    if (breakPoint === "SmartPhone") return "60%"
    if (breakPoint === "Tablet") return "40%"

    /** PCの場合 */
    if (navbarDraggedWidth) return Number(navbarDraggedWidth)
    return "20%"
  }, [breakPoint, navbarDraggedWidth])
  const screenHeightWithoutHeader = useMemo(
    () => `calc(100vh - ${HEADER_HEIGHT}px)`,
    []
  )

  const canSlideNavbar = useMemo(() => breakPoint !== "PC", [breakPoint])
  const layoutNavbar = useMemo(
    () => (
      <LayoutNavbar
        height={screenHeightWithoutHeader}
        isPlaying={isPlaying}
        canSlideNavbar={canSlideNavbar}
        onPlay={onPlay}
        setIsPreparingPlayback={setIsPreparingPlayback}
      />
    ),
    [
      canSlideNavbar,
      isPlaying,
      onPlay,
      setIsPreparingPlayback,
      screenHeightWithoutHeader
    ]
  )

  return (
    <Flex>
      {canSlideNavbar ? (
        <Box
          w={defaultNavbarWidth}
          h={screenHeightWithoutHeader}
          pos="absolute"
          left={0}
          sx={{
            zIndex: isNavbarOpened ? ZINDEX_NUMBERS.NAVBAR_COLLAPSED : 0
          }}
        >
          {layoutNavbar}
        </Box>
      ) : (
        <Rnd
          default={{
            x: 0,
            y: 0,
            width: defaultNavbarWidth,
            height: screenHeightWithoutHeader
          }}
          minWidth={215}
          onResize={(_, __, ref, ___, ____) =>
            localStorage.setItem(
              LOCAL_STORAGE_KEYS.NAVBAR_DRAGGED_WIDTH,
              String(ref.offsetWidth)
            )
          }
          enableResizing={{ right: true }}
          disableDragging
          style={{
            position: "relative",
            zIndex: ZINDEX_NUMBERS.NAVBAR_EXPANDED
          }}
        >
          {layoutNavbar}
        </Rnd>
      )}

      <Box w="100%" sx={{ flex: 1 }}>
        {children}

        <Box
          w="6rem"
          p="xs"
          ta="center"
          pos="absolute"
          bottom={15}
          right={15}
          bg="white"
          c="#0a83ff"
          fz="xs"
          sx={{
            borderRadius: "20px",
            boxShadow: "0 0 4px rgba(0, 0, 0, 0.2);"
          }}
        >
          {breakPoint}
        </Box>
      </Box>
    </Flex>
  )
}

export default memo(MainPageLayout)
