import { Premises, Room } from '../@types/shared'
import { BedspaceStatus, ErrorSummary, PageHeadingBarItem, PlaceContext } from '../@types/ui'
import paths from '../paths/temporary-accommodation/manage'
import { addPlaceContext } from './placeUtils'
import { DateFormats, dateIsInThePast } from './dateUtils'
import { insertBespokeError, insertGenericError } from './validation'
import { SanitisedError } from '../sanitisedError'

export function bedspaceActions(premises: Premises, room: Room, placeContext: PlaceContext): Array<PageHeadingBarItem> {
  if (premises.status === 'archived' || bedspaceStatus(room) === 'archived') {
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

export function bedspaceStatus(room: Room): BedspaceStatus {
  if (room.beds[0].bedEndDate) {
    if (dateIsInThePast(room.beds[0].bedEndDate)) {
      return 'archived'
    }
  }

  return 'online'
}

export function insertConflictErrors(err: SanitisedError, premisesId: Premises['id'], roomId: Room['id']) {
  const { detail } = err.data as { detail: string }
  const errorSummary: ErrorSummary[] = []
  let errorType: string

  if (detail.match('The bedspace end date must be on or after the bedspace createdAt date:')) {
    const createdAt = detail.split(':')[1].trim()
    errorSummary.push({
      text: `The bedspace end date must be on or after the date the bedspace was created (${DateFormats.isoDateToUIDate(
        createdAt,
      )})`,
    })
    errorType = 'beforeCreatedAt'
  }

  if (detail.match('Conflict booking exists for the room:')) {
    const bookingId = detail.split(':')[1].trim()
    errorSummary.push({
      html: `This bedspace end date conflicts with <a href="${paths.bookings.show({
        premisesId,
        roomId,
        bookingId,
      })}">an existing booking</a>`,
    })
    errorType = 'conflict'
  }

  if (errorSummary.length && errorType) {
    insertBespokeError(err, {
      errorTitle: 'There is a problem',
      errorSummary,
    })
    insertGenericError(err, 'bedEndDate', errorType)
  }
}
