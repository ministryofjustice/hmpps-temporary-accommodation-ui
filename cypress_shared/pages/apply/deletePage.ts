import { TemporaryAccommodationApplication as Application } from '../../../server/@types/shared'
import Page from '../page'
import { personName } from '../../../server/utils/personUtils'
import paths from '../../../server/paths/apply'

export default class DeletePage extends Page {
  private readonly name: string

  constructor(private readonly application: Application) {
    const name = personName(application.person)
    super(name)
    this.name = name
  }

  static visit(inProgressApplication: Application): DeletePage {
    cy.visit(paths.applications.delete({ id: inProgressApplication.id }))

    return new DeletePage(inProgressApplication)
  }

  hasGuidance(): void {
    cy.contains(`Are you sure you want to delete referral for ${this.name}?`)
  }

  chooseYesOption = (): void => {
    this.checkRadioByNameAndValue('confirmDelete', 'yes')
  }

  chooseNoOption = (): void => {
    this.checkRadioByNameAndValue('confirmDelete', 'no')
  }
}
