import React, { useState, useRef } from 'react';
import axios from 'axios';

const MAX_SIZE_MB = 10;

function FileUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const inputRef = useRef();

  const handleFile = (f) => {
    setError('');
    setUploadProgress('');

    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowed.includes(f.type)) {
      setError('❌ Unsupported file type. Please upload a PDF or DOCX file only.');
      return;
    }

    const sizeMB = f.size / (1024 * 1024);
    if (sizeMB > MAX_SIZE_MB) {
      setError(`❌ File too large (${sizeMB.toFixed(1)} MB). Maximum allowed size is ${MAX_SIZE_MB} MB. Please upload a smaller file.`);
      return;
    }

    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setUploadProgress('Uploading file…');

    try {
      const formData = new FormData();
      formData.append('document', file);

      setUploadProgress('Parsing document and generating embeddings…');

      const res = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setUploadProgress('Done! Loading chat…');
      onUploadSuccess({ ...res.data, fileName: file.name });

    } catch (err) {
      if (!err.response) {
        setError('❌ Cannot connect to backend. Make sure the server is running on port 5000 (run: npm run dev in the backend folder).');
      } else if (err.response.status === 413) {
        setError(`❌ File too large for the server. Please upload a file under ${MAX_SIZE_MB} MB.`);
      } else {
        setError(`❌ ${err.response?.data?.error || 'Upload failed. Please try again.'}`);
      }
    } finally {
      setLoading(false);
      setUploadProgress('');
    }
  };

  const sizeMB = file ? (file.size / (1024 * 1024)).toFixed(2) : null;

  return (
    <div className="upload-wrapper">
      <div className="upload-card">
        <h2 className="upload-heading">Upload Your Document</h2>
        <p className="upload-subheading">Supports PDF and DOCX · Max {MAX_SIZE_MB} MB</p>

        <div
          className={`drop-zone ${dragOver ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !loading && inputRef.current.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
          />
          <div className="drop-icon">{file ? '✓' : '⬆'}</div>
          <p className="drop-text">
            {file ? file.name : 'Drag & drop your PDF or DOCX here'}
          </p>
          <span className="drop-hint">
            {file
              ? `${sizeMB} MB — ${sizeMB > MAX_SIZE_MB ? '❌ Too large!' : '✓ Ready to upload'}`
              : `or click to browse files (max ${MAX_SIZE_MB} MB)`}
          </span>
        </div>

        {/* Loading progress */}
        {loading && (
          <div className="upload-progress">
            <div className="progress-bar">
              <div className="progress-fill" />
            </div>
            <p className="progress-text">{uploadProgress}</p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="upload-error-box">
            <p>{error}</p>
            <button onClick={() => setError('')}>✕</button>
          </div>
        )}

        <button
          className="upload-btn"
          onClick={handleUpload}
          disabled={!file || loading}
        >
          {loading ? (
            <span className="btn-loading">
              <span className="spinner" /> {uploadProgress || 'Processing…'}
            </span>
          ) : 'Upload & Start Chatting'}
        </button>

        <p className="upload-note">
          Document is parsed, chunked, and embedded for AI-powered Q&amp;A
        </p>
      </div>
    </div>
  );
}

export default FileUpload;
