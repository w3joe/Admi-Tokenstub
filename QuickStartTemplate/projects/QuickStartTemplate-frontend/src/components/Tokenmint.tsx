
// Tokenmint.tsx
// Create a standard fungible token (ASA) on Algorand TestNet.
import { AlgorandClient } from '@algorandfoundation/algokit-utils';
import { useWallet } from '@txnlab/use-wallet-react';
import { useSnackbar } from 'notistack';
import { useMemo, useState, useRef } from 'react';
import { AiOutlineLoading3Quarters, AiOutlineInfoCircle } from 'react-icons/ai';
import { BsCoin } from 'react-icons/bs';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs';

interface TokenMintProps {
  openModal: boolean;
  setModalState: (value: boolean) => void;
}

const defaultTokenRow = () => ({
  assetName: 'MasterPass Token',
  unitName: 'MPT',
  total: '1000',
  decimals: '0',
  status: '' as '' | 'pending' | 'success' | 'error',
  assetId: undefined as number | undefined,
  error: '' as string,
});

type TicketMintResult = { status: 'pending' | 'success' | 'error'; assetId?: number; error?: string };

const Tokenmint = ({ openModal, setModalState }: TokenMintProps) => {
  const LORA = 'https://lora.algokit.io/testnet';
  const [ticketCount, setTicketCount] = useState<string>('1');
  const [results, setResults] = useState<TicketMintResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { transactionSigner, activeAddress } = useWallet();
  const { enqueueSnackbar } = useSnackbar();
  const algodConfig = getAlgodConfigFromViteEnvironment();
  const algorand = useMemo(() => AlgorandClient.fromConfig({ algodConfig }), [algodConfig]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleMintTickets = async () => {
    if (!transactionSigner || !activeAddress) {
      enqueueSnackbar('Please connect your wallet first.', { variant: 'warning' });
      return;
    }
    if (!/^[0-9]+$/.test(ticketCount) || Number(ticketCount) < 1) {
      enqueueSnackbar('Please enter a positive number of tickets.', { variant: 'warning' });
      return;
    }
    const count = Number(ticketCount);
    setLoading(true);
    setResults([]);
    let newResults: TicketMintResult[] = [];
    for (let i = 1; i <= count; ++i) {
      newResults.push({ status: 'pending' });
      setResults([...newResults]);
      try {
        enqueueSnackbar(`Minting Ticket (${i})...`, { variant: 'info' });
        const createResult = await algorand.send.assetCreate({
          sender: activeAddress,
          signer: transactionSigner,
          total: 1n,
          decimals: 0,
          assetName: `Ticket (${i})`,
          unitName: 'TIX',
          defaultFrozen: false,
          manager: activeAddress,
          reserve: activeAddress,
          freeze: activeAddress,
          clawback: activeAddress,
        });
        newResults[i-1] = { status: 'success', assetId: Number(createResult.assetId) };
        enqueueSnackbar(`Ticket (${i}) minted! Asset ID: ${createResult.assetId}`, { variant: 'success' });
      } catch (e) {
        const errMsg = (e && typeof e === 'object' && 'message' in e) ? String((e as any).message) : 'Error';
        newResults[i - 1] = { status: 'error', error: errMsg };
        enqueueSnackbar(`Ticket (${i}) failed`, { variant: 'error' });
      }
      setResults([...newResults]);
    }
    setLoading(false);
  }

  return (
    <dialog
      id="token_modal"
      className={`modal modal-bottom sm:modal-middle backdrop-blur-sm ${openModal ? 'modal-open' : ''}`}
    >
      <div className="modal-box bg-neutral-800 text-gray-100 rounded-2xl shadow-xl border border-neutral-700 p-6 min-w-[360px]">
        <h3 className="flex items-center gap-3 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500 mb-2">
          <BsCoin size={32} />
          Mint Tickets
        </h3>
        <p className="text-gray-400 text-sm mb-6">
          Mint Ticket tokens in bulk. Each ticket gets an assetName of 'Ticket (i)', unitName 'TIX', total 1, decimals 0.
        </p>
        <div className="space-y-3">
          <input
            ref={inputRef}
            type="number"
            min={1}
            className="input input-bordered w-full bg-neutral-700 text-gray-100 border-neutral-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            placeholder="How many tickets?"
            value={ticketCount}
            onChange={(e) => setTicketCount(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-end gap-3 mt-4">
          <button
            type="button"
            className={`btn bg-green-500 hover:bg-green-600 text-white w-full sm:w-auto rounded-xl border-none font-semibold ${loading ? 'btn-disabled opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleMintTickets}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <AiOutlineLoading3Quarters size={20} />
                Minting...
              </span>
            ) : (
              'Mint Tickets'
            )}
          </button>
          <button
            type="button"
            className="btn w-full sm:w-auto bg-neutral-700 hover:bg-neutral-600 border-none text-gray-300 rounded-xl"
            onClick={() => setModalState(false)}
            disabled={loading}
          >
            Close
          </button>
        </div>
        <div className="mt-4 space-y-1 text-xs">
          {results.map((r, i) =>
            r.status === 'success' ? (
              <p key={i} className="text-green-400">
                #{i + 1} Ticket minted! Asset ID: {r.assetId}{' '}
                <a
                  className="underline ml-2"
                  href={`${LORA}/asset/${r.assetId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View
                </a>
              </p>
            ) : r.status === 'error' ? (
              <p key={i} className="text-red-400">
                #{i + 1} Failed: {r.error}
              </p>
            ) : r.status === 'pending' ? (
              <p key={i} className="text-cyan-400">
                #{i + 1} Minting...
              </p>
            ) : null
          )}
        </div>
      </div>
    </dialog>
  );
};

export default Tokenmint;
