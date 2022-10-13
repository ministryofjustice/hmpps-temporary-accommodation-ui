import { temporaryAccommodationPath } from '../service'

const premisesPath = temporaryAccommodationPath.path('properties')
const singlePremisesPath = premisesPath.path(':premisesId')

const paths = {
  premises: {
    index: premisesPath,
    new: premisesPath.path('new'),
    create: premisesPath,
    show: singlePremisesPath,
  },
}

export default paths
