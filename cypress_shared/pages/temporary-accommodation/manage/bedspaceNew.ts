import type { Cas3Bedspace } from '@approved-premises/api'
import BedspaceEditablePage from './bedspaceEditable'

export default class BedspaceNewPage extends BedspaceEditablePage {
  constructor() {
    super('Add a bedspace')
  }

  completeForm(bedspace: Cas3Bedspace): void {
    super.completeEditableForm(bedspace)
  }
}
