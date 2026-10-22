// English content for the Gokarna Main Beach guide (SEO-facing copy).
import { place } from './place';

export const enFaq = [
  {
    q: 'Is there an entry fee for Gokarna Main Beach?',
    a: 'A current official entry-fee schedule was not found in the checked district source. Confirm any access restrictions and charges locally; parking, transport and private activities may cost separately.',
  },
  {
    q: 'When is the best time to visit?',
    a: 'October to March usually brings comfortable weather and less rain, making a visit easier. During the June–September monsoon, waves can be strong; take extra caution with swimming and boat activities.',
  },
  {
    q: 'What are the usual beach hours?',
    a: 'Google Maps showed 07:00–19:00 daily when checked on 22 October 2026. This is a third-party listing, not guaranteed access; follow local notices and weather restrictions.',
  },
  {
    q: 'Is it safe to swim?',
    a: 'Karnataka Tourism warns of strong currents at Main Beach. Follow local notices, flags and any lifeguard instructions. Calm-looking water or the models below do not establish swimming safety; if in doubt, stay ashore.',
  },
  {
    q: 'Are toilets and changing facilities available?',
    a: 'Current operation of public toilets and changing facilities could not be verified from the checked source. Ask locally before relying on them and confirm any charge.',
  },
  {
    q: 'Which railway station is useful if arriving by train?',
    a: 'The district guide identifies Kumta as a rail approach. Gokarna Road and Ankola are also station options to check for your train; confirm stops and onward transport with the operator before booking.',
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
    '@type': 'TouristAttraction',
    ...(attractionId ? { '@id': attractionId } : {}),
    name: 'Gokarna Main Beach',
    alternateName: ['Gokarna Beach', 'Gokarna Main Beach, Gokarna'],
    description:
      'Gokarna Main Beach is the central public beach of Gokarna town in Uttara Kannada, Karnataka, India — known for its long sandy shore, Arabian Sea sunsets and pilgrimage atmosphere near Mahabaleshwar Temple.',
    ...(pageUrl ? { url: pageUrl } : {}),
    image: [new URL(place.heroImage, site).toString()],
    hasMap: place.mapsUrl,
    sameAs: [place.mapsUrl],
    address: {
      '@type': 'PostalAddress',
      ...place.address,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: place.latitude,
      longitude: place.longitude,
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
