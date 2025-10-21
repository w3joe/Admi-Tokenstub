// Home.tsx
// Main landing UI: shows navbar, hero text, and feature cards.
// This file only handles layout and modals — safe place to customize design.

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
import EventPage from './components/EventPage'
import FreezeAccount from './components/FreezeAccount'

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  const [openPaymentModal, setOpenPaymentModal] = useState<boolean>(false)
  const [openMintModal, setOpenMintModal] = useState<boolean>(false)
  const [openTokenModal, setOpenTokenModal] = useState<boolean>(false)
  const [openAppCallsModal, setOpenAppCallsModal] = useState<boolean>(false)

  const { activeAddress } = useWallet()

  return (
    <div className="min-h-screen bg-neutral-900 text-gray-100 flex flex-col">
      {/* ---------------- Navbar ---------------- */}
      <nav className="w-full bg-neutral-800 border-b border-neutral-700 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500">
          Tokenstub
        </h1>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-sm font-semibold text-gray-100 transition"
          onClick={() => setOpenWalletModal(true)}
        >
          <BsWallet2 className="text-lg text-cyan-400" />
          <span>{activeAddress ? 'Wallet Connected' : 'Connect Wallet'}</span>
        </button>
      </nav>

      {/* ---------------- Features Grid ---------------- */}
      <main className="flex-1 px-6 pb-12">
        {activeAddress ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Send Payment
            <div className="p-6 bg-neutral-800 rounded-2xl border border-neutral-700 hover:border-cyan-500 transition">
              <AiOutlineSend className="text-4xl mb-3 text-green-400" />
              <h3 className="text-lg font-semibold mb-2">Send Payment</h3>
              <p className="text-sm text-gray-400 mb-4">
                Try sending 1 ALGO to any address on TestNet. This helps you understand wallet transactions.
              </p>
              <button
                className="w-full py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition"
                onClick={() => setOpenPaymentModal(true)}
              >
                Open
              </button>
            </div> */}

            
            {/* Create Token */}
            {/* <div className="p-6 bg-neutral-800 rounded-2xl border border-neutral-700 hover:border-purple-500 transition">
              <BsArrowUpRightCircle className="text-4xl mb-3 text-purple-400" />
              <h3 className="text-lg font-semibold mb-2">Create Token (ASA)</h3>
              <p className="text-sm text-gray-400 mb-4">
                Spin up your own Algorand Standard Asset (ASA) in seconds. Perfect for testing token creation.
              </p>
              <button
                className="w-full py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-semibold transition"
                onClick={() => setOpenTokenModal(true)}
              >
                Open
              </button>
            </div> */}
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-12">
            <p>⚡ Connect your wallet first to unlock the features below.</p>
          </div>
        )}
      </main>

      {/* ---------------- Modals ---------------- */}
      <ConnectWallet openModal={openWalletModal} closeModal={() => setOpenWalletModal(false)} />
      {/* <Transact openModal={openPaymentModal} setModalState={setOpenPaymentModal} />
      <NFTmint openModal={openMintModal} setModalState={setOpenMintModal} />
      <Tokenmint openModal={openTokenModal} setModalState={setOpenTokenModal} />
      <AppCalls openModal={openAppCallsModal} setModalState={setOpenAppCallsModal} /> */}
      <EventPage />

    </div>
  )
}

export default Home
