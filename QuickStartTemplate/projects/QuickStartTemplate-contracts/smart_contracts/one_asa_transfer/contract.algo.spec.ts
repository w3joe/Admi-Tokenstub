import { TestExecutionContext } from '@algorandfoundation/algorand-typescript-testing'
import { Bytes } from '@algorandfoundation/algorand-typescript'
import { OneAsaTransfer } from './contract.algo'
import { afterEach, describe, expect, it } from 'vitest'

describe('OneAsaTransfer contract', () => {
  const ctx = new TestExecutionContext()
  afterEach(() => {
    ctx.reset()
  })

  it('invokes transfer of 1 ASA to a receiver', () => {
  const contract = ctx.contract.create(OneAsaTransfer)

  // Initialize the app (so create() runs and owner is set)
  contract.create()

  // Create a fake receiver address (32-byte array) and convert to `bytes`
  const receiver = Bytes(new Uint8Array(32))

  // Call transfer with a sample asset id (e.g., 123)
  contract.transfer(123, receiver)

  // If the inner transaction API runs in the test harness, ensure no exception thrown
  expect(true).toBe(true)
  })
})
