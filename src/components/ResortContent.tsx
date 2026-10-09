'use client'

import { googleReviewsUrl } from '@/lib/google-review-links'

import { ReviewShowcase } from './ReviewShowcase'

import { useState, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowUpRight, ArrowRight, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { ProtectedBookingButton } from '@/components/ProtectedBookingButton'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import styles from './ResortContent.module.css'

interface Room {
  name: string
  description: string
  images: string[]
  price: string
  bedType: string
  sqft: string
  maxGuests: string
}
interface Review { name: string; text: string; rating: number; location?: string }
interface Props {
  story: ReactNode
  rooms: Room[]
  roomAmenities: Record<string, string[]>
  reviews: Review[]
  reviewsLoading: boolean
}

function RoomPresentation({ room, amenities, index }: { room: Room; amenities: string[]; index: number }) {
  const [photo, setPhoto] = useState(0)
  const router = useRouter()
  const roomType = index === 0 ? 'premium' : 'premium_plus'
  return (
    <article className={styles.room}>
      <div className={styles.roomPhoto}>
        <Image src={room.images[photo]} alt={`${room.name}, photograph ${photo + 1}`} fill sizes="(min-width: 800px) 44vw, 92vw" className={styles.cover} />
        <div className={styles.photoControls}>
          <button type="button" aria-label={`Previous photo of ${room.name}`} onClick={() => setPhoto((photo + room.images.length - 1) % room.images.length)}><ChevronLeft size={18} /></button>
          <span aria-live="polite">{String(photo + 1).padStart(2, '0')} / {String(room.images.length).padStart(2, '0')}</span>
          <button type="button" aria-label={`Next photo of ${room.name}`} onClick={() => setPhoto((photo + 1) % room.images.length)}><ChevronRight size={18} /></button>
        </div>
      </div>
      <div className={styles.roomHeading}><h3>{room.name}</h3><p className={styles.price}>{room.price.replace('/Night', '')}<span> / night</span></p></div>
      <p>{index === 0 ? 'Warm wood, soft linen, and the space to settle in. An inviting retreat after a day in Madurai.' : 'A little more indulgence, from restful interiors to a private bathtub. Make time to stay a little longer.'}</p>
      <ul className={styles.specs}><li>{room.bedType}</li><li>{room.sqft}</li><li>Up to {room.maxGuests} guests</li></ul>
      <div className={styles.roomActions}>
        <Dialog>
          <DialogTrigger className={styles.textLink}>Explore the room <ArrowUpRight size={17} /></DialogTrigger>
          <DialogContent className={styles.roomDialog}>
            <DialogTitle>{room.name}</DialogTitle>
            <DialogDescription>{room.description}</DialogDescription>
            <ul className={styles.amenityList}>{amenities.map(item => <li key={item}><Check size={15} />{item}</li>)}</ul>
            <ProtectedBookingButton className={styles.button} onClick={() => router.push(`/reservation?roomType=${roomType}`)}>Reserve this room <ArrowRight size={17} /></ProtectedBookingButton>
          </DialogContent>
        </Dialog>
        <ProtectedBookingButton className={styles.button} onClick={() => router.push(`/reservation?roomType=${roomType}`)}>Reserve room <ArrowRight size={16} /></ProtectedBookingButton>
      </div>
    </article>
  )
}

export function ResortContent({ story, rooms, roomAmenities, reviews, reviewsLoading }: Props) {
  return (
    <div className={styles.content}>
      <div className={styles.retainedStory}>{story}</div>

      <section className={styles.welcomeFilm} aria-labelledby="welcome-heading">
        <video className={styles.welcomeVideo} autoPlay muted loop playsInline preload="metadata" poster="/entrance2.png" aria-hidden="true"><source src="/resort-welcome-web.mp4" type="video/mp4" /></video>
        <div className={`${styles.container} ${styles.welcomeOverlay}`}>
          <p className={styles.eyebrow}>MHOMES RESORT / MADURAI</p>
          <h2 id="welcome-heading">A place to pause.<br /><em>A feeling of home.</em></h2>
          <p className={styles.welcomeDescription}>Rooted in Madurai. Made for your escape.<br />A warm welcome, on Alagarkoil Road.</p>
          <a className={styles.welcomeLink} href="#accommodations">Explore our rooms <ArrowUpRight size={18} /></a>
        </div>
      </section>


      <section id="accommodations" className={`${styles.section} ${styles.roomsSection}`} aria-labelledby="rooms-heading">
        <div className={styles.container}>
          <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>STAY A LITTLE LONGER</p><h2 id="rooms-heading">Your own quiet corner.</h2></div><p>Two thoughtfully appointed room categories.<br />One simple pleasure: feeling at home.</p></div>
          <div className={styles.roomsGrid}>{rooms.map((room, index) => <RoomPresentation key={room.name} room={room} index={index} amenities={roomAmenities[room.name] || []} />)}</div>
          <p className={styles.rateNote}>Select your dates to view availability and the final price for your stay.</p>
        </div>
      </section>

      <section id="gallery" className={`${styles.section} ${styles.experiences}`} aria-labelledby="experiences-heading">
        <div className={styles.container}>
          <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>LIFE AT MHOMES</p><h2 id="experiences-heading">Little moments.<br /><em>A whole day to enjoy.</em></h2></div><p>Play a match, make a splash, or find a quiet spot. Discover the spaces that make time together special.</p></div>
          <div className={styles.experienceGrid}>
            {[
              { image: '/pickleball2.png', title: 'Pickleball court', text: 'A friendly rally. A little healthy competition. Make room for a game together.' },
              { image: '/swimmingpool2.png', title: 'Pool & rain dance', text: 'Water-filled moments for the family, with space for the little ones to splash and play.' },
              { image: '/fountain.jpeg', title: 'The fountain', text: 'Slow down beside the water and enjoy a different pace around the resort.' },
              { image: '/fishtank.png', title: 'Aquarium lounge', text: 'Pause by the aquarium and let a quieter moment become part of your day.' },
            ].map(item => <article className={styles.experience} key={item.title}><div className={styles.experiencePhoto}><Image src={item.image} alt={`${item.title} at MHOMES Resort, Madurai`} fill sizes="(max-width: 599px) 90vw, (max-width: 1000px) 45vw, 23vw" className={styles.cover} /></div><h3>{item.title}</h3><p>{item.text}</p></article>)}
          </div>
          <div className={styles.experienceBottom}><div><p className={styles.eyebrow}>TIME TOGETHER, WELL SPENT</p><p>From a friendly match to a quiet evening, make room for the moments you came here to share.</p></div><a href="tel:+919677943053" className={styles.textLink}>Find your getaway <ArrowUpRight size={17} /></a></div>
        </div>
      </section>
      <section id="alagar-temple" className={`${styles.section} ${styles.temple}`} aria-labelledby="temple-heading">
        <div className={`${styles.container} ${styles.templeGrid}`}>
          <figure className={styles.templeFigure}><video className={styles.templeVideo} autoPlay muted loop playsInline preload="metadata" aria-label="A scenic view of Alagar Kovil temple"><source src="/alagar-temple-cropped.mp4" type="video/mp4" />Your browser does not support this video. <a href="/alagar-temple-cropped.mp4">Watch the Alagar Kovil video</a>.</video><figcaption>A closer look at Alagar Kovil.</figcaption></figure>
          <div className={styles.templeCopy}><p className={styles.eyebrow}>ALAGAR KOVIL / MADURAI</p><h2 id="temple-heading">A temple visit.<br /><em>A restful stay nearby.</em></h2><p>Looking for a resort near Alagar Temple in Madurai? Make MHOMES on Alagarkoil Road your base for a visit, with a comfortable room to return to and time to spend with your family.</p><p>Set by the Solaimalai hills, Alagar Kovil is dedicated to Lord Vishnu as Alagar. Its traditions are closely woven into Madurai&apos;s celebrated Chithirai festival.</p><div className={styles.templeRoute}><span>YOUR BASE</span><strong>Poigaikaraipatti, Alagarkoil Road</strong><p>Check the current route from MHOMES to the temple before setting out. Festival traffic can affect your journey.</p><a className={styles.textLink} href="https://www.google.com/maps/dir/?api=1&origin=MHOMES+Resort+Poigaikaraipatti+Madurai&destination=Alagar+Kovil+Temple+Madurai&travelmode=driving" target="_blank" rel="noopener noreferrer">View the temple route <ArrowUpRight size={17} /></a></div><div className={styles.templeLinks}><a href="#accommodations" className={styles.button}>Find your room <ArrowRight size={17} /></a><a href="https://madurai.nic.in/tourist-place/azhagar-kovil/" target="_blank" rel="noopener noreferrer" className={styles.textLink}>About Alagar Kovil <ArrowUpRight size={17} /></a></div></div>
        </div>
      </section>

      <section id="booking" className={styles.booking} aria-labelledby="booking-heading">
        <Image src="/entrance2.png" alt="An evening welcome at MHOMES Resort" fill sizes="100vw" className={styles.cover} />
        <div className={`${styles.container} ${styles.bookingInner}`}><p className={styles.eyebrow}>YOUR NEXT GETAWAY</p><h2 id="booking-heading">Let the everyday<br /><em>wait a little.</em></h2><p>A room of your own. Time with your people.<br />We look forward to welcoming you to MHOMES.</p><ProtectedBookingButton className={styles.lightButton}>Plan your stay <ArrowRight size={18} /></ProtectedBookingButton><a href="tel:+919677943053" className={styles.bookingPhone}>Or speak with us: +91 96779 43053</a></div>
      </section>

      <section id="reviews" className={`${styles.section} ${styles.reviews}`} aria-labelledby="reviews-heading">
        <div className={styles.container}>
          <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>GUEST REVIEWS</p><h2 id="reviews-heading">Stays worth remembering.</h2></div><a className={styles.textLink} href={googleReviewsUrl} target="_blank" rel="noopener noreferrer">View all reviews <ArrowUpRight size={18} /></a></div>
          {reviewsLoading ? <p role="status">Loading guest reviews...</p> : reviews.length ? <ReviewShowcase reviews={reviews} /> : <p>Guest reviews will appear here.</p>}
        </div>
      </section>

      <section id="contact" className={`${styles.section} ${styles.arrival}`} aria-labelledby="contact-heading">
        <div className={styles.container}>
          <div className={styles.arrivalHeading}><p className={styles.eyebrow}>FIND YOUR WAY TO MHOMES</p><h2 id="contact-heading">On Alagarkoil Road.<br /><em>Away from the everyday.</em></h2></div>
          <div className={styles.arrivalGrid}>
            <figure className={styles.arrivalPhoto}><Image src="/entrance2.png" alt="Illuminated MHOMES entrance to look for when arriving at the resort" fill sizes="(max-width: 799px) 90vw, 55vw" className={styles.cover} /><figcaption>YOUR ARRIVAL / MHOMES RESORT</figcaption></figure>
            <div className={styles.arrivalInfo}><p className={styles.eyebrow}>THE ADDRESS</p><address>62/7, Poigaikaraipatti<br />Alagarkoil Road, Madurai<br />Tamil Nadu - 625301</address><p>Visiting Alagar Kovil or joining us for a getaway? Open the route to our entrance and plan your journey.</p><a href="https://www.google.com/maps/search/?api=1&query=MHOMES+Resort+Poigaikaraipatti+Madurai" target="_blank" rel="noopener noreferrer" className={styles.button}>Open in Google Maps <ArrowUpRight size={18} /></a><div className={styles.arrivalContact}><p className={styles.eyebrow}>SPEAK WITH THE RESORT</p><a href="tel:+919677943053">+91 96779 43053 <ArrowUpRight size={16} /></a><a href="mailto:contact-us@mhomes.co.in">contact-us@mhomes.co.in <ArrowUpRight size={16} /></a></div></div>
          </div>
        </div>
      </section>

      <footer className={styles.footer}><div className={styles.container}>
        <div className={styles.footerTop}><div className={styles.footerBrand}><a href="#home" aria-label="MHOMES home">MHOMES<span>RESORT · MADURAI</span></a><p>A warm welcome.<br />A place to come back to.</p></div><div><p className={styles.eyebrow}>EXPLORE</p><nav aria-label="Footer navigation"><a href="#story">Our story</a><a href="#accommodations">Rooms & stays</a><a href="#gallery">Resort experiences</a><a href="#alagar-temple">Alagar Temple nearby</a><a href={googleReviewsUrl} target="_blank" rel="noopener noreferrer">Google reviews</a></nav></div><div><p className={styles.eyebrow}>PLAN YOUR VISIT</p><nav aria-label="Guest information"><Link href="/reservation">Reservations</Link><a href="#contact">Contact & directions</a><Link href="/terms-conditions">Terms & conditions</Link><Link href="/sitemap">Sitemap</Link></nav></div><div><p className={styles.eyebrow}>LET’S STAY IN TOUCH</p><a href="tel:+919677943053">+91 96779 43053</a><a href="mailto:contact-us@mhomes.co.in">contact-us@mhomes.co.in</a><p>62/7, Poigaikaraipatti<br />Alagarkoil Road, Madurai<br />Tamil Nadu - 625301</p></div></div>
        <div className={styles.footerBottom}><p>© {new Date().getFullYear()} MHOMES Resort. All rights reserved.</p><a href="#home">Back to top ↑</a></div>
      </div></footer>
    </div>
  )
}

