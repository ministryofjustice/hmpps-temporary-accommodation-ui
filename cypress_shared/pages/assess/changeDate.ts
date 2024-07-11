import Page from '../page'
import { TemporaryAccommodationAssessment as Assessment } from '../../../server/@types/shared'
import { AssessmentUpdatableDateField } from '../../../server/@types/ui'
import { personName } from '../../../server/utils/personUtils'
import paths from '../../../server/paths/temporary-accommodation/manage'

export default class ChangeDatePage extends Page {
  dateField: AssessmentUpdatableDateField

  constructor(
    dateField: AssessmentUpdatableDateField,
    private readonly assessment: Assessment,
  ) {
    const title =
      dateField === 'releaseDate'
        ? `What is ${personName(assessment.application.person)}'s release date?`
        : 'What date is accommodation required from?'
    super(title)

    this.dateField = dateField
  }

  static visit(dateField: AssessmentUpdatableDateField, assessment: Assessment): ChangeDatePage {
    cy.visit(paths.assessments.changeDate[dateField]({ id: assessment.id }))

    return new ChangeDatePage(dateField, assessment)
  }

  completeForm(date: string) {
    this.completeDateInputs(this.dateField, date)
    this.clickSubmit('Save and continue')
  }
}
