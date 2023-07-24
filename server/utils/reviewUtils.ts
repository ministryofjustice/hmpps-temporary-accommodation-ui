import {
  TemporaryAccommodationApplication as Application,
  TemporaryAccommodationAssessment as Assessment,
} from '../@types/shared'
import { SummaryListItem, Task } from '../@types/ui'
import getSections from './assessments/getSections'

const reviewSections = (
  applicationOrAssessment: Application | Assessment,
  rowFunction: (task: Task, document: Application | Assessment) => Array<SummaryListItem>,
) => {
  const nonCheckYourAnswersSections = getSections(applicationOrAssessment).slice(0, -1)

  return nonCheckYourAnswersSections.map(section => {
    return {
      title: section.title,
      tasks: section.tasks.map(task => {
        return {
          id: task.id,
          title: task.title,
          rows: rowFunction(task, applicationOrAssessment),
        }
      }),
    }
  })
}

export default reviewSections
