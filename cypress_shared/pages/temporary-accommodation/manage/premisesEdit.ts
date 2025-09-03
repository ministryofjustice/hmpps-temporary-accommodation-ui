import type { TemporaryAccommodationPremises as Premises } from '@approved-premises/api'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import PremisesEditablePage from './premisesEditable'

export default class PremisesEditPage extends PremisesEditablePage {
  constructor() {
    super('Edit a property')
  }

  static visit(premises: Premises): PremisesEditPage {
    cy.visit(paths.premises.edit({ premisesId: premises.id }))
    return new PremisesEditPage()
  }
}
