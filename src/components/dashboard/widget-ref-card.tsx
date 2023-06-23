import type { Identifier, XYCoord } from 'dnd-core'
import type { FC } from 'react'
import { useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { Card, Flex, Heading, IconButton } from '@chakra-ui/react';
import { CloseIcon, DragHandleIcon } from '@chakra-ui/icons';

const WidgetRefCardType = 'WidgetRefCard';

export interface WidgetRefCardProps {
  id: any
  text: string
  index: number
  moveCard: (dragIndex: number, hoverIndex: number) => void
  removeWidget: (id: string) => void
}

interface DragItem {
  index: number
  id: string
  type: string
}

export const WidgetRefCard: FC<WidgetRefCardProps> = ({ id, text, index, moveCard, removeWidget }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [{ handlerId }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: Identifier | null }
  >({
    accept: WidgetRefCardType,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect()

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

      // Determine mouse position
      const clientOffset = monitor.getClientOffset()

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }

      // Time to actually perform the action
      moveCard(dragIndex, hoverIndex)

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex
    },
  })

  const [{ isDragging }, drag] = useDrag({
    type: WidgetRefCardType,
    item: () => {
      return { id, index }
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const opacity = isDragging ? 0 : 1
  drag(drop(ref))
  return (
    <Flex w='full'> 
      <Card
      direction={{ base: 'column', sm: 'row' }}
      overflow='hidden'
      variant='outline'
      cursor='move'
      marginTop='4'
      marginBottom='4'
      ref={ref}
      style={{ opacity }}
      data-handler-id={handlerId}
      w='full'
    >
      {/* <CardBody p='0' w='full'> */}
        <Flex>
          <DragHandleIcon bgColor='gray.100' h='auto' w='4' />
          <Heading size='sm' p='2' w='full'>{text}</Heading>
        </Flex>
      {/* </CardBody> */}
    </Card>
    <IconButton
      marginTop='4'
      marginBottom='4'
      bgColor='white'
      aria-label={`Remove ${text} widget from dashbaord`}
      icon={<CloseIcon />}
      onClick={() => removeWidget(id)}
    />
   </Flex>
  )
}
