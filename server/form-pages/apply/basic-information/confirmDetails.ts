import type { Request } from 'express'
import type { TasklistPage, Person } from 'approved-premises'

import type { DataServices } from '../../../services/applicationService'
import { TasklistAPIError } from '../../../utils/errors'

export default class ConfirmDetails implements TasklistPage {
  name = 'confirm-details'

  title: string

  details: Person

  async setup(request: Request, dataServices: DataServices): Promise<void> {
    const { personService } = dataServices
    const { crn } = request.session.application[request.params.id]['basic-information']['enter-crn']

    try {
      this.details = await personService.findByCrn(request.user.token, crn)
      this.title = `Confirm ${this.details.name}'s details`
    } catch (err) {
      if ('status' in err && err.status === 404) {
        throw new TasklistAPIError(`No person with an CRN of '${crn}' was found`, 'crn')
      } else {
        throw err
      }
    }
  }

  next() {
    return 'sentence-type'
  }

  previous() {
    return 'enter-crn'
  }
}
