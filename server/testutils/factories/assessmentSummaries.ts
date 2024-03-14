import { Factory } from 'fishery'
import { PaginatedResponse } from '@approved-premises/ui'
import { TemporaryAccommodationAssessmentSummary } from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import AssessmentSummary from './assessmentSummary'

export default Factory.define<PaginatedResponse<TemporaryAccommodationAssessmentSummary>>(() => {
  const data = AssessmentSummary.buildList(faker.number.int({ min: 5, max: 10 }))

  return {
    url: {
      params: new URLSearchParams(),
    },
    pageNumber: 1,
    totalResults: data.length,
    totalPages: 1,
    pageSize: 1000,
    data,
  }
})
