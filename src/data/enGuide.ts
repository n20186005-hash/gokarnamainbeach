// English content for the Gokarna Main Beach guide (SEO-facing copy).
import { place, sourceLinks } from './place';

export const enFaq = [
  {
    q: 'Is there an entry fee for Gokarna Main Beach?',
    a: 'Main Beach is a public beach, and general entry is free according to Karnataka Tourism’s beach guide. Parking, private activities or transport may cost separately; confirm rates on site.',
  },
  {
    q: 'When is the best time to visit?',
    a: 'October to March usually brings comfortable weather and less rain, making a visit easier. During the June–September monsoon, waves can be strong; take extra caution with swimming and boat activities.',
  },
  {
    q: 'What are the usual beach hours?',
    a: 'The Google Maps listing generally shows about 7 AM to 7 PM. This is variable operational information; follow local notices on special days, festivals or weather conditions.',
  },
  {
    q: 'Is it safe to swim?',
    a: 'Karnataka Tourism’s current Gokarna guide warns that Main Beach is not ideal for swimming because of strong currents. Wave and current conditions change daily; follow lifeguards’ advice, warning flags and local restrictions — if in doubt, do not enter the water.',
  },
  {
    q: 'Are toilets and changing facilities available?',
    a: 'Karnataka Tourism’s published beach guide indicates public toilets and changing facilities near Main Beach. Their operation and cleanliness vary over time.',
  },
  {
    q: 'Which railway station is useful if arriving by train?',
    a: 'Gokarna Road railway station is about 10 km from town. Kumta and Ankola are alternative stations; from there you can reach Gokarna town by local bus, auto or taxi.',
  },
  {
    q: 'What is the connection between Main Beach and Mahabaleshwar Temple?',
    a: 'Gokarna is a major Shaiva pilgrimage town. In local religious practice some devotees bathe at Main Beach before the temple darshan. It is a religious custom, not mandatory for all visitors.',
  },
];

export function enAttractionSchema(site: string | undefined) {
  const pageUrl = site ? new URL('/en/', site).toString() : undefined;
  const attractionId = site ? new URL('/en/#attraction', site).toString() : undefined;
  return {
    '@context': 'https://schema.org',
    '@type': ['TouristAttraction', 'LocalBusiness'],
    ...(attractionId ? { '@id': attractionId } : {}),
    name: 'Gokarna Main Beach',
    alternateName: ['Gokarna Beach', 'Gokarna Main Beach, Gokarna'],
    description:
      'Gokarna Main Beach is the central public beach of Gokarna town in Uttara Kannada, Karnataka, India — known for its long sandy shore, Arabian Sea sunsets and pilgrimage atmosphere near Mahabaleshwar Temple.',
    ...(pageUrl ? { url: pageUrl } : {}),
    image: [place.heroImage],
    isAccessibleForFree: true,
    hasMap: place.mapsUrl,
    sameAs: [place.mapsUrl, sourceLinks.stateTourism, sourceLinks.nationalTourism],
    address: {
      '@type': 'PostalAddress',
      ...place.address,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: place.latitude,
      longitude: place.longitude,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '07:00',
        closes: '19:00',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: place.rating,
      ratingCount: place.ratingCount,
      bestRating: 5,
      worstRating: 1,
    },
  };
}

export function enFaqSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: enFaq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}
