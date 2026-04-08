export interface Restaurant {
  name: string;
  category: string;
  lunchBudget: string;
  dinnerBudget: string;
  rating: number;
  googleRating?: number;
  reviewsSummary?: string;
  waitTime?: string;
  reservationRequired?: string;
  walkInFriendly?: string;
  signatureDishes?: string;
  status: 'idle' | 'loading' | 'success' | 'error';
}
