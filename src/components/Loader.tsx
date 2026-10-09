'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import styles from './Loader.module.css'

const RequestLoader = createContext<() => () => void>(() => () => {})
export const useRequestLoader = () => useContext(RequestLoader)
const LoaderFinished = createContext(false)
export const useLoaderFinished = () => useContext(LoaderFinished)

export function LoaderProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [initialized, setInitialized] = useState(false)
  const [visible, setVisible] = useState(true)
  const [leaving, setLeaving] = useState(false)
  const [requests, setRequests] = useState<Set<symbol>>(() => new Set())
  const content = useRef<HTMLDivElement>(null)
  const animationIterations = useRef(0)
  const beginRequest = useCallback(() => {
    const token = Symbol('request')
    setLeaving(false)
    setVisible(true)
    setRequests(current => new Set(current).add(token))
    return () => setRequests(current => { const next = new Set(current); next.delete(token); return next })
  }, [])
  useEffect(() => { setRequests(new Set()) }, [pathname])

  // Initial document load only. Client-side links do not replay the preloader.
  useEffect(() => {
    let active = true
    let loadListener: (() => void) | undefined
    const loaded = new Promise<void>(resolve => {
      if (document.readyState === 'complete') resolve()
      else { loadListener = () => resolve(); window.addEventListener('load', loadListener, { once: true }) }
    })
    void loaded.then(async () => {
      const images = Array.from(content.current?.querySelectorAll('img') || []).filter(image => {
        const bounds = image.getBoundingClientRect()
        return bounds.bottom > 0 && bounds.top < window.innerHeight
      })
      await Promise.all(images.map(image => image.decode().catch(() => undefined)))
      if (active) setInitialized(true)
    })
    return () => { active = false; if (loadListener) window.removeEventListener('load', loadListener) }
  }, [])

  const busy = !initialized || requests.size > 0
  useEffect(() => {
    if (visible) animationIterations.current = 0
  }, [visible])

  useEffect(() => {
    // Normal motion exits at the end of a forward-and-back cycle below.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const finishReduced = () => { if (!busy && reduced.matches) setLeaving(true) }
    finishReduced()
    reduced.addEventListener('change', finishReduced)
    return () => reduced.removeEventListener('change', finishReduced)
  }, [busy])

  useEffect(() => {
    if (busy || !leaving) return
    const timer = setTimeout(() => setVisible(false), window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 100 : 180)
    return () => clearTimeout(timer)
  }, [busy, leaving])

  useEffect(() => {
    if (!visible) return
    const bodyOverflow = document.body.style.overflow
    const htmlOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    return () => { document.body.style.overflow = bodyOverflow; document.documentElement.style.overflow = htmlOverflow }
  }, [visible])

  return <RequestLoader.Provider value={beginRequest}><LoaderFinished.Provider value={initialized && !visible}>
    {visible && <div className={styles.overlay} data-leaving={leaving && !busy} role="status" aria-label="Loading MHOMES">
      <div className={styles.logo} aria-hidden="true">
        <div className={styles.staticLogo}><img src="/MHOMES-logo.png" alt="" width={1536} height={1024} draggable={false} /></div>
        {[0, 1, 2, 3, 4].map(section => <div key={section} className={styles.slice} data-section={section} onAnimationIteration={section === 0 ? () => {
          animationIterations.current += 1
          // Each direction lasts .75s: the complete logo returns after 1.5s.
          if (animationIterations.current % 2 === 0 && !busy) setLeaving(true)
        } : undefined}><img src="/MHOMES-logo.png" alt="" width={1536} height={1024} draggable={false} /></div>)}
      </div>
    </div>}
    <div ref={content} inert={visible}>{children}</div>
  </LoaderFinished.Provider></RequestLoader.Provider>
}
