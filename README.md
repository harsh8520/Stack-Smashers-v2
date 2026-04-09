# ContentLens AI

An intelligent content quality analysis platform powered by AI and NLP that helps content creators optimize their writing for different platforms and audiences.

## 🚀 Features

- **Multi-Platform Optimization**: Tailored analysis for Blog, LinkedIn, Twitter, and Medium
- **AI-Powered Insights**: Uses Groq's LLaMA 3.1 70B for deep content analysis
- **Comprehensive Scoring**: Multi-dimensional analysis (Clarity, Structure, Tone, Engagement)
- **Readability Metrics**: Flesch Reading Ease, Grade Level, and more
- **Real-Time Processing**: Get results in under 2 seconds
- **User Authentication**: Secure JWT-based auth with MongoDB
- **Analysis History**: Track and review past analyses

## 🛠️ Technology Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS + shadcn/ui components
- Recharts for data visualization

### Backend
- Node.js with Express
- MongoDB for data persistence
- Groq AI SDK (LLaMA 3.1 70B)
- JWT authentication
- bcrypt for password hashing

### NLP & Analysis
- Sentiment analysis
- Readability calculations (Flesch-Kincaid, SMOG, etc.)
- Custom analyzers for structure, tone, and accessibility

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB database
- Groq API key

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/contentlens-ai.git
cd contentlens-ai
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

3. **Configure environment variables**

Create a `.env` file in the root directory:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Application Configuration
MAX_CONTENT_LENGTH=2000

# Rate Limiting
RATE_LIMIT_WINDOW=60
RATE_LIMIT_MAX=10

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Groq AI Configuration
GROQ_API_KEY=your-groq-api-key-here

# Storage Configuration
ANALYSIS_TTL_DAYS=30
```

Create `frontend/.env`:

```env
VITE_API_ENDPOINT=http://localhost:3001
```

4. **Start the application**

```bash
# Terminal 1: Start backend server
node server.js

# Terminal 2: Start frontend
cd frontend
npm run dev
```

5. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 🎯 Usage

1. **Sign Up**: Create an account with email and password
2. **Analyze Content**: 
   - Paste your content
   - Select target platform (Blog, LinkedIn, Twitter, Medium)
   - Choose content intent (Inform, Educate, Persuade)
   - Click "Analyze Content"
3. **Review Results**: Get comprehensive scores and actionable suggestions
4. **View History**: Access past analyses from the History page

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login existing user

### Content Analysis
- `POST /api/analyze` - Analyze content (requires authentication)
- `GET /api/history` - Get user's analysis history
- `GET /api/analysis/:id` - Get specific analysis by ID

## 🏗️ Project Structure

```
contentlens-ai/
├── api/                    # API endpoints
│   ├── auth/              # Authentication routes
│   ├── analyze.js         # Content analysis endpoint
│   └── history.js         # History endpoint
├── lib/                   # Backend libraries
│   ├── analyzers/         # Content analyzers
│   ├── auth.js           # Auth utilities
│   ├── storage.js        # MongoDB operations
│   ├── groq-client.js    # AI client
│   └── nlp-utils.js      # NLP utilities
├── frontend/             # React frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   └── services/     # API services
│   └── package.json
├── server.js            # Express server
└── package.json         # Root dependencies
```

## 🔒 Security

- JWT-based authentication
- bcrypt password hashing
- Rate limiting (10 requests/minute)
- Environment variable protection
- CORS enabled for frontend

## 🚧 Future Enhancements

- Browser extension for in-place analysis
- Team collaboration features
- Multi-language support
- A/B testing suggestions
- Content calendar integration
- Public API for third-party integrations

## 📝 License

MIT

## 👨‍💻 Author

Built for hackathon submission

## 🙏 Acknowledgments

- Groq AI for fast LLM inference
- MongoDB for reliable data storage
- shadcn/ui for beautiful components
