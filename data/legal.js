// Text of the Terms and Privacy pages. Keep the Privacy Policy in step with what the site does:
// update it if you add analytics, ads, cookies, a contact form or another outside service.

const UPDATED = '5 November 2026';
const EMAIL = 'sales@calculatorworlds.com';

const terms = {
  title: 'Terms and Conditions',
  updated: UPDATED,
  body: 'These terms apply when you use Calculator Worlds. By using the site, you agree to them. If you don’t agree, please don’t use the site.',
  sections: [
    {
      heading: 'Using the site',
      paragraphs: [
        'Calculator Worlds offers free online calculators, converters and generators. You don’t need an account to use them. We may change, add or remove tools at any time.',
      ],
    },
    {
      heading: 'Results are estimates',
      paragraphs: [
        'We try to keep our tools accurate, but we can’t promise that every result is correct or suitable for your situation. Please check important results yourself before relying on them.',
      ],
    },
    {
      heading: 'Not professional advice',
      paragraphs: ['Our tools give general information only and don’t replace advice from a qualified professional. In particular:'],
      items: [
        'Loan and mortgage results are estimates, not offers of credit. A lender’s actual figures may differ.',
        'BMI results are a general guide, not a medical diagnosis. Please talk to a healthcare professional about your health.',
        'Currency rates come from an outside provider, are updated about once a day and may differ from the rate your bank or exchange service offers.',
      ],
    },
    {
      heading: 'Generated passwords and QR codes',
      paragraphs: [
        'You’re responsible for how you use anything you generate here, including keeping passwords safe. Before sharing a QR code, please test it and check that it leads where you intend.',
      ],
    },
    {
      heading: 'Acceptable use',
      paragraphs: ['When using the site, you agree not to:'],
      items: [
        'Break any law or use the tools to mislead or harm others, for example by creating QR codes that lead to scams or harmful websites.',
        'Interfere with the site or try to disrupt it, including by overloading it with automated requests.',
      ],
    },
    {
      heading: 'Our content',
      paragraphs: [
        'The site’s name, design and text belong to Calculator Worlds, and you may not copy them without permission. Some parts of the site use third-party software and services under their own licenses and terms. You’re free to use the results and QR codes you generate.',
      ],
    },
    {
      heading: 'Other websites and services',
      paragraphs: [
        'The site relies on some outside services and may link to other websites. We don’t control them and aren’t responsible for their content, availability or practices.',
      ],
    },
    {
      heading: 'No warranty',
      paragraphs: [
        'The site is provided “as is” and “as available”, without warranties of any kind, to the extent the law allows. We don’t promise that it will always be available or free of errors.',
      ],
    },
    {
      heading: 'Limit of liability',
      paragraphs: [
        'To the extent the law allows, Calculator Worlds isn’t liable for any loss or damage arising from your use of the site or from relying on its results. Nothing in these terms removes any rights you have by law that can’t be excluded.',
      ],
    },
    {
      heading: 'Changes to these terms',
      paragraphs: [
        'We may update these terms from time to time and will change the date at the top of this page when we do. Continuing to use the site after a change means you accept the updated terms.',
      ],
    },
    {
      heading: 'Contact',
      paragraphs: [`If you have a question about these terms, email us at ${EMAIL}.`],
    },
  ],
};

const privacy = {
  title: 'Privacy Policy',
  updated: UPDATED,
  body: 'This policy explains what happens to your information when you use Calculator Worlds. The short version: our tools run in your browser, and you don’t need an account to use them.',
  sections: [
    {
      heading: 'What you enter into our tools',
      paragraphs: [
        'Calculations and conversions run in your browser. The numbers and dates you enter, the text you turn into a QR code, and the passwords and random numbers you generate aren’t sent to us or stored by us. A QR code you download is saved only on your device.',
      ],
    },
    {
      heading: 'Searching the site',
      paragraphs: [
        'Search results are worked out in your browser, but the words you search for become part of the page address. That address is sent to our hosting provider when the page loads, so your search words may appear in its logs.',
      ],
    },
    {
      heading: 'Cookies, analytics and advertising',
      paragraphs: ['The site doesn’t set its own cookies, and it doesn’t currently use analytics or advertising. If that changes, we’ll update this policy.'],
    },
    {
      heading: 'Outside services',
      paragraphs: [
        'Like any website, the site needs some outside services to work. When your browser connects to them, they receive technical information such as your IP address and browser details, and they handle it under their own privacy policies:',
      ],
      items: [
        'Vercel hosts the site, so it receives requests for each page you visit, including the page address.',
        'Google Fonts provides the site’s font, so your browser contacts Google when pages load.',
        'ExchangeRate-API provides exchange rates. Your browser contacts it only when you open the Currency Converter. It doesn’t receive the amounts or currencies you choose, because the conversion happens in your browser.',
      ],
      links: [
        { label: 'Vercel privacy policy', href: 'https://vercel.com/legal/privacy-policy' },
        { label: 'Google privacy policy', href: 'https://policies.google.com/privacy' },
        { label: 'ExchangeRate-API terms and privacy information', href: 'https://www.exchangerate-api.com/terms' },
      ],
    },
    {
      heading: 'If you email us',
      paragraphs: ['If you contact us by email, we’ll use your email address and message to reply to you, and keep them only as long as we need them for that.'],
    },
    {
      heading: 'Children',
      paragraphs: ['The site isn’t aimed at children under 13, and we don’t knowingly collect their personal information. If you think a child has sent us personal information, please contact us so we can delete it.'],
    },
    {
      heading: 'Your rights',
      paragraphs: ['Depending on where you live, you may have rights over your personal information, such as asking to see or delete it. To make a request about information we hold, such as an email you sent us, contact us at the address below.'],
    },
    {
      heading: 'Changes to this policy',
      paragraphs: ['We may update this policy from time to time and will change the date at the top of this page when we do.'],
    },
    {
      heading: 'Contact',
      paragraphs: [`If you have a question about your privacy, email us at ${EMAIL}.`],
    },
  ],
};

module.exports = { terms, privacy };
