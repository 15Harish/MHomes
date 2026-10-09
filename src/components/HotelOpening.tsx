'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import Image from 'next/image'
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import { useLoaderFinished } from './Loader'
import styles from './HotelOpening.module.css'

// Roof silhouette in the generated image's native coordinates. The two image
// layers always use the same frame and motion to avoid seams during the reveal.
const foreground = 'M0 427 H118 L230 460 V511 H279 V482 H304 V368 L275 363 251 337 687 334 V321 H618 L593 288 V255 L592 250 H1109 L1105 257 V283 L1109 287 1087 321 H1014 V334 H1488 L1468 361 1434 368 V603 H1672 V940 H0 Z'

interface HotelOpeningProps {
  children: ReactNode
  ready: boolean
  onReady: () => void
  onControlsReady: () => void
}

export function HotelOpening({ children, ready, onReady, onControlsReady }: HotelOpeningProps) {
  const section = useRef<HTMLElement>(null)
  const introDone = useLoaderFinished()
  const [photoLoaded, setPhotoLoaded] = useState(false)
  const [wordmarkLoaded, setWordmarkLoaded] = useState(false)
  const [wordmarkFailed, setWordmarkFailed] = useState(false)
  const titleReadyAt = useRef(Number.POSITIVE_INFINITY)
  const autoReveal = useRef<(() => void) | null>(null)
  const [skipOpening, setSkipOpening] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(false)
  const [titleSettled, setTitleSettled] = useState(false)
  const [photoSettled, setPhotoSettled] = useState(false)
  useEffect(() => {
    if (!titleSettled) return
    const timer = setTimeout(() => autoReveal.current?.(), 250)
    return () => clearTimeout(timer)
  }, [titleSettled])
  useEffect(() => {
    if (photoLoaded && wordmarkLoaded && introDone) onReady()
  }, [photoLoaded, wordmarkLoaded, introDone, onReady])
  useEffect(() => {
    const photo = new window.Image()
    photo.src = '/hotel-opening-v2.png'
    let active = true
    photo.decode().catch(() => undefined).then(() => { if (active) setPhotoLoaded(true) })
    return () => { active = false }
  }, [])
  const reducedMotion = useReducedMotion()
  useEffect(() => {
    if (!ready) return
    const reveal = () => { setControlsVisible(true); onControlsReady() }
    if (reducedMotion) { reveal(); return }
    // Direct navigation or a restored scroll position must never hide navigation.
    const onScroll = () => {
      if (section.current && section.current.getBoundingClientRect().bottom < window.innerHeight / 2) reveal()
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [ready, reducedMotion, onControlsReady])

  const sceneScale = useMotionValue(1.16)

  useEffect(() => {
    // A reload replays the opening from the top, rather than restoring a partial
    // scroll into the next section. Keep explicit section links working.
    const previousRestoration = history.scrollRestoration
    history.scrollRestoration = 'manual'
    const resetOpening = () => {
      if (!window.location.hash) window.scrollTo({ top: 0, behavior: 'instant' })
    }
    resetOpening()
    window.addEventListener('pageshow', resetOpening)
    return () => {
      history.scrollRestoration = previousRestoration
      window.removeEventListener('pageshow', resetOpening)
    }
  }, [])

  useEffect(() => {
    if (reducedMotion || !introDone) return
    let animation: ReturnType<typeof animate> | undefined
    let phase: 'idle' | 'running' | 'done' = 'idle'
    let touchY: number | null = null
    const events = ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart', 'touchmove'] as const
    const detach = () => events.forEach(event => window.removeEventListener(event, reveal))
    const reveal = (event: Event) => {
      if (phase === 'done') return
      if (event instanceof KeyboardEvent && (event.ctrlKey || event.metaKey || event.altKey)) return
      if (event instanceof WheelEvent && event.ctrlKey) return
      const isControl = event.target instanceof Element && Boolean(event.target.closest(
        'input, textarea, select, button, a, [role="dialog"], [role="listbox"], [contenteditable="true"]'
      ))
      if (event instanceof TouchEvent && event.type === 'touchstart') touchY = event.touches[0]?.clientY ?? null
      const downward = event instanceof WheelEvent ? event.deltaY > 0 && Math.abs(event.deltaY) >= Math.abs(event.deltaX) :
        event instanceof TouchEvent ? event.type === 'touchmove' && touchY !== null && event.touches.length === 1 && touchY - event.touches[0].clientY > 8 :
        event instanceof KeyboardEvent && !event.shiftKey && ['ArrowDown', 'PageDown', ' ', 'End'].includes(event.key)
      const early = performance.now() < titleReadyAt.current
      if (isControl || !section.current || Math.abs(section.current.getBoundingClientRect().top) > 4) return
      if (early && phase === 'idle' && !downward) return
      if (early && downward) setSkipOpening(true)
      const scrollAction = event.type === 'wheel' || event.type === 'touchmove' ||
        (event instanceof KeyboardEvent && ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Home', 'End'].includes(event.key))
      if (scrollAction && !isControl && event.cancelable && section.current &&
          Math.abs(section.current.getBoundingClientRect().top) < 4) event.preventDefault()
      if (phase === 'running') return
      phase = 'running'
      setControlsVisible(true)
      onControlsReady()
      animation = animate(sceneScale, 1, {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        onComplete: () => {
          phase = 'done'
          detach()
        },
      })
    }
    autoReveal.current = () => {
      if (phase !== 'idle') return
      phase = 'running'
      setControlsVisible(true)
      onControlsReady()
      animation = animate(sceneScale, 1, { duration: 0.6, ease: [0.22, 1, 0.36, 1], onComplete: () => { phase = 'done'; detach() } })
    }
    // Early scrolling can still finish the opening immediately.
    events.forEach(event => window.addEventListener(event, reveal, { passive: false }))
    return () => {
      autoReveal.current = null
      detach()
      animation?.stop()
    }
  }, [reducedMotion, introDone, sceneScale, onControlsReady])
  const wordmarkScale = useTransform(sceneScale, value => value / 1.16)


  return (
    <section ref={section} id="home" className={styles.hero} aria-label="Welcome to MHOMES Resort">
      <motion.div
        className={styles.viewport}
        initial={{ opacity: 0, y: 28 }}
        animate={ready || skipOpening ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
        transition={{ duration: reducedMotion ? 0 : skipOpening ? 0.2 : 0.85, ease: [0.22, 1, 0.36, 1] }}
        onAnimationComplete={() => { if (ready || skipOpening) setPhotoSettled(true) }}
      >
      <motion.div className={styles.background} style={{ scale: reducedMotion ? 1 : sceneScale }}>
        <div className={styles.frame}>
          <Image src="/hotel-opening-v2.png" alt="MHOMES Resort at dusk" fill sizes="(max-aspect-ratio: 1672/940) 178vh, 100vw" priority unoptimized />
        </div>
      </motion.div>

      <motion.div className={styles.titleZoom} style={{ scale: reducedMotion ? 1 : wordmarkScale }}>
      <div className={styles.titlePosition}>
        <motion.h1
          className={styles.title}
          aria-label="MHOMES"
          initial={{ y: '125%', opacity: 0 }}
          animate={photoSettled || skipOpening ? { y: 0, opacity: 1 } : { y: '125%', opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : skipOpening ? 0.35 : 2.2, delay: reducedMotion || skipOpening ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
          onAnimationComplete={() => { if (photoSettled || skipOpening) { titleReadyAt.current = performance.now() + 250; setTitleSettled(true) } }}
        >
          {wordmarkFailed ? <span className={styles.titleFallback}>MHOMES</span> : (
            <Image
              className={styles.wordmark}
              src="/mhomes-wordmark-hero.png"
              alt=""
              aria-hidden="true"
              width={2172}
              height={724}
              priority
              unoptimized
              draggable={false}
              onLoad={() => setWordmarkLoaded(true)}
              onError={() => { setWordmarkFailed(true); setWordmarkLoaded(true) }}
            />
          )}
        </motion.h1>
      </div>
      </motion.div>

      <motion.div aria-hidden="true" className={styles.foreground} style={{ scale: reducedMotion ? 1 : sceneScale }}>
        <div className={styles.imageReveal}>
        <svg className={styles.frame} viewBox="0 0 1672 940" focusable="false">
          <defs><clipPath id="hotel-opening-roofline"><path d={foreground} /></clipPath></defs>
          <image href="/hotel-opening-v2.png" width="1672" height="940" clipPath="url(#hotel-opening-roofline)" />
        </svg>
        </div>
      </motion.div>

      <div className={styles.shade} aria-hidden="true" />
      <motion.div
        className={styles.booking}
        initial={{ opacity: 0, y: 24, visibility: 'hidden' }}
        animate={controlsVisible ? { opacity: 1, y: 0, visibility: 'visible' } : { opacity: 0, y: 24, visibility: 'hidden' }}
        transition={{ duration: reducedMotion ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
        <a href="#story" className={styles.scrollHint}>Scroll to explore <span aria-hidden="true">↓</span></a>
      </motion.div>
      </motion.div>
    </section>
  )
}
