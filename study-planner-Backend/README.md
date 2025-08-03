# Study Planner Backend

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file with your OpenAI API key:

   ```
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=3300
   ```

3. Start the server:

   ```bash
   npm start
   ```

   For development with auto-restart:

   ```bash
   npm run dev
   ```

## API Endpoints

- `GET /api/exam` - Fetch all subjects
- `POST /api/exam` - Add a new subject (with file upload)
- `DELETE /api/exam/:id` - Delete a subject
- `POST /api/chat` - Generate study plan using AI

## Features

- MongoDB integration
- File upload support for PDF syllabi
- AI-powered study plan generation
- CORS enabled for frontend integration

## Dependencies

- Express.js
- MongoDB (Mongoose)
- Multer (file upload)
- Axios (HTTP client)
- PDF-Parse (PDF text extraction)
- OpenAI API integration
