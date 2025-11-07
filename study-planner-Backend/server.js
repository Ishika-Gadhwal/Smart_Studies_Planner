import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
// import authRoutes from './routes/authRoutes.js'
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

console.log("GEMINI_API_KEY loaded:", process.env.GEMINI_API_KEY ? "Yes" : "No");
console.log("API Key length:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : "undefined");

// Check if API key is available
if (!process.env.GEMINI_API_KEY) {
    console.error("ERROR: GEMINI_API_KEY is not defined in environment variables");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// List of models that should support content generation, in order of preference
const KNOWN_GENERATIVE_MODELS = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-001",
    "gemini-pro",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-flash-latest",
    "gemini-pro-latest"
];

// Function to test if a model supports content generation
async function testModel(modelName) {
    try {
        console.log(`Testing model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello, this is a test message.");
        console.log(`✅ Model ${modelName} works!`);
        return true;
    } catch (error) {
        console.error(`❌ Model ${modelName} failed:`, error.message);
        return false;
    }
}

// Find a working model
async function findWorkingModel() {
    console.log("Testing known generative models...");
    
    for (const modelName of KNOWN_GENERATIVE_MODELS) {
        if (await testModel(modelName)) {
            return modelName;
        }
    }
    
    console.error("None of the known models worked. Let's try to list available models...");
    
    // If none of the known models work, try to get the list of available models
    try {
        const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const models = response.data.models || [];
        
        // Try each model that looks like it might support generation
        for (const model of models) {
            const modelName = model.name.split('/').pop(); // Extract just the model name
            if (modelName.includes('gemini') && !modelName.includes('embedding')) {
                if (await testModel(modelName)) {
                    return modelName;
                }
            }
        }
    } catch (error) {
        console.error("Error listing models:", error.response?.data || error.message);
    }
    
    return null;
}

// Initialize with a valid model
let MODEL_NAME = "";

async function initializeModel() {
    MODEL_NAME = await findWorkingModel();
    if (!MODEL_NAME) {
        console.error("Failed to find a working model. Exiting...");
        process.exit(1);
    }
    
    console.log(`Using model: ${MODEL_NAME}`);
    return true;
}

const app = express();
const PORT = process.env.PORT || 5000;

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

// Initialize model at startup
initializeModel().then(isValid => {
    if (!isValid) {
        console.error("WARNING: Gemini API validation failed. The /api/chat endpoint may not work correctly.");
    }
});

app.post("/api/chat", async (req, res) => {
    const { prompt: userPrompt, hours } = req.body;

    try {
        const subjects = await SubjectSheet.find();
        console.log(`Found ${subjects.length} subjects in database`);
        
        // Check if there are any subjects
        if (subjects.length === 0) {
            return res.status(400).json({ error: "No subjects found in the database. Please add subjects first." });
        }

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

        const model = genAI.getGenerativeModel({ model: MODEL_NAME });
        console.log('Sending prompt to Gemini API...');
        console.log('Model:', MODEL_NAME);
        console.log('API Key (first 10 chars):', process.env.GEMINI_API_KEY.substring(0, 10));

        try {
            const result = await model.generateContent(finalPrompt);
            const text = result.response.text();
            console.log('Received response from Gemini API');
            res.json({ output: text });
        } catch (geminiError) {
            console.error("Gemini API Error:", geminiError);
            // Send more details to frontend for debugging
            res.status(500).json({ 
                error: "AI generation failed", 
                details: geminiError.message || geminiError.toString(),
                model: MODEL_NAME,
                suggestion: "Please check if the model name is correct and your API key has access to this model."
            });
        }
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Server error", details: error.message || error.toString() });
    }
});

app.listen(PORT, () => { console.log("Server is running on port", PORT) });