import { TemporaryAccommodationBedSearchResult as BedSearchResult } from '../../server/@types/shared'
import paths from '../../server/paths/temporary-accommodation/manage'
import Component from './component'

export default class BedspaceSearchResult extends Component {
  constructor(private readonly result: BedSearchResult) {
    super()
  }

  shouldShowResult(checkCount = true): void {
    cy.get('h2')
      .contains(this.result.room.name)
      .parents('article[data-cy-bedspace]')
      .within(() => {
        const fullAddress = [
          this.result.premises.addressLine1,
          this.result.premises.town,
          this.result.premises.postcode,
        ]
          .filter(Boolean)
          .join(', ')
        this.shouldShowKeyAndValue('Address', fullAddress)

        if (checkCount) {
          this.shouldShowKeyAndValue(
            'Bedspaces',
            `${this.result.premises.bedCount} total: ${this.result.premises.bookedBedCount} booked, ${this.result.premises.bedCount - this.result.premises.bookedBedCount} available`,
          )
        }

        this.result.premises.characteristics.forEach(characteristic => {
          cy.get('ul[data-cy-premises-key-characteristics] > li').should('contain', characteristic.name)
        })

        this.result.room.characteristics.forEach(characteristic => {
          cy.get('ul[data-cy-bedspace-key-characteristics] > li').should('contain', characteristic.name)
        })

        this.result.overlaps.forEach((overlap, i) => {
          cy.get('ul[data-cy-overlaps] > li')
            .eq(i)
            .within(() => {
              cy.root().contains(`CRN: ${overlap.crn}`)
              cy.root().contains(overlap.days === 1 ? '1 day overlap' : `${overlap.days} days overlap`)
              cy.get('a')
                .contains('View booking')
                .should(
                  'have.attr',
                  'href',
                  paths.bookings.show({
                    premisesId: this.result.premises.id,
                    roomId: overlap.roomId,
                    bookingId: overlap.bookingId,
                  }),
                )
            })
        })
      })
  }

  clickOverlapLink(crn: string) {
    cy.get('summary').contains('Other people staying').click()
    cy.get('ul[data-cy-overlaps] > li').contains(crn).find('a').click()
  }
}
