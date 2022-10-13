import { temporaryAccommodationPath } from '../service'

const premisesPath = temporaryAccommodationPath.path('properties')
const singlePremisesPath = premisesPath.path(':premisesId')

const paths = {
  premises: {
    index: premisesPath,
    show: singlePremisesPath,
    new: premisesPath.path('new'),
    create: premisesPath,
  },
}

export default paths
