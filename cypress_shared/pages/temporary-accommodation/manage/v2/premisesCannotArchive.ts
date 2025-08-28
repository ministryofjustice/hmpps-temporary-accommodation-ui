import Page from '../../../page'
import { Cas3Premises, Cas3ValidationResult } from '../../../../../server/@types/shared'

export default class PremisesCannotArchivePage extends Page {
  constructor(premises: Cas3Premises) {
    super(`You cannot archive ${premises.addressLine1}`)
  }

  shouldShowAffectedBedspaces(bedspaces: Array<Cas3ValidationResult>): void {
    bedspaces.forEach(bedspace => {
      cy.get('ul li a').contains(bedspace.entityReference)
    })
  }

  clickAffectedBedspace(reference: string): void {
    cy.get('ul li a').contains(reference).click()
  }

  clickViewBedspacesOverview(): void {
    cy.get('a').contains('View bedspaces overview').click()
  }
}
