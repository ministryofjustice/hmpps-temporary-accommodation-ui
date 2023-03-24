import Component from './component'
import { Person } from '../../server/@types/shared'
import { DateFormats } from '../../server/utils/dateUtils'

export default class PopDetailsHeaderComponent extends Component {
  constructor(private readonly person: Person) {
    super()
  }

  shouldShowPopDetails(): void {
    cy.get('.pop-details-header').within(() => {
      cy.get('p').should('contain', `Name: ${this.person.name}`)
      cy.get('p').should('contain', `CRN: ${this.person.crn}`)
      cy.get('p').should('contain', `Date of birth: ${DateFormats.isoDateToUIDate(this.person.dateOfBirth)}`)
    })
  }
}
