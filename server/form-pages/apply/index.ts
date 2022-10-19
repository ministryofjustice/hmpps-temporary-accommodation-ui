/* istanbul ignore file */

import type { TaskNames } from '@approved-premises/ui'
import basicInfomationPages from './basic-information'
import typeOfApPages from './type-of-ap'

const pages: {
  [key in TaskNames]: Record<string, unknown>
} = {
  'basic-information': basicInfomationPages,
  'type-of-ap': typeOfApPages,
}

export default pages
