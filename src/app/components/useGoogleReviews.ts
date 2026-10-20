import { useMemo } from 'react';
import { useSiteDocument } from '../../content/use-site-document';
export interface GoogleReview { author: string; rating: number; text: string; textEn: string }
export interface GoogleReviewsData { reviews: GoogleReview[]; averageRating: number; totalReviews: number; fetchedAt: string; source: string }
export function useGoogleReviews(filterMinRating = 4, topic?: string) {
  const stories = useSiteDocument().stories;
  const allReviews = useMemo<GoogleReview[]>(() => stories.filter(story => story.content.component === 'review' && story.content.public_visible !== false && (!topic || story.content.topic === topic)).sort((a, b) => (Number(a.content.sort_order) || 0) - (Number(b.content.sort_order) || 0)).map(story => ({ author: story.content.author || story.name, rating: Math.min(5, Math.max(1, Number(story.content.rating) || 5)), text: story.content.text || '', textEn: story.content.text_en || story.content.text || '' })), [stories, topic]);
  return { reviews: allReviews.filter(review => review.rating >= filterMinRating), allReviews, averageRating: allReviews.length ? allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length : 0, totalReviews: allReviews.length, source: 'website', loading: false, error: null };
}
