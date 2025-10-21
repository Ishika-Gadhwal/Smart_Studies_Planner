import React, { useState, useEffect } from 'react';
// import axios from 'axios';
import API from './services/api';

// for adjusting the AI output Table
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './Dashboard.css';

// SVG Icons Components
const PrintIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z" />
    </svg>
);

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
    </svg>
);

function Dashboard() {

    const [data, Dataset] = useState([]);

    const [hours, setHours] = useState(() => {
        // Get hours from localStorage if available, else empty string
        const saved = localStorage.getItem('study_hours');
        return saved !== null ? saved : '';
    });

    // boolean variable
    const [lock, setLock] = useState(() => {
        return localStorage.getItem('study_hours') !== null;
    });

    const [subject, setSubject] = useState("");
    const [examDate, setExamDate] = useState(new Date());
    const [syllabus, setSyllabus] = useState("");
    const [level, setLevel] = useState("");
    const [comments, setComments] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);

    // For plan display
    const [aiLoading, setAiLoading] = useState(false);
    const [aiPlan, setAiPlan] = useState("");
    // Add timeout warning state
    const [timeoutWarning, setTimeoutWarning] = useState(false);

    // Save hours to localStorage whenever it changes
    useEffect(() => {
        if (hours !== '' && /^\d+$/.test(String(hours))) {
            localStorage.setItem('study_hours', hours);
        }
    }, [hours]);

    // Custom function to render styled table from markdown content
    const renderStyledTable = (markdownContent) => {
        if (!markdownContent) return null;

        // Simple parser to extract table content from markdown
        const lines = markdownContent.split('\n');
        const tableLines = [];
        let inTable = false;

        for (const line of lines) {
            if (line.includes('|')) {
                inTable = true;
                tableLines.push(line);
            } else if (inTable && line.trim() === '') {
                break;
            }
        }

        if (tableLines.length < 2) {
            // If no proper table found, return ReactMarkdown as fallback
            return (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdownContent}</ReactMarkdown>
            );
        }

        // Parse header and rows
        const headerLine = tableLines[0];
        const headers = headerLine.split('|').map(h => h.trim()).filter(h => h !== '');

        const dataRows = tableLines.slice(2).map(line => {
            return line.split('|').map(cell => cell.trim()).filter(cell => cell !== '');
        });

        return (
            <div>
                <table style={{
                    width: '100%',
                    borderCollapse: 'separate',
                    borderSpacing: '0',
                    margin: '30px 0',
                    background: 'white',
                    border: '1.5px solid rgba(119, 229, 164, 0.3)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 15px rgba(119, 229, 164, 0.1)',
                    fontFamily: 'Inter, Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
                }}>
                    <thead>
                        <tr>
                            {headers.map((header, index) => (
                                <th key={index} style={{
                                    background: '#24353a',
                                    color: 'white',
                                    padding: '16px 18px',
                                    textAlign: 'left',
                                    fontWeight: '700',
                                    fontSize: '1rem',
                                    letterSpacing: '0.5px',
                                    border: 'none'
                                }}>
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {dataRows.map((row, rowIndex) => (
                            <tr
                                key={rowIndex}
                                style={{
                                    background: rowIndex % 2 === 0 ? 'white' : 'rgba(119, 229, 164, 0.15)',
                                    transition: 'background-color 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(119, 229, 164, 0.25)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = rowIndex % 2 === 0 ? 'white' : 'rgba(119, 229, 164, 0.15)';
                                }}
                            >
                                {row.map((cell, cellIndex) => (
                                    <td key={cellIndex} style={{
                                        borderBottom: '1px solid rgba(119, 229, 164, 0.2)',
                                        padding: '14px 18px',
                                        textAlign: 'left',
                                        fontSize: '0.95rem',
                                        color: '#24353a',
                                        borderLeft: 'none',
                                        borderRight: 'none',
                                        borderTop: 'none'
                                    }}>
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Render any content after the table using ReactMarkdown */}
                {markdownContent.split('\n\n').slice(1).map((section, index) => {
                    if (section.trim() && !section.includes('|')) {
                        return (
                            <div key={index} style={{ margin: '20px 0' }}>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{section}</ReactMarkdown>
                            </div>
                        );
                    }
                    return null;
                })}
            </div>
        );
    };


    useEffect(() => {
        API.get('/exam').then((response) => {
            console.log("Backend Response:", response.data);
            Dataset(response.data);
        })
    }, []);

    const addSubject = async (e) => {

        e.preventDefault(); // prevent form reload
        setLoading(true);

        try {
            const response = await API.post('/exam', {
                sub: subject,
                date: examDate.toISOString(),
                syllabus: syllabus,
                DifficultyLevel: level,
                comments: comments
            });
            console.log("✅ Server response:", response.data);

            Dataset([...data, response.data.data]);

            // Reset form fields
            setSubject('');
            setExamDate(new Date());
            setSyllabus('');
            setLevel('');
            setComments('');

            // Show toast
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);

            // Hide form after successful submission
            setShowForm(false);

        } catch (error) {
            console.error("❌ Upload failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const deleteSubject = (id) => {
        API.delete(`/exam/${id}`).then(() => {
            Dataset(data.filter((info) => info._id !== id));
        });
    };

    const showSubjectform = () => {
        return (
            <div className="subject-form">
                <form>
                    <fieldset>
                        <legend>Please Fill All Details (Required)</legend>
                        <div className="form-container">
                            <label>Subject Name:</label>
                            <input
                                type='text'
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder='Enter Subject Name'
                                required
                            />

                            <label>Exam Date:</label>
                            <input
                                type='date'
                                value={examDate.toISOString().substring(0, 10)}
                                onChange={(e) => setExamDate(new Date(e.target.value))}
                                required
                            />

                            <label>Syllabus:</label>
                            <textarea
                                value={syllabus}
                                onChange={(e) => setSyllabus(e.target.value)}
                                placeholder='Enter the syllabus or topics that you want to cover'
                                required
                            ></textarea>

                            <label>Difficulty Level:</label>
                            <select value={level} onChange={(e) => setLevel(e.target.value)} required>
                                <option value=''>Select Level</option>
                                <option value='easy'>Easy</option>
                                <option value='medium'>Medium</option>
                                <option value='hard'>Hard</option>
                            </select>

                            <label>Comments:</label>
                            <textarea
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                placeholder='Which chapters you feel are hard and which are important that you want to cover first'
                            ></textarea>

                            <button className="add-subject-button" onClick={addSubject} disabled={loading}>
                                {loading ? <span className="spinner"></span> : "Add Subject"}
                            </button>

                        </div>
                    </fieldset>
                </form>
            </div>
        )
    }

    // Creating prompt to call API with timeout warning
    const handleChat = async () => {
        setAiLoading(true); // Set loading to true
        setAiPlan(""); // Clear previous plan
        setTimeoutWarning(false);
        // Set a timeout to show warning if response is slow
        const timeoutId = setTimeout(() => setTimeoutWarning(true), 10000);
        try {
            const res = await API.post('/chat', {
                prompt: "Create a table with [Date, Chapters, Tasks]",
                hours: hours
            });
            setAiPlan(res.data.output);
        } catch (error) {
            console.error("Error fetching AI plan:", error);
            setAiPlan("Failed to generate study plan.");
        } finally {
            clearTimeout(timeoutId);
            setAiLoading(false);
        }
    };

    return (
        <div className="main-container">
            <h1>SMART STUDY PLANNER</h1>
            <h3>Let's plan together to crack exams</h3>

            <div className="study-hours">
                <div className="study-hours-wrapper">
                    <label>Hours of Study per Day:</label>
                    <input
                        type='number'
                        value={hours}
                        placeholder='Enter hours of study'
                        disabled={lock}
                        onChange={(e) => {
                            setHours(e.target.value);
                            setLock(true);
                        }}
                    />
                    {lock && (
                        <button
                            className="edit-hours-btn"
                            onClick={() => {
                                localStorage.removeItem('study_hours');
                                setLock(false);
                            }}
                        >
                            Edit
                        </button>
                    )}
                </div>
            </div>

            <div className="add-subject">
                <button className="plus-button" onClick={() => setShowForm((view) => !view)}>
                    +
                </button>
                <label>Add Subject</label>
            </div>

            {showForm && showSubjectform()}

            {data.length > 0 && (
                <>
                    <h2>Stored Subjects</h2>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Subject</th>
                                    <th>Exam Date</th>
                                    <th>Syllabus</th>
                                    <th>Difficulty Level</th>
                                    <th>Comments</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((info) => (
                                    <tr key={info._id}>
                                        <td>{info.sub}</td>
                                        <td>{new Date(info.date).toISOString().split('T')[0]}</td>
                                        <td>Syllabus Submitted</td>
                                        <td style={{ textTransform: 'capitalize' }}>{info.DifficultyLevel}</td>
                                        <td>{info.comments || 'No comments'}</td>
                                        <td>
                                            <button onClick={() => deleteSubject(info._id)}>
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            <div className="generate-plan-container">
                <button
                    className="generate-plan-btn"
                    onClick={handleChat}
                    disabled={aiLoading} // Disable button while loading
                >
                    {aiLoading ? "Generating..." : "Generate Smart Study Plan"}
                </button>
            </div>

            {aiLoading && (
                <div className="ai-plan-container">
                    <h3>Generating your plan...</h3>
                    <p>This may take a moment. Please wait.</p>
                    {timeoutWarning && (
                        <p style={{ color: '#ff6b6b', fontWeight: 600 }}>
                            Response is taking longer than usual. Please wait a bit more.
                        </p>
                    )}
                </div>
            )}

            {/* Your existing aiPlan container, which will show after loading is complete */}
            {aiPlan && !aiLoading && (
                <div className="ai-plan-container">
                    <h3>Smart Study Plan</h3>
                    {/* Print & Copy Buttons */}
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '18px', justifyContent: 'flex-end' }}>
                        <button
                            className="plan-action-btn"
                            onClick={() => {
                                const printWindow = window.open('', '', 'width=900,height=700');
                                printWindow.document.write('<html><head><title>Print Study Plan</title>');
                                printWindow.document.write('<link rel="stylesheet" href="./Dashboard.css" />');
                                printWindow.document.write('</head><body >');
                                printWindow.document.write(`<h3>Smart Study Plan</h3>`);
                                printWindow.document.write(document.querySelector('.ai-plan-container').innerHTML);
                                printWindow.document.write('</body></html>');
                                printWindow.document.close();
                                printWindow.focus();
                                setTimeout(() => printWindow.print(), 500);
                            }}
                        >
                            <PrintIcon />
                            Print
                        </button>
                        <button
                            className="plan-action-btn"
                            onClick={() => {
                                navigator.clipboard.writeText(aiPlan);
                                alert('Study plan copied to clipboard!');
                            }}
                        >
                            <CopyIcon />
                            Copy
                        </button>
                    </div>
                    {/* Custom styled table renderer */}
                    <div
                        className="markdown-content study-plan-content"
                        style={{
                            fontSize: '14px',
                            lineHeight: '1.6'
                        }}
                    >
                        {renderStyledTable(aiPlan)}
                    </div>
                    <p>📸 Take a screenshot of the above plan before leaving this page.</p>
                </div>
            )}

            {/* Toast notification for successful subject add */}
            {showToast && (
                <div className="toast">Subject added successfully!</div>
            )}
        </div>
    );
}

export default Dashboard;