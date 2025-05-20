import { fakerEN_GB as faker } from '@faker-js/faker'
import { DateFormats } from '../../server/utils/dateUtils'

const releaseDate = faker.date.soon({ days: 90 })
const accommodationRequiredFromDate = faker.date.soon({ days: 90, refDate: releaseDate })

export const eligibilityDates = {
  releaseDate: {
    iso: DateFormats.dateObjToIsoDate(releaseDate),
    year: releaseDate.getFullYear().toString(),
    month: (releaseDate.getMonth() + 1).toString(),
    day: releaseDate.getDate().toString(),
  },
  accommodationRequiredFromDate: {
    iso: DateFormats.dateObjToIsoDate(accommodationRequiredFromDate),
    year: accommodationRequiredFromDate.getFullYear().toString(),
    month: (accommodationRequiredFromDate.getMonth() + 1).toString(),
    day: accommodationRequiredFromDate.getDate().toString(),
  },
}
