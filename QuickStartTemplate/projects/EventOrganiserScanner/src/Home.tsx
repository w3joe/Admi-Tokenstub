// Home.tsx
// Main landing UI: shows navbar, hero text, and feature cards.
// This file only handles layout and modals — safe place to customize design.

import React, { useState } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { AiOutlineWallet } from 'react-icons/ai'
import { BsWallet2 } from 'react-icons/bs'

// Frontend modals
import ConnectWallet from './components/ConnectWallet'
import CheckAsaOwnership from './components/CheckAsaOwnership'

// Smart contract demo modal (backend app calls)
// Removed other features

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  const [openCheckAsaModal, setOpenCheckAsaModal] = useState<boolean>(false)

  const { activeAddress } = useWallet()

  return (
    <div className="min-h-screen bg-neutral-900 text-gray-100 flex flex-col">
      {/* ---------------- Navbar ---------------- */}
      <nav className="w-full bg-neutral-800 border-b border-neutral-700 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500">
          TokenStub Scanner
        </h1>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-sm font-semibold text-gray-100 transition"
          onClick={() => setOpenWalletModal(true)}
        >
          <BsWallet2 className="text-lg text-cyan-400" />
          <span>{activeAddress ? 'Wallet Connected' : 'Connect Wallet'}</span>
        </button>
      </nav>

      {/* ---------------- Hero Section ---------------- */}
      <header className="text-center py-10 px-4">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500 mb-4">
           Tokenstub
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Ticket Verification and Clawback
        </p>
      </header>

      {/* ---------------- Feature ---------------- */}
      <main className="flex-1 px-6 pb-12">
        {activeAddress ? (
          <div className="max-w-3xl mx-auto">
            <div className="p-6 bg-neutral-800 rounded-2xl border border-neutral-700 hover:border-cyan-500 transition">
              <AiOutlineWallet className="text-4xl mb-3 text-cyan-400" />
              <h3 className="text-lg font-semibold mb-2">Check Ticket Ownership</h3>
              <p className="text-sm text-gray-400 mb-4">Verify if a wallet address owns ASA Ticket by ID.</p>
              <button
                className="w-full py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-semibold transition"
                onClick={() => setOpenCheckAsaModal(true)}
              >
                Open
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-12">
            <p>⚡ Connect your wallet first to access the ASA checker.</p>
          </div>
        )}
      </main>

      {/* ---------------- Modals ---------------- */}
      <ConnectWallet openModal={openWalletModal} closeModal={() => setOpenWalletModal(false)} />
  <CheckAsaOwnership openModal={openCheckAsaModal} setModalState={setOpenCheckAsaModal} />
    </div>
  )
}

export default Home
