import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001'

const flowerAssetEntries = Object.entries(
  import.meta.glob('./assets/flowers/*.png', { eager: true, import: 'default' })
)
const flowerAssets = flowerAssetEntries
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, src]) => src)

const logoFlower = flowerAssets[0]

import branchAltImg from './assets/attachments (1)/1000083001.png'
import branchAltImgTwo from './assets/attachments (1)/1000083002.png'
const branchSources = [branchAltImg, branchAltImgTwo]
const branchAssets = [0, 1, 2]

const bloomOptions = flowerAssets.map((src, index) => ({
  id: `flower-${index + 1}`,
  name: `Flower ${index + 1}`,
  src
}))

const arrangements = [
  [
    { x: 50, y: 14, size: 144 },
    { x: 37, y: 26, size: 128 },
    { x: 63, y: 26, size: 130 },
    { x: 43, y: 38, size: 122 },
    { x: 57, y: 40, size: 118 },
    { x: 50, y: 50, size: 126 },
    { x: 33, y: 44, size: 114 },
    { x: 67, y: 46, size: 114 }
  ],
  [
    { x: 50, y: 16, size: 140 },
    { x: 35, y: 28, size: 122 },
    { x: 65, y: 28, size: 126 },
    { x: 41, y: 40, size: 118 },
    { x: 59, y: 42, size: 116 },
    { x: 50, y: 52, size: 122 },
    { x: 31, y: 46, size: 112 },
    { x: 69, y: 48, size: 112 }
  ],
  [
    { x: 50, y: 12, size: 146 },
    { x: 35, y: 26, size: 124 },
    { x: 65, y: 28, size: 128 },
    { x: 41, y: 40, size: 116 },
    { x: 59, y: 42, size: 120 },
    { x: 50, y: 52, size: 124 },
    { x: 33, y: 46, size: 114 },
    { x: 67, y: 48, size: 114 }
  ]
]

const heroButtons = [
  { id: 'build', label: 'Build a bouquet', variant: 'solid' },
  { id: 'mono', label: 'Build it in black and white', variant: 'outline' },
  { id: 'garden', label: 'View garden', variant: 'text' }
]

const branchLayouts = [
  { left: 50, bottom: 6, width: 340, rotate: 0, flip: false, opacity: 0.9 },
  { left: 50, bottom: 12, width: 300, rotate: 2, flip: true, opacity: 0.75 },
  { left: 48, bottom: 2, width: 360, rotate: -4, flip: false, opacity: 0.6 }
]


const AssetBloom = ({ src, alt, className = '' }) => (
  <img className={`asset-image ${className}`.trim()} src={src} alt={alt} loading="lazy" />
)

function App() {
  const [selected, setSelected] = useState(bloomOptions.slice(0, 8).map((bloom) => bloom.id))
  const [isMono, setIsMono] = useState(false)
  const [arrangementIndex, setArrangementIndex] = useState(0)
  const [greeneryStyle, setGreeneryStyle] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [note, setNote] = useState(
    'I have so much to tell you, but only this much space on this card! Still, you must know...'
  )
  const [signature, setSignature] = useState('Secret Admirer')
  const [shareStatus, setShareStatus] = useState('')
  const [shareId, setShareId] = useState('')
  const [shareLoading, setShareLoading] = useState(false)
  const [confettiActive, setConfettiActive] = useState(false)
  const confettiTimer = useRef(null)

  const selectedBlooms = useMemo(() => {
    return bloomOptions.filter((bloom) => selected.includes(bloom.id))
  }, [selected])

  const bloomCount = selectedBlooms.length
  const canProceed = bloomCount === 8
  const arrangement = arrangements[arrangementIndex % arrangements.length]
  const cardLeft = bloomOptions.slice(0, 4)
  const cardRight = bloomOptions.slice(4, 8)
  const confettiPieces = Array.from({ length: 18 }, (_, index) => index)

  const shareText = `I made you a bouquet on Digibouquet.\n\n${note}\n\nSincerely, ${signature}`
  const buildShareUrl = (id) => {
    if (typeof window === 'undefined') {
      return ''
    }
    return `${window.location.origin}${window.location.pathname}?share=${id}`
  }

  const triggerConfetti = () => {
    if (confettiTimer.current) {
      clearTimeout(confettiTimer.current)
    }
    setConfettiActive(true)
    confettiTimer.current = setTimeout(() => {
      setConfettiActive(false)
    }, 1800)
  }

  useEffect(() => {
    if (currentStep === 4) {
      triggerConfetti()
    }
    return () => {
      if (confettiTimer.current) {
        clearTimeout(confettiTimer.current)
      }
    }
  }, [currentStep])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    const params = new URLSearchParams(window.location.search)
    const incomingShareId = params.get('share')
    if (!incomingShareId) {
      return
    }

    const loadSharedBouquet = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/bouquets/${incomingShareId}`)
        if (!response.ok) {
          throw new Error('Share not found')
        }
        const data = await response.json()
        const bouquet = data?.bouquet
        if (!bouquet) {
          throw new Error('Missing bouquet data')
        }
        const incomingSelected = Array.isArray(bouquet.selected) && bouquet.selected.length
          ? bouquet.selected
          : bloomOptions.slice(0, 8).map((bloom) => bloom.id)

        setSelected(incomingSelected)
        setArrangementIndex(Number(bouquet.arrangementIndex || 0))
        setGreeneryStyle(Number(bouquet.greeneryStyle || 0))
        setIsMono(Boolean(bouquet.isMono))
        setNote(bouquet.note || '')
        setSignature(bouquet.signature || '')
        setShareId(incomingShareId)
        setCurrentStep(4)
      } catch (error) {
        setShareStatus('Unable to load shared bouquet.')
      }
    }

    loadSharedBouquet()
  }, [])

  const createShare = async () => {
    if (shareId) {
      return shareId
    }
    setShareLoading(true)
    setShareStatus('Creating share link...')
    try {
      const response = await fetch(`${API_BASE}/api/bouquets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selected,
          arrangementIndex,
          greeneryStyle,
          isMono,
          note,
          signature
        })
      })
      if (!response.ok) {
        throw new Error('Share failed')
      }
      const data = await response.json()
      const newShareId = data?.shareId || data?.bouquet?.shareId
      if (!newShareId) {
        throw new Error('Share id missing')
      }
      setShareId(newShareId)
      setShareStatus('')
      return newShareId
    } catch (error) {
      setShareStatus('Unable to create share link.')
      throw error
    } finally {
      setShareLoading(false)
    }
  }

  const handleShare = async () => {
    try {
      const newShareId = await createShare()
      const shareUrl = buildShareUrl(newShareId)
      if (navigator.share) {
        await navigator.share({ title: 'Digibouquet', text: shareText, url: shareUrl })
        setShareStatus('Shared!')
        triggerConfetti()
        return
      }
      await handleCopy(true)
    } catch (error) {
      setShareStatus('Unable to share yet.')
    }
  }

  const handleCopy = async (withConfetti = false) => {
    try {
      const newShareId = await createShare()
      const shareUrl = buildShareUrl(newShareId)
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`.trim())
      } else {
        const fallback = document.createElement('textarea')
        fallback.value = `${shareText}\n${shareUrl}`.trim()
        document.body.appendChild(fallback)
        fallback.select()
        document.execCommand('copy')
        document.body.removeChild(fallback)
      }
      setShareStatus('Copied to clipboard!')
      if (withConfetti) {
        triggerConfetti()
      }
    } catch (error) {
      setShareStatus('Copy failed.')
    }
  }

  const getBranchStyle = (index) => {
    const layout = branchLayouts[index % branchLayouts.length]
    const transforms = [`translateX(-50%)`, `rotate(${layout.rotate}deg)`]
    if (layout.flip) {
      transforms.push('scaleX(-1)')
    }
    return {
      left: `${layout.left}%`,
      bottom: `${layout.bottom}%`,
      width: `${layout.width}px`,
      opacity: layout.opacity,
      transform: transforms.join(' ')
    }
  }


  const toggleBloom = (id) => {
    setSelected((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id)
      }
      if (current.length >= 8) {
        return current
      }
      return [...current, id]
    })
  }

  const handleHeroAction = (id) => {
    if (id === 'mono') {
      setIsMono(true)
      setCurrentStep(1)
    }
    if (id === 'build') {
      setIsMono(false)
      setCurrentStep(1)
    }
    if (id === 'garden') {
      setCurrentStep(4)
    }
  }

  return (
    <div className="page">
      {currentStep === 0 && (
        <header className="hero">
          <div className="logo">
            <img className="logo-image" src={logoFlower} alt="Digibouquet flower logo" />
            <h1 className="wordmark">Digibouquet</h1>
          </div>
          <p className="tagline">Beautiful flowers delivered digitally</p>
          <div className="hero-actions">
            {heroButtons.map((button) => (
              <button
                key={button.id}
                className={`hero-button ${button.variant}`}
                onClick={() => handleHeroAction(button.id)}
              >
                {button.label}
              </button>
            ))}
          </div>
          <p className="byline">Made by Samiksha</p>
        </header>
      )}

      {currentStep === 1 && (
        <section className="section">
          <div className="section-header">
            <h2>Pick 8 blooms</h2>
            <p className="section-sub">Tap to add or remove a flower from your bouquet.</p>
          </div>
          <div className={`bloom-grid ${isMono ? 'mono' : ''}`}>
            {bloomOptions.map((bloom) => (
              <button
                key={bloom.id}
                className={`bloom-tile ${selected.includes(bloom.id) ? 'selected' : ''}`}
                onClick={() => toggleBloom(bloom.id)}
                type="button"
              >
                <AssetBloom src={bloom.src} alt={bloom.name} />
                <span>{bloom.name}</span>
              </button>
            ))}
          </div>
          <div className="section-footer">
            <button className="hero-button outline" onClick={() => setCurrentStep(0)}>
              Back
            </button>
            <button
              className="hero-button solid"
              disabled={!canProceed}
              onClick={() => setCurrentStep(2)}
            >
              Next
            </button>
            <span className="count">{bloomCount} selected</span>
          </div>
        </section>
      )}

      {currentStep === 2 && (
        <section className="section">
          <div className="section-header">
            <h2>Customize your bouquet</h2>
          </div>
          <div className="action-row">
            <button
              className="hero-button solid"
              onClick={() => setArrangementIndex((current) => current + 1)}
            >
              Try a new arrangement
            </button>
            <button
              className="hero-button outline"
              onClick={() => setGreeneryStyle((current) => (current + 1) % 2)}
            >
              Change greenery
            </button>
          </div>
          <div
            className={`bouquet-stage ${greeneryStyle === 1 ? 'lush' : 'airy'} ${isMono ? 'mono' : ''}`}
          >
            <div className="greenery">
              {branchAssets.map((assetId, index) => (
                <img
                  key={`branch-${assetId}`}
                  className="branch-image"
                  src={branchSources[greeneryStyle % branchSources.length]}
                  alt=""
                  aria-hidden="true"
                  style={getBranchStyle(index)}
                />
              ))}
            </div>
            <div className="bouquet-blooms">
              {selectedBlooms.slice(0, 8).map((bloom, index) => {
                const position = arrangement[index % arrangement.length]
                return (
                  <div
                    key={bloom.id}
                    className="bouquet-bloom"
                    style={{
                      left: `${position.x}%`,
                      top: `${position.y}%`,
                      width: `${position.size}px`,
                      height: `${position.size}px`
                    }}
                  >
                    <AssetBloom src={bloom.src} alt={bloom.name} />
                  </div>
                )
              })}
            </div>
          </div>
          <div className="section-footer">
            <button className="hero-button outline" onClick={() => setCurrentStep(1)}>
              Back
            </button>
            <button className="hero-button solid" onClick={() => setCurrentStep(3)}>
              Next
            </button>
          </div>
        </section>
      )}

      {currentStep === 3 && (
        <section className="section">
          <div className="section-header">
            <h2>Write the card</h2>
          </div>
          <div className="card-area">
            <div className="card-side">
              {cardLeft.map((bloom) => (
                <AssetBloom key={bloom.id} src={bloom.src} alt={bloom.name} />
              ))}
            </div>
            <div className="card">
              <label className="card-label" htmlFor="card-note">
                Dear Beloved,
              </label>
              <textarea
                id="card-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={6}
              />
              <div className="card-sign">
                <span>Sincerely,</span>
                <input
                  type="text"
                  value={signature}
                  onChange={(event) => setSignature(event.target.value)}
                />
              </div>
            </div>
            <div className="card-side">
              {cardRight.map((bloom) => (
                <AssetBloom key={bloom.id} src={bloom.src} alt={bloom.name} />
              ))}
            </div>
          </div>
          <div className="section-footer">
            <button className="hero-button outline" onClick={() => setCurrentStep(2)}>
              Back
            </button>
            <button className="hero-button solid" onClick={() => setCurrentStep(4)}>
              Next
            </button>
          </div>
        </section>
      )}

      {currentStep === 4 && (
        <section className="section finale">
          <h2>Hi, I made this bouquet for you!</h2>
          <div className={`confetti ${confettiActive ? 'active' : ''}`} aria-hidden="true">
            {confettiPieces.map((piece) => (
              <span
                key={`confetti-${piece}`}
                className="confetti-piece"
                style={{
                  left: `${((piece + 1) * 100) / (confettiPieces.length + 1)}%`,
                  backgroundColor: `hsl(${(piece * 35) % 360} 70% 60%)`,
                  animationDelay: `${piece * 0.05}s`,
                  animationDuration: `${1.2 + (piece % 5) * 0.15}s`
                }}
              />
            ))}
          </div>
          <div className={`final-bouquet ${isMono ? 'mono' : ''}`}>
            <div className="final-orb" />
            <div className="final-stems">
              {branchAssets.map((assetId, index) => (
                <img
                  key={`final-branch-${assetId}`}
                  className="branch-image"
                  src={branchSources[greeneryStyle % branchSources.length]}
                  alt=""
                  aria-hidden="true"
                  style={getBranchStyle(index)}
                />
              ))}
            </div>
            <div className="final-blooms">
              {selectedBlooms.slice(0, 8).map((bloom, index) => {
                const position = arrangement[index % arrangement.length]
                return (
                  <div
                    key={`${bloom.id}-final`}
                    className="bouquet-bloom"
                    style={{
                      left: `${position.x}%`,
                      top: `${position.y + 8}%`,
                      width: `${position.size}px`,
                      height: `${position.size}px`
                    }}
                  >
                    <AssetBloom src={bloom.src} alt={bloom.name} />
                  </div>
                )
              })}
            </div>
            <div className="final-card">
              <p>Dear</p>
              <p className="final-note">{note}</p>
              <p className="final-sign">Sincerely, {signature}</p>
            </div>
          </div>
          <div className="share-actions">
            <button
              className="hero-button solid"
              onClick={handleShare}
              type="button"
              disabled={shareLoading}
            >
              Share
            </button>
            <button
              className="hero-button outline"
              onClick={handleCopy}
              type="button"
              disabled={shareLoading}
            >
              Copy
            </button>
            <button className="hero-button text" onClick={() => setCurrentStep(0)} type="button">
              Start over
            </button>
            <span className="share-status" aria-live="polite">
              {shareStatus}
            </span>
          </div>
        </section>
      )}
    </div>
  )
}

export default App
