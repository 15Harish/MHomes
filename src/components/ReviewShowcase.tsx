"use client"
import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Star } from 'lucide-react'
import styles from './ReviewShowcase.module.css'

type Review = { name: string; text: string; rating: number; location?: string; source?: string; profilePhotoUrl?: string; authorUrl?: string; reviewUrl?: string }
function ReviewAuthor({ review, duplicate = false }: { review: Review; duplicate?: boolean }) {
 const content = <>{review.profilePhotoUrl ? <img className={styles.avatar} src={review.profilePhotoUrl} alt="" width={40} height={40} loading="lazy" referrerPolicy="no-referrer" /> : <span className={styles.avatar} aria-hidden="true">{review.name.trim().charAt(0)}</span>}<strong>{review.name}</strong></>
 return review.authorUrl ? <a className={styles.author} href={review.authorUrl} target="_blank" rel="noopener noreferrer" tabIndex={duplicate?-1:0}>{content}</a> : <div className={styles.author}>{content}</div>
}
function ReviewSource({ review, duplicate = false, linkToSource = false }: { review: Review; duplicate?: boolean; linkToSource?: boolean }) {
 if(review.source !== 'google') return null
 return <div className={styles.attribution}>{linkToSource && review.reviewUrl ? <a href={review.reviewUrl} target="_blank" rel="noopener noreferrer" tabIndex={duplicate?-1:0}>View on <span translate="no">Google Maps</span></a> : <span translate="no">Google Maps</span>}</div>
}
export function ReviewStars({ rating }: { rating: number }) {
 return <div className={styles.stars} aria-label={`${rating} out of 5 stars`}>{Array.from({length:5},(_,i)=><Star aria-hidden="true" key={i} size={13} fill={i<Math.round(rating)?'currentColor':'none'}/>)}</div>
}
export function ReviewShowcase({ reviews }: { reviews: Review[] }) {
 const [selectedReview,setSelectedReview]=useState<Review|null>(null)
 if(!reviews.length)return null
 return <div className={styles.showcase} role="region" aria-label="Guest reviews carousel" tabIndex={0} data-reading={Boolean(selectedReview)}>
  <div className={styles.viewport}><div className={styles.track} style={{animationDuration:`${Math.max(30,reviews.length*10)}s`}}>
   {[0,1].map(copy=><div className={styles.group} key={copy} aria-hidden={copy===1?true:undefined}>{reviews.map((review,index)=><figure className={styles.card} key={`${review.name}-${index}`}>
    <figcaption><ReviewAuthor review={review} duplicate={copy===1}/>{review.source!=='google'&&review.location&&<span className={styles.location}>{review.location}</span>}<ReviewSource review={review} duplicate={copy===1}/></figcaption>
    <ReviewStars rating={review.rating}/><blockquote>{review.text}</blockquote>
    {review.text && <button className={styles.readReview} tabIndex={copy===1?-1:0} onClick={()=>setSelectedReview(review)} aria-label={`Read full review by ${review.name}`}>Read full review</button>}
   </figure>)}</div>)}
  </div></div>
  {reviews.some(review=>review.source==='google') && <p className={styles.reviewNotice}>Google reviews, ordered by relevance.</p>}
  <Dialog open={Boolean(selectedReview)} onOpenChange={open=>{if(!open)setSelectedReview(null)}}>
   <DialogContent className={styles.reviewDialog}>
    <DialogTitle>Guest review</DialogTitle>
    <DialogDescription>{selectedReview?.location || 'Guest review'}</DialogDescription>
    {selectedReview && <><ReviewAuthor review={selectedReview}/><ReviewSource review={selectedReview} linkToSource/><ReviewStars rating={selectedReview.rating}/><p className={styles.fullText}>{selectedReview.text}</p></>}
   </DialogContent>
  </Dialog>
 </div>
}
