// Page copy for the info pages, the tool pages and the listing pages.
// Source: the "Calculator Worlds Google Docs" folder in Google Drive (one doc per page).
// The Terms and Privacy pages live in data/legal.js.

const EMAIL = 'sales@calculatorworlds.com';

// Info pages, served at /<key>/. Rendered by views/page.ejs.
const infoPages = {
  about: {
    title: 'About Us',
    body: 'Calculator Worlds is a free collection of online calculators, converters, and generators. We bring everyday tools together so you can check a calculation, compare an estimate, change units, or generate something useful from your browser. Start with the tool that fits your task, enter your own values, and use the result to take your next step.',
    sections: [
      {
        heading: 'What you can do here',
        paragraphs: [
          'Use the Standard Calculator to evaluate an expression or switch between degrees and radians for trigonometry. The Percentage Calculator helps you find a percentage, compare two values, or work out how much a figure increased or decreased. The Age Calculator measures the calendar time between a date of birth and a date you select.',
          'The Loan Calculator estimates recurring payments or a lump sum due at maturity. The Mortgage Calculator estimates a monthly payment using a fixed interest rate, with room to account for property tax, insurance, and HOA fees. The BMI Calculator uses your height and weight to calculate BMI and show its adult category.',
        ],
      },
      {
        heading: 'Convert a measurement or generate a result',
        paragraphs: [
          'Our converters cover time, currency, temperature, length, and weight. Enter a value, select its current unit, and choose the unit you want. You can use them to change a recipe from ounces to grams, understand a temperature given on another scale, or estimate a price in another currency.',
          'The QR Code Generator turns text or a link into a PNG you can download. The Random Number Generator draws values within a range you set, with an option to leave out repeats. The Password Generator lets you choose a length and the character types to include.',
        ],
      },
      {
        heading: 'Choose the right tool for your question',
        paragraphs: [
          'Search by the name of a tool or browse the categories under All Tools. If you have two prices and want to know how much one changed from the other, start with Percentage Change. If you only need to know how far apart the two values are, the Percentage Difference option compares them using their average.',
          'Each tool page explains the inputs, how the tool uses them, and what appears in the result. The How to Use Calculators page covers common controls and gives you a starting point if you are unsure which field to fill in.',
        ],
      },
      {
        heading: 'How to use the results',
        paragraphs: [
          'The tools work in your browser without an account. Check the units and assumptions before you use a result. A currency estimate can differ from your bank’s rate. A mortgage estimate changes when your loan terms or housing costs change. Adult BMI gives a broad reference point and has limits as a measure of individual health. See our Privacy Policy for details on how the site handles tool inputs, searches, and email.',
        ],
      },
      {
        heading: 'Get in touch',
        paragraphs: [
          `Email ${EMAIL} to suggest a tool or report a problem. If you are writing about an existing tool, tell us its name, the units or settings you used, and what you expected to happen. A short example with sample numbers can make the issue easier to reproduce.`,
        ],
      },
    ],
  },

  contact: {
    title: 'Contact Us',
    body: `Email ${EMAIL} to contact Calculator Worlds. Use this address for questions about the website, suggestions for new tools, feedback on existing calculators, and reports of problems. Include the name of the tool or page if you know it so we can start with the right part of the site.`,
    sections: [
      {
        heading: 'Ask a question about a tool',
        paragraphs: [
          'Tell us what you are trying to calculate and where you got stuck. If you are unsure which tool to use, describe the starting information you have and the result you want. For example, say whether you are comparing two prices, estimating a recurring loan payment, or converting a value from one unit to another. The unit, currency, or date format can make a difference.',
        ],
      },
      {
        heading: 'Report a calculation or display issue',
        paragraphs: [
          'Include the page URL, the values you entered, and the exact result or error the site displayed. Tell us what you expected and how you worked out that result, if you know. For a converter, include the units in both menus. For a loan calculator, mention the interest rate and the repayment or compounding settings.',
          'If the page does not load, a button is missing, or the layout is hard to use, tell us which browser and device you are using. Add the steps that lead to the issue and whether it happens every time. If a screenshot helps, crop it to the relevant part of the tool.',
        ],
      },
      {
        heading: 'Suggest a new calculator or improvement',
        paragraphs: [
          'Describe the task you would like to complete on Calculator Worlds. A short example is useful: which values would you enter, what units would you use, and what result should the tool return? If a similar tool already exists on the site, explain which field, setting, or conversion you would add. You can also tell us if a label or instruction caused confusion while using an existing tool.',
        ],
      },
      {
        heading: 'Send sample information',
        paragraphs: [
          'Use made-up numbers or dates if the original inputs contain personal information. You can usually reproduce a problem without sending a real date of birth, a private link, a generated password, or any financial account details. Remove personal information from screenshots before attaching them. Our Privacy Policy explains how we handle the email address and message you choose to send us.',
        ],
      },
      {
        heading: 'Questions about privacy or site terms',
        paragraphs: [
          'If you are contacting us about the Privacy Policy or Terms and Conditions, name the relevant page and describe the question in your message. If your request concerns an earlier email, give enough context for us to find that correspondence without including unrelated personal details. You can use the same contact address for these requests.',
        ],
      },
      {
        heading: 'Find help on the website',
        paragraphs: [
          `The How to Use Calculators page explains how to enter values, choose units, and read a result. Our FAQs cover common questions about free access, browser-based tools, and why estimates can vary. If you still have a question after checking those pages, email ${EMAIL}.`,
        ],
      },
    ],
  },

  faqs: {
    title: 'Frequently Asked Questions',
    body: 'These answers cover how to find a tool, what happens when you enter information, and how to interpret the results from Calculator Worlds.',
    sections: [
      {
        heading: 'Are the tools free and do I need an account?',
        paragraphs: [
          'The calculators, converters, and generators are free to use without creating an account or signing in. Open any tool and enter the values required for that task. You can browse the directories or use the site search to find a specific calculator, converter, or generator.',
        ],
      },
      {
        heading: 'Which percentage calculator should I use?',
        paragraphs: [
          'Use the main percentage calculation when you know two of the percentage, base amount, and result. Use Percentage Change when you are comparing a starting value with a later value and want the increase or decrease relative to the starting amount. Use Percentage Difference when neither value is the starting point and you want to compare the gap relative to their average.',
        ],
      },
      {
        heading: 'Why might two time tools give different answers?',
        paragraphs: [
          'They answer different questions. The Time Converter changes a duration from one unit to another. Its month and year conversions use calendar averages. The Age Calculator measures between two specific dates, taking the calendar into account. Use the age tool for a date-based interval and the converter for a unit-based estimate.',
        ],
      },
      {
        heading: 'Can I compare loan and mortgage payments?',
        paragraphs: [
          'You can enter different amounts, terms, and rates to see how the estimates change. Choose the amortized loan option for fixed recurring payments or the deferred option for a lump sum at maturity. Use the Mortgage Calculator to model a fixed-rate home loan and add property tax, insurance, or HOA costs. Check any estimate against the lender’s actual terms and fees.',
        ],
      },
      {
        heading: 'Why is my bank’s currency quote different?',
        paragraphs: [
          'The Currency Converter uses rates supplied by an outside provider and shows when those rates were updated. Your bank or exchange service may quote a different rate or charge fees. Check the provider’s rate before using a conversion to plan a transfer or purchase.',
        ],
      },
      {
        heading: 'Does Calculator Worlds receive what I enter?',
        paragraphs: [
          'Tool inputs and generated results are processed in your browser. If you use the site search, the term is included in the page URL and may appear in hosting logs. When you email us, we receive your message and email address. See the Privacy Policy for details about these situations.',
        ],
      },
      {
        heading: 'How can I use a QR code I create?',
        paragraphs: [
          'Enter text or a link into the QR Code Generator, choose a size, and save the preview as a PNG. Scan the downloaded code before distributing it. If you use the code on printed material, test it at the planned size so you can check that it remains readable.',
        ],
      },
      {
        heading: 'Where can I get help?',
        paragraphs: [
          `See How to Use Calculators for steps on choosing a tool, entering values, and reading the answer. If you still have a question or want to report an issue, email ${EMAIL}. Include the tool name and enough information to reproduce what happened. Use sample values for inputs that would otherwise be personal.`,
        ],
      },
    ],
  },

  'how-to-use': {
    title: 'How to Use Calculators',
    body: 'Start by choosing the tool that answers your question. Calculator Worlds groups calculators, converters, and generators by purpose. Search for a tool by name or open All Tools to see the full list. Each tool page describes the inputs you need and what its result means.',
    sections: [
      {
        heading: 'Choose the right task',
        paragraphs: [
          'Use a calculator if you need to work something out from several values. If you already have a value and want it in a different unit, choose a converter. Use a generator to create a QR code, draw random numbers, or build a password. A similar name can still lead to a different task. Percentage Change measures an increase or decrease, while Percentage Difference describes how far two values are apart relative to their average.',
        ],
      },
      {
        heading: 'Check the field labels and units',
        paragraphs: [
          'Read each label before you enter a number. Some fields ask for a percentage, while others take a dollar amount, a measurement, or a date. Match the interval as well as the unit. For example, the Mortgage Calculator asks for annual property tax and annual insurance, but takes the HOA fee as a monthly amount. If you are using the BMI Calculator, choose Metric or US before entering your height and weight.',
        ],
      },
      {
        heading: 'Run the tool',
        paragraphs: [
          'On a calculator with a Calculate button, select it after you enter the required values. For the Standard Calculator, enter the expression and press the equals key. For converters, select From and To and look for the result to update. The Age Calculator updates after you enter a birth date and a reference date. Generators use their own controls. Select Generate for random numbers or a password, or type text into the QR field to preview the code.',
        ],
      },
      {
        heading: 'Read the result before you use it',
        paragraphs: [
          'Check that the answer appears in the unit, currency, or period you intended. If it looks unusual, confirm that inputs are in the correct fields and that you selected the right options. For example, changing a loan’s repayment frequency changes what each payment represents. Months and years in the Time Converter use average lengths, while the Age Calculator counts calendar time between specific dates.',
          'Loan and mortgage payments and currency amounts are estimates. A provider’s actual figures may use different fees, rates, or terms. If a number matters to a decision, check it with the relevant source. Adult BMI is a general guide and should be considered alongside other health information.',
        ],
      },
      {
        heading: 'Start over or compare another scenario',
        paragraphs: [
          `Use Clear where it is available or edit the fields you want to change. For a useful comparison, change one input at a time. You could adjust only the interest rate to see its effect on a mortgage payment or change only the target unit to compare two measurements. If you need help, share an example with sample values at ${EMAIL}.`,
        ],
      },
    ],
  },
};

// "How it works" and "Key features" for each tool page, keyed by tool slug.
const toolContent = {
  'standard-calculator': {
    howItWorks: 'Build an expression with the number and operator keys, then press = to evaluate it. Use parentheses to set which part should be evaluated together. For sine, cosine, tangent, or their inverse functions, select Deg if your angle is in degrees or Rad if it is in radians before you calculate.',
    features: [
      'Supports basic arithmetic, percentages, powers, square and cube roots, logarithms, factorials, and absolute values.',
      'Includes π, e, scientific notation through EXP, and a sign toggle.',
      'Use Ans to insert the previous result. M+ and M− adjust the stored memory value, and MR recalls it. Back removes input and AC clears the display.',
    ],
  },
  'percentage-calculator': {
    howItWorks: 'In the main calculator, fill in any two of the percentage, base amount, and result, then select Calculate. The tool uses the relationship percentage divided by 100, multiplied by the base amount. For example, entering 20% and 150 returns 30. Leave the value you want the calculator to find blank.',
    features: [
      'Common-phrase forms let you find a percentage of an amount, express one value as a percentage of another, or work backward to the base amount.',
      'Percentage Difference measures the gap between two values relative to their average. Percentage Change uses the starting value as its reference.',
      'Choose Increase or Decrease in the change calculator and provide the two known values to solve for the third.',
    ],
  },
  'age-calculator': {
    howItWorks: 'Enter a date of birth and select the reference date in Age on this date. The field starts with today’s date. The calculator compares the two dates and displays the elapsed calendar years, months, and days without a separate Calculate button.',
    features: [
      'Shows total months, weeks, and days alongside the calendar age.',
      'Reports the countdown to the next birthday and the weekday of birth.',
      'Change the reference date to calculate age on another day, or select Clear to start again.',
    ],
  },
  'loan-calculator': {
    howItWorks: 'Choose Amortized Loan for regular repayments or Deferred Payment Loan for a lump sum at maturity. Enter the principal, interest rate, and term in years and months. Set how often interest compounds. On an amortized loan, also choose how often you will make payments, then select Calculate.',
    features: [
      'The amortized option estimates a fixed payment per selected repayment period. Each payment covers interest and pays down part of the principal.',
      'The deferred option estimates the amount due at the end of the term by allowing interest to accumulate before repayment.',
      'The frequency menus let you compare compounding schedules and repayment intervals. Check the settings before comparing estimates with a lender’s figures.',
    ],
  },
  'mortgage-calculator': {
    howItWorks: 'Enter the home price, down payment as a percentage, loan term in years, and interest rate. The tool subtracts the down payment from the price and estimates the fixed monthly principal and interest payment on the financed amount. Select Calculate to see the monthly estimate.',
    features: [
      'Enter yearly property tax and home insurance if you want them included. The tool spreads these annual costs across 12 months.',
      'Enter any HOA fee as a monthly amount. It is included in the estimate alongside the loan payment and any other costs entered.',
      'Assumes a fixed rate and monthly payments. Change one input at a time to compare scenarios.',
    ],
  },
  'bmi-calculator': {
    howItWorks: 'Choose Metric and enter centimeters and kilograms, or choose US and enter feet, inches, and pounds. Select Calculate. BMI is weight in kilograms divided by height in meters squared. The US input mode uses the equivalent calculation for your measurements. For example, 72 kg at 180 cm gives a BMI of about 22.2.',
    features: [
      'Displays body mass index and the applicable adult category.',
      'Supports metric and US units and includes Clear to start a new calculation.',
      'BMI is a general guide for adults. It does not measure body composition or diagnose a health condition.',
    ],
  },
  'time-converter': {
    howItWorks: 'Enter a duration in Value and choose the original unit in From and the desired unit in To. The tool converts the input using the relationship between those units and updates the result as you change the fields. For example, 90 minutes equals 1.5 hours.',
    features: [
      'Converts milliseconds, seconds, minutes, hours, days, weeks, months, and years.',
      'Uses an average year of 365.2425 days and one-twelfth of that year for a month. Use the Age Calculator for elapsed calendar time between specific dates.',
    ],
  },
  'currency-converter': {
    howItWorks: 'Enter the amount, choose its currency in From, and choose the currency you want in To. The converter applies the available exchange rate to show the equivalent amount and recalculates when you change the value or currency pair.',
    features: [
      'Supports currencies including USD, EUR, GBP, and PKR.',
      'Shows the rate update date when rates are available.',
      'The result is an estimate using third-party rates. Check your provider’s rate and fees before exchanging money.',
    ],
  },
  'temperature-converter': {
    howItWorks: 'Enter a temperature, choose its original scale in From, then choose the output scale in To. The tool applies the formula for the pair of scales and updates the result when either the number or the unit changes. For example, 0°C equals 32°F or 273.15 K.',
    features: [
      'Converts between Celsius, Fahrenheit, and Kelvin.',
      'Handles conversions in either direction and includes Clear for a new value.',
    ],
  },
  'length-converter': {
    howItWorks: 'Enter a measurement, select its current unit in From, then select the target unit in To. The converter uses the fixed relationship between the units to show the same length in the target unit. For example, 12 inches equals 1 foot.',
    features: [
      'Supports metric units from millimeters through kilometers.',
      'Also supports inches, feet, yards, miles, and nautical miles.',
      'Updates the result when you change the input or either unit.',
    ],
  },
  'weight-converter': {
    howItWorks: 'Enter a weight and choose the original and target units. The tool applies the conversion factor for those units and updates the result as you change the value or unit selections. For example, 1 kilogram equals 1,000 grams.',
    features: [
      'Supports milligrams, grams, kilograms, metric tonnes, ounces, pounds, stone, and US tons.',
      'Distinguishes a US ton of 2,000 pounds from a metric tonne of 1,000 kilograms.',
    ],
  },
  'qr-code-generator': {
    howItWorks: 'Type or paste text or a link into the input. The generator encodes that content into a scannable QR pattern in your browser and shows a preview. Choose a size and an error correction level, then select Download PNG to save the image.',
    features: [
      'Offers Small, Medium, and Large image sizes plus four error correction levels.',
      'Higher error correction can help a damaged code scan, with a denser pattern as a trade-off.',
      'Scan the PNG before sharing or printing to check the content and readability.',
    ],
  },
  'random-number-generator': {
    howItWorks: 'Enter the minimum and maximum integers and specify how many results you want. Select Generate to draw numbers from that range. If you choose No repeated numbers, set the count no higher than the number of distinct integers available.',
    features: [
      'Draws up to 1,000 results per request.',
      'Lets you allow repeats or draw unique values.',
      'Use Copy to save the displayed results to your clipboard or Clear to reset the tool.',
    ],
  },
  'password-generator': {
    howItWorks: 'Set a length and choose which character types to include. Select Generate. The tool uses your browser’s secure random source to choose characters from the selected options and displays the resulting password. Select Copy to put it on your clipboard.',
    features: [
      'Supports lengths from 4 to 128 characters and offers uppercase, lowercase, numbers, and symbols.',
      'Can omit look-alike characters such as O and 0, and provides a strength indicator.',
      'Creates passwords in your browser. Calculator Worlds does not receive or store the generated value.',
    ],
  },
};

// Intro line under the heading of each listing page, keyed by URL.
const listingIntros = {
  '/calculators/': 'Choose a calculator for everyday math, borrowing estimates, or adult BMI.',
  '/calculators/math/': 'Work out expressions, percentages, and ages with these free math tools.',
  '/calculators/financial/': 'Estimate what a loan or mortgage could cost using your own figures.',
  '/calculators/health/': 'Use your height and weight to work out your adult body mass index.',
  '/generators/': 'Create a QR code, draw random numbers, or make a password using the settings you choose.',
  '/converters/': 'Enter a value and select the units or currencies you want to convert between.',
  '/tools/': 'Browse every calculator, converter, and generator in Calculator Worlds.',
};

module.exports = { EMAIL, infoPages, toolContent, listingIntros };
