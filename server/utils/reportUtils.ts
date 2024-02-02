import { ProbationRegion } from '@approved-premises/api'
import type { ReportType } from '@approved-premises/ui'
import { DateFormats, monthsArr } from './dateUtils'
import paths from '../paths/api'

const permittedFilenameCharacters = 'abcdefghijklmnopqrstuvwxyz01234567890 '

export const reportFilename = () => {
  const date = DateFormats.dateObjtoUIDate(new Date(), { format: 'short' })

  const concatenatedName = `bookings ${date}`

  return `${filterFilename(concatenatedName)}.xlsx`
}

export const reportForProbationRegionFilename = (
  probationRegion: ProbationRegion,
  month: string,
  year: string,
  type: ReportType,
) => {
  const regionName = probationRegion.name

  const monthName = monthsArr.find(monthObj => monthObj.value === month).name

  const concatenatedName = `${type === 'bedspace-usage' ? 'bedspace usage' : type} ${regionName} ${monthName} ${year}`

  return `${filterFilename(concatenatedName)}.xlsx`
}

const filterFilename = (filename: string): string => {
  return filename
    .toLocaleLowerCase()
    .split('')
    .filter(character => permittedFilenameCharacters.includes(character))
    .join('')
    .replace(/([ ])+/g, '-')
}

export const getApiReportPath = (reportType: ReportType): string => {
  if (reportType === 'bookings') {
    return paths.reports.bookings({})
  }
  if (reportType === 'referrals') {
    return paths.reports.referrals({})
  }
  if (reportType === 'bedspace-usage') {
    return paths.reports.bedspaceUsage({})
  }

  return paths.reports.bedspaceUtilisation({})
}
