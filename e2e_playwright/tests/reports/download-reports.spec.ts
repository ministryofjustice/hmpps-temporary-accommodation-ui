import { test } from '../../test'
import { signIn } from '../../steps/signIn'
import { visitReportsPageAndDownloadReport } from '../../steps/reports'

const probationRegionName = 'South West'
const startDate = '01/03/2024'
const endDate = '01/04/2024'

test('Download booking report for a probation region', async ({ page, user }) => {
  await signIn(page, user)
  await visitReportsPageAndDownloadReport(page, 'book', probationRegionName, startDate, endDate)
})

test('Download bed-space usage report for a probation region', async ({ page, user }) => {
  await signIn(page, user)
  await visitReportsPageAndDownloadReport(page, 'bedSpace', probationRegionName, startDate, endDate)
})

test('Download future bookings report for a probation region', async ({ page, user }) => {
  await signIn(page, user)
  await visitReportsPageAndDownloadReport(page, 'futureBookings', probationRegionName, startDate, endDate)
})

test('Download occupancy report for a probation region', async ({ page, user }) => {
  await signIn(page, user)
  await visitReportsPageAndDownloadReport(page, 'occupancy', probationRegionName, startDate, endDate)
})

test('Download referrals report for a probation region', async ({ page, user }) => {
  await signIn(page, user)
  await visitReportsPageAndDownloadReport(page, 'referrals', probationRegionName, startDate, endDate)
})
