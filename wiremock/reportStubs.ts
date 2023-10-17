import paths from '../server/paths/api'

const reportStubs: Array<Record<string, unknown>> = []

reportStubs.push(
  {
    request: {
      method: 'GET',
      urlPath: paths.reports.bookings({}),
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
      },
      body: '"Column 1","Column 2"\n"Entry 1A","Entry 1B"\n"Entry 2A","Entry 2B"',
    },
  },
  {
    request: {
      method: 'GET',
      urlPath: paths.reports.bedspaceUsage({}),
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
      },
      body: '"Column 1","Column 2"\n"Entry 1A","Entry 1B"\n"Entry 2A","Entry 2B"',
    },
  },
  {
    request: {
      method: 'GET',
      urlPath: paths.reports.bedspaceUtilisation({}),
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
      },
      body: '"Column 1","Column 2"\n"Entry 1A","Entry 1B"\n"Entry 2A","Entry 2B"',
    },
  },
)

export default reportStubs
