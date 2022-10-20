/* istanbul ignore file */

import type { TaskNames, FormSections } from '@approved-premises/ui'
import basicInfomationPages from './basic-information'
import typeOfApPages from './type-of-ap'

const pages: {
  [key in TaskNames]: Record<string, unknown>
} = {
  'basic-information': basicInfomationPages,
  'type-of-ap': typeOfApPages,
}

const sections: FormSections = [
  {
    title: 'Reasons for placement',
    tasks: [
      {
        id: 'basic-information',
        title: 'Basic Information',
        pages: basicInfomationPages,
      },
      {
        id: 'type-of-ap',
        title: 'Type of Approved Premises required',
        pages: typeOfApPages,
      },
    ],
  },
]

export { pages, sections }
