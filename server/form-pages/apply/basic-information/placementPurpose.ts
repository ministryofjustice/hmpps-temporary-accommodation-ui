import type { TaskListErrors } from '@approved-premises/ui'
import type { Application } from '@approved-premises/api'

import TasklistPage from '../../tasklistPage'
import { convertKeyValuePairToCheckBoxItems } from '../../../utils/formUtils'

export const placementPurposes = {
  publicProtection: 'Public protection',
  preventContact: 'Prevent Contact',
  readjust: 'Help individual readjust to life outside custody',
  drugAlcoholMonitoring: 'Provide drug or alcohol monitoring',
  preventSelfHalf: 'Prevent self harm or suicide',
  otherReason: 'Other (please specify)',
} as const

type PlacementPurposeT = keyof typeof placementPurposes

export default class PlacementPurpose implements TasklistPage {
  name = 'placement-purpose'

  title = `What is the purpose of the AP placement?`

  body: { placementPurposes: Array<PlacementPurposeT>; otherReason?: string } | Record<string, never>

  purposes = placementPurposes

  previousPage: string

  constructor(body: Record<string, unknown>, private readonly _application: Application, previousPage: string) {
    if (this.responseNeedsFreeTextReason(body)) {
      this.body = {
        placementPurposes: body.placementPurposes as Array<PlacementPurposeT>,
        otherReason: body.otherReason as string,
      }
    } else {
      this.body = { placementPurposes: body.placementPurposes as Array<PlacementPurposeT> }
    }

    this.previousPage = previousPage
  }

  next() {
    return ''
  }

  previous() {
    return this.previousPage
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.responseContainsReasons(this.body)) {
      errors.placementPurposes = 'You must choose at least one placement purpose'
    }

    if (this.responseNeedsFreeTextReason(this.body)) {
      errors.placementPurposes = 'You must explain the reason'
    }

    return errors
  }

  private responseContainsReasons(body: Record<string, unknown>): body is { placementPurposes: Array<unknown> } {
    if (body?.placementPurposes && Array.isArray(body.placementPurposes)) {
      return true
    }
    return false
  }

  private responseNeedsFreeTextReason(body: Record<string, unknown>) {
    if (this.responseContainsReasons(body)) {
      if (body.placementPurposes.find(element => element === 'otherReason')) {
        return true
      }
    }
    return false
  }

  items() {
    return convertKeyValuePairToCheckBoxItems(placementPurposes, this.body.placementPurposes)
  }

  response() {
    return { [this.title]: this.body.placementPurposes.map(purpose => placementPurposes[purpose]).join(', ') }
  }
}
