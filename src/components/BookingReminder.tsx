"use client"
import { useEffect, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import styles from './BookingReminder.module.css'

type NavigationEvent = Event & { canIntercept: boolean; hashChange: boolean; destination: { url: string }; intercept: (options: { handler: () => Promise<void> }) => void }
/** Remind only after room selection; never interfere with payment completion. */
export function BookingReminder({ active }: { active: boolean }) {
 const [open,setOpen]=useState(false)
 const pending=useRef<(() => void)|null>(null)
 const leaving=useRef(false)
 useEffect(()=>{
  if(!active){setOpen(false);pending.current=null;return}
  const ask=(proceed:()=>void)=>{pending.current=proceed;setOpen(true)}
  const click=(event:MouseEvent)=>{
   if(leaving.current||event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return
   const link=event.target instanceof Element?event.target.closest('a'):null
   if(!link||link.target==='_blank'||link.hasAttribute('download'))return
   const url=new URL(link.href,location.href)
   if(!['http:','https:'].includes(url.protocol)||url.pathname===location.pathname&&url.search===location.search)return
   event.preventDefault();event.stopPropagation()
   ask(()=>location.assign(url.href))
  }
  const unload=(event:BeforeUnloadEvent)=>{if(!leaving.current){event.preventDefault();event.returnValue=''}}
  // The Navigation API lets browser Back stay on the current document while asking.
  const navigation=(window as Window & {navigation?:EventTarget}).navigation
  const navigate=(raw:Event)=>{
   const event=raw as NavigationEvent
   if(leaving.current||!event.canIntercept||event.hashChange)return
   const url=new URL(event.destination.url)
   if(url.pathname===location.pathname&&url.search===location.search)return
   event.preventDefault()
   ask(()=>location.assign(url.href))
  }
  document.addEventListener('click',click,true)
  window.addEventListener('beforeunload',unload)
  navigation?.addEventListener('navigate',navigate)
  return()=>{document.removeEventListener('click',click,true);window.removeEventListener('beforeunload',unload);navigation?.removeEventListener('navigate',navigate)}
 },[active])
 return <Dialog open={open} onOpenChange={value=>{setOpen(value);if(!value)pending.current=null}}><DialogContent className={styles.reminder}>
  <p className={styles.label}>A LITTLE REMINDER</p>
  <DialogTitle className={styles.title}>Your stay is not booked just yet.</DialogTitle>
  <DialogDescription className={styles.copy}>You have chosen your room, but your reservation is only confirmed once payment is complete. Would you like to continue planning your stay?</DialogDescription>
  <div className={styles.actions}><button onClick={()=>{setOpen(false);pending.current=null}}>Continue my booking</button><button onClick={()=>{leaving.current=true;setOpen(false);pending.current?.();pending.current=null}}>Leave for now</button></div>
 </DialogContent></Dialog>
}
