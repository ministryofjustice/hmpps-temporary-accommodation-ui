import { initialiseTelemetry, flushTelemetry, telemetry } from '@ministryofjustice/hmpps-azure-telemetry'
import { SpanFilterFn, SpanInfo } from '@ministryofjustice/hmpps-azure-telemetry/src/main'
import applicationInfoSupplier from '../applicationInfo'

const applicationInfo = applicationInfoSupplier()

const filterSentry: SpanFilterFn = (span: SpanInfo) => !span.attributes['sentry.op']

initialiseTelemetry({
  serviceName: applicationInfo.applicationName,
  serviceVersion: process.env.BUILD_NUMBER || 'unknown',
  connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
  debug: process.env.DEBUG_TELEMETRY === 'true',
})
  .addFilter(filterSentry)
  .addFilter(telemetry.processors.filterSpanWherePath(['/health', '/ping', '/info', '/assets/*', '/favicon.ico']))
  .addModifier(telemetry.processors.enrichSpanNameWithHttpRoute())
  .startRecording()

const shutdown = async () => {
  await flushTelemetry()
  process.exit(0)
}

process.on('SIGTERM', () => shutdown())
process.on('SIGINT', () => shutdown())

// export function initialiseAppInsights(): void {
//   if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
//     // eslint-disable-next-line no-console
//     console.log('Enabling azure application insights')
//
//     setup().setDistributedTracingMode(DistributedTracingModes.AI_AND_W3C).start()
//   }
// }
//
// export function buildAppInsightsClient(name = defaultName()): TelemetryClient {
//   if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
//     defaultClient.context.tags['ai.cloud.role'] = name
//     defaultClient.context.tags['ai.application.ver'] = version()
//
//     defaultClient.addTelemetryProcessor(({ tags, data }, contextObjects) => {
//       const operationNameOverride = contextObjects.correlationContext?.customProperties?.getProperty('operationName')
//       if (operationNameOverride) {
//         tags['ai.operation.name'] = operationNameOverride
//         data.baseData.name = operationNameOverride
//       }
//       return true
//     })
//
//     return defaultClient
//   }
//   return null
// }
