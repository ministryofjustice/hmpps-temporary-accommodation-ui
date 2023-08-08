import {
  TemporaryAccommodationApplication as Application,
  TemporaryAccommodationAssessment as Assessment,
} from '@approved-premises/api'
import { FormSections, Task, TaskStatus, TaskWithStatus } from '@approved-premises/ui'
import getTaskStatus from '../form-pages/utils/getTaskStatus'
import getSections from '../utils/assessments/getSections'

export default class TasklistService {
  taskStatuses: Record<string, TaskStatus>

  formSections: FormSections

  constructor(applicationOrAssessment: Application | Assessment) {
    this.formSections = getSections(applicationOrAssessment)
    this.taskStatuses = {}

    this.formSections.forEach(section => {
      section.tasks.forEach(task => {
        const previousTaskKey = Object.keys(this.taskStatuses).at(-1)
        const previousTaskStatus = this.taskStatuses[previousTaskKey]

        if (!previousTaskStatus || previousTaskStatus === 'complete') {
          this.taskStatuses[task.id] = getTaskStatus(task, applicationOrAssessment)
        } else {
          this.taskStatuses[task.id] = 'cannot_start'
        }
      })
    })
  }

  get completeSectionCount() {
    return this.formSections.filter(section => {
      const taskIds = section.tasks.map(s => s.id)
      const completeTasks = Object.keys(this.taskStatuses)
        .filter(k => taskIds.includes(k))
        .filter(k => this.taskStatuses[k] === 'complete')
      return completeTasks.length === taskIds.length
    }).length
  }

  get sections() {
    return this.formSections.map((s, i) => {
      const tasks = s.tasks.map(t => this.addStatusToTask(t))
      return { sectionNumber: i + 1, title: s.title, tasks }
    })
  }

  get status() {
    const completeTasks = Object.values(this.taskStatuses).filter(t => t === 'complete')
    return completeTasks.length === Object.keys(this.taskStatuses).length ? 'complete' : 'incomplete'
  }

  addStatusToTask(task: Task): TaskWithStatus {
    return { ...task, status: this.taskStatuses[task.id] }
  }
}
