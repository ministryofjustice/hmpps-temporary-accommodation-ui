import { LostBed } from '../../server/@types/shared'
import { DateFormats } from '../../server/utils/dateUtils'
import Component from './component'

export default class LostBedListingComponent extends Component {
  constructor(private readonly lostBed: LostBed) {
    super()
  }

  clickLink(): void {
    this.within(() => {
      cy.get('a').click()
    })
  }

  shouldShowLostBedDetails(): void {
    this.within(() => {
      cy.get('h3').should('contain', this.lostBed.reason.name)

      this.shouldShowKeyAndValue('Start date', DateFormats.isoDateToUIDate(this.lostBed.startDate))
      this.shouldShowKeyAndValue('End date', DateFormats.isoDateToUIDate(this.lostBed.endDate))

      cy.get('.listing-entry__content__lost-bed-notes').within(() => {
        this.lostBed.notes?.split('\n').forEach(notesLine => {
          cy.root().should('contain', notesLine)
        })
      })
    })
  }

  private within(next: () => void) {
    if (this.lostBed.id === 'unknown') {
      cy.get('.lost-bed-listing').eq(0).within(next)
    } else {
      cy.get('.lost-bed-listing').get(`[data-cy-id="${this.lostBed.id}"]`).within(next)
    }
  }
}
