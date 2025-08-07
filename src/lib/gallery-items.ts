export interface GalleryItem {
  name: string;
  description: string;
  prompt: string;
  image: string;
  'data-ai-hint'?: string;
}

export const galleryItems: GalleryItem[] = [
  {
    name: 'CTA Button',
    description: 'A standout button for primary actions.',
    prompt:
      "A bright orange call-to-action button with white text that says 'Get Started'. It should have a subtle shadow and become slightly larger on hover.",
    image: 'https://placehold.co/600x400.png',
    'data-ai-hint': 'call to action button',
  },
  {
    name: 'Login Form',
    description: 'A standard user authentication form.',
    prompt:
      "A centered login form in a card with a light shadow. It should have input fields for 'Email' and 'Password', a 'Remember me' checkbox, and a primary color 'Log In' button. Include a 'Forgot password?' link below the button.",
    image: 'https://placehold.co/600x400.png',
    'data-ai-hint': 'login form',
  },
  {
    name: 'Pricing Card',
    description: 'A card to display subscription or pricing tiers.',
    prompt:
      "A pricing card for a 'Pro' plan. It should be in a bordered container with a shadow. Highlight the price, '$29/mo', list three key features with checkmark icons, and have a prominent primary color call-to-action button at the bottom that says 'Choose Plan'.",
    image: 'https://placehold.co/600x400.png',
    'data-ai-hint': 'pricing card',
  },
  {
    name: 'User Profile Card',
    description: 'A card to display user information.',
    prompt:
      'A user profile card. Include a circular avatar placeholder at the top, followed by the user name "Alex Doe" and job title "Product Designer". Below that, include two buttons: "Follow" (primary style) and "Message" (secondary style).',
    image: 'https://placehold.co/600x400.png',
    'data-ai-hint': 'profile card',
  },
  {
    name: 'Team Members Section',
    description: 'A section to showcase team members.',
    prompt:
      'A "Meet Our Team" section. It should have a main heading. Below the heading, display a grid of three team member cards. Each card should contain a placeholder for an image, a name, and a role.',
    image: 'https://placehold.co/600x400.png',
    'data-ai-hint': 'team section',
  },
  {
    name: 'Cookie Consent Banner',
    description: 'A banner for GDPR and cookie compliance.',
    prompt:
      'A cookie consent banner that is fixed to the bottom of the screen. It should contain a short text explaining the use of cookies, an "Accept" button with a primary style, and a "Decline" button with a secondary style.',
    image: 'https://placehold.co/600x400.png',
    'data-ai-hint': 'cookie banner',
  },
];
