import type { Person } from '@approved-premises/api'
import { DateFormats } from '../../server/utils/dateUtils'
import Component from './component'

export default class PersonDetailsComponent extends Component {
  constructor(private readonly person: Person) {
    super()
  }

  shouldShowPersonDetails(): void {
    cy.get('dl[data-cy-person-info]').within(() => {
      this.assertDefinition('Name', this.person.name)
      this.assertDefinition('CRN', this.person.crn)
      this.assertDefinition('Date of birth', DateFormats.isoDateToUIDate(this.person.dateOfBirth, { format: 'short' }))
      this.assertDefinition('NOMS number', this.person.nomsNumber)
      if (this.person.nationality) {
        this.assertDefinition('Nationality', this.person.nationality)
      }
      if (this.person.religionOrBelief) {
        this.assertDefinition('Religion or belief', this.person.religionOrBelief)
      }
      this.assertDefinition('Sex', this.person.sex)
      cy.get(`[data-cy-status]`).should('have.attr', 'data-cy-status').and('equal', this.person.status)
      this.assertDefinition('Prison', this.person.prisonName)
    })
  }
}
