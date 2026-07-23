export const CAMPUS_DEFS = [
	{
		code: 'NW',
		name: 'Northwood Campus',
		address: 'Plot 12, Block 7, Clifton, Karachi',
		geoLat: 24.8138,
		geoLng: 67.0299,
	},
	{
		code: 'RV',
		name: 'Riverside Campus',
		address: 'Main Boulevard, DHA Phase 6, Lahore',
		geoLat: 31.4697,
		geoLng: 74.4084,
	},
	{
		code: 'CG',
		name: 'Clifton Gate Campus',
		address: 'Street 9, F-10 Markaz, Islamabad',
		geoLat: 33.6844,
		geoLng: 73.0479,
	},
] as const;

export const GRADE_NAMES = [
	'Grade 1',
	'Grade 2',
	'Grade 3',
	'Grade 4',
	'Grade 5',
	'Grade 6',
	'Grade 7',
	'Grade 8',
	'Grade 9',
	'Grade 10',
	'Grade 11',
	'Grade 12',
] as const;

export const SUBJECT_DEFS = [
	{ code: 'ENG', name: 'English', description: 'Language arts and literature' },
	{ code: 'URD', name: 'Urdu', description: 'Urdu language and composition' },
	{ code: 'MTH', name: 'Mathematics', description: 'Core mathematics' },
	{ code: 'SCI', name: 'General Science', description: 'Integrated science' },
	{ code: 'PHY', name: 'Physics', description: 'Physics for senior grades' },
	{ code: 'CHM', name: 'Chemistry', description: 'Chemistry for senior grades' },
	{ code: 'BIO', name: 'Biology', description: 'Biology and health sciences' },
	{ code: 'ISL', name: 'Islamiat', description: 'Islamic studies' },
	{ code: 'PAK', name: 'Pakistan Studies', description: 'History and civics' },
	{ code: 'CMP', name: 'Computer Science', description: 'Computing and digital literacy' },
	{ code: 'ART', name: 'Art & Design', description: 'Visual arts' },
	{ code: 'PE', name: 'Physical Education', description: 'Sports and fitness' },
] as const;

export const FIRST_NAMES_MALE = [
	'Ahmed',
	'Ali',
	'Hamza',
	'Usman',
	'Bilal',
	'Omar',
	'Hassan',
	'Zain',
	'Rayyan',
	'Ibrahim',
	'Arham',
	'Saad',
	'Faizan',
	'Danish',
	'Rohan',
	'James',
	'Ethan',
	'Noah',
	'Liam',
	'Adam',
] as const;

export const FIRST_NAMES_FEMALE = [
	'Ayesha',
	'Fatima',
	'Zara',
	'Mariam',
	'Hira',
	'Sana',
	'Amna',
	'Iqra',
	'Mahnoor',
	'Anaya',
	'Sofia',
	'Emma',
	'Olivia',
	'Ava',
	'Maya',
	'Layla',
	'Nadia',
	'Sara',
	'Hana',
	'Rania',
] as const;

export const LAST_NAMES = [
	'Khan',
	'Malik',
	'Sheikh',
	'Ahmed',
	'Ali',
	'Hussain',
	'Raza',
	'Butt',
	'Chaudhry',
	'Qureshi',
	'Siddiqui',
	'Hashmi',
	'Mirza',
	'Baig',
	'Shah',
	'Patel',
	'Sharma',
	'Kapoor',
	'Bennett',
	'Reyes',
	'Kim',
	'Novak',
	'Okafor',
	'Ahmedzai',
] as const;

export const CITIES = [
	{ city: 'Karachi', state: 'Sindh', postalCode: '75500' },
	{ city: 'Lahore', state: 'Punjab', postalCode: '54000' },
	{ city: 'Islamabad', state: 'ICT', postalCode: '44000' },
	{ city: 'Rawalpindi', state: 'Punjab', postalCode: '46000' },
	{ city: 'Multan', state: 'Punjab', postalCode: '60000' },
] as const;

export const OCCUPATIONS = [
	'Software engineer',
	'Physician',
	'Chartered accountant',
	'Business owner',
	'Teacher',
	'Bank manager',
	'Architect',
	'Marketing director',
	'Civil engineer',
	'Pharmacist',
] as const;

export const PREVIOUS_SCHOOLS = [
	'Beaconhouse School System',
	'City School',
	'Roots Millennium',
	'Lahore Grammar School',
	'Bay View Academy',
	'International School of Islamabad',
	'The Lyceum',
] as const;

export const TEACHER_QUALIFICATIONS = [
	'B.Ed',
	'M.Ed',
	'M.Sc Education',
	'MA English Literature',
	'MA Mathematics',
	'PhD Physics',
	'B.Sc + PGCE',
] as const;

export const TEACHER_SPECIALIZATIONS = [
	'Primary homeroom',
	'Secondary mathematics',
	'English language',
	'Science laboratory',
	'Urdu literature',
	'Computer science',
	'Physical education',
	'Arts & crafts',
] as const;

export const ATTENDANCE_WEIGHTS = [
	{ value: 'present' as const, weight: 88 },
	{ value: 'late' as const, weight: 5 },
	{ value: 'absent' as const, weight: 4 },
	{ value: 'excused' as const, weight: 2 },
	{ value: 'left_early' as const, weight: 1 },
];

export const SEED_STUDENT_CODE_PREFIX = 'SEED-';
