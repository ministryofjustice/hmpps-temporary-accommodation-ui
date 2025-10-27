import { Factory } from 'fishery'
import { PaginatedResponse } from '@approved-premises/ui'
import { Cas3AssessmentSummary } from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import cas3AssessmentSummaryFactory from './cas3AssessmentSummary'

export default Factory.define<PaginatedResponse<Cas3AssessmentSummary>>(() => {
  const data = cas3AssessmentSummaryFactory.buildList(faker.number.int({ min: 5, max: 10 }))

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
