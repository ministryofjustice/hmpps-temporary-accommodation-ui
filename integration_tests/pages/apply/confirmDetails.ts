import type { Person } from 'approved-premises'

import Page from '../page'

export default class ConfirmDetailsPage extends Page {
  constructor(private person: Person) {
    super(`Confirm ${person.name}'s details`)
  }

  verifyPersonIsVisible(): void {
    cy.get('dl').within(() => {
      this.assertDefinition('Name', this.person.name)
      this.assertDefinition('CRN', this.person.crn)
    })
  }
}
