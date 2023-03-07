import { Premises, Room } from '../@types/shared'
import { PageHeadingBarItem } from '../@types/ui'
import config from '../config'
import paths from '../paths/temporary-accommodation/manage'

export function bedspaceActions(premises: Premises, room: Room): Array<PageHeadingBarItem> {
  if (premises.status === 'archived') {
    return null
  }
  const items = [
    {
      text: 'Book bedspace',
      classes: 'govuk-button--secondary',
      href: paths.bookings.new({ premisesId: premises.id, roomId: room.id }),
    },
  ]

  if (!config.flags.voidsDisabled) {
    items.push({
      text: 'Void bedspace',
      classes: 'govuk-button--secondary',
      href: paths.lostBeds.new({ premisesId: premises.id, roomId: room.id }),
    })
  }

  return items
}
