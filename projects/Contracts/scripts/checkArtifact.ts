import * as fs from 'node:fs'
import * as path from 'node:path'
import { pathToFileURL } from 'node:url'

async function checkArtifact(artifactBasePath?: string) {
  try {
    const baseDir = artifactBasePath
      ? path.resolve(artifactBasePath)
      : path.resolve(__dirname, '../smart_contracts/artifacts/one_asa_transfer/OneAsaTransferClient')
    const tsPath = baseDir + '.ts'
    const jsPath = baseDir + '.js'
    let actualPath: string | null = null
    if (fs.existsSync(tsPath)) actualPath = tsPath
    else if (fs.existsSync(jsPath)) actualPath = jsPath

    if (!actualPath) {
      console.error(`Artifact not found. Checked:\n  ${tsPath}\n  ${jsPath}`)
      process.exitCode = 2
      return
    }

    // dynamic import via file:// URL so ESM/ts-node works
    const mod = await import(pathToFileURL(actualPath).href)
    const APP_SPEC = (mod && (mod.APP_SPEC ?? mod.default?.APP_SPEC)) as any | undefined

    if (!APP_SPEC) {
      console.error('Imported module does not export APP_SPEC (artifact shape unexpected).')
      console.error(`Imported keys: ${Object.keys(mod).join(', ')}`)
      process.exitCode = 3
      return
    }

    const byteCode = APP_SPEC.byteCode ?? APP_SPEC?.compiledPrograms ?? undefined
    const approval = byteCode?.approval ?? byteCode?.approvalProgram ?? null
    const clear = byteCode?.clear ?? byteCode?.clearStateProgram ?? null

    console.log(`Artifact file: ${actualPath}`)
    if (approval) {
      const len = typeof approval === 'string' ? Buffer.from(approval, 'base64').length : (approval.length ?? 'unknown')
      console.log(`- approval program: present (byte length: ${len})`)
    } else {
      console.log('- approval program: MISSING')
    }

    if (clear) {
      const len = typeof clear === 'string' ? Buffer.from(clear, 'base64').length : (clear.length ?? 'unknown')
      console.log(`- clear program:    present (byte length: ${len})`)
    } else {
      console.log('- clear program:    MISSING')
    }

    if (!approval || !clear) {
      console.error('\nResult: FAILED — approvalProgram and/or clearStateProgram missing. Build contract artifacts before deploying.')
      process.exitCode = 4
    } else {
      console.log('\nResult: OK — compiled programs found.')
    }
  } catch (err) {
    console.error('Error checking artifact:', err)
    process.exitCode = 1
  }
}

// CLI: optional first arg = path to artifact base (without extension)
const argPath = process.argv[2]
checkArtifact(argPath)
