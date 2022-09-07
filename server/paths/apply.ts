import { path } from 'static-path'

const applicationsPath = path('/applications')
const applicationPath = applicationsPath.path(':id')

const taskPath = applicationPath.path('tasks/:task/pages/:page')

const paths = {
  applications: {
    new: applicationsPath.path('new'),
    create: applicationsPath,
  },
}

export default paths
