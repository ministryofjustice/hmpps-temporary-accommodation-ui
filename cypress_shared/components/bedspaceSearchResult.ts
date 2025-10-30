import { Cas3v2BedspaceSearchResult } from '../../server/@types/shared'
import paths from '../../server/paths/temporary-accommodation/manage'
import Component from './component'
import { formatNotes } from '../../server/utils/viewUtils'

export default class BedspaceSearchResult extends Component {
  constructor(private readonly result: Cas3v2BedspaceSearchResult) {
    super()
  }

  shouldShowResult(checkCount = true): void {
    cy.get('h2')
      .contains(this.result.bedspace.reference)
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
            `${this.result.premises.bedspaceCount} total: ${this.result.premises.bookedBedspaceCount} booked, ${this.result.premises.bedspaceCount - this.result.premises.bookedBedspaceCount} available`,
          )
        }

        this.result.premises.characteristics.forEach(characteristic => {
          cy.get('ul[data-cy-premises-key-characteristics] > li').should('contain', characteristic.name)
        })

        this.result.bedspace.characteristics.forEach(characteristic => {
          cy.get('ul[data-cy-bedspace-key-characteristics] > li').should('contain', characteristic.name)
        })

        cy.get('div[data-cy-premises-notes]').within(() => {
          const expectedNotesHTML = formatNotes(this.result.premises.notes)
            .replace(/<br \/>/g, '<br>')
            .replace(/<p>/g, '')
            .replace(/<\/p>/g, '')

          cy.get('h3').contains('Property notes')

          cy.get('p').then(element => {
            const renderedHTML = element.html()
            expect(renderedHTML).to.eq(expectedNotesHTML)
          })

          // invoke('html').contains(notes)
        })

        this.result.overlaps.forEach((overlap, i) => {
          cy.get('ul[data-cy-overlaps] > li')
            .eq(i)
            .within(() => {
              cy.root().contains(`Name: ${overlap.name}`)
              cy.root().contains(`Sex: ${overlap.sex},`)
              cy.root().contains(`CRN: ${overlap.crn}`)
              cy.root().contains(overlap.days === 1 ? '1 day overlap' : `${overlap.days} days overlap`)
              cy.get('a')
                .contains(`View referral for ${overlap.name}`)
                .should('have.attr', 'href', paths.assessments.summary({ id: overlap.assessmentId }))
            })
        })
      })
  }

  clickOverlapLink(crn: string) {
    cy.get('summary').contains('Other people staying').click()
    cy.get('ul[data-cy-overlaps]').find('dd.overlap-details__value').contains(crn).parents('li').find('a').click()
  }
}
