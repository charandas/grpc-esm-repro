import { Server, ServerCredentials } from 'grpc'
import * as health from 'grpc-health-check/health'
import * as healthMessages from 'grpc-health-check/v1/health_pb'

const ServingStatus = healthMessages.HealthCheckResponse.ServingStatus

const statusMap = {
  '': ServingStatus.SERVING
}

/**
 * Start the GRPC server
 *
 * @param {number} port the port to start the service on. Its bound to all interfaces by default.
 * @param {any} implementations: an object which exactly maps each service method name to service implementation
 * @returns the server instance
 */
export function startServer (port, grpcService, implementation) {
  const server = new Server()
  const healthImpl = new health.Implementation(statusMap)

  server.addService(grpcService, implementation)
  server.addService(health.service, healthImpl)
  server.bind(`0.0.0.0:${port}`, ServerCredentials.createInsecure())
  server.start()

  return {
    server,
    healthImplementation: healthImpl
  }
}

export function stopServer (server, onShutdownCb) {
  server.tryShutdown(() => {
    onShutdownCb && onShutdownCb()
  })
}
