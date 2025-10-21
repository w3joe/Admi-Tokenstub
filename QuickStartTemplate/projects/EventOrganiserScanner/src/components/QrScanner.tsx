
import React, { useEffect, useRef } from 'react'

// Unique id per mount to avoid duplicate video elements
function useUniqueId(prefix = 'qr-reader-') {
  const idRef = useRef<string>()
  if (!idRef.current) idRef.current = `${prefix}${Math.random().toString(36).slice(2, 10)}`
  return idRef.current
}

interface QrScannerProps {
  onScan: (data: string) => void
  onClose: () => void
}

type QR = {
  start: (cameraConfig: unknown, config: unknown, onSuccess: (txt: string) => void, onError: (e: string) => void) => Promise<void>
  stop: () => Promise<void>
  clear: () => void
}

const QrScanner: React.FC<QrScannerProps> = ({ onScan, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const elementId = useUniqueId()
  const instanceRef = useRef<QR | null>(null)
  const runningRef = useRef(false)

  useEffect(() => {
    let cancelled = false

    const start = async () => {
      try {
        const mod = await import('html5-qrcode')
        if (cancelled || !containerRef.current) return
        const Html5QrcodeClass = (mod as unknown as { Html5Qrcode: new (id: string) => unknown }).Html5Qrcode
        const qr = (new Html5QrcodeClass(elementId) as unknown) as QR
        instanceRef.current = qr

        const BOX = 260
        await qr.start(
          { facingMode: 'environment' },
          { fps: 15, qrbox: { width: BOX, height: BOX }, disableFlip: false },
          (text: string) => {
            if (cancelled) return
            runningRef.current = false
            onScan(text)
            // best-effort cleanup after a successful scan
            qr.stop()
              .then(() => {
                try {
                  qr.clear()
                } catch {
                  /* ignore */
                }
              })
              .catch(() => {
                try {
                  qr.clear()
                } catch {
                  /* ignore */
                }
              })
          },
          () => {
            // ignore scan errors
          }
        )
        if (!cancelled) runningRef.current = true
      } catch {
        if (!cancelled) onClose()
      }
    }

    void start()

    return () => {
      cancelled = true
      const inst = instanceRef.current
      if (!inst) return
      const cleanup = async () => {
        try {
          if (runningRef.current) await inst.stop()
        } catch {
          // ignore
        }
        try {
          inst.clear()
        } catch {
          // ignore
        }
      }
      void cleanup()
    }
  }, [onClose, onScan, elementId])

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-neutral-900 rounded-xl p-4 shadow-lg relative w-80 flex flex-col items-center">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-red-400" onClick={onClose}>
          ✕
        </button>
        {/* html5-qrcode populates this element with the video + frame UI */}
        <div id={elementId} ref={containerRef} className="w-80 h-80 rounded-lg bg-black overflow-hidden" />
        <p className="mt-2 text-gray-300 text-sm">Scan QR code</p>
      </div>
    </div>
  )
}

export default QrScanner
