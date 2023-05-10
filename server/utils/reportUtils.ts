import { ProbationRegion } from '@approved-premises/api'
import { DateFormats, monthsArr } from './dateUtils'

const permittedFilenameCharacters = 'abcdefghijklmnopqrstuvwxyz01234567890 '

export const reportFilename = () => {
  const date = DateFormats.dateObjtoUIDate(new Date(), { format: 'short' })

  const concatenatedName = `bookings ${date}`

  return `${filterFilename(concatenatedName)}.xlsx`
}

export const reportForProbationRegionFilename = (probationRegion: ProbationRegion, month: string, year: string) => {
  const regionName = probationRegion.name

  const monthName = monthsArr.find(monthObj => monthObj.value === month).name

  const concatenatedName = `bookings ${regionName} ${monthName} ${year}`

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
