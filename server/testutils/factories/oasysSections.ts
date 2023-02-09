import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import { OASysQuestion, OASysSections, OASysSupportingInformationQuestion } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'
import oasysSelectionFactory from './oasysSelection'

export default Factory.define<OASysSections>(() => ({
  assessmentId: faker.datatype.number(),
  assessmentState: faker.helpers.arrayElement(['Completed', 'Incomplete']),
  dateStarted: DateFormats.dateObjToIsoDate(faker.date.past()),
  dateCompleted: DateFormats.dateObjToIsoDate(faker.date.recent()),
  offenceDetails: offenceDetailsFactory.buildList(5),
  roshSummary: roshSummaryFactory.buildList(5),
  supportingInformation: supportingInformationFactory.buildList(5),
  riskToSelf: riskToSelfFactory.buildList(5),
  riskManagementPlan: riskManagementPlanFactory.buildList(5),
}))

export const roshSummaryFactory = Factory.define<OASysQuestion>(options => ({
  questionNumber: options.sequence.toString(),
  label: faker.helpers.arrayElement([
    'Who is at risk?',
    'What is the nature of the risk?',
    'When is the risk likely to be greatest?',
    'What circumstances are likely to increase risk?',
  ]),
  answer: faker.lorem.paragraph(),
}))

export const offenceDetailsFactory = Factory.define<OASysQuestion>(options => ({
  questionNumber: options.sequence.toString(),
  label: faker.helpers.arrayElement([
    'Offence analysis',
    'Others involved',
    'Issues contributing to risk',
    'Motivation and triggers',
    'Victim impact',
    'Victim Information',
    'Previous offences',
  ]),
  answer: faker.lorem.paragraph(),
}))

export const supportingInformationFactory = Factory.define<OASysSupportingInformationQuestion>(options => {
  const oasysSelection = oasysSelectionFactory.build()

  return {
    ...oasysSelection,
    questionNumber: options.sequence.toString(),
    label: oasysSelection.name,
    answer: faker.lorem.paragraph(),
  }
})

const riskManagementPlanFactory = Factory.define<OASysQuestion>(options => ({
  questionNumber: options.sequence.toString(),
  label: faker.helpers.arrayElement([
    'Key information about current situation',
    'Further considerations about current situation',
    'Supervision',
    'Monitoring and control',
    'Intervention and treatment',
    'Victim safety planning',
    'Contingency Plans',
    'Additional comments',
  ]),
  answer: faker.lorem.paragraph(),
}))

export const riskToSelfFactory = Factory.define<OASysSupportingInformationQuestion>(options => {
  const oasysSelection = oasysSelectionFactory.build()

  return {
    ...oasysSelection,
    questionNumber: options.sequence.toString(),
    label: faker.helpers.arrayElement([
      'Current concerns of self harm and suicide',
      'Previous concerns of self harm and suicide',
      'Current concerns about coping in a hostel setting',
      'Previous concerns about coping in a hostel setting',
      'Risk of serious harm',
    ]),
    answer: faker.lorem.paragraph(),
  }
})
