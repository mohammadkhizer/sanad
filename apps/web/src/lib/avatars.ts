export interface PresetAvatar {
  id: string;
  name: string;
  arabicLabel: string;
  description: string;
  url: string;
}

export const PRESET_AVATARS: PresetAvatar[] = [
  {
    id: 'crest-sanad-gold',
    name: 'Sanad Transmission Crest',
    arabicLabel: 'سند',
    description: 'Classical gold and emerald seal of verified isnad transmission',
    url: '/assets/splash-mark.png',
  },
  {
    id: 'crest-hadith',
    name: 'Hadith Sciences & Riwayah',
    arabicLabel: 'حديث',
    description: 'Traditional seal dedicated to Prophetic traditions and isnad chains',
    url: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'crest-fiqh',
    name: 'Jurisprudence & Legal Maxims',
    arabicLabel: 'فقه',
    description: 'Insignia of classical legal theory, Usul al-Fiqh, and comparative law',
    url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'crest-manuscript',
    name: 'Illuminated Manuscripts & Tahqiq',
    arabicLabel: 'تحقيق',
    description: 'Crest of sacred philology, manuscript verification, and text editing',
    url: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=400&q=80',
  },
];

