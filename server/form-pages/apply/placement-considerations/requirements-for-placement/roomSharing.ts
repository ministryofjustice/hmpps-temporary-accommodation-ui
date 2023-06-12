import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { TaskListErrors, YesOrNoWithDetail } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { yesOrNoResponseWithDetail } from '../../../utils'

type RoomSharingBody = YesOrNoWithDetail<'roomSharing'>

@Page({ name: 'room-sharing', bodyProperties: ['roomSharing', 'roomSharingDetail'] })
export default class RoomSharing implements TasklistPage {
  title = 'Room sharing'

  questions: {
    roomSharing: string
  }

  constructor(readonly body: Partial<RoomSharingBody>, readonly application: Application) {
    this.questions = {
      roomSharing: `Would ${application.person.name} be able to share accommodation with others?`,
    }
  }

  response() {
    return {
      [this.questions.roomSharing]: yesOrNoResponseWithDetail('roomSharing', this.body),
    }
  }

  previous() {
    return 'dashboard'
  }

  next() {
    return 'food-allergies'
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.roomSharing) {
      errors.roomSharing = `You must specifiy if ${this.application.person.name} would be able to share accommodation with others`
    }

    if (this.body.roomSharing === 'yes' && !this.body.roomSharingDetail) {
      errors.roomSharingDetail = `You must provide details of how you will manage risk if ${this.application.person.name} is placed in shared accommodation`
    }

    return errors
  }
}
