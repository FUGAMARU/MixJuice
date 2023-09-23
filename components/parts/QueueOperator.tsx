import { Flex, Box } from "@mantine/core"
import { Dispatch, SetStateAction, memo, useCallback, useState } from "react"
import { IoMdCheckmarkCircleOutline } from "react-icons/io"
import { LuListStart, LuListPlus } from "react-icons/lu"
import TooltipDefault from "./TooltipDefault"

import { STYLING_VALUES } from "@/constants/StylingValues"

type Props = {
  canMoveToFront: boolean
  canAddToFront: boolean
  onMoveToFront: () => void
  onAddToFront: () => void
  hiddenMethod: "display" | "visibility"
  animated?: boolean
}

const QueueOperator = ({
  canMoveToFront,
  canAddToFront,
  onMoveToFront,
  onAddToFront,
  hiddenMethod,
  animated = false
}: Props) => {
  /** キューの先頭へ移動ボタンアニメーション */
  const [isDisplayMoveButton, setIsDisplayMoveButton] = useState(true)
  const [moveButtonClassNames, setMoveButtonClassNames] = useState("")

  /** キューの先頭へ追加ボタンアニメーション */
  const [isDisplayAddButton, setIsDisplayAddButton] = useState(true)
  const [addButtonClassNames, setAddButtonClassNames] = useState("")

  const startAnimation = useCallback(
    async (
      classNameDispatch: Dispatch<SetStateAction<string>>,
      displayDispatch: Dispatch<SetStateAction<boolean>>
    ) => {
      if (!animated) return

      classNameDispatch("animate__animated animate__fadeOut")
      await new Promise(resolve => setTimeout(resolve, 600))
      displayDispatch(false)
      classNameDispatch("animate__animated animate__fadeIn")
      await new Promise(resolve => setTimeout(resolve, 3000))
      classNameDispatch("animate__animated animate__fadeOut")
      await new Promise(resolve => setTimeout(resolve, 600))
      displayDispatch(true)
      classNameDispatch("animate__animated animate__fadeIn")
    },
    [animated]
  )

  return (
    <Flex gap="md">
      <Box
        sx={
          hiddenMethod === "visibility"
            ? {
                visibility: canMoveToFront ? "visible" : "hidden"
              }
            : {
                display: canMoveToFront ? "block" : "none"
              }
        }
      >
        <TooltipDefault label="キューの先頭に移動">
          <Box className={moveButtonClassNames}>
            {isDisplayMoveButton ? (
              <LuListStart
                size="1.3rem"
                color={STYLING_VALUES.TEXT_COLOR_DEFAULT}
                style={{ flexShrink: 0, cursor: "pointer" }}
                onClick={() => {
                  onMoveToFront()
                  startAnimation(
                    setMoveButtonClassNames,
                    setIsDisplayMoveButton
                  )
                }}
              />
            ) : (
              <IoMdCheckmarkCircleOutline
                size="1.3rem"
                color={STYLING_VALUES.TEXT_COLOR_DEFAULT}
                style={{ flexShrink: 0 }}
              />
            )}
          </Box>
        </TooltipDefault>
      </Box>

      <Box
        sx={
          hiddenMethod === "visibility"
            ? {
                visibility: canAddToFront ? "visible" : "hidden"
              }
            : {
                display: canAddToFront ? "block" : "none"
              }
        }
      >
        <TooltipDefault label="キューの先頭に追加">
          <Box className={addButtonClassNames}>
            {isDisplayAddButton ? (
              <LuListPlus
                size="1.3rem"
                color={STYLING_VALUES.TEXT_COLOR_DEFAULT}
                style={{ flexShrink: 0, cursor: "pointer" }}
                onClick={() => {
                  onAddToFront()
                  startAnimation(setAddButtonClassNames, setIsDisplayAddButton)
                }}
              />
            ) : (
              <IoMdCheckmarkCircleOutline
                size="1.3rem"
                color={STYLING_VALUES.TEXT_COLOR_DEFAULT}
                style={{ flexShrink: 0 }}
              />
            )}
          </Box>
        </TooltipDefault>
      </Box>
    </Flex>
  )
}

export default memo(QueueOperator)
