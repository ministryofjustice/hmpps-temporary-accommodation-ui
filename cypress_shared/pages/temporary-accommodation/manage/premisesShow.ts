import type { Premises } from '@approved-premises/api'

import Page from '../../page'
import paths from '../../../../server/paths/temporary-accommodation/manage'

export default class PremisesShowPage extends Page {
  constructor(private readonly premises: Premises) {
    super('Manage a property')
  }

  static visit(premises: Premises): PremisesShowPage {
    cy.visit(paths.premises.show({ premisesId: premises.id }))
    return new PremisesShowPage(premises)
  }

  shouldShowPremisesDetail(): void {
    cy.get('.govuk-summary-list__key')
      .contains('Property name')
      .siblings('.govuk-summary-list__value')
      .should('contain', this.premises.name)

    cy.get('.govuk-summary-list__key')
      .contains('Address')
      .siblings('.govuk-summary-list__value')
      .should('contain', this.premises.addressLine1)
      .should('contain', this.premises.postcode)

    cy.get('.govuk-summary-list__key')
      .contains('Local authority')
      .siblings('.govuk-summary-list__value')
      .should('contain', this.premises.localAuthorityArea.name)

    this.premises.notes.split('\n').forEach(noteLine => {
      cy.get('.govuk-summary-list__key')
        .contains('Notes')
        .siblings('.govuk-summary-list__value')
        .should('contain', noteLine)
    })
  }
}
