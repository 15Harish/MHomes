import { GuestPage } from '@/components/GuestPage'
import styles from '@/components/GuestPages.module.css'
const policySections = [
  {
    id: "booking",
    title: "Booking and Reservation Terms",
    points: [
      "All bookings are subject to room availability and final confirmation by MHOMES Resort.",
      "A reservation is considered confirmed only after successful payment or approved guarantee, based on the selected rate plan.",
      "Room category, inclusions, and occupancy limits are shown at checkout and in your confirmation details.",
      "Special requests (such as early check-in, late check-out, bed type, view preference, or nearby rooms) are non-binding and depend on availability at arrival.",
    ],
  },
  {
    id: "cancellation",
    title: "Cancellation, Modification, and No-Show",
    points: [
      "Cancellation and amendment charges depend on the specific rate and offer selected during booking.",
      "If you do not check in on the scheduled arrival date without prior cancellation, no-show charges may apply as per your booking terms.",
      "Refunds, where applicable, are processed to the original mode of payment and may take standard banking time.",
      "For third-party reservations, cancellation and refund timelines are governed by the platform used to book.",
    ],
  },
  {
    id: "checkin",
    title: "Check-In, Check-Out, and Stay Requirements",
    points: [
      "Guests must present a valid government-issued photo ID at check-in.",
      "Check-in and check-out times are communicated at booking and may vary by package or season.",
      "Additional guests, including children above the permitted threshold, may attract extra charges according to occupancy policy.",
      "Management may deny check-in or request departure in case of policy violations, unsafe conduct, or unlawful activity.",
    ],
  },
  {
    id: "payment",
    title: "Payments, Deposits, and Billing",
    points: [
      "Accepted payment methods include those displayed during checkout or at the front desk.",
      "An incidental deposit may be requested at check-in for extras such as dining, services, or damages.",
      "Any outstanding amount must be settled before check-out.",
      "In case of billing disputes, guests should notify the resort promptly to allow verification and resolution.",
    ],
  },
  {
    id: "conduct",
    title: "Guest Conduct and Property Use",
    points: [
      "Guests are expected to maintain respectful behavior toward other guests, staff, and resort property.",
      "Any damage, loss, or excessive cleaning requirement caused by guests may be charged to the registered booking.",
      "Use of facilities such as pool, activity zones, and outdoor areas must follow posted safety instructions.",
      "Activities that disturb other guests, threaten safety, or violate applicable law are strictly prohibited.",
    ],
  },
];

export default function TermsAndConditionsPage() {
 return <GuestPage label="GUEST INFORMATION / EFFECTIVE APRIL 25, 2026" title="Terms & conditions" intro="Please read these terms before making a reservation. For questions about your stay, contact our team."><div className={styles.policyLayout}><nav className={styles.policyNav} aria-label="Policy sections">{policySections.map((section,index)=><a href={`#${section.id}`} key={section.id}>{String(index+1).padStart(2,'0')} / {section.title}</a>)}</nav><div>{policySections.map(section=><section id={section.id} key={section.id} className={styles.policy}><h2>{section.title}</h2><ul>{section.points.map(point=><li key={point}>{point}</li>)}</ul></section>)}</div></div></GuestPage>
}
