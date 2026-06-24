import type { Parish, JobType, DayAvailability } from '@/types';

export const APP_NAME = 'StudentShift';
export const APP_TAGLINE = 'Find your first job';

export const MIN_AGE = 16;
export const MAX_AGE = 24;

export type SchoolRegion = 'Jersey' | 'Guernsey' | 'Isle of Man' | 'UK';
export const SCHOOL_REGIONS: SchoolRegion[] = ['Jersey', 'Guernsey', 'Isle of Man', 'UK'];

export const SCHOOLS_BY_REGION: Record<SchoolRegion, string[]> = {
  'Jersey': ['Grainville School', 'Hautlieu', 'Highlands College', 'JCG', 'Victoria College', 'Beaulieu', 'De La Salle'],
  'Guernsey': ['The Sixth Form Centre', 'The Guernsey Institute', 'Elizabeth College', "The Ladies' College"],
  'Isle of Man': ['Ballakermeen High School', "St Ninian's High School", 'Castle Rushen High School', 'Queen Elizabeth II High School', 'Ramsey Grammar School'],
  'UK': [
    'Brampton Manor Academy', 'City of London School', 'City of London School for Girls', 'Westminster School',
    "St Paul's School", 'Dulwich College', "King's College School", 'Eton College', 'Harrow School',
    'Hampton School', 'Latymer Upper School', 'Highgate School', 'University College School',
    'North London Collegiate School', 'South Hampstead High School', 'Henrietta Barnett School',
    "Queens' School (Watford)", 'Winchester College', 'Tonbridge School', 'Sevenoaks School',
    'Charterhouse', 'Cranleigh School', 'Brighton College', 'Lancing College', 'Eastbourne College',
    'St Leonards-Mayfield School', 'Reigate Grammar School', 'Guildford Grammar School', 'Reading School',
    'Kendrick School', "Dr Challoner's Grammar School", 'Chesham Grammar School', 'Aylesbury Grammar School',
    'Wycombe Abbey', 'Farnborough Sixth Form College', 'Peter Symonds College', 'Barton Peveril Sixth Form College',
    'Brockenhurst College', 'Exeter College', 'Truro and Penwith College', 'Richard Huish College',
    'City of Bristol College', 'Clifton College', 'Millfield School', 'Sherborne School', 'Marlborough College',
    'Cheltenham College', "Cheltenham Ladies' College", 'Dean Close School', 'Hills Road Sixth Form College',
    'Long Road Sixth Form College', 'Cambridge Regional College', 'West Suffolk College', 'City College Norwich',
    'Norwich School', 'King Edward VI School (Bury St Edmunds)', 'Peterborough College',
    'Huntingdonshire Regional College', 'Nottingham College', 'New College Nottingham', 'Leicester College',
    'Loughborough College', 'Derby College', 'Lincoln College', 'Ratcliffe College', 'Uppingham School',
    'Repton School', 'Oakham School', 'Birmingham Metropolitan College', 'Solihull College', 'Halesowen College',
    'King Edward VI College Stourbridge', 'Shrewsbury School', 'Malvern College', 'Bromsgrove School',
    'Rugby School', 'Warwickshire College', 'Coventry College', 'Manchester Grammar School',
    'Manchester High School for Girls', "Withington Girls' School", 'Cheadle Hulme School',
    'Altrincham Grammar School for Boys', 'Altrincham Grammar School for Girls', 'Sale Grammar School',
    'Loreto College (Manchester)', 'Xaverian College', 'Holy Cross College (Bury)', 'Bury College',
    'Bolton College', 'Winstanley College', 'Runshaw College', 'Preston College', 'Blackburn College',
    'Burnley College', 'Liverpool College', "Merchant Taylors' School (Crosby)", 'Birkenhead School',
    'Wirral Metropolitan College', 'Carmel College (St Helens)', 'Stokesley School', 'Harrogate Grammar School',
    "Skipton Girls' High School", "Ermysted's Grammar School", 'Bradford College', 'Leeds City College',
    'Greenhead College', 'Wakefield College', 'Barnsley College', 'Sheffield College',
    'Longley Park Sixth Form College', 'King Edward VII School (Sheffield)', 'Notre Dame High School (Sheffield)',
    'Hymers College', 'Hull College', 'Wilberforce College', 'York College', 'Scarborough Sixth Form College',
    'Newcastle College', 'Gateshead College', 'Sunderland College', 'Durham Johnston School', 'New College Durham',
    'Queen Elizabeth Sixth Form College (Darlington)', 'Northumberland College', 'Royal Grammar School Newcastle',
    "Dame Allan's School", "George Heriot's School", 'The Edinburgh Academy', 'Fettes College',
    "Stewart's Melville College", 'Glasgow Academy', "Hutchesons' Grammar School", 'High School of Glasgow',
    'Lomond School', 'Rydal Penrhos School', 'Christ College Brecon', 'Coleg y Cymoedd',
    'Gower College Swansea', 'Cardiff and Vale College', 'Coleg Sir Gar',
  ],
};

export const SCHOOLS: string[] = [
  ...SCHOOLS_BY_REGION['Jersey'],
  ...SCHOOLS_BY_REGION['Guernsey'],
  ...SCHOOLS_BY_REGION['Isle of Man'],
  'Other',
];

export const ALL_SCHOOLS: string[] = [
  ...SCHOOLS_BY_REGION['Jersey'],
  ...SCHOOLS_BY_REGION['Guernsey'],
  ...SCHOOLS_BY_REGION['Isle of Man'],
  ...SCHOOLS_BY_REGION['UK'],
  'Not currently studying',
  'Other',
];

export const SCHOOL_EMAIL_DOMAINS: Record<string, string[]> = {
  'Hautlieu': ['hautlieu.sch.je'],
  'Highlands College': ['hc.ac.je'],
  'JCG': ['jcg.sch.je'],
  'Victoria College': ['vcj.sch.je'],
  'Beaulieu': ['beaulieu.jersey.sch.uk'],
  'De La Salle': ['dls-jersey.co.uk'],
  'The Sixth Form Centre': ['education.gg'],
  'The Guernsey Institute': ['tgi.ac.gg'],
  'Elizabeth College': ['ecjs.gg', 'elizabethcollege.gg'],
  "The Ladies' College": ['ladiescollege.ac.gg'],
  'Ballakermeen High School': ['bhs.sch.im', 'sch.im'],
  "St Ninian's High School": ['sch.im'],
  'Castle Rushen High School': ['sch.im'],
  'Queen Elizabeth II High School': ['sch.im'],
  'Ramsey Grammar School': ['sch.im'],
};

export const PARISHES: Parish[] = [
  'Grouville', 'St. Brelade', 'St. Clement', 'St. Helier', 'St. John',
  'St. Lawrence', 'St. Martin', 'St. Mary', 'St. Ouen', 'St. Peter', 'St. Saviour', 'Trinity',
];

export const GUERNSEY_PARISHES: string[] = [
  'Castel', 'Forest', 'St Andrew', 'St Martin', 'St Peter Port',
  'St Pierre du Bois', 'St Sampson', 'St Saviour', 'Torteval', 'Vale', 'Alderney', 'Sark',
];

export const IOM_SHEADINGS: Record<string, string[]> = {
  'Ayre': ['Andreas', 'Bride', 'Lezayre'],
  'Garff': ['Lonan', 'Maughold'],
  'Glenfaba': ['German', 'Patrick'],
  'Michael': ['Ballaugh', 'Jurby', 'Michael'],
  'Middle': ['Braddan', 'Marown', 'Onchan', 'Santon', 'Douglas'],
  'Rushen': ['Arbory', 'Malew', 'Rushen'],
};

export const IOM_SHEADING_NAMES: string[] = Object.keys(IOM_SHEADINGS);
export const IOM_PARISHES: string[] = Object.values(IOM_SHEADINGS).flat();

export function getParishOptionsForRegion(region: string | null): string[] {
  switch (region) {
    case 'Jersey': return PARISHES;
    case 'Guernsey': return GUERNSEY_PARISHES;
    case 'Isle of Man': return IOM_SHEADING_NAMES;
    default: return [];
  }
}

// Determine which region a parish belongs to
export function getRegionForParish(parish: string): string | null {
  if (PARISHES.includes(parish)) return 'Jersey';
  if (GUERNSEY_PARISHES.includes(parish)) return 'Guernsey';
  if (IOM_PARISHES.includes(parish) || IOM_SHEADING_NAMES.includes(parish)) return 'Isle of Man';
  return null;
}

// Get the sheading name for an IoM parish
export function getSheadingForParish(parish: string): string | null {
  for (const [sheading, parishes] of Object.entries(IOM_SHEADINGS)) {
    if (parishes.includes(parish)) return sheading;
  }
  if (IOM_SHEADING_NAMES.includes(parish)) return parish;
  return null;
}

export const JOB_TYPES: { value: JobType; label: string; description: string }[] = [
  { value: 'part_time', label: 'Part-time', description: 'Regular hours each week' },
  { value: 'temporary', label: 'Temporary', description: 'Fixed period of work' },
  { value: 'seasonal', label: 'Seasonal', description: 'Summer, Christmas, etc.' },
  { value: 'one_off', label: 'One-off', description: 'Single day or event' },
  { value: 'zero_hours', label: 'Zero hours', description: 'Flexible, work when needed' },
];

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  part_time: 'Part-time',
  temporary: 'Temporary',
  seasonal: 'Seasonal',
  one_off: 'One-off',
  zero_hours: 'Zero hours',
};

export const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
export type DayOfWeek = typeof DAYS_OF_WEEK[number];

export const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
  friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
};

export const TIME_SLOTS: { value: DayAvailability; label: string }[] = [
  { value: 'morning', label: 'Morning (8am–12pm)' },
  { value: 'afternoon', label: 'Afternoon (12pm–5pm)' },
  { value: 'evening', label: 'Evening (5pm–9pm)' },
  { value: 'all_day', label: 'All day' },
];

export const COMMON_SKILLS = [
  'Customer service', 'Communication', 'Teamwork', 'Time management', 'Cash handling',
  'Food preparation', 'Cleaning', 'Stock management', 'Computer skills', 'Social media',
  'Photography', 'Driving licence', 'First aid', 'Lifeguard', 'Languages',
  'Babysitting', 'Pet care', 'Gardening', 'DIY', 'Sports coaching',
];

export const APPLICATION_STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#F59E0B', bgColor: '#FEF3C7' },
  reviewed: { label: 'Reviewed', color: '#3B82F6', bgColor: '#DBEAFE' },
  shortlisted: { label: 'Shortlisted', color: '#8B5CF6', bgColor: '#EDE9FE' },
  rejected: { label: 'Not selected', color: '#6B7280', bgColor: '#F3F4F6' },
  hired: { label: 'Hired!', color: '#10B981', bgColor: '#D1FAE5' },
  withdrawn: { label: 'Withdrawn', color: '#6B7280', bgColor: '#F3F4F6' },
};

export const COLORS = {
  primary: '#2563EB', primaryLight: '#3B82F6', primaryDark: '#1D4ED8', primaryBg: '#EFF6FF',
  secondary: '#F97316', secondaryLight: '#FB923C', secondaryDark: '#EA580C', secondaryBg: '#FFF7ED',
  success: '#10B981', successBg: '#D1FAE5',
  warning: '#F59E0B', warningBg: '#FEF3C7',
  error: '#EF4444', errorBg: '#FEE2E2',
  background: '#F9FAFB', surface: '#FFFFFF', border: '#E5E7EB',
  text: '#111827', textSecondary: '#6B7280', textLight: '#9CA3AF',
  tierStarter: '#9CA3AF', tierDeveloping: '#F59E0B', tierReady: '#3B82F6', tierWorkReady: '#10B981',
};

export const REGIONS = ['Jersey', 'Guernsey', 'Isle of Man', 'UK'] as const;
export type Region = typeof REGIONS[number];

export const PORTFOLIO_POST_TYPES = [
  { value: 'work_experience', label: 'Work experience' },
  { value: 'volunteering', label: 'Volunteering' },
  { value: 'education', label: 'Education' },
  { value: 'achievement', label: 'Achievement' },
  { value: 'project', label: 'Project' },
  { value: 'sports', label: 'Sports' },
  { value: 'other', label: 'Other' },
] as const;
