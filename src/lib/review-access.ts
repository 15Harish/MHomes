/** Only live Google responses should open the full guestbook. */
export function hasLiveReviews(data: { source?: string; reviews?: { source?: string }[] } | null | undefined): boolean {
 return data?.source === 'google' && Array.isArray(data.reviews) && data.reviews.length > 0 && !data.reviews.some(review => review.source === 'fallback')
}
