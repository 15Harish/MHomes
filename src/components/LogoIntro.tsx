'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import styles from './LogoIntro.module.css'
export function LogoIntro({ onComplete }: { onComplete: () => void }) {
 const video=useRef<HTMLVideoElement>(null)
 const finished=useRef(false)
 const exitTimer=useRef<ReturnType<typeof setTimeout> | null>(null)
 const [leaving,setLeaving]=useState(false)
 const finish=useCallback(()=>{if(finished.current)return;finished.current=true;setLeaving(true);exitTimer.current=setTimeout(onComplete,400)},[onComplete])
 useEffect(()=>{
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches||window.location.hash){onComplete();return}
  const previous=document.body.style.overflow
  document.body.style.overflow='hidden'
  video.current?.play().catch(finish)
  const timeout=setTimeout(finish,5000)
  const skip=(event:Event)=>{if(event instanceof KeyboardEvent&&!['Escape','Enter',' ','ArrowDown','PageDown'].includes(event.key))return;if(event.cancelable)event.preventDefault();finish()}
  window.addEventListener('wheel',skip,{passive:false})
  window.addEventListener('keydown',skip)
  return()=>{document.body.style.overflow=previous;clearTimeout(timeout);if(exitTimer.current)clearTimeout(exitTimer.current);window.removeEventListener('wheel',skip);window.removeEventListener('keydown',skip)}
 },[finish,onComplete])
 return <div className={styles.intro} data-leaving={leaving} aria-label="MHOMES welcome animation"><video ref={video} src="/mhomes-loader.mp4" autoPlay muted playsInline preload="auto" onEnded={finish} onError={finish} aria-hidden="true"/><button onClick={finish} className={styles.skip}>Skip intro <span aria-hidden="true">↗</span></button></div>
}
