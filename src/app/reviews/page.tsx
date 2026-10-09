"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { hasLiveReviews } from '@/lib/review-access'
import { ArrowUpRight, Star } from 'lucide-react'
import { GuestPage } from '@/components/GuestPage'
import { ReviewStars } from '@/components/ReviewShowcase'
import styles from './Reviews.module.css'
interface Review { id: string; name: string; location?: string; rating: number; text: string; date?: string; source?: string }
export default function ReviewsPage() {
 const router=useRouter()
 const [reviews,setReviews]=useState<Review[]>([])
 const [loading,setLoading]=useState(true)
 const [failed,setFailed]=useState(false)
 const [filter,setFilter]=useState(0)
 const [sort,setSort]=useState('featured')
 const [businessUrl,setBusinessUrl]=useState('https://www.google.com/maps/search/?api=1&query=MHOMES+Resort+Madurai')
 useEffect(()=>{let active=true;fetch('/api/reviews', { signal: AbortSignal.timeout(15000) }).then(r=>{if(!r.ok)throw new Error('Reviews unavailable');return r.json()}).then(data=>{if(active){if(!hasLiveReviews(data)){router.replace("/#reviews");return}setReviews(data.reviews||[]);if(data.businessUrl)setBusinessUrl(data.businessUrl)}}).catch(()=>{if(active){setFailed(true);router.replace("/#reviews")}}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[router])
 const rated=reviews.filter(review=>Number.isFinite(review.rating)&&review.rating>=1&&review.rating<=5)
 const average=rated.length?rated.reduce((sum,review)=>sum+review.rating,0)/rated.length:0
 const shown=reviews.filter(review=>!filter||Math.round(review.rating)===filter).sort((a,b)=>sort==='highest'?b.rating-a.rating:sort==='lowest'?a.rating-b.rating:0)
 return <GuestPage label="THE GUESTBOOK" title="Your stays. Your stories." intro="Unhurried days, familiar comforts, and the moments our guests take home.">
  {loading?<div className={styles.notice} role="status">Opening the guestbook...</div>:failed?<div className={styles.notice} role="status">We could not load the guestbook. You can still read our reviews on Google below.</div>:reviews.length?<>
   <section className={styles.summary} aria-label="Guest rating summary">
    <div className={styles.breakdown}><p className={styles.eyebrow}>A CLOSER LOOK</p>{[5,4,3,2,1].map(stars=>{const count=rated.filter(review=>Math.round(review.rating)===stars).length;return <button key={stars} className={styles.ratingRow} aria-label={`Show ${stars}-star reviews: ${count}`} aria-pressed={filter===stars} onClick={()=>setFilter(filter===stars?0:stars)}><span>{stars} <Star size={12} fill="currentColor" aria-hidden="true"/></span><span className={styles.bar}><span style={{width:`${rated.length?count/rated.length*100:0}%`}}/></span><span>{count}</span></button>})}</div>
    <div className={styles.score}><p className={styles.eyebrow}>GUEST IMPRESSIONS</p><div className={styles.number}>{average.toFixed(1)}<span>/ 5</span></div><ReviewStars rating={average}/><p>Based on {rated.length} displayed {rated.length===1?'review':'reviews'}</p><a href={businessUrl} target="_blank" rel="noopener noreferrer">See all reviews on Google <ArrowUpRight size={14}/></a></div>
   </section>
   <div className={styles.toolbar}><div><h2>From our guests</h2><p>{shown.length} {filter?`${filter}-star `:''}{shown.length===1?'review':'reviews'}{filter>0&&<button onClick={()=>setFilter(0)}>Show all</button>}</p></div><label>Sort by<select value={sort} onChange={event=>setSort(event.target.value)}><option value="featured">Featured</option><option value="highest">Highest rated</option><option value="lowest">Lowest rated</option></select></label></div>
   <div aria-live="polite">{shown.length?shown.map((review,index)=><article className={styles.review} key={review.id||index}><div className={styles.identity}><span className={styles.avatar} aria-hidden="true">{review.name.trim().charAt(0)}</span><div><h3>{review.name}</h3>{review.location&&<p>{review.location}</p>}</div></div><div className={styles.reviewBody}><div className={styles.reviewMeta}><ReviewStars rating={review.rating}/>{review.date&&<span>{review.date}</span>}</div><blockquote>{review.text}</blockquote>{review.source==='google'&&<span className={styles.source}>Shared on Google</span>}</div></article>):<p className={styles.notice}>No displayed reviews match this rating. Choose another rating or show all reviews.</p>}</div>
  </>:<p className={styles.notice}>Our guest stories will appear here soon.</p>}
  <div className={styles.invitation}><div><p className={styles.eyebrow}>BE PART OF THE GUESTBOOK</p><h2>A stay worth sharing?</h2><p>We would love to hear what made yours memorable.</p></div><a href={businessUrl} target="_blank" rel="noopener noreferrer">Share your experience <ArrowUpRight size={17}/></a></div>
 </GuestPage>
}
