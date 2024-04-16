import type { Booking, LostBed, Premises, Room } from '@approved-premises/api'
import errorLookups from '../../server/i18n/en/errors.json'
import Page from '../pages/page'
import BookingShowPage from '../pages/temporary-accommodation/manage/bookingShow'
import LostBedShowPage from '../pages/temporary-accommodation/manage/lostBedShow'
import Component from './component'

export default class BedspaceConflictErrorComponent extends Component {
  constructor(
    private readonly premises: Premises,
    private readonly room: Room,
    private readonly source: 'booking' | 'lost-bed' | 'turnaround',
  ) {
    super()
  }

  shouldShowDateConflictErrorMessages(
    fields: Array<string>,
    conflictingEntity: Booking | LostBed | null,
    conflictingEntityType: 'booking' | 'lost-bed' | 'bedspace-end-date',
  ): void {
    fields.forEach(field => {
      cy.get(`[data-cy-error-${field}]`).should('contain', errorLookups.generic[field].conflict)
    })

    const title = this.getTitle(fields)
    const message = this.getMessage(fields, conflictingEntityType)

    cy.get('.govuk-error-summary h2').should('contain', title)
    cy.get('.govuk-error-summary ul').should('contain', message)

    if (conflictingEntity) {
      cy.get('.govuk-error-summary a').click()

      if (conflictingEntityType === 'booking') {
        Page.verifyOnPage(BookingShowPage, this.premises, this.room, conflictingEntity as Booking)
      } else {
        Page.verifyOnPage(LostBedShowPage, this.premises, this.room, conflictingEntity as LostBed)
      }
      cy.go('back')
    }
  }

  private getTitle(fields: Array<string>): string {
    if (this.source === 'booking' || this.source === 'lost-bed') {
      return fields.length === 1
        ? 'This bedspace is not available for the date entered'
        : 'This bedspace is not available for the dates entered'
    }
    return 'The turnaround time could not be changed'
  }

  private getMessage(
    fields: Array<string>,
    conflictingEntityType: 'booking' | 'lost-bed' | 'bedspace-end-date',
  ): string {
    if (conflictingEntityType === 'bedspace-end-date') {
      return 'This booking conflicts with the bedspace end date.'
    }

    const noun = conflictingEntityType === 'booking' ? 'booking' : 'void'

    if (this.source === 'booking' || this.source === 'lost-bed') {
      return fields.length === 1 ? `It conflicts with an existing ${noun}` : `They conflict with an existing ${noun}`
    }
    return `The new turnaround time would conflict with an existing ${noun}`
  }
}
