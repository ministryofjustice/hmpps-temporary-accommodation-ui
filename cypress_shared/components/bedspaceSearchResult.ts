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
      .parents('div[data-cy-bedspace]')
      .within(() => {
        if (this.result.premises.town) {
          cy.get('h3').should(
            'contain',
            `${this.result.premises.addressLine1}, ${this.result.premises.town}, ${this.result.premises.postcode}`,
          )
        } else {
          cy.get('h3').should('contain', `${this.result.premises.addressLine1},${this.result.premises.postcode}`)
        }

        this.result.premises.characteristics.forEach(characteristic => {
          cy.get('ul[data-cy-premises-key-characteristics] > li').should('contain', characteristic.name)
        })

        this.result.room.characteristics.forEach(characteristic => {
          cy.get('ul[data-cy-bedspace-key-characteristics] > li').should('contain', characteristic.name)
        })

        if (checkCount) {
          this.shouldShowKeyAndValue('Number of bedspaces', `${this.result.premises.bedCount}`)
        }

        this.result.overlaps.forEach((overlap, i) => {
          cy.get('ul[data-cy-overlaps] > li')
            .eq(i)
            .within(() => {
              cy.get('a')
                .contains(overlap.crn)
                .should(
                  'have.attr',
                  'href',
                  paths.bookings.show({
                    premisesId: this.result.premises.id,
                    roomId: overlap.roomId,
                    bookingId: overlap.bookingId,
                  }),
                )

              cy.root().contains(`(${overlap.days} day overlap)`)
            })
        })
      })
  }

  clickOverlapLink(crn: string) {
    cy.get('ul[data-cy-overlaps] > li > a').contains(crn).click()
  }
}
