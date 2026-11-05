// Central data file: add or edit tools here and the pages update automatically.
// All hrefs end with a trailing slash so they work on static hosting (GitHub Pages).

const categoryCards = [
  {
    title: 'Browse Calculators',
    text: 'Explore a wide range of online calculators',
    href: '/calculators/',
    color: 'indigo',
    icon: 'calculator',
  },
  {
    title: 'Browse Generators',
    text: 'Generate QR codes, numbers, notes & more',
    href: '/generators/',
    color: 'green',
    icon: 'qr',
  },
  {
    title: 'Browse Converters',
    text: 'Convert units, currency, length & more',
    href: '/converters/',
    color: 'orange',
    icon: 'convert',
  },
  {
    title: 'Browse All Tools',
    text: 'All calculators, converters & generators',
    href: '/tools/',
    color: 'pink',
    icon: 'folder',
  },
];

// category: Math | Financial | Health | Converter  (drives the label colour)
const popularTools = [
  { name: 'Standard Calculator', slug: 'standard-calculator', category: 'Math', color: 'blue', icon: 'calculator' },
  { name: 'Percentage Calculator', slug: 'percentage-calculator', category: 'Math', color: 'green', icon: 'percent' },
  { name: 'Loan Calculator', slug: 'loan-calculator', category: 'Financial', color: 'green', icon: 'bank' },
  { name: 'BMI Calculator', slug: 'bmi-calculator', category: 'Health', color: 'blue', icon: 'building' },
  { name: 'Time Converter', slug: 'time-converter', category: 'Converter', color: 'orange', icon: 'clock' },
  { name: 'Age Calculator', slug: 'age-calculator', category: 'Math', color: 'indigo', icon: 'age' },
  { name: 'Mortgage Calculator', slug: 'mortgage-calculator', category: 'Financial', color: 'blue', icon: 'home' },
  { name: 'Currency Converter', slug: 'currency-converter', category: 'Converter', color: 'orange', icon: 'currency' },
  { name: 'Temperature Converter', slug: 'temperature-converter', category: 'Converter', color: 'orange', icon: 'thermo' },
  { name: 'Length Converter', slug: 'length-converter', category: 'Converter', color: 'orange', icon: 'ruler' },
  { name: 'Weight Converter', slug: 'weight-converter', category: 'Converter', color: 'indigo', icon: 'weight' },
];

const popularSearches = [
  { label: 'Percentage', q: 'percentage' },
  { label: 'Loan Calculator', q: 'loan' },
  { label: 'BMI Calculator', q: 'bmi' },
  { label: 'Age Calculator', q: 'age' },
];

const navLinks = [
  { label: 'Home', href: '/' },
  {
    label: 'Types of Calculator',
    href: '/calculators/',
    children: [
      { label: 'Math', href: '/calculators/math/' },
      { label: 'Financial', href: '/calculators/financial/' },
      { label: 'Health', href: '/calculators/health/' },
      { label: 'Converters', href: '/converters/' },
    ],
  },
  { label: 'Generators', href: '/generators/' },
  { label: 'About', href: '/about/' },
];

// Everything searchable (popular tools plus a few extra generators)
const allTools = [
  ...popularTools,
  { name: 'QR Code Generator', slug: 'qr-code-generator', category: 'Generator', color: 'green', icon: 'qr' },
  { name: 'Random Number Generator', slug: 'random-number-generator', category: 'Generator', color: 'green', icon: 'qr' },
  { name: 'Password Generator', slug: 'password-generator', category: 'Generator', color: 'green', icon: 'qr' },
];

module.exports = { categoryCards, popularTools, popularSearches, navLinks, allTools };
