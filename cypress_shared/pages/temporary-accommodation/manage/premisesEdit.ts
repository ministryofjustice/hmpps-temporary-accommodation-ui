import PremisesEditablePage from './premisesEditable'
import { Cas3Premises } from '../../../../server/@types/shared'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import { convertToTitleCase } from '../../../../server/utils/utils'

export default class PremisesEditPage extends PremisesEditablePage {
  constructor() {
    super('Edit property')
  }

  static visit(premises: Cas3Premises) {
    cy.visit(paths.premises.edit({ premisesId: premises.id }))
    return new PremisesEditPage()
  }

  shouldShowPropertySummary(premises: Cas3Premises) {
    cy.get('dl').contains('Status').siblings('dd').contains(convertToTitleCase(premises.status))
    cy.get('dl')
      .contains('Address')
      .siblings('dd')
      .contains(premises.addressLine1)
      .contains(premises.addressLine2)
      .contains(premises.town)
      .contains(premises.postcode)
  }
}
