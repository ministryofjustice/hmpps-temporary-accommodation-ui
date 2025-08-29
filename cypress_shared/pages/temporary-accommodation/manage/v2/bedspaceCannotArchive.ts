import Page from '../../../page'
import paths from '../../../../../server/paths/temporary-accommodation/manage'

export default class BedspaceCannotArchivePage extends Page {
  constructor(private readonly bedspaceReference: string) {
    super(`You cannot archive ${bedspaceReference}`)
  }

  static visit(premisesId: string, bedspaceId: string, bedspaceReference: string): BedspaceCannotArchivePage {
    cy.visit(paths.premises.bedspaces.cannotArchive({ premisesId, bedspaceId }))
    return new BedspaceCannotArchivePage(bedspaceReference)
  }

  shouldShowCannotArchiveMessage(): void {
    cy.get('h1').should('contain', `You cannot archive ${this.bedspaceReference}`)
    cy.get('p').should('contain', 'This bedspace has a booking or void that prevents it from being archived.')
  }

  clickReturnToBedspaceDetails(): void {
    cy.get('a').contains('View bedspace details').click()
  }

  shouldShowReturnButton(): void {
    cy.get('a').contains('View bedspace details').should('be.visible')
  }
}
