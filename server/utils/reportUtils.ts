import { ProbationRegion } from '@approved-premises/api'
import { DateFormats } from './dateUtils'

const permittedFilenameCharacters = 'abcdefghijklmnopqrstuvwxyz01234567890 '

export const bookingReportFilename = () => {
  const date = DateFormats.dateObjtoUIDate(new Date(), { format: 'short' })

  const concatenatedName = `bookings ${date}`

  return `${filterFilename(concatenatedName)}.xlsx`
}

export const bookingReportForProbationRegionFilename = (probationRegion: ProbationRegion) => {
  const date = DateFormats.dateObjtoUIDate(new Date(), { format: 'short' })
  const regionName = probationRegion.name

  const concatenatedName = `bookings ${regionName} ${date}`

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
