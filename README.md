# Urban Translator

Urban Translator is a Google Translate-style app built with Next.js, React, Tailwind CSS, and Google Gemini.

## Tech Stack

- Next.js (App Router)
- React
- Tailwind CSS
- Gemini API (`gemini-2.0-flash` via REST)

## Setup

1. Clone the repo.
2. Run `npm install`.
3. Copy `.env.local.example` to `.env.local` and add your Gemini key  
   (free at [aistudio.google.com/apikey](https://aistudio.google.com/apikey) - no credit card required).
4. Run `npm run dev`.
5. Open `http://localhost:3000`.

## Environment Variables

Create `.env.local` in the project root:

```bash
GEMINI_API_KEY=your_key_here
```

## Features

- Choose from default bot styles (Donald Trump, Shakespeare, Yoda, Gordon Ramsay, A Pirate, Elon Musk, Valley Girl, Formal Academic)
- Input panel with character counter (`500` max)
- Collapsible optional context instructions
- Gemini-powered translation via `/app/api/translate/route.ts`
- Output panel with loading spinner, fade-in text, and copy-to-clipboard button
- Dark-mode-first responsive layout (stacked on mobile, two columns on desktop)
