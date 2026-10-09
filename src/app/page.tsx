'use client'
import { hasLiveReviews } from '@/lib/review-access'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'

// Helper function to get today and tomorrow in local timezone (YYYY-MM-DD format)
const getTodayAndTomorrow = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Format using local date (not UTC) to avoid timezone shifts
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  const todayStr = `${year}-${month}-${day}`

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const tomorrowYear = tomorrow.getFullYear()
  const tomorrowMonth = String(tomorrow.getMonth() + 1).padStart(2, '0')
  const tomorrowDay = String(tomorrow.getDate()).padStart(2, '0')
  const tomorrowStr = `${tomorrowYear}-${tomorrowMonth}-${tomorrowDay}`

  return { today: todayStr, tomorrow: tomorrowStr }
}

import { motion, useReducedMotion, useMotionValue } from 'framer-motion'
import { HotelOpening } from '@/components/HotelOpening'
import { ResortContent } from '@/components/ResortContent'
import openingStyles from '@/components/HotelOpening.module.css'
import Image from 'next/image'
import { DayPicker, DateRange } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import Link from 'next/link'
import {
  Menu,
  X,
  Star,
  CalendarDays,
  ArrowRight,
  Building,
  Home as HomeIcon,
  BookOpen,
  ImageIcon,
  MessageSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProtectedBookingButton } from '@/components/ProtectedBookingButton'

// ═════════════════════════════════════════════════════════════════════════════
// DATE RANGE PICKER COMPONENT
// ═════════════════════════════════════════════════════════════════════════════

const rdpStyles = `
  .rdp-luxury {
    --rdp-accent-color: #967249;
    --rdp-background-color: #f0ebe2;
    margin: 0;
    padding: 12px;
  }
  .rdp-luxury .rdp-day_selected {
    background-color: #30271f !important;
    color: white !important;
    border-radius: 4px;
  }
  .rdp-luxury .rdp-day_range_middle {
    background-color: #f0ebe2 !important;
    color: #30271f !important;
    border-radius: 0 !important;
  }
  .rdp-luxury .rdp-day_range_start,
  .rdp-luxury .rdp-day_range_end {
    background-color: #30271f !important;
    color: white !important;
    border-radius: 4px !important;
  }
  .rdp-luxury .rdp-day:hover:not([disabled]) {
    background-color: #f0ebe2;
    border-radius: 4px;
  }
  .rdp-luxury .rdp-caption_label {
    font-family: 'Cormorant Garamond', serif;
    font-size: 15px;
    color: #30271f;
    font-weight: 400;
  }
  .rdp-luxury .rdp-nav_button:hover {
    background-color: #f0ebe2;
  }
  .rdp-luxury .rdp-head_cell {
    font-size: 11px;
    font-weight: 500;
    color: #999;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .rdp-luxury .rdp-day {
    font-size: 13px;
    border-radius: 4px;
    transition: background 0.15s;
  }
`

function formatDisplayDate(d: Date | undefined): string {
  if (!d) return ''
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, ' ')
}

function toISODate(d: Date | undefined): string {
  if (!d) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

interface HeroDatePickerProps {
  checkIn: string | null
  checkOut: string | null
  onChangeCheckIn: (v: string | null) => void
  onChangeCheckOut: (v: string | null) => void
  labelStyle?: React.CSSProperties
  inputStyle?: React.CSSProperties
}

function HeroDateRangePicker({
  checkIn,
  checkOut,
  onChangeCheckIn,
  onChangeCheckOut,
  labelStyle,
  inputStyle
}: HeroDatePickerProps) {
  const [open, setOpen] = useState(false)
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 })
  const [mounted, setMounted] = useState(false)
  const [selectingField, setSelectingField] = useState<'checkIn' | 'checkOut' | null>(null)
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const portalRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  const range: DateRange | undefined =
    checkIn || checkOut
      ? {
        from: checkIn ? new Date(checkIn + 'T00:00') : undefined,
        to: checkOut ? new Date(checkOut + 'T00:00') : undefined
      }
      : undefined

  const handleSelect = (selected: Date | DateRange | undefined) => {
    if (selectingField === 'checkIn' && selected instanceof Date) {
      onChangeCheckIn(toISODate(selected))
      setOpen(false)
    } else if (selectingField === 'checkOut' && selected instanceof Date) {
      onChangeCheckOut(toISODate(selected))
      setOpen(false)
    }
  }

  const updatePopoverPos = (element?: HTMLElement) => {
    const target = element || triggerRef.current
    if (!target) return
    const rect = target.getBoundingClientRect()
    const spacing = 8
    const minEdgeGap = 8
    const estimatedPopoverWidth = Math.min(338, window.innerWidth - 16)
    const estimatedPopoverHeight = 360

    let left = rect.left
    if (left + estimatedPopoverWidth > window.innerWidth - minEdgeGap) {
      left = window.innerWidth - estimatedPopoverWidth - minEdgeGap
    }
    left = Math.max(minEdgeGap, left)

    const canOpenBelow = rect.bottom + spacing + estimatedPopoverHeight <= window.innerHeight - minEdgeGap
    const top = canOpenBelow
      ? rect.bottom + spacing
      : Math.max(minEdgeGap, rect.top - estimatedPopoverHeight - spacing)

    setPopoverPos({ top, left })
  }

  const handleOpen = (element?: HTMLElement) => {
    updatePopoverPos(element)
    setOpen(v => !v)
  }

  const openForCheckIn = (e: React.MouseEvent<HTMLButtonElement>) => {
    setSelectingField('checkIn')
    setTriggerElement(e.currentTarget)
    handleOpen(e.currentTarget)
  }

  const openForCheckOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    setSelectingField('checkOut')
    setTriggerElement(e.currentTarget)
    handleOpen(e.currentTarget)
  }

  // Close on outside click (checks both trigger and portal)
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const t = e.target as Node
      if (
        triggerElement?.contains(t) ||
        portalRef.current?.contains(t)
      ) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, triggerElement])

  useEffect(() => {
    if (!open || !triggerElement) return
    const onViewportChange = () => updatePopoverPos(triggerElement)
    window.addEventListener('scroll', onViewportChange, { passive: true, capture: true })
    window.addEventListener('resize', onViewportChange)
    return () => {
      window.removeEventListener('scroll', onViewportChange, true)
      window.removeEventListener('resize', onViewportChange)
    }
  }, [open, triggerElement])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const defaultLabelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-label)',
    fontSize: '10px',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: '8px',
    fontWeight: 500
  }

  const defaultInputStyle: React.CSSProperties = {
    background: 'transparent',
    color: 'white',
    fontFamily: 'var(--font-body)',
    borderBottom: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 0
  }

  const popover = (
    <div
      ref={portalRef}
      style={{
        position: 'fixed',
        top: popoverPos.top,
        maxHeight: "calc(100dvh - 16px)",
        overflowY: "auto",
        left: popoverPos.left,
        zIndex: 99999,
        background: 'white',
        border: '1px solid #d9d1c5',
        borderRadius: '4px',
        boxShadow: '0 8px 32px rgba(107,63,42,0.12)',
      }}
    >
      <DayPicker
        mode="single"
        numberOfMonths={1}
        selected={
          selectingField === 'checkIn'
            ? (checkIn ? new Date(checkIn + 'T00:00') : undefined)
            : selectingField === 'checkOut'
            ? (checkOut ? new Date(checkOut + 'T00:00') : undefined)
            : undefined
        }
        onSelect={handleSelect}
        disabled={(date) => date < today}
        className="rdp-luxury"
      />
    </div>
  )

  return (
    <>
      <style>{rdpStyles}</style>
      <div ref={triggerRef} className="col-span-2 grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        {/* Check-in display */}
        <div className="flex flex-col">
          <label style={{ ...defaultLabelStyle, ...labelStyle }}>CHECK-IN</label>
          <button
            type="button"
            onClick={openForCheckIn}
            className="px-3 sm:px-4 py-2 sm:py-3 text-sm focus:outline-none transition-all text-left"
            style={{ ...defaultInputStyle, ...inputStyle, cursor: 'pointer', minWidth: 0 }}
          >
            {checkIn
              ? formatDisplayDate(new Date(checkIn + 'T00:00'))
              : <span style={{ color: 'rgba(255,255,255,0.45)' }}>Select date</span>}
          </button>
        </div>

        {/* Check-out display */}
        <div className="flex flex-col">
          <label style={{ ...defaultLabelStyle, ...labelStyle }}>CHECK-OUT</label>
          <button
            type="button"
            onClick={openForCheckOut}
            className="px-3 sm:px-4 py-2 sm:py-3 text-sm focus:outline-none transition-all text-left"
            style={{ ...defaultInputStyle, ...inputStyle, cursor: 'pointer', minWidth: 0 }}
          >
            {checkOut
              ? formatDisplayDate(new Date(checkOut + 'T00:00'))
              : <span style={{ color: 'rgba(255,255,255,0.45)' }}>Select date</span>}
          </button>
        </div>
      </div>
      {open && mounted && createPortal(popover, document.body)}
    </>
  )
}

// Custom select for the hero bar — matches date picker style
function HeroSelect({
  label, value, onChange, options
}: {
  label: string
  value: string | number
  onChange: (v: string) => void
  options: { value: string | number; label: string }[]
}) {
  const [open, setOpen] = useState(false)
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0, width: 0 })
  const [mounted, setMounted] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null)
  const portalRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  const handleOpen = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPopoverPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width
      })
    }
    setOpen(v => !v)
  }

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const t = e.target as Node
      if (triggerRef.current?.contains(t) || portalRef.current?.contains(t)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const selectedLabel = options.find(o => String(o.value) === String(value))?.label ?? String(value)

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-label)',
    fontSize: '10px',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: '8px',
    fontWeight: 500,
    display: 'block'
  }

  const portalContent = (
    <div
      ref={portalRef}
      style={{
        position: 'absolute',
        top: popoverPos.top,
        maxHeight: "calc(100dvh - 16px)",
        overflowY: "auto",
        left: popoverPos.left,
        minWidth: popoverPos.width,
        zIndex: 99999,
        background: 'white',
        border: '1px solid #d9d1c5',
        borderRadius: '4px',
        boxShadow: '0 8px 32px rgba(107,63,42,0.12)',
        overflow: 'hidden',
      }}
    >
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => { onChange(String(opt.value)); setOpen(false) }}
          className="w-full text-left px-4 py-2.5 text-sm transition-colors"
          style={{
            fontFamily: 'var(--font-body)',
            color: String(opt.value) === String(value) ? '#30271f' : '#30271f',
            background: String(opt.value) === String(value) ? '#f0ebe2' : 'white',
            fontWeight: String(opt.value) === String(value) ? 500 : 400,
            borderBottom: '1px solid #F0ECE4',
            cursor: 'pointer',
            display: 'block',
          }}
          onMouseEnter={e => { if (String(opt.value) !== String(value)) (e.currentTarget as HTMLElement).style.background = '#f0ebe2' }}
          onMouseLeave={e => { if (String(opt.value) !== String(value)) (e.currentTarget as HTMLElement).style.background = 'white' }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )

  return (
    <div className="flex flex-col" ref={triggerRef}>
      <label style={labelStyle}>{label}</label>
      <button
        type="button"
        onClick={handleOpen}
        className="px-3 sm:px-4 py-2 sm:py-3 text-sm text-left focus:outline-none transition-all"
        style={{
          background: 'transparent',
          color: 'white',
          fontFamily: 'var(--font-body)',
          borderBottom: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 0,
          cursor: 'pointer',
        }}
      >
        {selectedLabel}
      </button>
      {open && mounted && createPortal(portalContent, document.body)}
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// CONTACT FORM COMPONENT
// ═════════════════════════════════════════════════════════════════════════════

export default function Home() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [heroReady, setHeroReady] = useState(false)
  const [heroControlsReady, setHeroControlsReady] = useState(false)
  const [isOverHero, setIsOverHero] = useState(true)
  const [navigationRevealed, setNavigationRevealed] = useState(false)
  const reducedMotion = useReducedMotion()
  const handleHeroReady = useCallback(() => setHeroReady(true), [])
  const handleHeroControlsReady = useCallback(() => setHeroControlsReady(true), [])

  // Google reviews state
  const [topReviews, setTopReviews] = useState<Array<any>>([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [liveReviewsAvailable, setLiveReviewsAvailable] = useState(false)

  // Hero booking form state
  const { today: defaultToday, tomorrow: defaultTomorrow } = getTodayAndTomorrow()
  const [checkIn, setCheckIn] = useState<string | null>(defaultToday)
  const [checkOut, setCheckOut] = useState<string | null>(defaultTomorrow)
  const [roomType, setRoomType] = useState<'premium' | 'premium_plus'>('premium')
  const [roomCount, setRoomCount] = useState<number>(1)

  const handleHeroSearch = () => {
    if (!checkIn || !checkOut) {
      if (typeof window !== 'undefined') window.alert('Please select check-in and check-out dates')
      return
    }
    const params = new URLSearchParams({
      checkIn: checkIn || '',
      checkOut: checkOut || '',
      roomType: roomType,
      roomCount: roomCount.toString()
    })
    const reservationUrl = `/reservation?${params.toString()}`
    router.push(reservationUrl)
  }

  // Fetch Google reviews on mount
  useEffect(() => {
    const fetchGoogleReviews = async () => {
      try {
        setReviewsLoading(true)
        const response = await fetch('/api/reviews', { signal: AbortSignal.timeout(15000) })
        if (!response.ok) throw new Error('Reviews unavailable')
        const data = await response.json()
        setLiveReviewsAvailable(hasLiveReviews(data))

        // Get top 5 reviews sorted by rating (highest first) and then by date
        const top5 = (data.reviews || [])
          .sort((a: any, b: any) => {
            if (b.rating !== a.rating) {
              return b.rating - a.rating
            }
            return new Date(b.date).getTime() - new Date(a.date).getTime()
          })
          .slice(0, 5)

        setTopReviews(top5)
      } catch (error) {
        setLiveReviewsAvailable(false)
        console.error('Error fetching reviews:', error)
        // Use hardcoded testimonials as fallback
        setTopReviews(testimonials)
      } finally {
        setReviewsLoading(false)
      }
    }

    fetchGoogleReviews()
  }, [])



  const [activeSection, setActiveSection] = useState('home')
  const [shouldAnimateHome, setShouldAnimateHome] = useState(false)

  // Magnetic cursor effect
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  const navigationItems = [
    { name: 'Home', href: '#home', icon: HomeIcon },
    { name: 'Story', href: '#story', icon: BookOpen },
    { name: 'Accommodations', href: '#accommodations', icon: Building },
    { name: 'Experiences', href: '#gallery', icon: ImageIcon },
    { name: 'Booking', href: '#booking', icon: CalendarDays },
    { name: 'Reviews', href: '#reviews', icon: Star },
    { name: 'Contact', href: '#contact', icon: MessageSquare }
  ]

  const accommodationTypes = [
    {
      name: 'Premium Room',
      description: 'Sophisticated rooms with modern amenities and garden or pool views',
      image: "/premium.jpg",
      images: ["/premium1.png", "/premium2.png", "/premium3.png","/premium4.png","/premium5.png"],
      price: '₹5500/Night',
      bedType: 'King Bed',
      sqft: '30 sqm',
      maxGuests: '2',
      features: ['Pool View', 'King Bed', '30 sqm', 'Work Desk']
    },
    {
      name: 'Premium Plus Room',
      description: 'Comfortable studios perfect for couples seeking luxury and convenience',
      image: "/deluxe.jpg",
      images: ["/premium_plus1.png","/premium_plus2.png","/premium_plus3.png","/premium_plus4.png","/premium_plus5.png"],
      price: '₹6000/Night',
      bedType: 'King Bed',
      sqft: '30 sqm',
      maxGuests: '2',
      features: ['Garden View', 'King Bed', '30 sqm', 'Work Desk']
    }
  ]

  const roomAmenities = {
    'Premium Room': ['42-Inch Smart TV', 'In-Room Refreshment Kit', 'Air Conditioning', 'Work Desk', 'High-Speed WiFi', 'Premium Toiletries','Rainfall Shower', 'Daily Housekeeping'],
    'Premium Plus Room': ['42-Inch Smart TV','In-Room Refreshment Kit','Air Conditioning','Work Desk','High-Speed WiFi', 'Premium Toiletries','Rainfall Shower','Daily Housekeeping','Premium Bedding','BathTub']
  }

  const testimonials = [
  {
    name: 'Arjun Mehta',
    location: 'Mumbai, India',
    rating: 5,
    text: 'Stayed in the Premium Plus Room for our anniversary and it exceeded every expectation. The room was spotless, staff were incredibly warm, and the whole experience felt very personal. Highly recommend MHOMES to anyone looking for a peaceful luxury getaway.',
    image: '/api/placeholder/60/60'
  },
  {
    name: 'Priya Subramaniam',
    location: 'Chennai, India',
    rating: 5,
    text: 'We booked two Premium Rooms for a family trip and the entire process from online booking to check-out was seamless. The rooms were spacious, well-maintained, and the team made sure every need was taken care of. Will definitely be coming back!',
    image: '/api/placeholder/60/60'
  },
  {
    name: 'Karthik Rajan',
    location: 'Coimbatore, India',
    rating: 5,
    text: 'MHOMES Resort is a hidden gem. The ambience is serene, the rooms are beautifully maintained, and the staff go out of their way to make you feel at home. Checked in for a weekend trip and honestly did not want to leave.',
    image: '/api/placeholder/60/60'
  },
  {
    name: 'Sneha & Vikram Nair',
    location: 'Bangalore, India',
    rating: 5,
    text: 'Chose MHOMES for our honeymoon and it was the best decision we made. The Premium Plus Room was stunning, the privacy was great, and the staff were so thoughtful — they even surprised us with a small decoration in the room. Perfect in every way.',
    image: '/api/placeholder/60/60'
  },
  {
    name: 'Deepa Krishnamurthy',
    location: 'Madurai, India',
    rating: 5,
    text: 'Attended a small family gathering here and the experience was wonderful. Booking multiple rooms was easy, the property is well-kept, and the overall vibe is calm and luxurious. Great value for the quality you get. Strongly recommend MHOMES Resort.',
    image: '/api/placeholder/60/60'
  }
];


  const storyData = [
    {
      word: 'Madurai',
      description: 'The ancient City of Temples, where thousands of years of history echo through sacred streets. Madurai inspires us to build a resort that honors tradition while embracing modern luxury. Every corner reflects the vibrant culture and warm hospitality that defines this legendary city.',
      image: '/Madurai.png'
    },
    {
      word: 'Meenakshi',
      description: 'Goddess of divine beauty and strength, Meenakshi Amman embodies grace, power, and eternal elegance. Her legendary temple stands as a testament to architectural brilliance and spiritual majesty. We draw inspiration from her legend to create unforgettable moments of transcendence and wonder for our guests.',
      image: '/Meenakshi.png'
    },
    {
      word: 'Meen',
      description: 'The fish, symbol of life, movement, and the boundless ocean that surrounds our paradise resort. Meen represents freedom, harmony with nature, and the gentle flow of luxury that permeates every experience. Our waters teem with life, just as our resort teems with unforgettable experiences.',
      image: '/fish.png'
    },
    {
      word: 'Meena',
      description: 'The "M" also stands for Meena - the heart of our family, whose love is the foundation of our family. Built on her land and shaped by her love, made this more than a place - a home.',
      image: '/Meena_photo.jpeg'
    }
  ]


  useEffect(() => {
    const handleScroll = () => {
      setIsOverHero((document.getElementById('home')?.getBoundingClientRect().bottom ?? 0) > 100)
      const sections = ['home', 'story', 'accommodations', 'gallery', 'booking','reviews', 'contact']
      const scrollPosition = window.scrollY + 100

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const offsetTop = element.getBoundingClientRect().top + window.scrollY
          const offsetHeight = element.offsetHeight
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavigationClick = (href: string) => {
    if (href === '#home' && activeSection !== 'home') {
      setShouldAnimateHome(true)
      // Reset animation after a short delay
      setTimeout(() => setShouldAnimateHome(false), 100)
    }
    setIsMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 glass-effect border-b border-border ${openingStyles.navigation}`}
        data-home={isOverHero}
        style={{ zIndex: navigationRevealed ? 50 : 20 }}
        initial={{ y: 16, opacity: 0, visibility: 'hidden' }}
        animate={heroControlsReady ? { y: 0, opacity: 1, visibility: 'visible' } : { y: 16, opacity: 0, visibility: 'hidden' }}
        transition={{ duration: reducedMotion ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}
        onAnimationComplete={() => { if (heroControlsReady) setNavigationRevealed(true) }}
      >
        <div className="container mx-auto px-4 py-1">
          <div className="flex items-center justify-between">
            <div>
              <Link href="#home" className="flex items-center space-x-3">
                <div className="flex items-center justify-center -my-6 relative top-2">
                  <Image
                    src="/MHOMES-logo.png"
                    alt="MHOMES Resort Logo"
                    width={160}
                    height={160}
                    priority
                    style={{ width: 'auto' }}
                    className="object-contain drop-shadow-lg"
                  />
                </div>
              </Link>
            </div>

            <div className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => handleNavigationClick(item.href)}
                    className={`group relative px-3 py-1.5 transition-colors duration-200 ${activeSection === item.href.slice(1)
                      ? 'text-[#30271f]'
                      : 'text-[#30271f] hover:text-[#30271f]'
                      }`}
                    style={{ fontFamily: 'var(--font-label)', fontSize: '13px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}
                  >
                    <span className="inline-block">{item.name}</span>
                    <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-[#30271f] transition-transform duration-300 origin-left ${activeSection === item.href.slice(1)
                      ? 'scale-x-100'
                      : 'scale-x-0 group-hover:scale-x-100'
                      }`} />
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Book Now Button — desktop */}
            <motion.div
              className="hidden lg:flex items-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <ProtectedBookingButton 
                onClick={() => router.push("reservation")}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-1.5 shadow-md transition-colors duration-200 rounded-lg" 
                style={{ fontFamily: 'var(--font-label)', fontSize: '12px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' as const }}
              >
                Book Now
              </ProtectedBookingButton>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="lg:hidden"
            >
              <Button
                variant="outline"
                size="sm"
                aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-navigation"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="border-primary/30 hover:border-primary/50 rounded-lg"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            id="mobile-navigation"
            className="lg:hidden glass-effect border-t border-border max-h-[calc(100dvh-88px)] overflow-y-auto"
          >
            <div className="container mx-auto px-4 py-4 space-y-3">
              {navigationItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => handleNavigationClick(item.href)}
                    className="block luxury-text hover:text-primary transition-colors font-semibold py-2 px-3 rounded-lg hover:bg-primary/5"
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
              {/* Mobile Book Now button */}
              <div className="border-t border-primary/10 pt-3">
                <Link href="#booking" onClick={() => setIsMenuOpen(false)} className="w-full">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors duration-200">
                    Book Now
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </motion.nav>

      <HotelOpening ready={heroReady} onReady={handleHeroReady} onControlsReady={handleHeroControlsReady}>
              <div
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  borderRadius: '4px',
                  padding: '20px 28px'
                }}
              >
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6 items-end">
                  {/* Check-in / Check-out — unified date range picker */}
                  <HeroDateRangePicker
                    checkIn={checkIn}
                    checkOut={checkOut}
                    onChangeCheckIn={setCheckIn}
                    onChangeCheckOut={setCheckOut}
                  />

                  {/* Room Type */}
                  <HeroSelect
                    label="ROOM TYPE"
                    value={roomType}
                    onChange={(v) => setRoomType(v as 'premium' | 'premium_plus')}
                    options={[
                      { value: 'premium', label: 'Premium' },
                      { value: 'premium_plus', label: 'Premium Plus' },
                    ]}
                  />

                  {/* Room Count */}
                  <HeroSelect
                    label="ROOMS"
                    value={roomCount}
                    onChange={(v) => setRoomCount(Number(v))}
                    options={[
                      { value: 1, label: '1 Room' },
                      { value: 2, label: '2 Rooms' },
                      { value: 3, label: '3 Rooms' },
                      { value: 4, label: '4 Rooms' },
                      { value: 5, label: '5 Rooms' },
                      { value: 6, label: '6 Rooms' },
                    ]}
                  />

                  {/* Search Button */}
                  <div className="col-span-2 sm:col-span-4 lg:col-span-1">
                    <button
                      className="w-full transition-all hover:opacity-90"
                      style={{
                        background: '#30271f',
                        color: 'white',
                        fontFamily: 'var(--font-label)',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        fontSize: '13px',
                        borderRadius: '2px',
                        padding: '14px 32px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 500
                      }}
                      onClick={() => handleHeroSearch()}
                    >
                      Search
                    </button>
                  </div>
                </div>
              </div>
      </HotelOpening>

      <ResortContent
        rooms={accommodationTypes}
        roomAmenities={roomAmenities}
        reviews={topReviews}
        reviewsLoading={reviewsLoading}
        liveReviewsAvailable={liveReviewsAvailable}
        story={
      <section id="story" className="py-20 bg-gradient-to-b from-muted/30 via-background to-muted/50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -ml-48 -mb-48" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            viewport={{ once: true, amount: 0.08 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto mb-20"
          >
            <h2 className="luxury-heading mb-6" style={{ fontSize: 'clamp(32px, 4vw, 56px)', fontWeight: 400, letterSpacing: '-0.02em', color: '#30271f' }}>
              What does the M stand for?
            </h2>
            <p className="luxury-text text-muted-foreground" style={{ fontWeight: 300, fontSize: '16px', color: '#71665c', lineHeight: 1.8, maxWidth: '600px', margin: '0 auto' }}>
              Discover the profound meaning behind MHOMES — a fusion of culture, mythology, nature, and visionary dreams.
            </p>
          </motion.div>

          <div className="space-y-20">
            {storyData.map((story, index) => (
              <motion.div
                key={story.word}
                initial={{ opacity: 0, y: 30 }}
                viewport={{ once: true, amount: 0.08 }}
            whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'md:grid-flow-dense' : ''
                  }`}
              >
                {/* Image with enhanced effects */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  viewport={{ once: true, amount: 0.08 }}
            whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className={`relative h-96 rounded-3xl overflow-hidden shadow-2xl group ${index % 2 === 1 ? 'md:col-start-2 md:row-start-1' : ''
                    }`}
                >
                  <Image
                    src={story.image}
                    alt={story.word}
                    fill
                    sizes="(min-width: 768px) 45vw, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                  <div className={openingStyles.storyNumber}>{String(index + 1).padStart(2, '0')}<span>/ 04</span></div>
                </motion.div>

                {/* Content with enhanced typography */}
                <motion.div
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  viewport={{ once: true, amount: 0.08 }}
            whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className={index % 2 === 1 ? 'md:col-start-1 md:row-start-1' : ''}
                >
                  <h3
                    className="luxury-heading mb-6"
                    style={{ fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 500, color: '#30271f', letterSpacing: '-0.02em' }}
                  >
                    <em style={{ fontStyle: 'italic', color: '#967249', marginRight: '0.05em', fontWeight: 600 }}>
                      {story.word.charAt(0)}
                    </em>
                    {story.word.slice(1)}
                  </h3>
                  <p className="luxury-text mb-8" style={{ fontWeight: 300, color: '#71665c', fontSize: '16px', lineHeight: 1.8 }}>
                    {story.description}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="h-0.5 w-12 bg-[#967249]" />
                    <span style={{ fontFamily: 'var(--font-label)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#967249' }}>A pillar of MHOMES</span>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            viewport={{ once: true, amount: 0.08 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mt-20 max-w-3xl mx-auto"
          >
            <p className="luxury-text" style={{ fontWeight: 300, color: '#71665c', fontSize: '16px', lineHeight: 1.8, maxWidth: '600px', margin: '0 auto' }}>
              These four pillars weave together the soul of <span style={{ color: '#967249', fontWeight: 500 }}>MHOMES Resort</span> —
              where ancient cultural heritage meets contemporary luxury, where nature flows freely, and where dreams transform into unforgettable realities.
            </p>
          </motion.div>
        </div>
      </section>
        }

      />
    </div>
  )
}
