import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname } from 'node:path'

export async function deploy() {
  console.log('=== Deploying OneAsaTransfer (TestNet) ===')

  const algodConfig = {
    host: 'https://testnet-api.algonode.cloud',
    token: '',
    port: '',
  }
  const algorand = AlgorandClient.fromConfig({ algodConfig })

  const deployer = await algorand.account.fromEnvironment('DEPLOYER')

  // Resolve the compiled/generated artifact (TS or JS) and import it via file:// URL.
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  const artifactBase = path.resolve(__dirname, '../artifacts/one_asa_transfer/OneAsaTransferClient')
  const tsPath = artifactBase + '.ts'
  const jsPath = artifactBase + '.js'
  let actualArtifactPath: string | null = null
  if (fs.existsSync(tsPath)) actualArtifactPath = tsPath
  else if (fs.existsSync(jsPath)) actualArtifactPath = jsPath

  if (!actualArtifactPath) {
    throw new Error(
      `OneAsaTransferClient artifact not found. Expected one of:\n  ${tsPath}\n  ${jsPath}\n\nBuild the contract artifacts before deploying (from the contracts directory). Example:\n  npm run build:contracts\nor run your project's contract build/generate step so the artifacts are created.`
    )
  }

  // Quick sanity check: ensure the generated artifact contains compiled programs
  const content = fs.readFileSync(actualArtifactPath, 'utf8')
  if (!/approvalProgram|approval_program|clearStateProgram|clear_state_program/i.test(content)) {
    throw new Error(
      `OneAsaTransferClient found at ${actualArtifactPath} but it does not contain compiled approval/clear programs.\n\n` +
        'Make sure you compiled the contract. Typical steps:\n' +
        '  1) cd projects/QuickStartTemplate-contracts (or your contracts folder)\n' +
        '  2) run the contracts build/generate command (example): npm run build:contracts\n' +
        '  3) ensure artifacts/one_asa_transfer/OneAsaTransferClient(.ts|.js) exists and includes approvalProgram and clearStateProgram.\n' +
        'Then re-run the deploy.'
    )
  }

  const artifactModule = await import(pathToFileURL(actualArtifactPath).href)
  const { OneAsaTransferFactory } = artifactModule as any

  const factory = algorand.client.getTypedAppFactory(OneAsaTransferFactory, {
    defaultSender: deployer.addr,
  }) as any

  // Deploy and provide a helpful message if the factory fails due to missing programs
  let appClient: any, result: any
  try {
    const deployRes = await factory.deploy({ onUpdate: 'append', onSchemaBreak: 'append' })
    appClient = deployRes.appClient
    result = deployRes.result
  } catch (err: any) {
    const msg = String(err?.message ?? err)
    if (msg.includes('approvalProgram') || msg.includes('clearStateProgram') || msg.includes('approval program')) {
      throw new Error(
        'Application creation failed because compiled programs (approvalProgram and/or clearStateProgram) are missing from the generated artifact.\n\n' +
          'Action: build the contract artifacts so the factory has the compiled TEAL programs.\n\n' +
          'Typical steps:\n' +
          '  1) From the contracts directory, run your build command (example):\n' +
          '       npm run build:contracts\n' +
          "     or run your project's contract generation command so that `artifacts/one_asa_transfer/OneAsaTransferClient(.ts|.js)` exists and contains the compiled programs.\n" +
          '  2) Re-run the deploy command.\n\n' +
          'If you already generated artifacts, ensure the artifact file path is correct and the artifact exports the OneAsaTransferFactory with compiled programs.'
      )
    }
    throw err
  }

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
