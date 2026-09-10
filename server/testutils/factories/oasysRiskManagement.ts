import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import { Cas3OASysAssessmentMetadata, Cas3OASysGroup, OASysQuestion } from '@approved-premises/api'

export default Factory.define<Cas3OASysGroup>(() => ({
  assessmentMetadata: oasysAssessmentMetadataFactory.build(),
  answers: riskManagementPlanFactory.buildList(5),
}))

export const riskManagementPlanFactory = Factory.define<OASysQuestion>(() => ({
  questionNumber: faker.helpers.arrayElement(['RM28', 'RM28.1', 'RM30', 'RM31', 'RM32', 'RM33', 'RM34', 'RM35']),
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

export const oasysAssessmentMetadataFactory = Factory.define<Cas3OASysAssessmentMetadata>(() => ({
  hasApplicableAssessment: true,
  dateStarted: faker.date.past({ years: 1 }).toISOString(),
  dateCompleted: faker.date.past({ years: 1 }).toISOString(),
  lastUpdatedDate: faker.date.past({ years: 1 }).toISOString(),
}))
