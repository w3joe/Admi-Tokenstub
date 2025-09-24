import React, { useState } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { AiOutlineWallet, AiOutlineSend, AiOutlineStar, AiOutlineDeploymentUnit } from 'react-icons/ai'
import { BsArrowUpRightCircle, BsWallet2 } from 'react-icons/bs'

// Frontend modals
import ConnectWallet from './components/ConnectWallet'
import Transact from './components/Transact'
import NFTmint from './components/NFTmint'
import Tokenmint from './components/Tokenmint'

// Smart contract demo modal (backend app calls)
import AppCalls from './components/AppCalls'

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  const [openPaymentModal, setOpenPaymentModal] = useState<boolean>(false)
  const [openMintModal, setOpenMintModal] = useState<boolean>(false)
  const [openTokenModal, setOpenTokenModal] = useState<boolean>(false)
  const [openAppCallsModal, setOpenAppCallsModal] = useState<boolean>(false)

  const { activeAddress } = useWallet()

  return (
    <div className="min-h-screen bg-neutral-900 text-gray-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="bg-neutral-800 border border-neutral-700 shadow-2xl rounded-3xl p-6 sm:p-8 md:p-10 text-center max-w-lg w-full transform transition-all duration-300 hover:shadow-cyan-500/20">
        <header className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500 mb-2 leading-tight">
            Algorand dApp Gateway
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Connect your wallet to explore TestNet features: payments, asset creation, and smart contract interactions.
          </p>
        </header>

        <main>
          <div className="space-y-4">
            <button
              className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-xl font-bold transition-all duration-300 transform active:scale-95 text-gray-100 bg-neutral-700 hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-neutral-800"
              onClick={() => setOpenWalletModal(true)}
            >
              <BsWallet2 className="text-xl text-cyan-400" />
              <span>{activeAddress ? 'Wallet Connected' : 'Connect Wallet'}</span>
            </button>

            {activeAddress && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    className="w-full flex flex-col items-center justify-center p-4 rounded-xl border border-neutral-700 bg-neutral-800 text-gray-300 hover:bg-neutral-700 transition-all duration-300 transform active:scale-95"
                    onClick={() => setOpenPaymentModal(true)}
                  >
                    <AiOutlineSend className="text-3xl mb-2 text-green-400" />
                    <span className="text-sm font-semibold">Send Payment</span>
                  </button>

                  <button
                    className="w-full flex flex-col items-center justify-center p-4 rounded-xl border border-neutral-700 bg-neutral-800 text-gray-300 hover:bg-neutral-700 transition-all duration-300 transform active:scale-95"
                    onClick={() => setOpenMintModal(true)}
                  >
                    <AiOutlineStar className="text-3xl mb-2 text-pink-400" />
                    <span className="text-sm font-semibold">Mint NFT</span>
                  </button>

                  <button
                    className="w-full flex flex-col items-center justify-center p-4 rounded-xl border border-neutral-700 bg-neutral-800 text-gray-300 hover:bg-neutral-700 transition-all duration-300 transform active:scale-95"
                    onClick={() => setOpenTokenModal(true)}
                  >
                    <BsArrowUpRightCircle className="text-3xl mb-2 text-purple-400" />
                    <span className="text-sm font-semibold">Create Token (ASA)</span>
                  </button>

                  <button
                    className="w-full flex flex-col items-center justify-center p-4 rounded-xl border border-neutral-700 bg-neutral-800 text-gray-300 hover:bg-neutral-700 transition-all duration-300 transform active:scale-95"
                    onClick={() => setOpenAppCallsModal(true)}
                  >
                    <AiOutlineDeploymentUnit className="text-3xl mb-2 text-amber-400" />
                    <span className="text-sm font-semibold">Contract Interactions</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <ConnectWallet openModal={openWalletModal} closeModal={() => setOpenWalletModal(false)} />

      <Transact openModal={openPaymentModal} setModalState={setOpenPaymentModal} />
      <NFTmint openModal={openMintModal} setModalState={setOpenMintModal} />
      <Tokenmint openModal={openTokenModal} setModalState={setOpenTokenModal} />

      <AppCalls openModal={openAppCallsModal} setModalState={setOpenAppCallsModal} />
    </div>
  )
}

export default Home