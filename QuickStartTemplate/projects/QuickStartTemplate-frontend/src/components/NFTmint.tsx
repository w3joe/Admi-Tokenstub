import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { useWallet } from '@txnlab/use-wallet-react'
import { sha512_256 } from 'js-sha512'
import { useSnackbar } from 'notistack'
import React, { useRef, useState } from 'react'
import { AiOutlineCloudUpload, AiOutlineLoading3Quarters } from 'react-icons/ai'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

interface NFTMintProps {
  openModal: boolean
  setModalState: (value: boolean) => void
}

const NFTmint = ({ openModal, setModalState }: NFTMintProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { transactionSigner, activeAddress } = useWallet()
  const { enqueueSnackbar } = useSnackbar()

  const algodConfig = getAlgodConfigFromViteEnvironment()
  const algorand = AlgorandClient.fromConfig({ algodConfig })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setSelectedFile(file)
    if (file) {
      setPreviewUrl(URL.createObjectURL(file))
    } else {
      setPreviewUrl('')
    }
  }

  const handleDivClick = () => {
    fileInputRef.current?.click()
  }

  const handleMintNFT = async () => {
    setLoading(true)

    console.log('=== STARTING NFT MINT PROCESS ===');
    console.log('Selected file:', selectedFile);
    console.log('Active address:', activeAddress);
    console.log('Transaction signer available:', !!transactionSigner);

    if (!transactionSigner || !activeAddress) {
      enqueueSnackbar('Please connect wallet first', { variant: 'warning' })
      setLoading(false)
      return
    }

    if (!selectedFile) {
      enqueueSnackbar('Please select an image file to mint.', { variant: 'warning' })
      setLoading(false)
      return
    }

    enqueueSnackbar('Uploading and preparing NFT...', { variant: 'info' })
    let metadataUrl = ''
    
    try {
      // Try to determine the correct backend URL
      const currentUrl = window.location.href;
      console.log('Current frontend URL:', currentUrl);
      
      // Extract the base codespace URL and construct backend URL
      let backendApiUrl = '';
      if (currentUrl.includes('app.github.dev')) {
        // Match pattern like: https://sturdy-lamp-pxrrxp5wx5wf6pv-5175.app.github.dev/
        const match = currentUrl.match(/https:\/\/([^-]+-[^-]+-[^-]+)-\d+\.app\.github\.dev/);
        if (match) {
          const baseCodespace = match[1]; // sturdy-lamp-pxrrxp5wx5wf6pv
          backendApiUrl = `https://${baseCodespace}-3001.app.github.dev/api/pin-image`;
        }
      }
      
      // Fallback to the original URL if pattern matching fails
      if (!backendApiUrl) {
        backendApiUrl = 'https://sturdy-lamp-pxrrxp5wx5wf6pv-3001.app.github.dev/api/pin-image';
      }

      console.log('Computed backend URL:', backendApiUrl);

      // Test if backend is reachable first
      try {
        const healthUrl = backendApiUrl.replace('/api/pin-image', '/health');
        console.log('Testing backend health at:', healthUrl);
        
        const healthResponse = await fetch(healthUrl, {
          method: 'GET',
          mode: 'cors'
        });
        
        if (healthResponse.ok) {
          const healthData = await healthResponse.json();
          console.log('Backend health check passed:', healthData);
        } else {
          console.warn('Backend health check failed with status:', healthResponse.status);
        }
      } catch (healthError) {
        console.warn('Backend health check error:', healthError);
        enqueueSnackbar('Backend server may not be running. Please check the server.', { variant: 'warning' });
      }

      console.log('Submitting file to backend...');
      const formData = new FormData()
      formData.append('file', selectedFile)

      console.log('FormData created with file:', selectedFile.name);

      const response = await fetch(backendApiUrl, {
        method: 'POST',
        body: formData,
        mode: 'cors',
        // Don't set Content-Type header - let the browser set it for FormData
        headers: {
          // Remove any Content-Type header to let browser handle it
        }
      })

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error response:', errorText);
        throw new Error(`Backend request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json()
      console.log('Backend response data:', data);
      
      metadataUrl = data.metadataUrl
      
      if (!metadataUrl) {
        throw new Error('Backend did not return a valid metadata URL')
      }

      console.log('Successfully received metadata URL:', metadataUrl);
      
    } catch (e: any) {
      console.error('=== BACKEND ERROR ===');
      console.error('Error object:', e);
      console.error('Error message:', e.message);
      console.error('Error stack:', e.stack);
      
      let errorMessage = 'Failed to upload to backend';
      if (e.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to backend server. Please ensure the backend is running on port 3001.';
      } else if (e.message.includes('CORS')) {
        errorMessage = 'CORS error - backend server needs to allow your frontend origin.';
      } else {
        errorMessage = `Backend error: ${e.message}`;
      }
      
      enqueueSnackbar(errorMessage, { variant: 'error' })
      setLoading(false)
      return
    }

    try {
      console.log('=== MINTING NFT ON ALGORAND ===');
      enqueueSnackbar('Minting NFT on Algorand...', { variant: 'info' })

      const metadataHash = new Uint8Array(Buffer.from(sha512_256.digest(metadataUrl)))
      console.log('Metadata hash computed:', Array.from(metadataHash).map(b => b.toString(16).padStart(2, '0')).join(''));

      const createNFTResult = await algorand.send.assetCreate({
        sender: activeAddress,
        signer: transactionSigner,
        total: 1n,
        decimals: 0,
        assetName: 'MasterPass Ticket',
        unitName: 'MTK',
        url: metadataUrl,
        metadataHash,
        defaultFrozen: false,
      })

      console.log('NFT created successfully:', createNFTResult);
      enqueueSnackbar(`✅ NFT Minted Successfully! ASA ID: ${createNFTResult.assetId}`, { variant: 'success' })
      
      // Reset form
      setSelectedFile(null)
      setPreviewUrl('')
      
      // Close modal after successful mint
      setTimeout(() => {
        setModalState(false)
      }, 2000)
      
    } catch (e: any) {
      console.error('=== ALGORAND MINTING ERROR ===');
      console.error('Error:', e);
      enqueueSnackbar(`Failed to mint NFT: ${e.message || 'Unknown error'}`, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <dialog id="nft_modal" className={`modal modal-bottom sm:modal-middle backdrop-blur-sm ${openModal ? 'modal-open' : ''}`}>
      <div className="modal-box bg-neutral-800 text-gray-100 rounded-2xl shadow-xl border border-neutral-700 p-6">
        <h3 className="flex items-center gap-3 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500 mb-6">
          <AiOutlineCloudUpload className="text-3xl" />
          Mint a MasterPass NFT
        </h3>
        
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-400">
            Select an image to mint
          </label>
          <div
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-neutral-700 rounded-xl cursor-pointer hover:border-cyan-500 transition-colors"
            onClick={handleDivClick}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="NFT preview" className="rounded-lg max-h-48 object-contain" />
            ) : (
              <div className="text-center">
                <AiOutlineCloudUpload className="mx-auto h-12 w-12 text-gray-500" />
                <p className="mt-2 text-sm text-gray-400">Drag and drop or click to upload</p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="sr-only"
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/gif"
            />
          </div>
        </div>
        
        <div className="modal-action mt-6 flex flex-col-reverse sm:flex-row-reverse gap-3">
          <button
            type="button"
            className="btn w-full sm:w-auto bg-neutral-700 hover:bg-neutral-600 border-none text-gray-300 rounded-xl"
            onClick={() => setModalState(false)}
            disabled={loading}
          >
            Close
          </button>
          <button
            type="button"
            className={`
              btn w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white rounded-xl border-none font-semibold transition-all duration-300 transform active:scale-95
              ${selectedFile && !loading ? '' : 'btn-disabled opacity-50 cursor-not-allowed'}
            `}
            onClick={handleMintNFT}
            disabled={loading || !selectedFile}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <AiOutlineLoading3Quarters className="animate-spin" />
                Minting...
              </span>
            ) : (
              'Mint NFT'
            )}
          </button>
        </div>
      </div>
    </dialog>
  )
}

export default NFTmint