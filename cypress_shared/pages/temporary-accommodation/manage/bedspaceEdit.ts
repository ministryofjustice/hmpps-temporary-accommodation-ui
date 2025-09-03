import type { Premises } from '@approved-premises/api'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import BedspaceEditablePage from './bedspaceEditable'
import { Cas3Bedspace } from '../../../../server/@types/shared'

export default class BedspaceEditPage extends BedspaceEditablePage {
  constructor() {
    super('Edit a bedspace')
  }

  static visit(premises: Premises, bedspace: Cas3Bedspace): BedspaceEditPage {
    cy.visit(paths.premises.bedspaces.edit({ premisesId: premises.id, bedspaceId: bedspace.id }))
    return new BedspaceEditPage()
  }
}
