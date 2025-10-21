import React, { useState, useMemo } from 'react'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

export default function FreezeAccount() {
  const { transactionSigner, activeAddress } = useWallet()
  const { enqueueSnackbar } = useSnackbar()
  const algodConfig = getAlgodConfigFromViteEnvironment()
  const algorand = useMemo(() => AlgorandClient.fromConfig({ algodConfig }), [algodConfig])

  const [assetIdInput, setAssetIdInput] = useState<string>('')
  const [accountToFreeze, setAccountToFreeze] = useState<string>('')
  const [freeze, setFreeze] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(false)

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!transactionSigner || !activeAddress) {
      enqueueSnackbar('Connect the freeze account wallet first', { variant: 'warning' })
      return
    }
    if (!assetIdInput || !/^\d+$/.test(assetIdInput)) {
      enqueueSnackbar('Enter a valid numeric asset id', { variant: 'warning' })
      return
    }
    if (!accountToFreeze) {
      enqueueSnackbar('Enter an account address to freeze/unfreeze', { variant: 'warning' })
      return
    }

    try {
      setLoading(true)
      enqueueSnackbar('Submitting freeze transaction...', { variant: 'info' })

      const assetIdNum = BigInt(assetIdInput)
      // Use algorand.send.assetFreeze (algokit helper). Sender must be the freeze authority account.
      await algorand.send.assetFreeze({
        sender: activeAddress,
        signer: transactionSigner,
        assetId: assetIdNum,
        account: accountToFreeze,
        frozen: freeze,
      })

      enqueueSnackbar(`Successfully ${freeze ? 'froze' : 'unfroze'} account`, { variant: 'success' })
    } catch (err) {
      console.error('assetFreeze failed:', err)
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as any).message) : String(err)
      enqueueSnackbar(`Freeze failed: ${msg}`, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-neutral-800 border border-neutral-700 rounded-xl p-4 space-y-3">
      <h3 className="text-lg font-semibold">Freeze / Unfreeze Account</h3>

      <label className="text-xs text-gray-400 block">Asset ID</label>
      <input
        value={assetIdInput}
        onChange={(e) => setAssetIdInput(e.target.value.replace(/[^\d]/g, ''))}
        placeholder="123456"
        className="w-full p-2 rounded-md bg-neutral-700 text-gray-100 border border-neutral-600"
        disabled={loading}
      />

      <label className="text-xs text-gray-400 block">Account to freeze / unfreeze</label>
      <input
        value={accountToFreeze}
        onChange={(e) => setAccountToFreeze(e.target.value.trim())}
        placeholder="ACCOUNT_ADDRESS"
        className="w-full p-2 rounded-md bg-neutral-700 text-gray-100 border border-neutral-600"
        disabled={loading}
      />

      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-200">Frozen</label>
        <input type="checkbox" checked={freeze} onChange={(e) => setFreeze(e.target.checked)} disabled={loading} />
        <div className="text-xs text-gray-400 ml-auto">Sender must be the freeze authority (connected wallet)</div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className={`px-3 py-2 rounded-md font-semibold text-white ${loading ? 'bg-neutral-700 opacity-60 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-700'}`}
        >
          {loading ? 'Submitting...' : freeze ? 'Freeze Account' : 'Unfreeze Account'}
        </button>
        <button
          type="button"
          onClick={() => {
            setAssetIdInput('')
            setAccountToFreeze('')
            setFreeze(true)
          }}
          className="px-3 py-2 rounded-md bg-neutral-700 text-gray-200"
          disabled={loading}
        >
          Reset
        </button>
      </div>

      <div className="text-xs text-gray-400">
        Note: the freeze transaction must be signed by the asset's freeze authority. If your connected wallet is not the freeze account, the
        call will fail.
      </div>
    </form>
  )
}
