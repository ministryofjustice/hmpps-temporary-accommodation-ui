import { ApprovedPremisesApplication as Application, ApprovedPremisesAssessment as Assessment } from '../@types/shared'
import { SummaryListItem, Task } from '../@types/ui'
import Apply from '../form-pages/apply'
import getSections from './assessments/getSections'
import isAssessment from './assessments/isAssessment'

const reviewSections = (
  applicationOrAssessment: Application | Assessment,
  rowFunction: (task: Task, document: Application | Assessment) => Array<SummaryListItem>,
) => {
  const nonCheckYourAnswersSections = isAssessment(applicationOrAssessment)
    ? getSections(applicationOrAssessment).slice(0, -1)
    : Apply.sections.slice(0, -1)

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
