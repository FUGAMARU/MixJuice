import { Flex, Box, Tooltip } from "@mantine/core"
import { Dispatch, SetStateAction, memo, useCallback, useState } from "react"
import { IoMdCheckmarkCircleOutline } from "react-icons/io"
import { LuListStart, LuListPlus } from "react-icons/lu"
import { TEXT_COLOR_DEFAULT } from "@/constants/Styling"

type Props = {
  canMoveToFront: boolean
  canAddToFront: boolean
  onMoveToFront: () => void
  onAddToFront: () => void
  animated?: boolean
}

const QueueOperator = ({
  canMoveToFront,
  canAddToFront,
  onMoveToFront,
  onAddToFront,
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
        sx={{
          visibility: canMoveToFront ? "visible" : "hidden"
        }}
      >
        <Tooltip label="キューの先頭に移動">
          <Box className={moveButtonClassNames}>
            {isDisplayMoveButton ? (
              <LuListStart
                size="1.3rem"
                color={TEXT_COLOR_DEFAULT}
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
                color={TEXT_COLOR_DEFAULT}
                style={{ flexShrink: 0 }}
              />
            )}
          </Box>
        </Tooltip>
      </Box>

      <Box
        sx={{
          visibility: canAddToFront ? "visible" : "hidden"
        }}
      >
        <Tooltip label="キューの先頭に追加">
          <Box className={addButtonClassNames}>
            {isDisplayAddButton ? (
              <LuListPlus
                size="1.3rem"
                color={TEXT_COLOR_DEFAULT}
                style={{ flexShrink: 0, cursor: "pointer" }}
                onClick={() => {
                  onAddToFront()
                  startAnimation(setAddButtonClassNames, setIsDisplayAddButton)
                }}
              />
            ) : (
              <IoMdCheckmarkCircleOutline
                size="1.3rem"
                color={TEXT_COLOR_DEFAULT}
                style={{ flexShrink: 0 }}
              />
            )}
          </Box>
        </Tooltip>
      </Box>
    </Flex>
  )
}

export default memo(QueueOperator)
