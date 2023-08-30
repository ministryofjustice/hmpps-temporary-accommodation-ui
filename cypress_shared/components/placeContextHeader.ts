import { PlaceContext } from '../../server/@types/ui'
import { DateFormats } from '../../server/utils/dateUtils'
import { isFullPerson, personName } from '../../server/utils/personUtils'
import Component from './component'

export default class PlaceContextHeaderComponent extends Component {
  constructor(private readonly placeContext: PlaceContext) {
    super()
  }

  static shouldNotShowPlaceContextDetails(): void {
    cy.get('.place-context-header').should('not.exist')
  }

  shouldShowPlaceContextDetails(): void {
    cy.get('.place-context-header').within(() => {
      const { application } = this.placeContext!.assessment
      const { person } = application

      cy.root().should('contain', personName(person, 'Limited access offender'))

      if (isFullPerson(person)) {
        cy.root().should(
          'contain',
          `Date of birth: ${DateFormats.isoDateToUIDate(person.dateOfBirth, { format: 'short' })}`,
        )

        if (person.genderIdentity) {
          cy.root().should('contain', `Gender identity: ${person.genderIdentity}`)
          cy.root().should('not.contain', 'Sex')
        } else {
          cy.root().should('contain', `Sex: ${person.sex}`)
          cy.root().should('not.contain', 'Gender identity')
        }
      }
      cy.root().should('contain', `CRN: ${person.crn}`)
      cy.root().should(
        'contain',
        `Accommodation required from: ${DateFormats.isoDateToUIDate(application.arrivalDate, { format: 'short' })}`,
      )
    })
  }
}
