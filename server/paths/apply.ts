import { approvedPremisesPath } from './service'

const applicationsPath = approvedPremisesPath.path('applications')
const applicationPath = applicationsPath.path(':id')

const pagesPath = applicationPath.path('tasks/:task/pages/:page')

const paths = {
  applications: {
    new: applicationsPath.path('new'),
    start: applicationsPath.path('start'),
    people: applicationsPath.path('people').path('find'),
    create: applicationsPath,
    index: applicationsPath,
    show: applicationPath,
    update: applicationPath,
    pages: {
      show: pagesPath,
      update: pagesPath,
    },
  },
}

export default paths
