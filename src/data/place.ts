// SEO 站点名格式：景点名称 + 城市 + 旅游指南
export const SITE_NAME = 'ಗೋಕರ್ಣ ಮುಖ್ಯ ಕಡಲತೀರ, ಗೋಕರ್ಣ — ಪ್ರವಾಸಿ ಮಾರ್ಗದರ್ಶಿ';

export const place = {
  name: 'ಗೋಕರ್ಣ ಮುಖ್ಯ ಕಡಲತೀರ',
  alternateName: 'Gokarna Main Beach',
  // Entity-binding fields (match the production domain gokarnamainbeach.com)
  fullNameEn: 'Gokarna Main Beach',
  shortNameEn: 'Gokarna Main Beach',
  cityEn: 'Gokarna',
  stateEn: 'Karnataka',
  countryEn: 'India',
  countryCode: 'IN',
  domainName: 'gokarnamainbeach.com',
  plusCode: 'G8V7+FF Gokarna, Karnataka',
  region: 'ಗೋಕರ್ಣ, ಉತ್ತರ ಕನ್ನಡ, ಕರ್ನಾಟಕ',
  addressDisplay: '15, ಬೆಲೆಹಿಟ್ಟಲ್ ರಸ್ತೆ, ದಂಡೇಬಾಗ್, ಗೋಕರ್ಣ, ಕರ್ನಾಟಕ 581326',
  address: {
    streetAddress: '15, Belehittal Rd, Dandebagh',
    addressLocality: 'Gokarna',
    addressRegion: 'Karnataka',
    postalCode: '581326',
    addressCountry: 'IN',
  },
  latitude: 14.543854,
  longitude: 74.313712,
  rating: 4.4,
  ratingCount: 35614,
  opening: '07:00–19:00',
  mapsUrl: 'https://maps.app.goo.gl/UnysVUHyiDeTVxnt5',
  heroImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Gokarna_Main_Beach.jpg/1280px-Gokarna_Main_Beach.jpg',
  nearbyLandmarks: ['Mahabaleshwar Temple', 'Om Beach'],
} as const;

export const sourceLinks = {
  localGovernment: 'https://rdpr.karnataka.gov.in/',
  district: 'https://uttarakannada.nic.in/en/tourist-place/gokarna/',
  stateTourism: 'https://karnatakatourism.org/en/experiences/gokarna',
  stateBeachGuide: 'https://karnatakatourism.org/en/blogs/gokarna-beaches-guide',
  nationalTourism: 'https://tourism.gov.in/',
} as const;
