import managePaths from './manage'
import applyPaths from './apply'

export default {
  premises: {
    show: managePaths.premises.show,
    index: managePaths.premises.index,
    capacity: managePaths.premises.show.path('capacity'),
    lostBeds: {
      create: managePaths.lostBeds.create,
    },
  },
  applications: {
    index: applyPaths.applications.index,
    update: applyPaths.applications.update,
    new: applyPaths.applications.create,
  },
}
