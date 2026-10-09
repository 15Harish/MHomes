import { GuestPage } from '@/components/GuestPage'
import styles from '@/components/GuestPages.module.css'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
export const metadata = { title: 'Sitemap | MHOMES Resort', description: 'Explore MHOMES rooms, experiences, guest reviews and visitor information.' }
export default function SitemapPage() { return <GuestPage label="EXPLORE MHOMES" title="Find your way around." intro="Rooms, resort experiences and the details for your visit, all in one place."><div className={styles.directory}>{[{title:'Discover the resort',links:[['Welcome','/#home'],['Our story','/#story'],['Rooms & stays','/#accommodations'],['Resort experiences','/#gallery'],['Alagar Temple nearby','/#alagar-temple']]},{title:'Plan your visit',links:[['Reservations','/reservation'],['Guest reviews','/reviews'],['Contact & directions','/#contact'],['Terms & conditions','/terms-conditions']]}].map(group=><section key={group.title}><h2>{group.title}</h2>{group.links.map(([label,href])=><Link key={href} href={href}>{label}<ArrowUpRight size={18}/></Link>)}</section>)}</div></GuestPage> }
