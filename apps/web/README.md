# Web Frontend (@entry/web)

Next.js e-commerce frontend application.

## Features

- 🛍️ Product catalog and search
- 🛒 Shopping cart and checkout
- 👤 User authentication and profiles
- 🔍 Advanced product filtering
- 📱 Responsive design
- 🎨 Tailwind CSS styling

## Development

```bash
# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint

# Type checking
npm run type-check
```

## Environment Variables

Create a `.env.local` file in the app directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

## Dependencies

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Radix UI components
- Zustand for state management
- @entry/types (shared types)
- @entry/config (shared config)
