import { loadProto, startServer, stopServer } from '../lib'
import * as path from 'path'
import * as grpc from 'grpc'
import health from 'grpc-health-check/health'
import healthMessages from 'grpc-health-check/v1/health_pb'
import series from 'async/series'

const ServingStatus = healthMessages.HealthCheckResponse.ServingStatus

function whaleSay (call, callback) {
  callback(null, { status: true })
}

describe('Grpc Utils Tests', () => {
  test('can load proto', () => {
    const packageDefinition = loadProto('test-service.proto', path.resolve(__dirname, 'proto'))
    expect(packageDefinition.grpc_esm_repro.test.TestService.service).toBeDefined()
  })

  test('can call service', done => {
    expect.assertions(7)

    const packageDefinition = loadProto('test-service.proto', path.resolve(__dirname, 'proto'))
    const grpcService = packageDefinition.grpc_esm_repro.test.TestService.service

    expect(grpcService).toBeDefined()
    const TestServiceClient = (grpc as any).makeGenericClientConstructor(grpcService)
    const client = new TestServiceClient('localhost:' + 3000, grpc.credentials.createInsecure())

    expect(client).toBeDefined()

    const healthClient = new health.Client('localhost:' + 3000, grpc.credentials.createInsecure())

    const { server, healthImplementation } = startServer(
      3000,
      grpcService,
      {
        whaleSay
      }
    )

    expect(healthImplementation).toBeDefined()

    series([
      function (callback) {
        const healthCheckRequest = new healthMessages.HealthCheckRequest()
        // Check for root service itself
        healthCheckRequest.setService('')
        healthClient.check(healthCheckRequest, (err, response) => {
          expect(err).toBeNull()
          expect(response.getStatus()).toEqual(ServingStatus.SERVING)
          callback(null)
        })
      },
      function (callback) {
        client.whaleSay({}, (err, result) => {
          expect(err).toBeNull()
          expect(result).toEqual({ status: true })
          stopServer(server, () => callback(null))
        })
      }
    ], done)
  })
})
