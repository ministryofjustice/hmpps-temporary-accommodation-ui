import { path } from 'static-path'

const applicationsPath = path('/referrals')
const applicationPath = applicationsPath.path(':id')

const pagesPath = applicationPath.path('tasks/:task/pages/:page')
const peoplePath = applicationsPath.path('people')
const personPath = peoplePath.path(':crn')

const paths = {
  applications: {
    new: applicationsPath.path('new'),
    start: applicationsPath.path('start'),
    people: {
      find: peoplePath.path('find'),
      selectOffence: personPath.path('select-offence'),
      documents: personPath.path('documents/:documentId'),
    },
    delete: applicationPath.path('delete'),
    create: applicationsPath,
    index: applicationsPath,
    show: applicationPath,
    update: applicationPath,
    full: applicationPath.path('full'),
    checkYourAnswers: applicationPath.path('check-your-answers'),
    submission: applicationPath.path('submission'),
    confirm: applicationPath.path('confirm'),
    pages: {
      show: pagesPath,
      update: pagesPath,
    },
  },
}

export default paths
