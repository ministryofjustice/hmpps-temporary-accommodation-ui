import type { Booking, LostBed, Premises, Room } from '@approved-premises/api'
import errorLookups from '../../server/i18n/en/errors.json'
import Page from '../pages/page'
import BookingShowPage from '../pages/temporary-accommodation/manage/bookingShow'
import LostBedShowPage from '../pages/temporary-accommodation/manage/lostBedShow'
import Component from './component'

export default class BedspaceConflictErrorComponent extends Component {
  constructor(private readonly premises: Premises, private readonly room: Room) {
    super()
  }

  shouldShowDateConflictErrorMessages(
    fields: Array<string>,
    conflictingEntity: Booking | LostBed,
    conflictingEntityType: 'booking' | 'lost-bed',
  ): void {
    fields.forEach(field => {
      cy.get(`[data-cy-error-${field}]`).should('contain', errorLookups.generic[field].conflict)
    })

    const title =
      fields.length === 1
        ? 'This bedspace is not available for the date entered'
        : 'This bedspace is not available for the dates entered'

    const noun = conflictingEntityType === 'booking' ? 'booking' : 'void'

    const message =
      fields.length === 1 ? `It conflicts with an existing ${noun}` : `They conflict with an existing ${noun}`

    cy.get('.govuk-error-summary h2').should('contain', title)
    cy.get('.govuk-error-summary ul').should('contain', message)

    cy.get('.govuk-error-summary a').click()

    if (conflictingEntityType === 'booking') {
      Page.verifyOnPage(BookingShowPage, this.premises, this.room, conflictingEntity as Booking)
    } else {
      Page.verifyOnPage(LostBedShowPage, this.premises, this.room, conflictingEntity as LostBed)
    }

    cy.go('back')
  }
}
