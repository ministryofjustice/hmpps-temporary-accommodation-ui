import type { Premises, Room } from '@approved-premises/api'

import Page from '../../page'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import { formatStatus } from '../../../../server/utils/premisesUtils'

export default class PremisesShowPage extends Page {
  constructor(private readonly premises: Premises) {
    super('View a property')
  }

  static visit(premises: Premises): PremisesShowPage {
    cy.visit(paths.premises.show({ premisesId: premises.id }))
    return new PremisesShowPage(premises)
  }

  shouldShowPremisesDetails(): void {
    cy.get('h2').should('contain', `${this.premises.addressLine1}, ${this.premises.postcode}`)

    cy.get(`[data-cy-premises]`).within(() => {
      cy.get('h3').should('contain', this.premises.name)

      this.shouldShowKeyAndValues('Address', [this.premises.addressLine1, this.premises.postcode])
      this.shouldShowKeyAndValue('Local authority', this.premises.localAuthorityArea.name)
      this.shouldShowKeyAndValue('Probation region', this.premises.probationRegion.name)
      this.shouldShowKeyAndValues(
        'Attributes',
        this.premises.characteristics.map(({ name }) => name),
      )
      this.shouldShowKeyAndValue('Status', formatStatus(this.premises.status))
      this.shouldShowKeyAndValues('Notes', this.premises.notes.split('\n'))
    })
  }

  shouldShowRoomDetails(room: Room): void {
    cy.get('h4')
      .contains(room.name)
      .parents('[data-cy-bedspace]')
      .within(() => {
        this.shouldShowKeyAndValues(
          'Attributes',
          room.characteristics.map(({ name }) => name),
        )
        this.shouldShowKeyAndValues('Notes', room.notes.split('\n'))
      })
  }

  clickAddBedspaceLink(): void {
    cy.get('.moj-identity-bar').within(() => {
      cy.get('button').contains('Actions').click()
      cy.get('a').contains('Add a bedspace').click()
    })
  }

  clickPremisesEditLink(): void {
    cy.get(`[data-cy-premises]`).within(() => {
      cy.get('a').contains('Edit').click()
    })
  }

  clickBedpaceViewLink(room: Room): void {
    cy.get('h4')
      .contains(room.name)
      .parents('[data-cy-bedspace]')
      .within(() => {
        cy.get('a').contains('View').click()
      })
  }
}
