import TasklistPage from '../../tasklistPage'
import { convertKeyValuePairToRadioItems } from '../../../utils/formUtils'

const apTypes = {
  standard: 'Standard',
  pipe: 'PIPE (physcologically informed planned environment)',
  esap: 'ESAP (enhanced security AP)',
} as const

type ApTypes = typeof apTypes

export default class ApType implements TasklistPage {
  name = 'ap-type'

  title = 'Which type of AP does xxxx require?'

  body: { type: keyof ApTypes }

  constructor(body: Record<string, unknown>) {
    this.body = {
      type: body.type as keyof ApTypes,
    }
  }

  next() {
    if (this.body.type === 'pipe') {
      return 'pipe-referral'
    }
    if (this.body.type === 'esap') {
      return 'esap-placement-screening'
    }

    return null
  }

  errors() {
    const errors = []

    if (!this.body.type) {
      errors.push({
        propertyName: '$.type',
        errorType: 'empty',
      })
    }

    return errors
  }

  items() {
    return convertKeyValuePairToRadioItems(apTypes, this.body.type)
  }
}
