import { temporaryAccommodationPath } from '../service'

const premisesPath = temporaryAccommodationPath.path('properties')

const paths = {
  premises: {
    new: premisesPath.path('new'),
    create: premisesPath,
  },
}

export default paths
