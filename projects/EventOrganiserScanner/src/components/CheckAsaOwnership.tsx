// CheckAsaOwnership.tsx
// Component to check if a wallet address owns a specific ASA (Algorand Standard Asset).
// Queries account information via Algod API to verify asset holdings.

import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import QrScanner from './QrScanner'
import { AiOutlineQrcode } from 'react-icons/ai'
import { AiOutlineLoading3Quarters, AiOutlineSearch, AiOutlineCheckCircle, AiOutlineCloseCircle } from 'react-icons/ai'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

interface CheckAsaOwnershipInterface {
  openModal: boolean
  setModalState: (value: boolean) => void
}

const CheckAsaOwnership = ({ openModal, setModalState }: CheckAsaOwnershipInterface) => {
  const LORA = 'https://lora.algokit.io/testnet'

  // UI state
  const [loading, setLoading] = useState<boolean>(false)
  const [clawbackLoading, setClawbackLoading] = useState<boolean>(false)
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [asaId, setAsaId] = useState<string>('')
  const [checkResult, setCheckResult] = useState<{
    owns: boolean
    balance?: bigint
    assetName?: string
    checked: boolean
  }>({ owns: false, checked: false })
  const [showQr, setShowQr] = useState(false)
  const [clawbackAmount, setClawbackAmount] = useState<string>('1')

  // Algorand client setup (TestNet by default from env)
  const algodConfig = getAlgodConfigFromViteEnvironment()
  const algorand = AlgorandClient.fromConfig({ algodConfig })

  // Notifications
  const { enqueueSnackbar } = useSnackbar()
  const { transactionSigner, activeAddress } = useWallet()

  // Ensure receiver (active account) is opted-in to the ASA
  const ensureOptIn = async (assetIdNum: bigint) => {
    if (!activeAddress || !transactionSigner) return false
    const receiverInfo = await algorand.client.algod.accountInformation(activeAddress).do()
    type RawHolding = { assetId?: number | string; ['asset-id']?: number | string }
    const recAssets = (receiverInfo as { assets?: RawHolding[] }).assets
    const hasAsset = recAssets?.some((a) => {
      const id = a.assetId ?? a['asset-id']
      if (id === undefined) return false
      return BigInt(String(id)) === assetIdNum
    })
    if (hasAsset) return true

    // Try opt-in via 0-amount self transfer
    enqueueSnackbar('Opting-in signed-in wallet to the ASA...', { variant: 'info' })
    await algorand.send.assetTransfer({
      signer: transactionSigner,
      sender: activeAddress,
      receiver: activeAddress,
      assetId: assetIdNum,
      amount: 0n,
    })
    return true
  }

  // Execute clawback from entered wallet to connected (active) wallet
  const executeClawback = async (params: { assetIdNum: bigint; fromAddress: string; amount: bigint }) => {
    if (!transactionSigner || !activeAddress) {
      enqueueSnackbar('Please connect a wallet with clawback privileges', { variant: 'warning' })
      return null
    }

    // Fetch asset params to verify clawback authority
    const assetInfo = await algorand.client.algod.getAssetByID(Number(params.assetIdNum)).do()
    const clawbackAddr: string | undefined = assetInfo.params?.clawback
    if (!clawbackAddr) {
      enqueueSnackbar('This ASA has no clawback address set. Cannot revoke.', { variant: 'error' })
      return null
    }
    if (clawbackAddr !== activeAddress) {
      enqueueSnackbar('Connected wallet is not the clawback manager of this ASA.', { variant: 'error' })
      return null
    }

    // Ensure receiver opted-in
    await ensureOptIn(params.assetIdNum)

    enqueueSnackbar('Executing clawback...', { variant: 'info' })
    const txResult = await algorand.send.assetTransfer({
      signer: transactionSigner,
      sender: activeAddress, // clawback address must send the revocation
      receiver: activeAddress, // where the clawed-back assets will go
      assetId: params.assetIdNum,
      amount: params.amount,
      clawbackTarget: params.fromAddress, // address to revoke from
    })

    return txResult
  }

  // ------------------------------
  // Handle checking ASA ownership
  // ------------------------------
  const handleCheckOwnership = async () => {
    setLoading(true)
    setCheckResult({ owns: false, checked: false })

    try {
      // Validate inputs
      if (!walletAddress || walletAddress.length !== 58) {
        enqueueSnackbar('Please enter a valid wallet address (58 characters)', { variant: 'warning' })
        setLoading(false)
        return
      }

      const assetIdNum = BigInt(asaId)
      if (!asaId || assetIdNum <= 0n) {
        enqueueSnackbar('Please enter a valid ASA ID', { variant: 'warning' })
        setLoading(false)
        return
      }

      enqueueSnackbar('Checking ASA ownership...', { variant: 'info' })

      // Get account information
      const accountInfo = await algorand.client.algod.accountInformation(walletAddress).do()

      // Check if the account holds the specified asset with a positive balance
      const asset = accountInfo.assets?.find((a) => BigInt(a.assetId) === assetIdNum)
      const balance = asset ? BigInt(asset.amount) : 0n

      if (asset && balance > 0n) {
        // Account owns the asset (positive balance)

        // Try to get asset info
        let assetName = 'Unknown'
        try {
          const assetInfo = await algorand.client.algod.getAssetByID(Number(assetIdNum)).do()
          assetName = assetInfo.params.name || assetInfo.params.unitName || `Asset ${asaId}`
        } catch (e) {
          // Silently fail if asset info cannot be fetched
        }

        setCheckResult({
          owns: true,
          balance,
          assetName,
          checked: true,
        })

        enqueueSnackbar(`✅ Wallet owns this ASA! Balance: ${balance.toString()}`, {
          variant: 'success',
          action: () => (
            <a
              href={`${LORA}/account/${walletAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'underline', marginLeft: 8 }}
            >
              View on Lora ↗
            </a>
          ),
        })

        // Clawback is now manual via the button below
      } else {
        // Account does not own the asset
        setCheckResult({
          owns: false,
          checked: true,
        })

        enqueueSnackbar('❌ Wallet does not own this ASA (no holding or zero balance)', { variant: 'info' })
      }
    } catch (e) {
      const error = e as Error

      if (error.message?.includes('account does not exist')) {
        enqueueSnackbar('Account not found. Please check the wallet address.', { variant: 'error' })
      } else {
        enqueueSnackbar('Failed to check ASA ownership. Please try again.', { variant: 'error' })
      }

      setCheckResult({ owns: false, checked: false })
    }

    setLoading(false)
  }
  // ------------------------------
  // Handle clawback (1 unit)
  // ------------------------------
  const handleClawback = async () => {
    try {
      if (!asaId || walletAddress.length !== 58) return
      const amount = clawbackAmount.replace(/[^0-9]/g, '')
      if (!amount || amount === '0') {
        enqueueSnackbar('Please enter a valid clawback amount (> 0).', { variant: 'warning' })
        return
      }
      setClawbackLoading(true)
      const assetIdNum = BigInt(asaId)
      const amountBig = BigInt(amount)
      if (checkResult.balance !== undefined && amountBig > checkResult.balance) {
        enqueueSnackbar('Clawback amount exceeds wallet balance for this ASA.', { variant: 'warning' })
        setClawbackLoading(false)
        return
      }
      const clawbackResult = await executeClawback({ assetIdNum, fromAddress: walletAddress, amount: amountBig })
      const txId = clawbackResult?.txIds?.[0]
      if (txId) {
        enqueueSnackbar(`🧲 Clawback transaction sent (${amount} unit${amount === '1' ? '' : 's'})`, {
          variant: 'info',
          action: () => (
            <a
              href={`${LORA}/transaction/${txId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'underline', marginLeft: 8 }}
            >
              View on Lora ↗
            </a>
          ),
        })
      }
    } catch (err) {
      enqueueSnackbar('Failed to execute clawback.', { variant: 'error' })
    } finally {
      setClawbackLoading(false)
    }
  }

  // ------------------------------
  // Reset form
  // ------------------------------
  const handleReset = () => {
    setWalletAddress('')
    setAsaId('')
    setCheckResult({ owns: false, checked: false })
  }

  // ------------------------------
  // Modal UI
  // ------------------------------
  return (
    <dialog id="check_asa_modal" className={`modal modal-bottom sm:modal-middle backdrop-blur-sm ${openModal ? 'modal-open' : ''}`}>
      <div className="modal-box w-11/12 max-w-4xl lg:max-w-5xl bg-neutral-800 text-gray-100 rounded-2xl shadow-xl border border-neutral-700 p-6 md:p-8 max-h-[85vh] overflow-y-auto">
        <h3 className="flex items-center gap-3 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500 mb-6">
          <AiOutlineSearch size={32} />
          Check Ticket Ownership
        </h3>

        {/* Wallet Address input */}
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text text-gray-400">Wallet Address</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              data-test-id="wallet-address"
              className="input input-bordered w-full bg-neutral-700 text-gray-100 border-neutral-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              placeholder="e.g., KPLX..."
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
            />
            <button
              type="button"
              className="btn bg-neutral-700 hover:bg-cyan-600 text-cyan-400 border-none px-3"
              title="Scan QR code"
              onClick={() => setShowQr(true)}
            >
              <AiOutlineQrcode size={24} />
            </button>
          </div>
          <div className="flex justify-end items-center text-xs mt-2">
            <span className={`font-mono ${walletAddress.length === 58 ? 'text-green-400' : 'text-red-400'}`}>
              {walletAddress.length}/58
            </span>
          </div>
        </div>
        {/* QR Scanner Modal */}
        {showQr && (
          <QrScanner
            onScan={(data) => {
              setWalletAddress(data)
              setShowQr(false)
            }}
            onClose={() => setShowQr(false)}
          />
        )}

        {/* ASA ID input */}
        <div className="form-control mb-6">
          <label className="label">
            <span className="label-text text-gray-400">ASA ID (Asset ID)</span>
          </label>
          <input
            type="text"
            data-test-id="asa-id"
            className="input input-bordered w-full bg-neutral-700 text-gray-100 border-neutral-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            placeholder="e.g., 10458941"
            value={asaId}
            onChange={(e) => setAsaId(e.target.value.replace(/[^0-9]/g, ''))}
          />
          <label className="label">
            <span className="label-text-alt text-gray-500">Enter the numeric ID of the asset</span>
          </label>
        </div>

        {/* Result Display */}
        {checkResult.checked && (
          <div
            className={`alert mb-6 ${
              checkResult.owns ? 'bg-green-900/30 border-green-500' : 'bg-red-900/30 border-red-500'
            } border rounded-xl`}
          >
            <div className="flex items-start gap-3">
              {checkResult.owns ? <AiOutlineCheckCircle size={24} color="#4ade80" /> : <AiOutlineCloseCircle size={24} color="#f87171" />}
              <div className="flex-1">
                <h4 className="font-semibold mb-1">{checkResult.owns ? 'Ownership Confirmed' : 'Asset Not Found'}</h4>
                {checkResult.owns ? (
                  <>
                    <p className="text-sm text-gray-300 mb-1">
                      {checkResult.assetName && <span className="font-semibold">{checkResult.assetName}</span>}
                    </p>
                    <p className="text-sm text-gray-400">
                      Balance: <span className="font-mono text-green-300">{checkResult.balance?.toString()}</span> units
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-400">The wallet does not hold this ASA or has not opted in to it.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Clawback amount input (visible when ownership confirmed) */}
        {checkResult.owns && (
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text text-gray-400">Amount to Clawback</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              data-test-id="clawback-amount"
              className="input input-bordered w-full bg-neutral-700 text-gray-100 border-neutral-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              placeholder="1"
              value={clawbackAmount}
              onChange={(e) => setClawbackAmount(e.target.value.replace(/[^0-9]/g, ''))}
            />
            <label className="label">
              <span className="label-text-alt text-gray-500">Enter a positive integer not exceeding balance</span>
            </label>
          </div>
        )}

        {/* Action buttons */}
        <div className="modal-action mt-6 flex flex-col-reverse sm:flex-row-reverse gap-3">
          <button
            data-test-id="check-ownership"
            type="button"
            className={`
              btn w-full sm:w-auto bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl border-none font-semibold transition-all duration-300 transform active:scale-95
              ${walletAddress.length === 58 && asaId ? '' : 'btn-disabled opacity-50 cursor-not-allowed'}
            `}
            onClick={handleCheckOwnership}
            disabled={loading || walletAddress.length !== 58 || !asaId}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <AiOutlineLoading3Quarters size={20} />
                Checking...
              </span>
            ) : (
              'Check Ownership'
            )}
          </button>
          {checkResult.owns && (
            <button
              data-test-id="clawback-one-unit"
              type="button"
              className={`
                btn w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white rounded-xl border-none font-semibold transition-all duration-300 transform active:scale-95
                ${walletAddress.length === 58 && asaId ? '' : 'btn-disabled opacity-50 cursor-not-allowed'}
              `}
              onClick={handleClawback}
              disabled={(() => {
                if (clawbackLoading || walletAddress.length !== 58 || !asaId) return true
                const amt = clawbackAmount.replace(/[^0-9]/g, '')
                if (!amt || amt === '0') return true
                try {
                  const amtBig = BigInt(amt)
                  if (checkResult.balance !== undefined && amtBig > checkResult.balance) return true
                } catch {
                  return true
                }
                return false
              })()}
              title="Revoke a specified amount from the entered wallet to the connected clawback address"
            >
              {clawbackLoading ? (
                <span className="flex items-center gap-2">
                  <AiOutlineLoading3Quarters size={20} />
                  Clawback...
                </span>
              ) : (
                `Clawback ${clawbackAmount && clawbackAmount !== '0' ? clawbackAmount : '—'} unit${clawbackAmount === '1' ? '' : 's'}`
              )}
            </button>
          )}
          {checkResult.checked && (
            <button
              type="button"
              className="btn w-full sm:w-auto bg-neutral-600 hover:bg-neutral-500 border-none text-gray-300 rounded-xl"
              onClick={handleReset}
            >
              Reset
            </button>
          )}
          <button
            type="button"
            className="btn w-full sm:w-auto bg-neutral-700 hover:bg-neutral-600 border-none text-gray-300 rounded-xl"
            onClick={() => setModalState(false)}
          >
            Close
          </button>
        </div>
      </div>
    </dialog>
  )
}

export default CheckAsaOwnership
