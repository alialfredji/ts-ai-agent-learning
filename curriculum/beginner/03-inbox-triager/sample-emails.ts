/**
 * Sample email data for testing the triager
 */

export const sampleEmails = [
  {
    subject: 'Urgent: Production server is down!',
    from: 'ops@company.com',
    body: 'The main production server went down 5 minutes ago. Users are unable to access the application. Need immediate assistance!',
    timestamp: '2024-01-15T14:30:00Z',
  },
  {
    subject: 'Weekly Team Meeting - Tomorrow 2pm',
    from: 'manager@company.com',
    body: "Hi team, reminder about our weekly sync tomorrow at 2pm. We'll review the sprint progress and plan next week's work. Please come prepared with updates.",
    timestamp: '2024-01-15T09:00:00Z',
  },
  {
    subject: '50% OFF - Limited Time Offer!',
    from: 'deals@retailstore.com',
    body: 'Huge sale this weekend! Get 50% off on all items. Shop now before the deals expire!',
    timestamp: '2024-01-15T08:15:00Z',
  },
  {
    subject: 'Happy Birthday! 🎉',
    from: 'friend@email.com',
    body: "Hey! Just wanted to wish you a very happy birthday! Hope you have an amazing day. Let's catch up soon!",
    timestamp: '2024-01-15T06:30:00Z',
  },
  {
    subject: 'Code Review Request: PR #234',
    from: 'dev@company.com',
    body: "Hi, I've submitted PR #234 for the new authentication feature. Could you review it when you get a chance? It's a medium-sized change, around 200 lines.",
    timestamp: '2024-01-15T11:45:00Z',
  },
  {
    subject: 'Your package has been delivered',
    from: 'noreply@shipping.com',
    body: 'Good news! Your package (tracking #123456) was delivered today at 10:30 AM and left at your front door.',
    timestamp: '2024-01-15T10:30:00Z',
  },
  {
    subject: 'ACTION REQUIRED: Verify your account',
    from: 'security@suspicious-site.xyz',
    body: 'Your account has been locked due to suspicious activity. Click here immediately to verify your identity and prevent account deletion.',
    timestamp: '2024-01-15T13:00:00Z',
  },
  {
    subject: 'Q4 Budget Planning',
    from: 'finance@company.com',
    body: "It's time to submit your Q4 budget requests. Please fill out the attached spreadsheet and return it by end of week. Let me know if you have questions.",
    timestamp: '2024-01-15T07:00:00Z',
  },
];
