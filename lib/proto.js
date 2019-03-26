import * as protoLoader from '@grpc/proto-loader'
import * as grpcLibrary from 'grpc'

export function loadProto (protoFileName, dir) {
  const packageDefinition = protoLoader.loadSync(protoFileName, {
    enums: String,
    defaults: true,
    keepCase: true,
    oneofs: true,
    includeDirs: [dir]
  })

  return grpcLibrary.loadPackageDefinition(packageDefinition)
}
