import type { Request } from 'express'
import type { TasklistPage, Person } from 'approved-premises'

import type { DataServices } from '../../../services/applicationService'

export default class ConfirmDetails implements TasklistPage {
  name = 'confirm-details'

  title: string

  details: Person

  async setup(request: Request, dataServices: DataServices): Promise<void> {
    const { personService } = dataServices
    const { crn } = request.session.application[request.params.id]['basic-information']['enter-crn']

    this.details = await personService.findByCrn(request.user.token, crn)
    this.title = `Confirm ${this.details.name}'s details`
  }

  next() {
    return 'sentence-type'
  }

  previous() {
    return 'enter-crn'
  }
}
