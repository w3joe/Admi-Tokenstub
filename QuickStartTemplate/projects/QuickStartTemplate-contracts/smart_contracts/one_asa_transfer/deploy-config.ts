import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { OneAsaTransferFactory } from '../artifacts/one_asa_transfer/OneAsaTransferClient'

export async function deploy() {
  console.log('=== Deploying OneAsaTransfer ===')

  const algorand = AlgorandClient.fromEnvironment()
  const deployer = await algorand.account.fromEnvironment('DEPLOYER')

  const factory = algorand.client.getTypedAppFactory(OneAsaTransferFactory, {
    defaultSender: deployer.addr,
  }) as any

  const { appClient, result } = await factory.deploy({ onUpdate: 'append', onSchemaBreak: 'append' })

  // If app was just created, fund the app account so it can pay for inner txns
  if (['create', 'replace'].includes(result.operationPerformed)) {
    await algorand.send.payment({
      amount: (1).algo(),
      sender: deployer.addr,
      receiver: appClient.appAddress,
    })
  }

  console.log(`Deployed OneAsaTransfer app id=${appClient.appClient.appId} address=${appClient.appAddress}`)
}
