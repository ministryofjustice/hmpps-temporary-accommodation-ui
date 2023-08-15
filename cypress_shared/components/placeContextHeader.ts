import { PlaceContext } from '../../server/@types/ui'
import { DateFormats } from '../../server/utils/dateUtils'
import Component from './component'

export default class PlaceContextHeaderComponent extends Component {
  constructor(private readonly placeContext: PlaceContext) {
    super()
  }

  shouldShowPlaceContextDetails(): void {
    cy.get('.place-context-header').within(() => {
      const { person } = this.placeContext.assessment.application

      cy.root().should('contain', person.name)
      cy.root().should(
        'contain',
        `Date of birth: ${DateFormats.isoDateToUIDate(person.dateOfBirth, { format: 'short' })}`,
      )
      cy.root().should('contain', `Sex: ${person.sex}`)

      if (person.genderIdentity) {
        cy.root().should('contain', `Gender identity: ${person.genderIdentity}`)
      } else {
        cy.root().should('not.contain', `Gender identity`)
      }

      cy.root().should('contain', `CRN: ${person.crn}`)
    })
  }
}
