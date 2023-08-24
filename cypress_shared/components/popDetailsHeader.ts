import Component from './component'
import { Person } from '../../server/@types/shared'
import { DateFormats } from '../../server/utils/dateUtils'
import { isFullPerson, personName } from '../../server/utils/personUtils'

export default class PopDetailsHeaderComponent extends Component {
  constructor(private readonly person: Person) {
    super()
  }

  shouldShowPopDetails(): void {
    cy.get('.pop-details-header').within(() => {
      if (isFullPerson(this.person)) {
        cy.get('p').should('contain', `Name: ${this.person.name}`)
      } else {
        cy.get('p').should('contain', 'Limited access offender')
      }
      cy.get('p').should('contain', `CRN: ${this.person.crn}`)
      if (isFullPerson(this.person)) {
        cy.get('p').should('contain', `Date of birth: ${DateFormats.isoDateToUIDate(this.person.dateOfBirth)}`)
      }
    })
  }

  shouldHaveNameLink(path: string): void {
    cy.get('a').contains(personName(this.person, 'Limited access offender')).should('have.attr', 'href', path)
  }
}
