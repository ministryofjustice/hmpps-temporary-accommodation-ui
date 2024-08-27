import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'
import { TemporaryAccommodationAssessmentSummary as AssessmentSummary } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'
import { fullPersonFactory as personFactory } from './person'
import risksFactory from './risks'
import referenceDataFactory from './referenceData'

class AssessmentSummaryFactory extends Factory<AssessmentSummary> {
  /* istanbul ignore next */
  createdXDaysAgo(days: number) {
    const today = new Date()
    return this.params({
      createdAt: DateFormats.dateObjToIsoDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - days)),
    })
  }
}

export default AssessmentSummaryFactory.define(() => ({
  type: 'CAS3' as const,
  id: faker.string.uuid(),
  applicationId: faker.string.uuid(),
  arrivalDate: DateFormats.dateObjToIsoDateTime(faker.date.future()),
  createdAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
  dateOfInfoRequest: DateFormats.dateObjToIsoDateTime(faker.date.past()),
  status: 'closed' as const,
  risks: risksFactory.build(),
  person: personFactory.build(),
  probationDeliveryUnitName: referenceDataFactory.pdu().build().name,
}))
