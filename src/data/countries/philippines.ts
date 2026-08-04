import phBoatParty from "@/assets/PH East/boat_party.avif";
import phBoracay1 from "@/assets/PH East/boracay_1.webp";
import phNoah1 from "@/assets/PH East/noah-1.jpg";
import phBoracaySunset from "@/assets/PH East/boracay_sunset.webp";
import phBoracayVideo from "@/assets/PH East/Boracay_video.mp4";
import phCebu from "@/assets/PH East/cebu.jpg";
import phCanyon2 from "@/assets/PH East/canyon_2.webp";
import phNoah3 from "@/assets/PH East/noah-3.jpg";
import phDay2Church from "@/assets/PH East/day2_church.webp";
import phNoah2 from "@/assets/PH East/noah-2.webp";
import phPb from "@/assets/PH East/pb.jpg";
import phDesktopTurtle from "@/assets/PH East/desktop_turtle.webp";
import phNoah4 from "@/assets/PH East/noah-4.webp";
import phNoah5 from "@/assets/PH East/noah-5.jpg";
import phNoah7 from "@/assets/PH East/noah-7.jpg";
import phMoalboalVideo from "@/assets/PH East/moalboal_vid.mp4";
import phParawSailing from "@/assets/PH East/paraw_sailing.webp";
import phTurtle from "@/assets/PH East/turtle.webp";
import phTripHighlightCover1 from "@/assets/PH East/trip-highlight-cover-1.jpg";
import phTripHighlightCover2 from "@/assets/PH East/trip-highlight-cover-2.jpg";
import { Home, Zap, Plane, Users, UtensilsCrossed } from "lucide-react";

export const philippinesData = {
  id: "philippines-island-explorer",
  slug: "philippines",
  title: "Philippines Island Explorer",
  subtitle: "8 Days | Cebu → Moalboal → Boracay",
  location: "Philippines",
  duration: "8 Days",
  startDate: "April 1st - April 8th",
  price: "$2,259",
  priceOriginal: "$2,459",
  priceNote: "Early bird: first 6 people save $200 USD.",
  ctaLabel: "$650 Deposit",
  heroImage: phDesktopTurtle,
  desktopHeroVideo: phMoalboalVideo,
  desktopHeroPosterImage: phTurtle,
  desktopTopMiddleImage: phBoracay1,
  desktopTopMiddleObjectPosition: "50% 75%",
  desktopTopRightImage: phNoah7,
  desktopTopRightObjectPosition: "50% 75%",
  desktopBottomLeftImage: phNoah5,
  desktopBottomMiddleImage: phNoah2,
  desktopBottomMiddleObjectPosition: "center top",
  desktopBottomRightImage: phNoah1,
  desktopBottomRightObjectPosition: "50% 78%",
  hideSummary: true,
  route: ["Cebu", "Moalboal", "Boracay"],
  tags: [
    { emoji: "🚀", label: "Adventure" },
    { emoji: "🪭", label: "Culture" },
    { emoji: "🧳", label: "Solo" },
    { emoji: "🏖️", label: "Beach" },
  ],
  aboutDescription: [
    "Hosted by Noah, aka The Black Culdron, get ready for tropical chaos in the best possible way. Think turquoise water, white-sand beaches, waterfalls, snorkelling with turtles, sunset sailing, boat parties, local food, and a group of new travel mates who will very quickly feel like family.",
    "This trip brings the online magic into real life: island adventures, spirituality, folklore, culture, manifestation moments, big laughs, and plenty of time to soak up the Philippines.",
  ],
  aboutImages: [phCebu, phBoracay1],
  highlights: [
    {
      title: "Boracay",
      description: "Arguably one of the best beaches in the world, with white sand, turquoise water, sunset sailing, and island nightlife.",
      image: phTripHighlightCover1,
      video: phBoracayVideo,
      videoAspectRatio: "5 / 7",
      videoObjectPosition: "top center",
    },
    {
      title: "Swimming with Turtles",
      description: "Snorkel in Moalboal's clear tropical water and swim alongside turtles, colourful coral, and the famous sardine run.",
      image: phTripHighlightCover2,
      video: phMoalboalVideo,
      videoAspectRatio: "5 / 7",
      videoObjectPosition: "center center",
    },
  ],
  accommodations: [
    {
      title: "Cebu City stay",
      description: "A comfortable city base for the start of the Philippines itinerary.",
      images: [phCebu],
    },
    {
      title: "Moalboal beachside stay",
      description: "A relaxed coastal base close to snorkelling, cafes, and island nightlife.",
      images: [phTurtle],
    },
    {
      title: "Boracay resort stay",
      description: "A well-located island stay near Boracay's white sand, sunsets, and restaurants.",
      images: [phBoracay1, phParawSailing],
    },
  ],
  whatsIncludedHighlights: [
    {
      icon: Home,
      title: "7 NIGHTS<br />ACCOMM",
      description: "Comfortable stays in well-located beachside hotels.",
    },
    {
      icon: Zap,
      title: "8 DAYS OF<br />PHILIPPINES",
      description: "Cebu, Moalboal, and Boracay with sardine run snorkelling, turtles, canyoneering, waterfalls, paraw sailing, island hopping, and more.",
      link: {
        text: "Explore the itinerary",
        url: "#itinerary",
      },
    },
    {
      icon: Plane,
      title: "AIRPORT PICKUP<br />& TRANSFERS",
      description: "Includes arrival pickup in Cebu, ground transfers, flight to Caticlan, ferry to Boracay, and help with onward travel at the end of the trip.",
    },
    {
      icon: Users,
      title: "LOCAL<br />GUIDE",
      description: "Expert local guide who knows hidden gems and provides authentic cultural experiences.",
    },
    {
      icon: UtensilsCrossed,
      title: "LOCAL<br />CUISINE",
      description: "7 breakfasts and 2 lunches, including a local lechon lunch on the journey to Moalboal.",
    },
  ],
  itinerary: [
    {
      day: 1,
      title: "Welcome to Cebu",
      location: "Cebu City",
      heroImage: phCebu,
      description:
        "Welcome to the Philippines! It is hot, it is tropical, and yes, you are absolutely going to love it. Today is all about arriving in Cebu City, meeting your group, and getting to know your tour guide. These are the people you will be island-hopping, waterfall-jumping, cocktail-sipping, and probably embarrassing yourself on the dance floor with over the next week.",
      highlights: "Meet your group and tour guide",
      accommodation: { name: "Hop Inn Cebu City or similar" },
      transportation: {
        mode: "Car",
        from: "Cebu Airport",
        to: "Hotel in Cebu City",
        duration: "45 mins",
      },
    },
    {
      day: 2,
      title: "Cebu to Moalboal",
      location: "Moalboal",
      heroImage: phDay2Church,
      description:
        "This morning, we leave the city behind and make our way to the beautiful seaside town of Moalboal. Pronounced “mole-bowl”, for anyone wondering. On the way, we will stop for a local lunch, lechon style. This is one of the Philippines’ most famous dishes, and for the brave foodies in the group, it is a must-try. Bellies full and energy high, we will visit the incredible Simala Church. This place looks like it has been lifted straight out of a fairytale, so make sure your camera is ready. It is also known by many locals as a place of miracles, so feel free to put in a good word for next week’s lottery numbers. After a relaxed walking tour, we continue to Moalboal. The afternoon is yours to enjoy. Grab an iced coffee, explore the town, get a Filipino massage, or just settle into island mode.",
      meals: "1 breakfast, 1 lunch",
      highlights: "Moalboal walking tour, Simala Church visit",
      accommodation: { name: "Quo Vadis Dive Resort or similar" },
    },
    {
      day: 3,
      title: "Snorkelling with Sardines & Turtles",
      location: "Moalboal",
      heroImage: phTurtle,
      description:
        "Wake up, grab breakfast, and get ready for one of the most magical days of the trip. Today we head into the water for an unforgettable snorkelling experience. Moalboal is famous for its marine life, and you will get the chance to swim among colourful corals, tropical fish, the iconic sardine run, and, if we are lucky, turtles gliding through the ocean like absolute legends. There is something pretty special about seeing turtles in their natural habitat. Do not be surprised if someone quietly sheds a happy tear into their snorkel mask. Later, Noah will host a short Art of Having Everything session, introducing scripting, manifestation, and a grounding guided meditation. In the evening, we will head out to experience Moalboal’s nightlife. Expect beach bars, good vibes, and at least one person recreating the sardine run on the dance floor.",
      meals: "1 breakfast",
      highlights: "Snorkelling with turtles, sardine run, manifestation and meditation workshop",
      accommodation: { name: "Quo Vadis Dive Resort or similar" },
    },
    {
      day: 4,
      title: "Canyoneering Adventure",
      location: "Moalboal",
      heroImage: phNoah3,
      description:
        "Today is a big one. We are off canyoneering through waterfalls, rivers, rock pools, and jungle scenery. This is one of the Philippines’ most iconic adventure activities, and it is every bit as epic as it sounds. Whether you are the first to jump, the last to jump, or firmly in the “I am absolutely not jumping off that” club, we have got you. Float downstream, scramble over rocks, splash through crystal-clear water, and get those GoPro shots ready. After the adventure, we will enjoy a late lunch and then take the evening slow. You have earned a chilled night before we continue to our next dreamy destination: Boracay.",
      meals: "1 breakfast, 1 lunch",
      highlights: "Waterfalls and canyoneering",
      accommodation: { name: "Quo Vadis Dive Resort or similar" },
    },
    {
      day: 5,
      title: "Moalboal to Boracay & Noah's Birthday Bash",
      location: "Boracay",
      heroImage: phBoracay1,
      description:
        "Paradise is calling. Today, we travel back to Cebu Airport and catch a short flight to Caticlan, the gateway to Boracay. From there, we hop over to the island and check into our resort, our home for the next three nights. Boracay is famous for powdery white sand, bright blue water, beach clubs, sunsets, and a nightlife scene that does not mess around. Once we are settled in, we will head out to watch the sunset, followed by a group dinner and Noah's Birthday Bash in the evening.",
      meals: "1 breakfast",
      highlights: "Noah's Birthday Bash",
      accommodation: { name: "Commander Suites or similar" },
    },
    {
      day: 6,
      title: "Boracay Beach Day & Paraw Sailing",
      location: "Boracay",
      heroImage: phParawSailing,
      description:
        "This morning is yours. Sleep in, wander the beach, find a cute café, hit the shops, swim, sunbathe, or spend quality time recovering from last night’s questionable life choices. We will also make space for a relaxed Noah-led manifestation and meditation workshop, using scripting to get clear on what you want and reset before the final stretch of the trip. In the late afternoon, we meet back up for one of Boracay’s most beautiful experiences: Paraw sailing. A paraw is a traditional Filipino sailboat with two outriggers and two sails. We will glide across the water as the sun begins to set, with Boracay’s famous colours lighting up the sky. Golden orange, pink, purple, lilac — the whole thing looks like someone turned the saturation up in real life. After sailing, we will head back, freshen up, and check out some of the best cocktail spots in town. Mojitos at sunset? Yes, please.",
      meals: "1 breakfast",
      highlights: "Paraw sailing, guided manifestation and meditation session",
      accommodation: { name: "Commander Suites or similar" },
    },
    {
      day: 7,
      title: "Boracay Boat Party",
      location: "Boracay",
      heroImage: phBoatParty,
      description:
        "It is our last full day together, so obviously we are going out with a bang. Today is boat party day. We will spend the day island hopping, snorkelling in crystal-clear water, floating around, soaking up the sun, and making the most of every final moment in paradise. Expect music, drinks, swimming, lunch, and all the “how is this real life?” energy. Later, we head back to shore and get ready for our farewell dinner. This is the final night, so dress up, order dessert, make a toast, and celebrate an unforgettable week in the Philippines. The goodbye might hurt, but the memories will be worth it.",
      meals: "1 breakfast",
      highlights: "Boat party",
      accommodation: { name: "Commander Suites or similar" },
    },
    {
      day: 8,
      title: "Chilled Check-Out",
      location: "Boracay",
      heroImage: phNoah2,
      description:
        "Today, it is time to say goodbye. After breakfast, we will help with onward travel plans, whether you are heading home, staying in Boracay, or continuing your adventure through the Philippines. You arrived as strangers, but you leave as part of the Imagine Beyond family. And as every good traveller knows, goodbye really just means “see you somewhere else in the world.”",
      meals: "1 breakfast",
      highlights: "Help with onward travel",
    },
  ],
  summary: {
    duration: "8 Days",
    activities: "Cruise, Culture & Food",
    areas: "Hanoi, Ha Long Bay & Hoi An",
    type: "Culture & Adventure",
  },
  included: [
    {
      title: "Meals & Accommodation Included",
      items: [
        { text: "7 nights of accommodation" },
        { text: "7 breakfasts" },
        { text: "2 lunches, including local lechon lunch" },
      ],
    },
    {
      title: "Transport & Local Guide",
      items: [
        { text: "Ground transfers" },
        { text: "Flight to Caticlan Airport (Boracay)" },
        { text: "Short ferry to Boracay" },
        { text: "24/7 local guide" },
      ],
    },
    {
      title: "Included Experiences",
      items: [
        { text: "Moalboal walking tour" },
        { text: "Simala Church" },
        { text: "Snorkelling with sardines and turtles" },
        { text: "Guided manifestation and meditation session" },
        { text: "Canyoneering" },
        { text: "Waterfalls" },
        { text: "Paraw sailing" },
        { text: "Boat party" },
      ],
    },
  ],
  paymentPlanDescription:
    "Secure your place with a $650 non-refundable deposit and pay the remaining balance in two installments.",
  paymentPlans: [
    {
      title: "Early Bird Price",
      price: "$2,259",
      featured: true,
      payments: [
        { label: "Deposit at booking", amount: "$650" },
        { label: "Payment 1 due October 31, 2026", amount: "$805" },
        { label: "Final payment due January 31, 2027", amount: "$804" },
      ],
      note: "Single room: add the $785 supplement to payment 1, making that payment $1,590 and the trip total $3,044.",
    },
    {
      title: "Standard Price",
      price: "$2,459",
      payments: [
        { label: "Deposit at booking", amount: "$650" },
        { label: "Payment 1 due October 31, 2026", amount: "$905" },
        { label: "Final payment due January 31, 2027", amount: "$904" },
      ],
      note: "Single room: add the $785 supplement to payment 1, making that payment $1,690 and the trip total $3,244.",
    },
  ],
  faqs: [
    {
      question: "Which airports should I fly into and out of?",
      answer: "Fly into Mactan-Cebu International Airport (CEB) for the start of the trip. The tour finishes in Boracay, so most travellers depart via Caticlan Airport (Boracay/MPH) or continue their Philippines adventure from there.",
    },
    {
      question: "Is canyoneering suitable for beginners?",
      answer: "Yes, beginners can join, but it is an active adventure with swimming, scrambling, and optional jumps. You can skip the bigger jumps if you prefer.",
    },
    {
      question: "What meals are included?",
      answer: "The trip includes 7 breakfasts and 2 lunches, including a local lechon lunch on the journey to Moalboal. Other meals are left flexible so you can explore local restaurants and beach spots with the group.",
    },
    {
      question: "What is the local currency?",
      answer: "The local currency is the Philippine peso (PHP). Cash is useful for smaller local spots, while cards are accepted in many hotels, restaurants, and larger businesses.",
    },
    {
      question: "Do I need a visa for the Philippines?",
      answer: "Entry requirements depend on your passport and can change, so check the latest official Philippines travel requirements before booking flights. Your passport should usually be valid for at least six months beyond your travel dates.",
    },
  ],
};
