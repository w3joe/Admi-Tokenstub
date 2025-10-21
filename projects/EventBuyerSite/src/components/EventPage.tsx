// EventPage.tsx
// Create a standard fungible token (ASA) on Algorand TestNet.
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useMemo, useState, useEffect } from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { BsCoin } from 'react-icons/bs'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'
import algosdk from 'algosdk'

type TicketMintResult = { status: 'pending' | 'success' | 'error'; assetId?: number; error?: string }

const EventPage = () => {
  async function createPreSignedTxn() {
    // 1. Connect to Algorand TestNet node
    const algodClient = new algosdk.Algodv2(
      '', // No token needed with Algonode
      'https://testnet-api.algonode.cloud',
      '',
    )

    // 2. Recover account from mnemonic (for demo)
    const mnemonic = 'your 25-word mnemonic here'
    const sender = algosdk.mnemonicToSecretKey(mnemonic)

    // 3. Get suggested transaction params
    const params = await algodClient.getTransactionParams().do()

    // 4. Create a payment txn (unsigned)
    const receiver = 'LTEBZO7SDB7M7DV3TDV5JEIFD7LTZHBY67T6IPVQRY67WWC2PRRUGINAF'
    const amount = 1000000 // 1 Algo (microAlgos)
    const unsignedTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: sender.addr,
      to: receiver,
      amount,
      suggestedParams: params,
    })

    // 5. Sign offline
    const signedTxn = unsignedTxn.signTxn(sender.sk)

    // 6. Encode to Base64 or keep as Uint8Array
    const base64Txn = Buffer.from(signedTxn).toString('base64')

    console.log('✅ Pre-signed transaction ready!')
    console.log('Transaction ID:', unsignedTxn.txID().toString())
    console.log('Signed Transaction Blob (Base64):', base64Txn)

    return base64Txn // can be sent or stored
  }

  const LORA = 'https://lora.algokit.io/testnet'
  const [results, setResults] = useState<TicketMintResult[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [purchaseSuccess, setPurchaseSuccess] = useState<{ assetId: number } | null>(null)
  const [currentHash, setCurrentHash] = useState<string>(() => window.location.hash || '')
  const { transactionSigner, activeAddress } = useWallet()
  const { enqueueSnackbar } = useSnackbar()
  const algodConfig = getAlgodConfigFromViteEnvironment()
  const algorand = useMemo(() => AlgorandClient.fromConfig({ algodConfig }), [algodConfig])
  const assetId = 748006598
  const organiserAddress = 'LIL4V4LOSDAIPVD4MDL7UBMNC4JBYBWSJNNOFMXPCA3A235OVE7XSRJUCU'
  const contractAppId = 748009753 // deployed stateful app id (buyer will call)

  // helper: encode uint64 to 8-byte big-endian Uint8Array
  const encodeUint64 = (v: bigint) => {
    const out = new Uint8Array(8)
    let x = v
    for (let i = 7; i >= 0; --i) {
      out[i] = Number(x & 0xffn)
      x = x >> 8n
    }
    return out
  }

  // transferAsset helper:
  // - If `signer` is provided, use algorand.send.assetTransfer (wallet signing flow).
  // - Else if `signedTxnBase64` (or signedTxnBytes) is provided, submit the signed bytes directly to algod.
  // - Otherwise throw an error instructing organiser to connect or provide a pre-signed txn.
  const transferAsset = async (opts: {
    sender?: string
    signer?: any
    receiver?: string
    assetId?: number
    amount?: number
    signedTxnBase64?: string
    signedTxnBytes?: Uint8Array
  }) => {
    // helper to decode base64 to Uint8Array (browser + node friendly)
    const base64ToUint8Array = (b64: string) => {
      if (typeof Buffer !== 'undefined' && (Buffer as any).from) {
        return Uint8Array.from(Buffer.from(b64, 'base64'))
      }
      const binary = atob(b64)
      const len = binary.length
      const bytes = new Uint8Array(len)
      for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i)
      return bytes
    }

    // 1) Wallet-signer flow (preferred)
    if (opts.signer && opts.sender && opts.receiver && typeof opts.assetId === 'number') {
      return algorand.send.assetTransfer({
        sender: opts.sender,
        signer: opts.signer,
        receiver: opts.receiver,
        assetId: opts.assetId,
        amount: opts.amount ?? 1,
      })
    }

    // 2) Pre-signed signed-txn bytes flow
    const signedBytes = opts.signedTxnBytes ?? (opts.signedTxnBase64 ? base64ToUint8Array(opts.signedTxnBase64) : undefined)
    if (signedBytes) {
      // submit signed txn bytes to algod REST
      const algodHost = (algodConfig as any).host || (algodConfig as any).server || ''
      const algodToken =
        typeof (algodConfig as any).token === 'object'
          ? ((algodConfig as any).token?.['X-Algo-API-Token'] ?? '')
          : ((algodConfig as any).token ?? '')
      if (!algodHost) throw new Error('Algod host not configured (algodConfig.host missing)')
      const res = await fetch(`${String(algodHost).replace(/\/$/, '')}/v2/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-binary',
          ...(algodToken ? { 'X-Algo-API-Token': String(algodToken) } : {}),
        },
        body: signedBytes,
      })
      if (!res.ok) {
        const txt = await res.text().catch(() => '')
        throw new Error(`Algod rejected signed tx: ${res.status} ${txt}`)
      }
      return { txId: await res.json().then((j) => j?.txId ?? j?.txid ?? null) }
    }

    // 3) No viable signing path
    throw new Error('No signer or pre-signed transaction provided. Organiser must connect or provide a signed transaction blob.')
  }

  // Basic event details (replace with real data or props as needed)
  const event = {
    bannerUrl: 'https://picsum.photos/1200/400', // placeholder banner
    title: 'Rocketbury Music Fest 2025',
    date: 'June 21, 2025 · 7:00 PM',
    description:
      'Join us for an unforgettable evening of live performances, community, and blockchain innovation. Your purchase grants one NFT-backed ticket (an Algorand Standard Asset) that serves as your entry pass — unique, transferable, and verifiable on-chain. Arrive early for on-site activations, artist meet-and-greets, and interactive demos showcasing Algorand-powered dApps. Please ensure your wallet is connected and opted-in to receive the ticket ASA; fees for opt-in and transfer will apply. All sales are final unless the event is canceled; in that case a refund or on-chain reversal procedure will be announced. Limited capacity — secure your tokenized ticket while supplies last.',
    priceAlgo: 0.5,
  }

  const handleMintTickets = async () => {
    if (!transactionSigner || !activeAddress) {
      enqueueSnackbar('Please connect your wallet first.', { variant: 'warning' })
      return
    }
    const count = 1 // Buy single ticket from this UI
    setLoading(true)
    setResults([])
    let newResults: TicketMintResult[] = []
    for (let i = 1; i <= count; ++i) {
      newResults.push({ status: 'pending' })
      setResults([...newResults])
      try {
        // Step 1: send payment to organiser
        if (!organiserAddress || organiserAddress.trim() === '') throw new Error('Organizer address required')
        enqueueSnackbar(`Sending payment to organiser...`, { variant: 'info' })
        const microAlgo = 0.5
        await algorand.send.payment({
          sender: activeAddress,
          signer: transactionSigner,
          receiver: organiserAddress,
          amount: microAlgo.algo(),
        })

        // Step 2: opt-in buyer to the ticket ASA
        enqueueSnackbar('Opting in to ticket asset...', { variant: 'info' })
        const targetAssetId = assetId
        let optInSuccess = false
        let lastOptErrMsg = ''
        for (let attempt = 1; attempt <= 3 && !optInSuccess; attempt++) {
          try {
            if (attempt > 1) await new Promise((r) => setTimeout(r, 1000 * attempt))
            await algorand.send.assetOptIn({
              sender: activeAddress,
              signer: transactionSigner,
              assetId: targetAssetId,
            })
            optInSuccess = true
            enqueueSnackbar('Successful — ticket delivered!', { variant: 'success' })
            // Mark purchase as successful (show ticket / instructions) and stop further processing
            newResults[i - 1] = { status: 'success', assetId: assetIdNum }
            setResults([...newResults])
            setPurchaseSuccess({ assetId: assetIdNum })
            // simple hash navigation so we don't need new routes/files
            window.location.hash = '#/ticket-success'
            setLoading(false)
            return
          } catch (optErr) {
            lastOptErrMsg = optErr && typeof optErr === 'object' && 'message' in optErr ? String((optErr as any).message) : 'Opt-in failed'
            if (attempt === 3) {
              throw new Error(`Failed: ${lastOptErrMsg}`)
            }
          }
        }
      } catch (e) {
        const errMsg = e && typeof e === 'object' && 'message' in e ? String((e as any).message) : 'Error'
        newResults[i - 1] = { status: 'error', error: errMsg }
        enqueueSnackbar(`Ticket (${i}) failed`, { variant: 'error' })
      }
      setResults([...newResults])
    }
    setLoading(false)
  }

  // Listen for hash changes so UI updates to the success "page"
  useEffect(() => {
    const onHash = () => setCurrentHash(window.location.hash || '')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return (
    <div className="min-h-screen bg-neutral-900 text-gray-100">
      {/* Hero Banner */}
      <header className="relative w-full">
        <img src={event.bannerUrl} alt="event banner" className="w-full h-64 sm:h-96 object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/40 flex items-end">
          <div className="max-w-5xl mx-auto p-6 sm:p-10">
            <h1 className="text-2xl sm:text-4xl font-extrabold">{event.title}</h1>
            <p className="text-sm text-gray-300 mt-1">{event.date}</p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto p-4 sm:p-8">
        {/* If redirected to success "page", show the ticket + QR instructions */}
        {currentHash === '#/ticket-success' && purchaseSuccess ? (
          <section className="max-w-3xl mx-auto bg-neutral-800 border border-neutral-700 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-2 text-green-400">Purchase complete</h2>
            <p className="text-gray-300 mb-4">Your ticket has been delivered to your wallet.</p>

            <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-700 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-400">Ticket Asset ID</div>
                  <div className="font-mono font-semibold">{purchaseSuccess.assetId}</div>
                </div>
                <a
                  className="text-sm underline text-cyan-400"
                  href={`${LORA}/asset/${purchaseSuccess.assetId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Indexer
                </a>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-300">
                On event day, present your wallet QR code at the entrance to verify ticket ownership. Below is a QR generated from your
                wallet address for quick scanning.
              </p>
            </div>

            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <input
                  readOnly
                  value={activeAddress ?? ''}
                  className="bg-neutral-700 text-gray-100 rounded-md p-2 w-full font-mono text-sm border border-neutral-600"
                />
                <div className="mt-2 text-xs text-gray-400">Copy your address and open your wallet to show its QR.</div>
              </div>
              <div className="w-40 h-40 bg-white/5 rounded-md flex items-center justify-center p-2">
                {/* public QR generator for preview; users should use their wallet app's QR for verification */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(activeAddress ?? '')}`}
                  alt="wallet qr"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                className="px-3 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-md text-white text-sm"
                onClick={() => {
                  if (typeof navigator !== 'undefined' && (navigator as any).clipboard?.writeText) {
                    ;(navigator as any).clipboard.writeText(activeAddress ?? '')
                    enqueueSnackbar('Wallet address copied to clipboard', { variant: 'success' })
                  } else {
                    // fallback
                    try {
                      ;(window as any).prompt('Copy your address', activeAddress ?? '')
                    } catch (_e) {}
                  }
                }}
              >
                Copy address
              </button>
              <button
                className="px-3 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-md text-white text-sm"
                onClick={() => {
                  // go back to event page
                  window.location.hash = ''
                  setPurchaseSuccess(null)
                }}
              >
                Back to event
              </button>
            </div>
          </section>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Details (span 2 columns on lg) */}
            <section className="lg:col-span-2">
              <div className="bg-neutral-800 border border-neutral-700 rounded-2xl p-6 mb-6">
                <h2 className="text-xl font-semibold mb-2">About the event</h2>
                <p className="text-gray-300 leading-relaxed">{event.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-4">
                  <h3 className="text-sm text-gray-400">When</h3>
                  <div className="mt-1 font-medium">{event.date}</div>
                </div>
                <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-4">
                  <h3 className="text-sm text-gray-400">Where</h3>
                  <div className="mt-1 font-medium">Algorand TestNet · Online</div>
                </div>
              </div>
            </section>

            {/* Right: Sticky purchase card */}
            <aside className="lg:col-span-1">
              <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-5 sticky top-20 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BsCoin size={20} />
                    <div>
                      <div className="text-xs text-gray-400">Price</div>
                      <div className="text-lg font-semibold">{event.priceAlgo} ALGO</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">1 ticket</div>
                </div>

                <div className="space-y-2">
                  {purchaseSuccess || currentHash === '#/ticket-success' ? (
                    <button
                      type="button"
                      disabled
                      aria-disabled
                      className="w-full py-3 rounded-xl bg-neutral-700 text-gray-400 font-semibold opacity-60 cursor-not-allowed"
                    >
                      Bought
                    </button>
                  ) : (
                    <button
                      onClick={handleMintTickets}
                      disabled={loading}
                      className={`w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2 justify-center">
                          <AiOutlineLoading3Quarters className="animate-spin" />
                          Processing...
                        </span>
                      ) : (
                        'Buy Ticket'
                      )}
                    </button>
                  )}
                </div>

                <div className="text-xs text-gray-400">
                  Transactions will be signed via your connected wallet. Make sure you have enough ALGO for the tx fee.
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  )
}

export default EventPage
