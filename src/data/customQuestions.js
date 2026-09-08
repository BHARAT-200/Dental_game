// ============================================================
// DEFAULT CUSTOM GAME QUESTIONS
// Endodontic Champion Question Set
// ============================================================
// These questions are used to pre-populate the Custom Game
// Question Builder. They are NOT part of the persistent
// Admin Question Bank.

// ============================================================
// ROUND 1 – Identify the Instrument Through Emojis
// ============================================================
export const defaultEmojiQuestions = [
  {
    emoji: '💉💦🦷',
    answer: 'Irrigation Syringe',
  },
  {
    emoji: '☝️➖🦷',
    answer: 'Finger Spreader',
  },
  {
    emoji: '🔨⬇️🦷',
    answer: 'Plugger',
  },
  {
    emoji: '〰️🪥🦷',
    answer: 'H-File',
  },
];

// ============================================================
// ROUND 2 – Identify the Instrument Through Function (MCQ)
// ============================================================
export const defaultFunctionQuestions = [
  {
    question: 'Which instruments are used for lateral condensation of gutta-percha?',
    options: [
      'Plugger and Lentulo spiral',
      'Finger spreader and Hand spreader',
      'H-file and K-file',
      'Gates-Glidden and Peeso reamer',
    ],
    correct: 1, // Finger spreader and Hand spreader
    explanation: '',
  },
  {
    question: 'Which instrument is primarily used for vertical compaction of gutta-percha?',
    options: [
      'Plugger',
      'Spreader',
      'Barbed broach',
      'K-file',
    ],
    correct: 0, // Plugger
    explanation: '',
  },
  {
    question: 'Which instrument is designed primarily for removing pulp tissue from the root canal?',
    options: [
      'Lentulo spiral',
      'Barbed broach',
      'Plugger',
      'Spreader',
    ],
    correct: 1, // Barbed broach
    explanation: '',
  },
  {
    question: 'Which instrument is commonly used to carry sealer into the root canal by rotating action?',
    options: [
      'H-file',
      'Finger spreader',
      'Lentulo spiral',
      'Plugger',
    ],
    correct: 2, // Lentulo spiral
    explanation: '',
  },
];

// ============================================================
// ROUND 3 – This or That
// ============================================================
export const defaultThisOrThatQuestions = [
  {
    question: 'Which has greater flexibility?',
    optionA: 'NiTi',
    optionB: 'Stainless Steel',
    correct: 'A', // NiTi
    explanation: '',
  },
  {
    question: 'Which is mainly used for lateral condensation?',
    optionA: 'Spreader',
    optionB: 'Plugger',
    correct: 'A', // Spreader
    explanation: '',
  },
  {
    question: 'Which instrument has a triangular cross-section?',
    optionA: 'K-file',
    optionB: 'K-reamer',
    correct: 'A', // K-file
    explanation: '',
  },
  {
    question: 'Which is used for vertical condensation?',
    optionA: 'Plugger',
    optionB: 'Spreader',
    correct: 'A', // Plugger
    explanation: '',
  },
];

// ============================================================
// ROUND 4 – Rapid Fire
// ============================================================
export const defaultRapidFireQuestions = [
  {
    question: 'Which instrument is used to enlarge the coronal third of the root canal by flaring?',
    answer: 'Gates-Glidden drill',
    timeLimit: 10,
  },
  {
    question: 'Which instrument is commonly used to prepare space for a post by removing dentin from the root canal?',
    answer: 'Peeso reamer',
    timeLimit: 10,
  },
  {
    question: 'Which instrument is used for apical preparation and has a flexible nickel-titanium design in modern rotary systems?',
    answer: 'Rotary NiTi file',
    timeLimit: 10,
  },
  {
    question: 'Which instrument is used for removing calcifications or dentin overlying the canal orifice?',
    answer: 'Ultrasonic endodontic tip',
    timeLimit: 10,
  },
  {
    question: 'Which instrument is used for the removal of broken instruments from the root canal?',
    answer: 'Masserann kit',
    timeLimit: 10,
  },
  {
    question: 'Which instrument is used to measure the diameter of the apical preparation?',
    answer: 'Apical gauge',
    timeLimit: 10,
  },
];

// ============================================================
// ROUND 5 – Riddles
// ============================================================
export const defaultRiddleQuestions = [
  {
    riddle: "I protect the crown but I'm not a king. I cover the root and help it cling. What am I?",
    answer: "cementum",
    hint: "I connect the PDL to the root surface."
  },
  {
    riddle: "I am the hardest substance your body makes, yet acid can dissolve me with ease. I coat the crown and gleam and shine — what am I?",
    answer: "enamel",
    hint: "96% mineral, formed by ameloblasts."
  },
  {
    riddle: "I have millions of tiny tunnels within me, running from the pulp to the enamel. What am I?",
    answer: "dentin",
    hint: "I contain dentinal tubules and am yellowish in color."
  },
  {
    riddle: "I am a living chamber inside every tooth. I carry blood and nerves, and when inflamed, I cause great pain. What am I?",
    answer: "pulp",
    hint: "Root canal treatment removes me."
  },
];

// ROUND 5 is left empty - will use admin bank or skip

// ============================================================
// ROUND 1 – Image-based Instrument Identification (PLACEHOLDER)
// ============================================================
// NOTE: These are placeholder questions. The actual images
// (imgq1a.jpg through imgq10b.jpg) need to be added to
// src/assets/round1-images/ for this to work.

export const defaultImageQuestions = [
  {
    image1: '/src/assets/round1-images/imgq1a.jpg',
    image2: '/src/assets/round1-images/imgq1b.jpg',
    answer: 'Gates-Glidden Drill',
  },
  {
    image1: '/src/assets/round1-images/imgq2a.jpg',
    image2: '/src/assets/round1-images/imgq2b.jpg',
    answer: 'Peeso Reamer',
  },
  {
    image1: '/src/assets/round1-images/imgq3a.jpg',
    image2: '/src/assets/round1-images/imgq3b.jpg',
    answer: 'Finger Spreader',
  },
  {
    image1: '/src/assets/round1-images/imgq4a.jpg',
    image2: '/src/assets/round1-images/imgq4b.jpg',
    answer: 'Hand Spreader',
  },
  {
    image1: '/src/assets/round1-images/imgq5a.jpg',
    image2: '/src/assets/round1-images/imgq5b.jpg',
    answer: 'Plugger',
  },
  {
    image1: '/src/assets/round1-images/imgq6a.jpg',
    image2: '/src/assets/round1-images/imgq6b.jpg',
    answer: 'Barbed Broach',
  },
  {
    image1: '/src/assets/round1-images/imgq7a.jpg',
    image2: '/src/assets/round1-images/imgq7b.jpg',
    answer: 'Lentulo Spiral',
  },
  {
    image1: '/src/assets/round1-images/imgq8a.jpg',
    image2: '/src/assets/round1-images/imgq8b.jpg',
    answer: 'H-File',
  },
  {
    image1: '/src/assets/round1-images/imgq9a.jpg',
    image2: '/src/assets/round1-images/imgq9b.jpg',
    answer: 'K-File',
  },
  {
    image1: '/src/assets/round1-images/imgq10a.jpg',
    image2: '/src/assets/round1-images/imgq10b.jpg',
    answer: 'Rotary NiTi File',
  },
];
