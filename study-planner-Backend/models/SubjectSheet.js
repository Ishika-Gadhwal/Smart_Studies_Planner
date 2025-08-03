import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
    sub: String,
    date: Date,
    syllabus: String,
    DifficultyLevel: String,
    comments: String
});

export default mongoose.model('SubjectSheet', subjectSchema);