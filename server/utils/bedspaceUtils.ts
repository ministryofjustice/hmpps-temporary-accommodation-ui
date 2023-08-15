import { Premises, Room } from '../@types/shared'
import { PageHeadingBarItem, PlaceContext } from '../@types/ui'
import paths from '../paths/temporary-accommodation/manage'
import { addPlaceContext } from './placeUtils'

export function bedspaceActions(premises: Premises, room: Room, placeContext: PlaceContext): Array<PageHeadingBarItem> {
  if (premises.status === 'archived') {
    return null
  }
  const items = [
    {
      text: 'Book bedspace',
      classes: 'govuk-button--secondary',
      href: addPlaceContext(paths.bookings.new({ premisesId: premises.id, roomId: room.id }), placeContext),
    },
  ]

  items.push({
    text: 'Void bedspace',
    classes: 'govuk-button--secondary',
    href: paths.lostBeds.new({ premisesId: premises.id, roomId: room.id }),
  })

  return items
}
