/** One slide in the Find Parking carousel. Every slide points at a real spot. */
export interface PromoSlide {
  spotId: string;
  /** Short badge, e.g. "EV charging". */
  eyebrow: string;
  /** Headline, e.g. "Charge while you park". */
  title: string;
  /** The spot's own title. */
  subtitle: string;
  imageUrl: string;
  priceLabel?: string;
}