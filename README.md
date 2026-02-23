# Family Tree Application

A production-quality MVP for a Family Tree web application with dynamic relationship perspective switching.

## Tech Stack

- **Frontend**: React (Vite) + TypeScript + TailwindCSS + React Flow
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL (Supabase)

## Project Structure

```
.
├── client/          # React frontend application
├── server/          # Express backend API
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (Supabase recommended)
- npm or yarn package manager

### Database Setup

1. Create a Supabase project at https://supabase.com
2. Copy your Supabase URL and anon key
3. Run the SQL schema in your Supabase SQL editor:

```sql
-- See server/database/schema.sql
```

Or execute the SQL file located at `server/database/schema.sql` in your Supabase SQL editor.

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your Supabase credentials:
```
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
```

5. Start the development server:
```bash
npm run dev
```

The backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional, defaults to localhost:3001):
```bash
cp .env.example .env
```

4. Update `.env` if needed:
```
VITE_API_URL=http://localhost:3001
```

5. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Usage

1. Open `http://localhost:3000` in your browser
2. Click "Create New Family" to create a new family tree
3. You'll be redirected to `/family/:token` where you can:
   - Add persons to the tree
   - Create relationships (parent, spouse)
   - Click on any person to set them as the root and see relationships from their perspective
   - Double-click two persons to create a relationship between them
   - Edit or delete persons

## Features

- **Dynamic Relationship Perspective**: Click any person to see all relationships from their perspective
- **Interactive Graph**: Pan, zoom, and drag nodes using React Flow
- **Person Management**: Add, edit, and delete persons with name, alias, age, and photo
- **Relationship Management**: Create parent and spouse relationships
- **Private URLs**: Each family tree is accessible via a unique token-based URL

## API Endpoints

### Families
- `POST /api/families` - Create a new family
- `GET /api/families/:token` - Get family data by token

### Persons
- `POST /api/persons` - Create a person
- `PUT /api/persons/:id` - Update a person
- `DELETE /api/persons/:id` - Delete a person

### Relationships
- `POST /api/relationships` - Create a relationship
- `DELETE /api/relationships/:id` - Delete a relationship

## Development

### Backend
```bash
cd server
npm run dev    # Development with hot reload
npm run build  # Build for production
npm start      # Run production build
```

### Frontend
```bash
cd client
npm run dev      # Development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Notes

- No authentication required - access is controlled via private URLs (tokens)
- Relationships are stored as primitive relations (parent, spouse) only
- Derived relationships (sibling, grandparent, etc.) are computed dynamically on the frontend
- Deleting a person automatically removes all their relationships (cascade delete)

