import { TemporaryAccommodationApplication } from '@approved-premises/api'
import { HtmlItem, SummaryListItem, Task, TextItem } from '@approved-premises/ui'

import paths from '../../paths/apply'

import reviewSections from '../reviewUtils'
import { formatLines } from '../viewUtils'
import { embeddedSummaryListItem } from './embeddedSummaryListItem'
import { forPagesInTask } from '../applicationUtils'
import { offenceIdKey } from '../../form-pages/apply/accommodation-need/sentence-information/offendingSummary'

const checkYourAnswersSections = (application: TemporaryAccommodationApplication) =>
  reviewSections(application, getTaskResponsesAsSummaryListItems)

export const getTaskResponsesAsSummaryListItems = (
  task: Task,
  application: TemporaryAccommodationApplication,
): Array<SummaryListItem> => {
  const items: Array<SummaryListItem> = []

  forPagesInTask(application, task, (page, pageName) => {
    const response = page.response()

    Object.keys(response).forEach(key => {
      const value =
        typeof response[key] === 'string' || response[key] instanceof String
          ? ({ html: formatLines(response[key] as string) } as HtmlItem)
          : ({ html: embeddedSummaryListItem(response[key] as Array<Record<string, unknown>>) } as HtmlItem)

      items.push(summaryListItemForResponse(key, value, task, pageName, application))
    })
  })

  return items
}

const summaryListItemForResponse = (
  key: string,
  value: TextItem | HtmlItem,
  task: Task,
  pageName: string,
  application: TemporaryAccommodationApplication,
) => {
  const actions = {
    items: [
      {
        href: paths.applications.pages.show({ task: task.id, page: pageName, id: application.id }),
        text: 'Change',
        visuallyHiddenText: key,
        classes: 'exclude-from-print',
      },
    ],
  }

  return {
    key: {
      text: key,
    },
    value,
    ...(key === offenceIdKey ? {} : { actions }),
  }
}

export { checkYourAnswersSections }
