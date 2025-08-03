

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';

import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";

console.log("GEMINI_API_KEY loaded:", process.env.GEMINI_API_KEY ? "Yes" : "No");
console.log("API Key length:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : "undefined");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function validateGeminiAPI() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello, this is a test message.");
        console.log(" Gemini API validation successful!");
        return true;
    } catch (error) {
        console.error("Gemini API validation failed:", error.message);
        return false;
    }
}

validateGeminiAPI();

const app = express();
const PORT = process.env.PORT || 5000;

// To create API call
import axios from "axios";
import authRoutes from './routes/authRoutes.js';

app.use(bodyParser.json());
app.use(cors());
app.use('/api/auth', authRoutes);





// MongoDB connection with better error handling
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB successfully");
        console.log("Database:", mongoose.connection.db.databaseName);
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error.message);
        console.error("Full error:", error);
        process.exit(1);
    });

// Monitor connection events
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

const subjectSchema = new mongoose.Schema({
    sub: String,
    date: Date,
    syllabus: String,
    DifficultyLevel: String,
    comments: String
})
const SubjectSheet = mongoose.model('SubjectSheet', subjectSchema);

//GET: Fetch all Subject Data from database
app.get('/api/exam', async (req, res) => {
    try {
        const subjects = await SubjectSheet.find();
        res.json(subjects);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
})

//POST: Add a new Subject to the database
app.post('/api/exam', async (req, res) => {
    try {
        const newSubject = new SubjectSheet({
            sub: req.body.sub,
            date: req.body.date,
            syllabus: req.body.syllabus,
            DifficultyLevel: req.body.DifficultyLevel,
            comments: req.body.comments
        })

        const savedSubject = await newSubject.save();
        res.json({ message: 'Subject added successfully', data: savedSubject });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
})

// DELETE: Remove a Data
app.delete('/api/exam/:id', async (req, res) => {
    try {
        const deletedSubject = await SubjectSheet.findByIdAndDelete(req.params.id);
        res.json(deletedSubject);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});



validateGeminiAPI();

app.post("/api/chat", async (req, res) => {
    const { prompt: userPrompt, hours } = req.body;

    try {
        const subjects = await SubjectSheet.find();
        console.log(`Found ${subjects.length} subjects in database`);

        let syllabusDetails = "";
        for (const subj of subjects) {
            syllabusDetails += `Subject: ${subj.sub}, Exam Date: ${new Date(subj.date).toDateString()}, Difficulty: ${subj.DifficultyLevel}, Comments: ${subj.comments}, Syllabus: ${subj.syllabus}\n\n`;
        }

        const finalPrompt = `You are a study planner AI. Generate a **Markdown formatted table** for a smart daily study plan. The table should include the following columns:
                            | Date | Subject | Topics | Tasks |
                            Study hours/day: ${hours}
                            Analyze the following subjects and syllabus content:
                            ${syllabusDetails}
                            Instructions:
                            - Group topics by subject and day.
                            - Use realistic daily workload considering study hours.
                            - Prioritize **harder subjects** and **earlier exam dates**.
                            - Include **revision days**.
                            - Keep Markdown syntax clean and aligned.
                            Output only the table. After the table, add 4-5 important general tips in bullet points like break suggestions, recall, etc.
                            ${userPrompt ? `\n\nUser Prompt: ${userPrompt}` : ""}`;

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log('Sending prompt to Gemini API...');
        console.log('Model:', model.model);
        console.log('API Key (first 10 chars):', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) : 'undefined');

        try {
            const result = await model.generateContent(finalPrompt);
            const text = result.response.text();
            console.log('Received response from Gemini API');
            res.json({ output: text });
        } catch (geminiError) {
            console.error("Gemini API Error:", geminiError);
            // Send more details to frontend for debugging
            res.status(500).json({ error: "AI generation failed", details: geminiError.message || geminiError.toString() });
        }
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Server error", details: error.message || error.toString() });
    }
});

app.listen(PORT, () => { console.log("Server is running on port", PORT) });