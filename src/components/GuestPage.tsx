import Link from 'next/link'
import Image from 'next/image'
import type { ReactNode } from 'react'
import styles from './GuestPages.module.css'
export function GuestPage({ label, title, intro, children }: { label: string; title: string; intro: string; children: ReactNode }) {
  return <div className={styles.page}><header className={styles.header}><Link href="/" aria-label="MHOMES home"><Image src="/MHOMES-logo.png" alt="MHOMES Resort" width={100} height={80} /></Link><nav aria-label="Page navigation"><Link href="/#accommodations">Our rooms</Link><Link href="/#contact">Find us</Link><Link href="/reservation" className={styles.button}>Reserve a stay</Link></nav></header><main className={styles.main}><div className={styles.heading}><p className={styles.eyebrow}>{label}</p><h1>{title}</h1><p>{intro}</p></div>{children}</main><footer className={styles.footer}><Link href="/">MHOMES <span>RESORT / MADURAI</span></Link><nav aria-label="Guest information"><Link href="/reviews">Guest reviews</Link><Link href="/terms-conditions">Terms & conditions</Link><Link href="/sitemap">Sitemap</Link><a href="tel:+919677943053">+91 96779 43053</a></nav></footer></div>
}
