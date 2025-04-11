import { useState, useEffect } from 'react';
import Head from 'next/head';

const ADMIN_PASSWORD = 'admin123'; // In a real app, this would be in environment variables

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    correctAnswer: '',
    options: ['', '', '', ''],
    type: 'multiple-choice'
  });
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      // Load questions from localStorage
      const savedQuestions = localStorage.getItem('customQuestions');
      if (savedQuestions) {
        try {
          const parsed = JSON.parse(savedQuestions);
          setQuestions(parsed.questions || []);
        } catch (error) {
          console.error('Error loading questions:', error);
        }
      }
    } else {
      showNotification('Invalid password', 'error');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error('Invalid file format: missing questions array');
      }

      data.questions.forEach((q, i) => {
        if (!q.question || !q.correctAnswer || !q.options || !Array.isArray(q.options)) {
          throw new Error(`Invalid question format at index ${i}`);
        }
      });

      setQuestions(prev => [...prev, ...data.questions]);
      saveQuestions([...questions, ...data.questions]);
      showNotification(`Loaded ${data.questions.length} questions successfully`);
    } catch (error) {
      showNotification('Error loading questions: ' + error.message, 'error');
    }
  };

  const handleAddQuestion = (e) => {
    e.preventDefault();
    if (!newQuestion.question || !newQuestion.correctAnswer || newQuestion.options.some(opt => !opt)) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    const updatedQuestions = [...questions, newQuestion];
    setQuestions(updatedQuestions);
    saveQuestions(updatedQuestions);
    setNewQuestion({
      question: '',
      correctAnswer: '',
      options: ['', '', '', ''],
      type: 'multiple-choice'
    });
    showNotification('Question added successfully');
  };

  const handleDeleteQuestion = (index) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
    saveQuestions(updatedQuestions);
    showNotification('Question deleted');
  };

  const saveQuestions = (questions) => {
    localStorage.setItem('customQuestions', JSON.stringify({
      title: 'Custom Questions',
      description: 'Admin created questions',
      questions
    }));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="bg-slate-800 p-8 rounded-lg shadow-xl max-w-md w-full">
          <h1 className="text-2xl font-bold text-amber-400 mb-6">Admin Login</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full p-2 mb-4 rounded bg-slate-700 text-white"
            />
            <button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-500 text-white p-2 rounded"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <Head>
        <title>Admin - Question Manager</title>
      </Head>

      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg ${
          notification.type === 'error' ? 'bg-red-600' : 'bg-green-600'
        }`}>
          <span className="text-white">{notification.message}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-amber-400">Question Manager</h1>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>

        {/* File Upload */}
        <div className="bg-slate-800 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-bold text-amber-400 mb-4">Upload Questions</h2>
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="text-white"
          />
        </div>

        {/* Add New Question */}
        <div className="bg-slate-800 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-bold text-amber-400 mb-4">Add New Question</h2>
          <form onSubmit={handleAddQuestion}>
            <div className="mb-4">
              <label className="block text-white mb-2">Question</label>
              <input
                type="text"
                value={newQuestion.question}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                className="w-full p-2 rounded bg-slate-700 text-white"
              />
            </div>
            <div className="mb-4">
              <label className="block text-white mb-2">Correct Answer</label>
              <input
                type="text"
                value={newQuestion.correctAnswer}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, correctAnswer: e.target.value }))}
                className="w-full p-2 rounded bg-slate-700 text-white"
              />
            </div>
            <div className="mb-4">
              <label className="block text-white mb-2">Options</label>
              {newQuestion.options.map((option, index) => (
                <input
                  key={index}
                  type="text"
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...newQuestion.options];
                    newOptions[index] = e.target.value;
                    setNewQuestion(prev => ({ ...prev, options: newOptions }));
                  }}
                  className="w-full p-2 rounded bg-slate-700 text-white mb-2"
                  placeholder={`Option ${index + 1}`}
                />
              ))}
            </div>
            <button
              type="submit"
              className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded"
            >
              Add Question
            </button>
          </form>
        </div>

        {/* Question List */}
        <div className="bg-slate-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-amber-400 mb-4">Existing Questions</h2>
          {questions.map((q, index) => (
            <div key={index} className="bg-slate-700 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white font-bold mb-2">{q.question}</p>
                  <p className="text-green-400 text-sm mb-2">Correct: {q.correctAnswer}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map((option, i) => (
                      <div
                        key={i}
                        className={`p-2 rounded ${
                          option === q.correctAnswer
                            ? 'bg-green-600/20 text-green-400'
                            : 'bg-slate-600/50 text-slate-300'
                        }`}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteQuestion(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}