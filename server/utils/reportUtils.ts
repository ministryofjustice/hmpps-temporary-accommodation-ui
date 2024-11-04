import { Cas3ReportType, ProbationRegion } from '@approved-premises/api'
import { DateFormats } from './dateUtils'
import paths from '../paths/api'

const permittedFilenameCharacters = 'abcdefghijklmnopqrstuvwxyz01234567890 -'

export const reportFilename = () => {
  const date = DateFormats.dateObjtoUIDate(new Date(), { format: 'short' })

  const concatenatedName = `bookings ${date}`

  return `${filterFilename(concatenatedName)}.xlsx`
}

const reverseISODate = (isoDate: string) => isoDate.split('-').reverse().join('-')
const reportNames: Record<Cas3ReportType, string> = {
  referral: 'referrals',
  futureBookings: 'future bookings',
  futureBookingsCsv: 'future bookings csv',
  booking: 'bookings',
  bookingGap: 'booking gap',
  bedUsage: 'bedspace usage',
  bedOccupancy: 'occupancy',
}

const reportFileType = (reportType: Cas3ReportType): string => {
  if (reportType === 'futureBookingsCsv') {
    return 'csv'
  }
  return 'xlsx'
}

export const reportForProbationRegionFilename = (
  regionName: ProbationRegion['name'],
  startDate: string,
  endDate: string,
  type: Cas3ReportType,
) => {
  const concatenatedName = `${reportNames[type]} ${regionName} ${reverseISODate(startDate)} to ${reverseISODate(
    endDate,
  )}`

  return `${filterFilename(concatenatedName)}.${reportFileType(type)}`
}

const filterFilename = (filename: string): string => {
  return filename
    .toLocaleLowerCase()
    .split('')
    .filter(character => permittedFilenameCharacters.includes(character))
    .join('')
    .replace(/ +/g, '-')
}

export const getApiReportPath = (reportType: Cas3ReportType): string => {
  if (reportType === 'booking') {
    return paths.reports.bookings({})
  }
  if (reportType === 'referral') {
    return paths.reports.referrals({})
  }
  if (reportType === 'bedUsage') {
    return paths.reports.bedspaceUsage({})
  }
  if (reportType === 'futureBookings') {
    return paths.reports.futureBookings({})
  }

  if (reportType === 'futureBookingsCsv') {
    return paths.reports.futureBookingsCsv({})
  }

  return paths.reports.bedspaceUtilisation({})
}

export const allReportProbationRegions = (regions: Array<ProbationRegion>): Array<ProbationRegion> => [
  {
    id: 'all',
    name: 'All regions',
  },
  ...regions.filter(region => region.name !== 'National'),
]
