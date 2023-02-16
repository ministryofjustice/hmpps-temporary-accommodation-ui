import type { Person } from '@approved-premises/api'
import { DateFormats } from '../../../server/utils/dateUtils'

import Page from '../page'

export default class ConfirmDetailsPage extends Page {
  constructor(private person: Person) {
    super(`Confirm ${person.name}'s details`)
  }

  verifyPersonIsVisible(): void {
    cy.get('dl[data-cy-person-info]').within(() => {
      this.assertDefinition('Name', this.person.name)
      this.assertDefinition('CRN', this.person.crn)
      this.assertDefinition('Date of Birth', DateFormats.isoDateToUIDate(this.person.dateOfBirth, { format: 'short' }))
      this.assertDefinition('NOMS Number', this.person.nomsNumber)
      this.assertDefinition('Nationality', this.person.nationality)
      this.assertDefinition('Religion or belief', this.person.religionOrBelief)
      this.assertDefinition('Sex', this.person.sex)
    })

    cy.get('dl[data-cy-prison-info]').within(() => {
      cy.get(`[data-cy-status]`).should('have.attr', 'data-cy-status').and('equal', this.person.status)
      this.assertDefinition('Prison', this.person.prisonName)
    })
  }
}
