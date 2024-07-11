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
        `Accommodation required from: ${DateFormats.isoDateToUIDate(assessment.accommodationRequiredFromDate, { format: 'short' })}`,
      )
      cy.root().should('contain', 'Suitable to share: Yes')
    })
  }
}
