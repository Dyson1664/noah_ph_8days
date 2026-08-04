import { DayLayout } from "@/components/DayLayout";
import Navbar from "@/components/Navbar";
import { Home, Zap, Plane, Users, UtensilsCrossed, TreePine, MapPin, Star, X, Calendar, Clock } from "lucide-react";
import { CategoryTags, CategoryTag } from "@/components/CategoryTags";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { memo, useMemo, useCallback, useState, useRef, useEffect } from "react";
import { STATIC_STYLES, STATIC_TEXT } from "@/data/itinerary-static";
import Footer from "@/components/common/Footer";
import { DayItinerary } from "@/data/types";
import ResponsiveRoute from "@/components/RouteBar"; // <-- route component
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Book Now Button Component (routes to Shopify payment or internal booking page)
import { getPayUrlBySlug } from "@/data/payUrls";

const getBookingUrlBySlug = (slug?: string) => (slug ? `/#/booking/${slug}` : "#");

const BookNowButton = memo(({ tripSlug }: { tripSlug?: string }) => {
  const bookingUrl = getBookingUrlBySlug(tripSlug);

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <a href={bookingUrl} className="inline-block">
        <Button
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold"
          disabled={!tripSlug}
        >
          Book Now
        </Button>
      </a>
      <p className="text-xs text-muted-foreground">
        Deposit is non-refundable.
      </p>
    </div>
  );
});



interface WhatsIncludedHighlight {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  link?: {
    text: string;
    url: string;
  };
}

interface IncludedItem {
  text: string;
}

interface IncludedSection {
  title: string;
  items: IncludedItem[];
}

interface PaymentPlan {
  title: string;
  price: string;
  featured?: boolean;
  note?: string;
  payments: Array<{
    label: string;
    amount: string;
  }>;
}

interface FAQ {
  question: string;
  answer: string;
}

interface TripHighlight {
  title: string;
  description?: string;
  image?: string;
  video?: string;
  videoAspectRatio?: string;
  videoObjectPosition?: string;
}

interface AccommodationHighlight {
  title: string;
  description?: string;
  image?: string;
  images?: string[]; // Multiple images per hotel
  video?: string;
}

interface CountryData {
  id: string;
  slug?: string;
  title: string;
  subtitle: string;
  location: string;
  duration: string;
  heroImage: string;
  desktopHeroVideo?: string;
  desktopHeroPosterImage?: string;
  price?: string;
  priceOriginal?: string;
  priceNote?: string;
  ctaLabel?: string;
  soldOut?: boolean;
  startDate?: string;
  overviewGallery?: string[];
  overviewGallery2x?: (string | null)[]; // <-- new optional gallery for hero left grid
  route?: string[];
  tags?: CategoryTag[];
  aboutDescription: string[];
  aboutImages: string[];
  whatsIncludedHighlights?: WhatsIncludedHighlight[];
  highlights?: TripHighlight[];
  accommodations?: AccommodationHighlight[];
  itinerary: DayItinerary[];
  summary: {
    duration: string;
    activities: string;
    areas: string;
    type: string;
  };
  included: IncludedSection[];
  paymentPlanDescription?: string;
  paymentPlans?: PaymentPlan[];
  faqs: FAQ[];
  review?: {
    testimonialText: string;
    author: string;
    images: string[];
    disableReadMore?: boolean;
  };
}

interface ItineraryTemplateProps {
  data: CountryData;
  logoStyle?: React.CSSProperties;
  FooterComponent?: React.ComponentType;
  desktopHero?: React.ReactNode;
  hideDesktopHero?: boolean;
}

// Review Section Component
const ReviewSection = memo(
  ({
    review,
  }: {
    review?: { testimonialText: string; author: string; images: string[]; disableReadMore?: boolean };
  }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!review) return null;

    return (
      <>
        <div
          className="bg-white md:bg-background
                      w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]
                      md:w-auto md:left-auto md:right-auto md:ml-0 md:mr-0
                      py-8 px-6 mb-8
                      md:py-12 md:px-8 md:rounded-2xl md:mb-12 md:my-0
                      md:h-1/2 md:p-4 md:pt-20 lg:pt-24 md:pb-6 md:px-6 lg:px-8 md:flex md:flex-col md:justify-center md:rounded-br-2xl md:mb-0"
        >
          <div className="max-w-2xl mx-auto w-full">
            {/* 5 Stars with 5/5 rating */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                ))}
              </div>
              <span className="text-sm font-semibold text-foreground">5/5</span>
            </div>

            {/* Quote text */}
            <blockquote className="text-sm md:text-base text-foreground/90 mb-3 leading-relaxed">
              "{review.testimonialText}"
            </blockquote>

            {/* Author and Read More Link */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">- {review.author}</p>
              {!review.disableReadMore && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-[#506345] hover:underline text-sm font-medium inline-flex items-center gap-1"
                >
                  Read more here
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Review Modal with Image Carousel */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-4xl bg-background p-8 rounded-lg">
            <Carousel className="w-full relative">
              <CarouselContent>
                {review.images.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="flex items-center justify-center">
                      <img
                        src={image}
                        alt={`Review ${index + 1}`}
                        className="w-full h-auto object-contain rounded-lg"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {/* Desktop arrows - positioned outside the dialog content */}
              <CarouselPrevious className="hidden md:flex -left-16 lg:-left-20" />
              <CarouselNext className="hidden md:flex -right-16 lg:-right-20" />
              {/* Mobile swipe indicator */}
              <div className="md:hidden flex justify-center items-center gap-2 mt-4 text-muted-foreground text-sm">
                <span>Swipe for more</span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.5 5L12.5 10L7.5 15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </Carousel>
          </DialogContent>
        </Dialog>
      </>
    );
  },
);

// TripHighlights with working carousel + video reset
const TripHighlights = memo(({ data }: { data: CountryData }) => {
  const [activeVideo, setActiveVideo] = useState<number | null>(null);
  const desktopVideoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const mobileVideoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const mobileScrollRef = useRef<HTMLDivElement | null>(null);
  const [mobileHighlightIndex, setMobileHighlightIndex] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);

  // Reset all videos (desktop + mobile) so posters/cover images show again
  const resetAllVideos = useCallback(() => {
    desktopVideoRefs.current.forEach((v) => {
      if (v) {
        v.pause();
        v.currentTime = 0;
        v.load();
      }
    });

    mobileVideoRefs.current.forEach((v) => {
      if (v) {
        v.pause();
        v.currentTime = 0;
        v.load();
      }
    });

    setActiveVideo(null);
  }, []);

  // Default highlights if not provided
  const defaultHighlights: TripHighlight[] = [
    {
      title: "Cultural Immersion",
      description:
        "Experience authentic local traditions, festivals, and customs that bring this destination to life.",
      image: data.aboutImages[0] || data.heroImage,
    },
    {
      title: "Iconic Landmarks",
      description: "Visit world-famous monuments and architectural marvels that define this incredible destination.",
      image: data.aboutImages[1] || data.heroImage,
    },
    {
      title: "Local Cuisine",
      description: "Savor authentic regional dishes and discover the flavors that make this cuisine unique.",
      image: data.heroImage,
    },
  ];

  const highlights =
    data.highlights && data.highlights.length > 0 ? data.highlights : defaultHighlights;

    // Whenever the carousel slide changes (desktop), reset videos
  useEffect(() => {
    if (!carouselApi) return;

    const onSelect = () => {
      resetAllVideos();
    };

    carouselApi.on("select", onSelect);

    // If your CarouselApi supports off():
    // return () => {
    //   carouselApi.off("select", onSelect);
    // };
  }, [carouselApi, resetAllVideos]);

  const handleMobileHighlightScroll = useCallback(() => {
    const scroller = mobileScrollRef.current;
    if (!scroller) return;

    const maxScroll = scroller.scrollWidth - scroller.clientWidth;
    const nextIndex = maxScroll > 0
      ? Math.round((scroller.scrollLeft / maxScroll) * (highlights.length - 1))
      : 0;

    setMobileHighlightIndex(Math.max(0, Math.min(highlights.length - 1, nextIndex)));
  }, [highlights.length]);

  const handlePlay = (index: number, mode: "desktop" | "mobile") => {
    const refs = mode === "desktop" ? desktopVideoRefs.current : mobileVideoRefs.current;

    // Reset all *other* videos so they go back to their cover photos
    refs.forEach((v, i) => {
      if (v && i !== index) {
        v.pause();
        v.currentTime = 0;
        v.load();
      }
    });

    const video = refs[index];
    if (video) {
      video.currentTime = 0;
      video.play();
      setActiveVideo(index);
    }
  };

return (
    <div>
      {/* Mobile: Just title */}
      <h3 className="md:hidden text-xl font-semibold text-foreground mb-2">Trip Highlights</h3>
      {highlights.length > 1 && (
        <div className="mb-4 flex justify-center gap-2 md:hidden" aria-label="Trip highlights slides">
          {highlights.map((highlight, index) => (
            <button
              key={highlight.title}
              type="button"
              aria-label={`Show ${highlight.title}`}
              aria-current={mobileHighlightIndex === index ? "true" : undefined}
              className="h-2 rounded-full transition-all"
              style={{
                width: mobileHighlightIndex === index ? "1.5rem" : "0.5rem",
                backgroundColor: mobileHighlightIndex === index ? "#0FC2BF" : "rgba(100, 116, 139, 0.45)",
              }}
              onClick={() => {
                const scroller = mobileScrollRef.current;
                if (!scroller) return;
                const maxScroll = scroller.scrollWidth - scroller.clientWidth;
                const targetLeft = highlights.length > 1 ? (maxScroll / (highlights.length - 1)) * index : 0;
                scroller.scrollTo({ left: targetLeft, behavior: "smooth" });
                setMobileHighlightIndex(index);
              }}
            />
          ))}
        </div>
      )}

      <div className="relative">
        {/* Desktop: Carousel with external arrows */}
        <Carousel
          className="hidden md:block w-full max-w-none md:max-w-md lg:max-w-lg mx-auto"
          setApi={setCarouselApi} // hook into carousel API
        >
          {/* Desktop: Title with arrows in same row */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-foreground">Trip Highlights</h3>
            <div className="flex gap-2">
              <CarouselPrevious className="relative inset-auto translate-x-0 translate-y-0" />
              <CarouselNext className="relative inset-auto translate-x-0 translate-y-0" />
            </div>
          </div>

          <CarouselContent>
            {highlights.map((highlight, index) => {
              const isPlaying = activeVideo === index;

              return (
                <CarouselItem key={index}>
                  <div className="space-y-3">
                    {/* VIDEO (DESKTOP) */}
                    {highlight.video ? (
                      <div
                        className="relative w-full max-w-md mx-auto rounded-2xl shadow-md overflow-hidden bg-black"
                        style={{ aspectRatio: highlight.videoAspectRatio || "5 / 8" }}
                      >
                        <video
                          ref={(el) => (desktopVideoRefs.current[index] = el)}
                          src={highlight.video}
                          preload="auto"
                          className="w-full h-full object-cover"
                          style={{ objectPosition: highlight.videoObjectPosition }}
                          controls={isPlaying}
                          playsInline
                        />

                        {/* PLAY BUTTON */}
                        {!isPlaying && (
                          <button
                            onClick={() => handlePlay(index, "desktop")}
                            className="absolute inset-0 flex items-center justify-center z-20"
                          >
                            <div className="bg-white/90 p-4 rounded-full shadow-lg">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="32"
                                height="32"
                                fill="black"
                                viewBox="0 0 24 24"
                              >
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </button>
                        )}
                      </div>
                    ) : (
                      <img
                        src={highlight.image}
                        alt={highlight.title}
                        className="w-full h-56 md:h-64 lg:h-72 object-cover rounded-2xl shadow-md"
                        loading="lazy"
                      />
                    )}

                    {/* TEXT BELOW */}
                    <div className="text-center space-y-2">
                      <h4 className="font-semibold text-foreground">{highlight.title}</h4>
                      <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                        {highlight.description}
                      </p>
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>

        {/* Mobile: Swipeable container with peek */}
        <div
          ref={mobileScrollRef}
          onScroll={handleMobileHighlightScroll}
          className="md:hidden overflow-x-auto overflow-y-hidden scrollbar-none scroll-smooth snap-x snap-mandatory"
        >
          <div className="flex pb-2">
            {highlights.map((highlight, index) => {
              const isPlaying = activeVideo === index;

              return (
                <div
                  key={index}
                  className="flex-shrink-0 snap-start snap-always"
                  style={{ width: "calc(100vw - 3rem)", paddingRight: "0.75rem" }}
                >
                  <div className="space-y-3 w-full max-w-80 mx-auto">
                    {/* VIDEO (MOBILE) */}
                    {highlight.video ? (
                      <div
                        className="relative w-full rounded-2xl overflow-hidden shadow-md bg-black"
                        style={{ aspectRatio: highlight.videoAspectRatio || "5 / 8" }}
                      >
                        <video
                          ref={(el) => (mobileVideoRefs.current[index] = el)}
                          src={highlight.video}
                          poster={highlight.image}
                          preload="metadata"
                          className="w-full h-full object-cover"
                          style={{ objectPosition: highlight.videoObjectPosition }}
                          controls={isPlaying}
                          playsInline
                        />

                        {/* PLAY BUTTON */}
                        {!isPlaying && (
                          <button
                            onClick={() => handlePlay(index, "mobile")}
                            className="absolute inset-0 flex items-center justify-center z-20"
                          >
                            <div className="bg-white/90 p-4 rounded-full shadow-lg">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="32"
                                height="32"
                                fill="black"
                                viewBox="0 0 24 24"
                              >
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </button>
                        )}
                      </div>
                    ) : (
                      <img
                        src={highlight.image}
                        alt={highlight.title}
                        className="w-full h-56 object-cover rounded-2xl shadow-md"
                        loading="lazy"
                      />
                    )}

                    {/* TEXT BELOW */}
                    <div className="text-center space-y-2">
                      <h4 className="font-semibold text-foreground">{highlight.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {highlight.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {highlights.length > 1 && (
          <div className="mt-3 flex justify-center gap-2 md:hidden" aria-label="Trip highlights slides">
            {highlights.map((highlight, index) => (
              <button
                key={highlight.title}
                type="button"
                aria-label={`Show ${highlight.title}`}
                aria-current={mobileHighlightIndex === index ? "true" : undefined}
                className={`h-2 rounded-full transition-all ${
                  mobileHighlightIndex === index ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30"
                }`}
                onClick={() => {
                  const scroller = mobileScrollRef.current;
                  if (!scroller) return;
                  const maxScroll = scroller.scrollWidth - scroller.clientWidth;
                  const targetLeft = highlights.length > 1 ? (maxScroll / (highlights.length - 1)) * index : 0;
                  scroller.scrollTo({ left: targetLeft, behavior: "smooth" });
                  setMobileHighlightIndex(index);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

// Hotel Image Gallery Component - inner carousel for multiple images
const HotelImageGallery = memo(({ accommodation, className }: { accommodation: AccommodationHighlight; className?: string }) => {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const allImages = useMemo(() => {
    const imgs: string[] = [];
    if (accommodation.images && accommodation.images.length > 0) {
      imgs.push(...accommodation.images);
    } else if (accommodation.image) {
      imgs.push(accommodation.image);
    }
    return imgs;
  }, [accommodation.images, accommodation.image]);

  // Update current index when carousel changes
  useEffect(() => {
    if (!api) return;
    
    const onSelect = () => {
      setCurrentIndex(api.selectedScrollSnap());
    };
    
    api.on("select", onSelect);
    onSelect(); // Set initial state
  }, [api]);

  // Single image - no carousel needed
  if (allImages.length <= 1) {
    return (
      <img
        src={allImages[0] || accommodation.image}
        alt={accommodation.title}
        className={className || "w-full h-56 md:h-64 lg:h-72 object-cover rounded-2xl shadow-md"}
        loading="lazy"
      />
    );
  }

  // Multiple images - use inner carousel with arrows
  // On mobile, show dots for navigation; swipe naturally moves between images
  return (
    <div className="relative group">
      <Carousel 
        className="w-full" 
        setApi={setApi}
      >
        <CarouselContent>
          {allImages.map((img, idx) => (
            <CarouselItem key={idx}>
              <img
                src={img}
                alt={`${accommodation.title} - ${idx + 1}`}
                className={className || "w-full h-56 md:h-64 lg:h-72 object-cover rounded-2xl shadow-md"}
                loading="lazy"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Desktop arrows - sleek pill design, appear on hover */}
        <button
          onClick={() => api?.scrollPrev()}
          className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 
                     opacity-0 group-hover:opacity-100 
                     transition-all duration-300 ease-out
                     bg-white/95 backdrop-blur-sm hover:bg-white 
                     hover:scale-110 active:scale-95
                     shadow-lg hover:shadow-xl
                     h-8 w-8 rounded-full
                     items-center justify-center
                     border border-black/5"
          aria-label="Previous image"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="text-foreground/80"
          >
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <button
          onClick={() => api?.scrollNext()}
          className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 
                     opacity-0 group-hover:opacity-100 
                     transition-all duration-300 ease-out
                     bg-white/95 backdrop-blur-sm hover:bg-white 
                     hover:scale-110 active:scale-95
                     shadow-lg hover:shadow-xl
                     h-8 w-8 rounded-full
                     items-center justify-center
                     border border-black/5"
          aria-label="Next image"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="text-foreground/80"
          >
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </button>
      </Carousel>
      
      {/* Dots indicator - shows current position */}
      <div className="flex justify-center gap-2 mt-3">
        {allImages.map((_, idx) => (
          <button
            key={idx}
            onClick={() => api?.scrollTo(idx)}
            className={`transition-all duration-300 rounded-full ${
              idx === currentIndex 
                ? "bg-primary w-4 h-1.5" 
                : "bg-primary/25 hover:bg-primary/40 w-1.5 h-1.5"
            }`}
            aria-label={`Go to image ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
});

// WhereWeStay Component - Same layout as TripHighlights
const WhereWeStay = memo(({ data }: { data: CountryData }) => {
  const [activeVideo, setActiveVideo] = useState<number | null>(null);
  const desktopVideoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const mobileVideoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);

  // Reset all videos (desktop + mobile) so posters/cover images show again
  const resetAllVideos = useCallback(() => {
    desktopVideoRefs.current.forEach((v) => {
      if (v) {
        v.pause();
        v.currentTime = 0;
        v.load();
      }
    });

    mobileVideoRefs.current.forEach((v) => {
      if (v) {
        v.pause();
        v.currentTime = 0;
        v.load();
      }
    });

    setActiveVideo(null);
  }, []);

  // Whenever the carousel slide changes (desktop), reset videos
  useEffect(() => {
    if (!carouselApi) return;

    const onSelect = () => {
      resetAllVideos();
    };

    carouselApi.on("select", onSelect);
  }, [carouselApi, resetAllVideos]);

  const handlePlay = (index: number, mode: "desktop" | "mobile") => {
    const refs = mode === "desktop" ? desktopVideoRefs.current : mobileVideoRefs.current;

    // Reset all *other* videos so they go back to their cover photos
    refs.forEach((v, i) => {
      if (v && i !== index) {
        v.pause();
        v.currentTime = 0;
        v.load();
      }
    });

    const video = refs[index];
    if (video) {
      video.currentTime = 0;
      video.play();
      setActiveVideo(index);
    }
  };

  // Auto-generate accommodations from itinerary if not explicitly provided
  const accommodations = useMemo(() => {
    if (data.accommodations && data.accommodations.length > 0) {
      return data.accommodations;
    }

    // Otherwise, extract unique accommodations from itinerary days
    const seen = new Set<string>();
    const extracted: AccommodationHighlight[] = [];

    for (const day of data.itinerary) {
      if (day.accommodation?.name && !seen.has(day.accommodation.name)) {
        // Skip "Check-out" or similar non-accommodation entries
        if (day.accommodation.name.toLowerCase().includes("check-out")) continue;
        
        seen.add(day.accommodation.name);
        extracted.push({
          title: day.accommodation.name,
          description: day.location ? `Your home base in ${day.location}` : undefined,
          image: day.heroImage || data.heroImage
        });
      }
    }

    return extracted;
  }, [data.accommodations, data.itinerary, data.heroImage]);

  // Don't render if no accommodations
  if (!accommodations || accommodations.length === 0) return null;

  return (
    <div
      className="bg-white md:bg-background
                 w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]
                 md:w-auto md:left-auto md:right-auto md:ml-0 md:mr-0 md:rounded-2xl mt-10 md:mt-16
                 px-4 md:px-6 py-8"
    >
      {/* Mobile: Just title */}
      <h2 className="md:hidden text-2xl font-bold text-primary mb-4">Where We Stay</h2>

      <div className="relative">
        {/* Desktop */}
        {accommodations.length <= 2 ? (
          // If everything fits, avoid carousel entirely (prevents “missing” content + no arrows)
          <div className="hidden md:block">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-primary">Where We Stay</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {accommodations.map((accommodation, index) => {
                const isPlaying = activeVideo === index;

                return (
                  <div key={index} className="space-y-3">
                    {/* VIDEO (DESKTOP) */}
                    {accommodation.video ? (
                      <div
                        className="relative w-full max-w-md mx-auto rounded-2xl shadow-md overflow-hidden bg-black"
                        style={{ aspectRatio: "5 / 8" }}
                      >
                        <video
                          ref={(el) => (desktopVideoRefs.current[index] = el)}
                          src={accommodation.video}
                          poster={accommodation.image}
                          className="w-full h-full object-cover"
                          controls={isPlaying}
                          playsInline
                        />

                        {/* PLAY BUTTON */}
                        {!isPlaying && (
                          <button
                            onClick={() => handlePlay(index, "desktop")}
                            className="absolute inset-0 flex items-center justify-center z-20"
                          >
                            <div className="bg-white/90 p-4 rounded-full shadow-lg">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="32"
                                height="32"
                                fill="black"
                                viewBox="0 0 24 24"
                              >
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </button>
                        )}
                      </div>
                    ) : (
                      <HotelImageGallery 
                        accommodation={accommodation} 
                        className="w-full h-56 md:h-64 lg:h-72 object-cover rounded-2xl shadow-md"
                      />
                    )}

                    {/* TEXT BELOW */}
                    <div className="text-center space-y-2">
                      <h4 className="font-semibold text-foreground">{accommodation.title}</h4>
                      <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                        {accommodation.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <Carousel 
            className="hidden md:block w-full max-w-none mx-auto" 
            setApi={setCarouselApi}
            opts={{ slidesToScroll: 1, align: "start" }}
          >
            {/* Desktop: Title with arrows in same row */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-primary">Where We Stay</h2>
              <div className="flex gap-2">
                <CarouselPrevious className="relative inset-auto translate-x-0 translate-y-0" />
                <CarouselNext className="relative inset-auto translate-x-0 translate-y-0" />
              </div>
            </div>

            <CarouselContent className="-ml-4">
              {accommodations.map((accommodation, index) => {
                const isPlaying = activeVideo === index;

                return (
                  <CarouselItem key={index} className="pl-4 basis-1/2">
                    <div className="space-y-3">
                      {/* VIDEO (DESKTOP) */}
                      {accommodation.video ? (
                        <div
                          className="relative w-full max-w-md mx-auto rounded-2xl shadow-md overflow-hidden bg-black"
                          style={{ aspectRatio: "5 / 8" }}
                        >
                          <video
                            ref={(el) => (desktopVideoRefs.current[index] = el)}
                            src={accommodation.video}
                            poster={accommodation.image}
                            className="w-full h-full object-cover"
                            controls={isPlaying}
                            playsInline
                          />

                          {/* PLAY BUTTON */}
                          {!isPlaying && (
                            <button
                              onClick={() => handlePlay(index, "desktop")}
                              className="absolute inset-0 flex items-center justify-center z-20"
                            >
                              <div className="bg-white/90 p-4 rounded-full shadow-lg">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="32"
                                  height="32"
                                  fill="black"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            </button>
                          )}
                        </div>
                      ) : (
                        <HotelImageGallery 
                          accommodation={accommodation} 
                          className="w-full h-56 md:h-64 lg:h-72 object-cover rounded-2xl shadow-md"
                        />
                      )}

                      {/* TEXT BELOW */}
                      <div className="text-center space-y-2">
                        <h4 className="font-semibold text-foreground">{accommodation.title}</h4>
                        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                          {accommodation.description}
                        </p>
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
          </Carousel>
        )}

        {/* Mobile: Swipeable container with peek */}
        <div className="md:hidden overflow-x-auto overflow-y-hidden scrollbar-none scroll-smooth snap-x snap-mandatory">
          <div className="flex pb-2">
            {accommodations.map((accommodation, index) => {
              const isPlaying = activeVideo === index;

              return (
                <div
                  key={index}
                  className="flex-shrink-0 snap-start snap-always"
                  style={{ width: "calc(100vw - 3rem)", paddingRight: "0.75rem" }}
                >
                  <div className="space-y-3 w-full max-w-80 mx-auto">
                    {/* VIDEO (MOBILE) */}
                    {accommodation.video ? (
                      <div
                        className="relative w-full rounded-2xl overflow-hidden shadow-md bg-black"
                        style={{ aspectRatio: "5 / 8" }}
                      >
                        <video
                          ref={(el) => (mobileVideoRefs.current[index] = el)}
                          src={accommodation.video}
                          poster={accommodation.image}
                          className="w-full h-full object-cover"
                          controls={isPlaying}
                          playsInline
                        />

                        {/* PLAY BUTTON */}
                        {!isPlaying && (
                          <button
                            onClick={() => handlePlay(index, "mobile")}
                            className="absolute inset-0 flex items-center justify-center z-20"
                          >
                            <div className="bg-white/90 p-4 rounded-full shadow-lg">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="32"
                                height="32"
                                fill="black"
                                viewBox="0 0 24 24"
                              >
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </button>
                        )}
                      </div>
                    ) : (
                      <HotelImageGallery 
                        accommodation={accommodation} 
                        className="w-full h-56 object-cover rounded-2xl shadow-md"
                      />
                    )}

                    {/* TEXT BELOW */}
                    <div className="text-center space-y-2">
                      <h4 className="font-semibold text-foreground">{accommodation.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {accommodation.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
});

const AboutSection = memo(({ data }: { data: CountryData }) => {
  const countryName = useMemo(() => {
    // Special case for Sri Lanka to keep both words
    if (data.title.toLowerCase().includes("sri lanka")) {
      return "Sri Lanka";
    }
    return data.title.split(" ")[0];
  }, [data.title]);

  return (
    <div className="mb-8 md:mb-0">
      {/* Single white container with everything */}
      <div
        className="bg-white md:bg-background
          w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]
          md:w-auto md:left-auto md:right-auto md:ml-0 md:mr-0
          px-4 md:px-8 py-8 md:rounded-t-2xl"
      >
        {/* Category Tags - centered at top */}
        {data.tags && data.tags.length > 0 && (
          <div className="mb-6 md:hidden">
            <CategoryTags tags={data.tags} />
          </div>
        )}

        {/* Content grid: about text and highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left col: trip info + about text */}
          <div className="order-1 md:order-none space-y-6 w-full">
            {/* Trip duration and name - stacked layout */}
            <div className="flex flex-col gap-1 mb-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="text-lg font-medium text-foreground">{data.duration}</span>
                </div>
                {data.startDate && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <span className="text-lg font-medium text-foreground">{data.startDate}</span>
                  </div>
                )}
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold text-primary">{data.title}</h2>
            </div>

            {data.aboutDescription.map((paragraph, index) => (
              <p
                key={index}
                className="text-lg text-muted-foreground leading-relaxed mb-6 text-justify"
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Right col: highlights */}
          <div className="order-2 md:order-none w-full self-start">
            <TripHighlights data={data} />
          </div>
        </div>

        {/* Route: mobile only - below highlights */}
        {Array.isArray(data.route) && data.route.length > 1 && (
          <div className="w-full mt-6 md:hidden">
            <ResponsiveRoute stops={data.route} slug={data.slug} />
          </div>
        )}
      </div>
    </div>
  );
});

const IncludedSection = memo(
  ({ included, countryName }: { included: CountryData["included"]; countryName: string }) => (
    <div
      id="whats-included"
      className="mt-16
                 bg-white md:bg-card
                 rounded-2xl md:rounded-xl md:border md:shadow-sm
                 w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]
                 md:w-auto md:left-auto md:right-auto md:ml-0 md:mr-0"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-16 md:py-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-foreground mb-4">
            {STATIC_TEXT.includedTitle}
          </h3>
          <p className="text-lg text-muted-foreground">
            Everything you need for an unforgettable {countryName} experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 lg:gap-x-24 gap-y-12 max-w-7xl mx-auto">
          <div className="space-y-12">
            {included
              .filter((section) => section.title !== "Included Experiences")
              .map((section, index) => (
                <div key={index} className="space-y-5">
                  <h4 className="font-semibold text-foreground text-lg mb-5">{section.title}</h4>
                  <ul className="space-y-2 text-muted-foreground list-disc list-inside marker:text-primary">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="leading-relaxed">
                        {item.text}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>

          <div className="space-y-8">
            {included
              .filter((section) => section.title === "Included Experiences")
              .map((section, index) => (
                <div key={index} className="space-y-5">
                  <h4 className="font-semibold text-foreground text-lg mb-5">{section.title}</h4>
                  <ul className="space-y-2 text-muted-foreground list-disc list-inside marker:text-primary">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="leading-relaxed">
                        {item.text}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  ),
);

const WhatsIncludedHighlights = memo(
  ({ highlights, route, slug }: { highlights?: WhatsIncludedHighlight[]; route?: string[]; slug?: string }) => {
    if (!highlights || highlights.length === 0) return null;

    const handleLinkClick = useCallback((url: string) => {
      if (url === "#itinerary") {
        const includedSection = document.getElementById("whats-included");
        if (includedSection) {
          const offset = 100;
          const elementPosition = includedSection.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
      }
    }, []);

    const desktopGridClass =
      highlights.length === 5
        ? "md:grid-cols-5"
        : highlights.length === 4
          ? "md:grid-cols-4"
          : "md:grid-cols-6";

    return (
      <div
        className="bg-white md:bg-transparent
                 w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]
                 md:w-auto md:left-auto md:right-auto md:ml-0 md:mr-0
                 py-8 md:py-0"
      >
        <div className="max-w-6xl mx-auto px-4 md:px-0">
          {/* Route: desktop only - above What's Included, centered */}
          {Array.isArray(route) && route.length > 1 && (
            <>
              <div className="hidden md:block bg-background rounded-b-2xl pb-6 px-8">
                <div className="flex justify-center w-full">
                  <ResponsiveRoute stops={route} slug={slug} />
                </div>
              </div>
              {/* Grey gap between route and what's included */}
              <div className="hidden md:block h-4" />
            </>
          )}

          <div className="md:bg-background md:rounded-2xl md:px-8 md:pt-6 md:pb-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-primary">WHAT'S INCLUDED</h2>
            </div>

            <div className={`grid grid-cols-2 ${desktopGridClass} gap-4`}>
              {highlights.map((highlight, index) => {
                const IconComponent = highlight.icon;
                return (
                  <div key={index} className="text-center space-y-3">
                    <div className="flex justify-center">
                      <IconComponent className="w-12 h-12 text-primary" strokeWidth={1.25} />
                    </div>
                    <h3
                      className="text-lg font-bold text-foreground"
                      dangerouslySetInnerHTML={{ __html: highlight.title }}
                    />
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {highlight.description}
                    </p>
                    {highlight.link && (
                      <button
                        onClick={() => handleLinkClick(highlight.link.url)}
                        className="text-primary hover:text-primary/80 underline text-xs cursor-pointer"
                      >
                        {highlight.link.text}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  },
);

const PaymentPlansSection = memo(
  ({
    plans,
    description,
  }: {
    plans?: PaymentPlan[];
    description?: string;
  }) => {
    if (!plans || plans.length === 0) return null;

    return (
      <section
        id="payment-plans"
        className="relative left-1/2 right-1/2 mt-16 -ml-[50vw] -mr-[50vw] w-screen bg-[#f8fbfa] md:left-auto md:right-auto md:ml-0 md:mr-0 md:w-auto md:rounded-[28px] md:border md:border-[#0fc2bf]/10 md:shadow-[0_12px_40px_rgba(15,35,45,0.05)]"
      >
        <div className="mx-auto max-w-6xl px-5 py-14 md:px-10 md:py-16">
          <div className="mb-10 text-center">
            <h3 className="mb-3 text-3xl font-bold text-foreground">Payment Plans</h3>
            {description && (
              <p className="text-base text-muted-foreground md:text-lg">{description}</p>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {plans.map((plan) => (
              <article
                key={plan.title}
                className={`relative rounded-[24px] border p-6 shadow-[0_8px_28px_rgba(15,35,45,0.045)] md:p-8 ${
                  plan.featured
                    ? "border-[#0fc2bf]/30 bg-[#0fc2bf]/[0.035]"
                    : "border-slate-200/70 bg-white/80"
                }`}
              >
                {plan.featured && (
                  <span className="mb-4 inline-flex rounded-full bg-[#0fc2bf]/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#087f7c]">
                    Early Bird
                  </span>
                )}

                <div className="mb-6 flex items-end justify-between gap-4 border-b border-slate-200/60 pb-5">
                  <h4 className="text-xl font-semibold text-foreground">{plan.title}</h4>
                  <p className="text-3xl font-bold leading-none text-foreground">{plan.price}</p>
                </div>

                <div className="divide-y divide-slate-200/50">
                  {plan.payments.map((payment) => (
                    <div
                      key={payment.label}
                      className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <span className="leading-relaxed text-muted-foreground">{payment.label}</span>
                      <span className="shrink-0 font-bold text-foreground">{payment.amount}</span>
                    </div>
                  ))}
                </div>

                {plan.note && (
                  <p className="mt-6 border-t border-slate-200/60 pt-5 text-sm leading-relaxed text-muted-foreground">
                    {plan.note}
                  </p>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  },
);

PaymentPlansSection.displayName = "PaymentPlansSection";

const FAQSection = memo(
  ({ faqs, countryName }: { faqs: CountryData["faqs"]; countryName: string }) => (
    <div
      className="mt-16
               bg-white md:bg-card
               rounded-2xl md:rounded-xl md:border md:shadow-sm
               w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]
               md:w-auto md:left-auto md:right-auto md:ml-0 md:mr-0"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-3 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h3>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about your {countryName} adventure
          </p>
        </div>

        <Accordion
          type="single"
          collapsible
          className="w-full max-w-4xl mx-auto divide-y divide-gray-200 px-4 md:px-0"
        >
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`faq-${index}`}
              className="border-0 rounded-none bg-background"
            >
              <AccordionTrigger className="px-0 md:px-6 py-4 hover:no-underline text-left">
                <span className="font-semibold text-foreground">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="px-0 md:px-6 pb-4">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {faq.answer}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  ),
);

const StickyBookingCard = memo(({ data }: { data: CountryData }) => {
  const bookingUrl = getBookingUrlBySlug(data.slug);

  return (
    <div className="hidden lg:block w-80 flex-shrink-0">
      <div className="sticky top-24 space-y-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-foreground">{data.duration}</h3>
            {data.startDate && (
              <p className="text-lg font-normal text-primary mb-1">Trip starts {data.startDate}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {data.route ? data.route.join(" to ") : data.location}
            </p>
          </div>

          <div className="space-y-1">
            {data.soldOut ? (
              <div className="rounded-2xl border border-cyan-200/80 bg-gradient-to-r from-cyan-50 via-white to-teal-50 px-4 py-3 shadow-[0_18px_40px_-24px_rgba(15,194,191,0.45)]">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-base font-bold text-slate-800">Sold Out</p>
                  <div className="text-right">
                    <p className="text-[11px] text-slate-600">From</p>
                    <p className="text-lg font-bold text-slate-900">
                      {data.price || "USD $1,399"}
                    </p>
                  </div>
                </div>
                <p className="mt-1 text-sm leading-5 text-slate-600">
                  <span className="block font-semibold text-[#0fc2bf]">
                    Join the waitlist
                  </span>
                  Email <span className="font-semibold text-[#0b8f8d]">bookings@imaginebeyondtravel.com</span>
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">From</p>
                {data.priceOriginal ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl text-muted-foreground line-through">
                      {data.priceOriginal}
                    </span>
                    <span className="text-3xl font-bold text-foreground">
                      {data.price || "USD $1,399"}
                    </span>
                  </div>
                ) : (
                  <p className="text-3xl font-bold text-foreground">
                    {data.price || "USD $1,399"}
                  </p>
                )}
                {data.priceNote && (
                  <p className="text-xs text-muted-foreground">{data.priceNote}</p>
                )}
              </>
            )}
          </div>

          {data.soldOut ? null : bookingUrl === "#" ? (
            <Button
              size="default"
              className="h-auto w-full rounded-2xl border border-cyan-200/80 bg-gradient-to-r from-cyan-50 via-white to-teal-50 px-4 py-3 text-slate-700 shadow-[0_18px_40px_-24px_rgba(15,194,191,0.45)] cursor-not-allowed disabled:opacity-100"
              disabled
            >
              <span className="flex flex-col items-center leading-tight">
                <span className="text-sm font-semibold">Sold Out</span>
              </span>
            </Button>
          ) : (
            <>
              <a href={bookingUrl} className="block">
                <Button
                  size="default"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-base font-semibold"
                >
                  {data.ctaLabel || "RESERVE NOW $650"}
                </Button>
              </a>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Deposit is non-refundable.
              </p>
            </>
          )}


        </div>
      </div>
    </div>
  );
});


export const ItineraryTemplate = memo(
  ({ data, logoStyle, FooterComponent, desktopHero, hideDesktopHero }: ItineraryTemplateProps) => {
    const [mobileHeroVideoReady, setMobileHeroVideoReady] = useState(false);

    // Memoize derived values
    const countryName = useMemo(() => {
      // Special case for Sri Lanka to keep both words
      if (data.title.toLowerCase().includes("sri lanka")) {
        return "Sri Lanka";
      }
      return data.title.split(" ")[0];
    }, [data.title]);

    useEffect(() => {
      setMobileHeroVideoReady(false);
    }, [data.desktopHeroVideo]);

    // Compute 4 images for hero left grid (prefer overviewGallery)
    const overviewFour = useMemo(() => {
      if (data.overviewGallery && data.overviewGallery.length) {
        return data.overviewGallery.slice(0, 4);
      }
      // fallback to first 4 day hero images (current behavior)
      return data.itinerary.slice(0, 4).map((d) => d.heroImage || data.heroImage);
    }, [data.overviewGallery, data.itinerary, data.heroImage]);

    // Scroll to first image function (kept for reference)
    const scrollToFirstImage = useCallback((dayNumber: number) => {
      setTimeout(() => {
        const dayTrigger = document.querySelector(
          `[value="day-${dayNumber}"] [data-accordion-trigger]`,
        );
        const firstImageElement = document.querySelector(`#day-${dayNumber}-first-image`);
        const targetElement = dayTrigger || firstImageElement;
        if (targetElement) {
          const offset = 280;
          const elementPosition = (targetElement as HTMLElement).getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
      }, 150);
    }, []);

    // Put the opened day in a readable position below the sticky header.
    const handleAccordionChange = useCallback((value: string) => {
      if (value) {
        setTimeout(() => {
          const item = document.querySelector(`[data-itinerary-day="${value}"]`);
          const trigger = item?.querySelector("[data-accordion-trigger]") as HTMLElement | null;
          if (!trigger) return;

          const desktop = window.matchMedia("(min-width: 768px)").matches;
          const targetElement = desktop ? (item as HTMLElement) : trigger;
          const rect = targetElement.getBoundingClientRect();
          const offset = desktop ? 96 : 150;
          const targetTop = window.scrollY + rect.top - offset;

          if (Math.abs(window.scrollY - targetTop) > 40) {
            window.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
          }
        }, 350);
      }
    }, []);

    // Memoize itinerary rendering with accordion
    const itineraryContent = useMemo(
      () => (
        <Accordion
          type="single"
          collapsible
          className="w-full"
          onValueChange={handleAccordionChange}
        >
          {data.itinerary.map((day, index) => (
            <AccordionItem
              key={day.day}
              value={`day-${day.day}`}
              data-itinerary-day={`day-${day.day}`}
              className={`bg-background border-0 ${
                index === 0 ? "rounded-t-2xl" : ""
              } ${index === data.itinerary.length - 1 ? "rounded-b-2xl" : ""}`}
            >
              <div
                className={`${
                  index < data.itinerary.length - 1 ? "border-b border-gray-200" : ""
                } mx-0 md:mx-6`}
              >
                <AccordionTrigger className="px-4 md:px-0 py-4 hover:no-underline group">
                  <div className="w-full flex items-baseline gap-2 md:gap-4 text-left">
                    <h2 className="whitespace-nowrap flex-shrink-0 text-2xl font-bold text-foreground">
                      Day {day.day}
                    </h2>
                    <span
                      aria-hidden="true"
                      className="mx-2 text-muted-foreground/40"
                    >
                      |
                    </span>
                    <h3 className="min-w-0 break-words text-base md:text-lg font-semibold text-muted-foreground group-hover:text-primary transition-colors duration-200">
                      {day.title}
                    </h3>
                  </div>
                </AccordionTrigger>
              </div>
              <AccordionContent className="px-0 pb-0">
                <DayLayout
                  dayNumber={day.day}
                  date={day.date}
                  location={day.location || day.title}
                  siteName={day.siteName}
                  heroImage={day.heroImage || data.heroImage}
                  description={
                    day.description ||
                    `Experience the wonders of ${day.title} in this unforgettable day of your journey.`
                  }
                  carouselImages={day.galleryImages || []}
                  accommodation={day.accommodation}
                  transportation={day.transportation}
                  meals={day.meals}
                  highlights={
                  day.highlights ??
                  (day.activities?.length
                    ? day.activities.map((a) => a.title).join(", ")
                    : undefined)
                }
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ),
      [data.itinerary, data.heroImage, handleAccordionChange],
    );

    return (
      <div className={STATIC_STYLES.gradient}>
        <Navbar logoStyle={logoStyle} />
        {desktopHero}

        {/* Hero Section (custom) */}
        <section
          className={`relative h-[70vh] md:h-[70vh] flex overflow-hidden md:mx-6 lg:mx-12 xl:mx-16 rounded-none md:rounded-2xl mt-0 md:mt-6 bg-transparent md:bg-white p-0 md:p-6 shadow-none md:shadow-sm ${
            hideDesktopHero ? "md:hidden" : ""
          }`}
        >
          {/* Mobile: Show only main image */}
          <div className="md:hidden relative w-full h-full">
            <img
              src={data.heroImage}
              alt={`${data.title} hero`}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                mobileHeroVideoReady ? "opacity-0" : "opacity-100"
              }`}
              loading="eager"
              fetchpriority="high"
              decoding="async"
            />
            {data.desktopHeroVideo && (
              <video
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                  mobileHeroVideoReady ? "opacity-100" : "opacity-0"
                }`}
                src={data.desktopHeroVideo}
                poster={data.heroImage}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                onCanPlay={() => setMobileHeroVideoReady(true)}
              />
            )}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
              <div className="text-center text-white">
                <h1 className="text-3xl font-bold mb-2">{data.title}</h1>
                <div className="flex items-center justify-center gap-2 text-base">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {data.slug === "india-journey" ? "Feb 27th" : data.location} •{" "}
                    {data.duration}
                    {data.startDate ? ` - ${data.startDate}` : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop: Grid layout */}
          <div className="hidden md:flex w-full h-full">
            {/* Left side: Main hero image (60% of screen) */}
            <div className="w-[60%] relative overflow-hidden rounded-tl-2xl rounded-bl-2xl">
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${data.heroImage})` }}
              />
              {/* Tour Start Date Badge - Top Left */}
              {(data.slug === "india-journey" ||
                data.slug === "sri-lanka" ||
                data.slug === "philippines") && (
                <div className="absolute top-6 left-6 z-10">
                  <div className="bg-primary backdrop-blur-md border border-primary rounded-lg px-3 py-1.5">
                    <p className="text-sm font-semibold text-white">
                      {data.slug === "india-journey" && "Tour starts Feb 27th"}
                      {data.slug === "sri-lanka" && "Tour starts April 19th"}
                      {data.slug === "philippines" && "Tour starts April 1st"}
                    </p>
                  </div>
                </div>
              )}
              {/* Price in top right corner */}
              <div className="absolute top-6 right-6 z-10">
                <div className="bg-primary backdrop-blur-md border border-primary rounded-lg px-4 py-2">
                  <p className="text-xs text-white/90">From</p>
                  {data.priceOriginal ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm text-white/80 line-through">
                        {data.priceOriginal}
                      </span>
                      <span className="text-xl font-bold text-white">
                        {data.price || "USD $1,399"}
                      </span>
                    </div>
                  ) : (
                    <p className="text-xl font-bold text-white">
                      {data.price || "USD $1,399"}
                    </p>
                  )}
                </div>
              </div>
              <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-10">
                <div className="text-center text-white">
                  <h1 className="text-4xl lg:text-5xl font-bold mb-3">{data.title}</h1>
                  <div className="flex items-center justify-center gap-2 text-lg">
                    <MapPin className="w-5 h-5" />
                    <span>
                      {data.startDate || data.location} • {data.duration}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: 2 images on top, review section on bottom */}
            <div className="w-[40%] h-full flex flex-col gap-0">
              {/* Top row: 2 images */}
              <div className="h-1/2 md:h-[55%] grid grid-cols-2 gap-0">
                {overviewFour.slice(0, 2).map((src, index) => {
                  const src2x = data.overviewGallery2x?.[index] || undefined;
                  const cornerClass = index === 1 ? "rounded-tr-2xl" : "";

                  return (
                    <div key={index} className="relative h-full w-full overflow-hidden">
                      <img
                        src={src}
                        srcSet={src2x ? `${src} 1x, ${src2x} 2x` : undefined}
                        sizes="(min-width:1280px) 20vw, (min-width:1024px) 20vw, 50vw"
                        alt={`${data.title} overview ${index + 1}`}
                        className={`h-full w-full object-cover hover:scale-105 transition-transform duration-300 ${cornerClass}`}
                        decoding="async"
                        loading="eager"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Bottom row: Review section on desktop OR bottom 2 images */}
              {data.review ? (
                <div className="hidden md:block h-1/2 md:h-[45%]">
                  <ReviewSection review={data.review} />
                </div>
              ) : (
                <div className="h-1/2 md:h-[45%] grid grid-cols-2 gap-0">
                  {overviewFour.slice(2, 4).map((src, index) => {
                    const actualIndex = index + 2;
                    const src2x = data.overviewGallery2x?.[actualIndex] || undefined;
                    const cornerClass = index === 1 ? "rounded-br-2xl" : "";

                    return (
                      <div key={actualIndex} className="relative h-full w-full overflow-hidden">
                        <img
                          src={src}
                          srcSet={src2x ? `${src} 1x, ${src2x} 2x` : undefined}
                          sizes="(min-width:1280px) 20vw, (min-width:1024px) 20vw, 50vw"
                          alt={`${data.title} overview ${actualIndex + 1}`}
                          className={`h-full w-full object-cover hover:scale-105 transition-transform duration-300 ${cornerClass}`}
                          decoding="async"
                          loading="eager"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Country Overview - with sticky sidebar on desktop */}
        <div className="max-w-7xl mx-auto px-4 md:px-3 py-0 md:py-12">
          <div className="flex gap-8">
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <AboutSection data={data} />

              {/* Review Section - Mobile only */}
              {data.review && (
                <div className="block md:hidden">
                  <ReviewSection review={data.review} />
                </div>
              )}

              {/* What's Included Highlights */}
              <WhatsIncludedHighlights
                highlights={data.whatsIncludedHighlights}
                route={data.route}
                slug={data.slug}
              />

              {/* Daily Itinerary (full-bleed on mobile) */}
              <div
                className="bg-white md:bg-background
                         w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]
                         md:w-auto md:left-auto md:right-auto md:ml-0 md:mr-0 md:rounded-2xl mt-10 md:mt-16"
              >
                {/* Itinerary Title - left aligned, inside container */}
                <div className="px-4 md:px-6 pt-8 pb-4">
                  <h2 className="text-3xl font-bold text-primary">
                    {STATIC_TEXT.itineraryTitle}
                  </h2>
                </div>
                {itineraryContent}
              </div>

              {/* What's Included Section */}
              <IncludedSection included={data.included} countryName={countryName} />

              {/* Payment Plans */}
              <PaymentPlansSection
                plans={data.paymentPlans}
                description={data.paymentPlanDescription}
              />

              {/* FAQ Section */}
              <FAQSection faqs={data.faqs} countryName={countryName} />
            </div>

            {/* Sticky Booking Card */}
            <StickyBookingCard data={data} countryName={countryName} />
          </div>
        </div>

{/* Mobile Sticky Booking Bar */}
<div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 px-4 py-1 shadow-lg">
  <div className="flex items-center justify-between gap-4">
    <div className={`${data.soldOut ? "w-full" : ""} flex flex-col leading-tight space-y-0.5`}>
      {data.soldOut ? (
        <div className="rounded-2xl border border-cyan-200/80 bg-gradient-to-r from-cyan-50 via-white to-teal-50 px-4 py-2 shadow-[0_18px_40px_-24px_rgba(15,194,191,0.45)]">
          <div className="flex items-start justify-between gap-3">
            <span className="text-[13px] font-bold leading-4 text-slate-800">
              Sold Out
            </span>
            <div className="text-right">
              <span className="block text-[10px] text-slate-600">From</span>
              <p className="text-sm font-bold text-slate-900">
                {data.price || "USD $1,399"}
              </p>
            </div>
          </div>
          <p className="-mt-0.5 text-[11px] leading-4 text-slate-600">
            <span className="block text-[10px] font-semibold leading-3 text-[#0fc2bf]">
              Join the waitlist
            </span>
            Email <span className="font-semibold text-[#0b8f8d]">bookings@imaginebeyondtravel.com</span>
          </p>
        </div>
      ) : (
        <>
          <span className="text-sm text-muted-foreground">From</span>
          {data.priceOriginal ? (
            <span className="text-xl font-bold text-foreground">
              <span className="mr-2 text-sm text-muted-foreground line-through">
                {data.priceOriginal}
              </span>
              {data.price || "USD $1,399"}
            </span>
          ) : (
            <span className="text-xl font-bold text-foreground">
              {data.price || "USD $1,399"}
            </span>
          )}
          {data.priceNote && (
            <span className="text-[11px] text-muted-foreground leading-tight">
              {data.priceNote}
            </span>
          )}
        </>
      )}
    </div>

    {(() => {
      const bookingUrl = getBookingUrlBySlug(data.slug);

      if (data.soldOut) {
        return null;
      }

      if (bookingUrl === "#") {
        return (
          <Button
            size="default"
            className="h-auto rounded-full border border-cyan-200/80 bg-gradient-to-r from-cyan-50 via-white to-teal-50 px-8 py-3 font-semibold text-slate-700 shadow-[0_18px_40px_-24px_rgba(15,194,191,0.45)] cursor-not-allowed disabled:opacity-100"
            disabled
          >
            <span className="flex flex-col items-center leading-tight">
              <span className="text-sm">Sold Out</span>
            </span>
          </Button>
        );
      }

      return (
        <div className="flex w-[56%] flex-shrink-0 flex-col items-center gap-1">
          <a href={bookingUrl} className="flex w-full">
            <Button
              size="default"
              className="h-9 w-full rounded-full bg-primary px-3 text-[11px] font-semibold tracking-[0.08em] text-primary-foreground hover:bg-primary/90"
            >
              {data.ctaLabel || "RESERVE NOW $650"}
            </Button>
          </a>
          <p className="text-center text-[10px] leading-none text-muted-foreground">
            Deposit is non-refundable.
          </p>
        </div>
      );
    })()}
  </div>
</div>



        {/* Footer */}
        {FooterComponent ? <FooterComponent /> : <Footer />}
      </div>
    );
  },
);

export default ItineraryTemplate;
