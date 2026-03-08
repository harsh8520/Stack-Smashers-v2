# Content Quality Reviewer - Frontend

React + TypeScript + Vite frontend for the Content Quality Reviewer application.

---

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and set VITE_API_ENDPOINT

# Run development server
npm run dev
```

Frontend will be available at: [http://localhost:5173](http://localhost:5173)

---

## Documentation

📖 **Setup Guide:** [SETUP.md](./SETUP.md) - Detailed setup and deployment instructions  
📖 **Main Deployment Guide:** [../../../DEPLOYMENT_GUIDE.md](../../../DEPLOYMENT_GUIDE.md) - Complete deployment guide

---

## Features

✨ **User Authentication**
- Signup and login with email/password
- JWT token-based authentication
- Protected routes

✨ **Content Analysis**
- Multi-platform support (Blog, LinkedIn, Twitter, Medium)
- Real-time AI-powered analysis
- Detailed scoring across 8+ dimensions
- Actionable improvement suggestions

✨ **Dashboard**
- Analysis history with pagination
- Score visualization with charts
- Detailed dimension breakdowns
- Export capabilities

✨ **Modern UI**
- Built with shadcn/ui components
- Tailwind CSS styling
- Responsive design
- Dark mode support
- Accessible components

---

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Recharts
- Lucide React

---

## Environment Variables

Create a `.env` file:

```env
VITE_API_ENDPOINT=https://your-backend-url.vercel.app
```

---

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Lint code
```

---

## Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── Dashboard.tsx    # Main dashboard
│   ├── Login.tsx        # Login page
│   ├── SignUp.tsx       # Signup page
│   └── ...
├── services/
│   ├── apiService.ts    # Content analysis API
│   └── authService.ts   # Authentication API
├── styles/
│   └── globals.css      # Global styles
├── App.tsx              # Main app component
└── main.tsx             # Entry point
```

---

## Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add environment variable
vercel env add VITE_API_ENDPOINT

# Deploy to production
vercel --prod
```

See [SETUP.md](./SETUP.md) for detailed deployment instructions.

---

## API Integration

The frontend communicates with the backend via REST API:

- `POST /api/auth/signup` - User signup
- `POST /api/auth/login` - User login
- `POST /api/analyze` - Analyze content
- `GET /api/analysis/:id` - Get analysis by ID
- `GET /api/history` - Get user history

All authenticated requests include `Authorization: Bearer <token>` header.

---

## Development

### Adding UI Components

```bash
npx shadcn-ui@latest add <component-name>
```

### Type Checking

```bash
npm run type-check
```

### Hot Module Replacement

Vite provides fast HMR. Changes reflect immediately without full page reload.

---

## Troubleshooting

**Network errors?**
- Check `VITE_API_ENDPOINT` in `.env`
- Verify backend is deployed and accessible

**Unauthorized errors?**
- Log out and log in again
- Check JWT_SECRET in backend environment variables

**Build errors?**
- Delete `node_modules` and reinstall
- Clear Vite cache: `rm -rf node_modules/.vite`

See [SETUP.md](./SETUP.md) for more troubleshooting tips.

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## License

MIT

---

**Need help?** See [SETUP.md](./SETUP.md) or [../../../DEPLOYMENT_GUIDE.md](../../../DEPLOYMENT_GUIDE.md)
