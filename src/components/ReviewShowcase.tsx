"use client"
import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Star } from 'lucide-react'
import styles from './ReviewShowcase.module.css'

type Review = { name: string; text: string; rating: number; location?: string }
export function ReviewStars({ rating }: { rating: number }) {
 return <div className={styles.stars} aria-label={`${rating} out of 5 stars`}>{Array.from({length:5},(_,i)=><Star aria-hidden="true" key={i} size={13} fill={i<Math.round(rating)?'currentColor':'none'}/>)}</div>
}
export function ReviewShowcase({ reviews }: { reviews: Review[] }) {
 const [selectedReview,setSelectedReview]=useState<Review|null>(null)
 if(!reviews.length)return null
 return <div className={styles.showcase} role="region" aria-label="Guest reviews carousel" tabIndex={0} data-reading={Boolean(selectedReview)}>
  <div className={styles.viewport}><div className={styles.track} style={{animationDuration:`${Math.max(30,reviews.length*10)}s`}}>
   {[0,1].map(copy=><div className={styles.group} key={copy} aria-hidden={copy===1?true:undefined}>{reviews.map((review,index)=><figure className={styles.card} key={`${review.name}-${index}`}>
    <figcaption><span className={styles.avatar} aria-hidden="true">{review.name.trim().charAt(0)}</span><strong>{review.name}</strong>{review.location&&<span className={styles.location}>{review.location}</span>}</figcaption>
    <ReviewStars rating={review.rating}/><blockquote>{review.text}</blockquote>
    {review.text && <button className={styles.readReview} tabIndex={copy===1?-1:0} onClick={()=>setSelectedReview(review)} aria-label={`Read full review by ${review.name}`}>Read full review</button>}
   </figure>)}</div>)}
  </div></div>
  <Dialog open={Boolean(selectedReview)} onOpenChange={open=>{if(!open)setSelectedReview(null)}}>
   <DialogContent className={styles.reviewDialog}>
    <DialogTitle>{selectedReview?.name}</DialogTitle>
    <DialogDescription>{selectedReview?.location || 'Guest review'}</DialogDescription>
    {selectedReview && <><ReviewStars rating={selectedReview.rating}/><p className={styles.fullText}>{selectedReview.text}</p></>}
   </DialogContent>
  </Dialog>
 </div>
}
