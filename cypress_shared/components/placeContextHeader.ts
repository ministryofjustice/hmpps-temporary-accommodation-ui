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
      const { assessment } = this.placeContext
      const { person } = assessment.application

      cy.root().should('contain', personName(person, 'Limited access offender'))
      cy.root().should('contain', 'View referral summary (opens in new tab)')

      if (isFullPerson(person)) {
        cy.root().contains('Date of birth:').next().should('contain', DateFormats.isoDateToUIDate(person.dateOfBirth))

        cy.root().contains('Sex:').next().should('contain', person.sex)

        if (person.genderIdentity) {
          cy.root().contains('Gender identity:').next().should('contain', person.genderIdentity)
        } else {
          cy.root().should('not.contain', 'Gender identity')
        }
      }
      cy.root().contains('CRN:').next().should('contain', person.crn)
      cy.root()
        .contains('Accommodation required')
        .next()
        .should('contain', DateFormats.isoDateToUIDate(assessment.accommodationRequiredFromDate))
      cy.root().contains('Suitable to share:').next().should('contain', 'Yes')
    })
  }
}
