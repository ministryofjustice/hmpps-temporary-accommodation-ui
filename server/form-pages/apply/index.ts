/* istanbul ignore file */

import basicInfomationPages from './basic-information'
import typeOfApPages from './type-of-ap'

const pages = {
  'basic-information': basicInfomationPages,
  'type-of-ap': typeOfApPages,
}

export default pages

export type TaskNames = keyof typeof pages
export type Application = Record<TaskNames, unknown>
