# DocQA – AI Document Question Answering

## Tech Stack
- **Frontend**: React
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **LLM**: LLaMA 3 via Groq API (free, open-source)
- **Embeddings**: all-MiniLM-L6-v2 via @xenova/transformers (runs locally)

---

## Prerequisites
- Node.js 18+
- MongoDB Community Server installed
- Groq API Key (free)

---

## Setup Instructions

### Step 1 – Get Free Groq API Key
1. Go to https://console.groq.com
2. Sign up for free
3. Go to **API Keys** → **Create API Key**
4. Copy the key (starts with `gsk_...`)

### Step 2 – Add your Groq API Key
Open `backend/.env` and replace `your_groq_api_key_here` with your actual key:
```
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxx
```

---

### Step 3 – Start MongoDB (Windows)

MongoDB runs as a Windows Service. You need to start it before running the backend.

#### Option A – Using Command Prompt as Administrator (Required first time)
1. Press **Windows key**
2. Type **cmd**
3. Right-click on **Command Prompt**
4. Click **"Run as administrator"**
5. Click **Yes** on the popup
6. Run this command:
```bash
net start MongoDB
```
You should see:
```
The MongoDB service is starting.
The MongoDB service was started successfully.
```

#### Option B – Set MongoDB to start automatically (Recommended, do this once)
So you never have to manually start MongoDB again:
1. Press **Windows + R** on your keyboard
2. Type `services.msc` and press Enter
3. Find **MongoDB** in the list
4. Right-click on it → click **Properties**
5. Set **Startup type** to **Automatic**
6. Click **Apply** → **OK**

After this, MongoDB will **start automatically every time Windows boots** and you will never need to run `net start MongoDB` again.

---

### Step 4 – Start Backend
Open a terminal in VS Code (Ctrl + `) and run:
```bash
cd backend
npm install
npm run dev
```
> **First run note:** The first time you run this, it will automatically download the embedding model (~25MB). Wait until you see **"✅ Embedding model loaded"** in the terminal before uploading any file.

Server runs at: **http://localhost:5000**

---

### Step 5 – Start Frontend
Open a **new terminal** in VS Code (click the + button in terminal panel) and run:
```bash
cd frontend
npm install
npm start
```

App opens automatically at: **http://localhost:3000**

---

## Every Time You Want to Run the Project

If you set MongoDB to Automatic (Step 3 Option B), you only need:

**Terminal 1:**
```bash
cd backend
npm run dev
```

**Terminal 2:**
```bash
cd frontend
npm start
```

If MongoDB is NOT set to Automatic, first open **cmd as Administrator** and run:
```bash
net start MongoDB
```
Then run the backend and frontend as above.

---

## How It Works
1. Upload a PDF or DOCX → parsed into text chunks
2. Each chunk is embedded using `all-MiniLM-L6-v2` (runs locally, no install needed)
3. Embeddings are stored in MongoDB
4. When you ask a question → your query is embedded → top matching chunks are retrieved (cosine similarity)
5. Top chunks + your question are sent to **LLaMA 3** via Groq API
6. Answer is returned and saved to chat history in MongoDB

---

## Chat History
- All messages are **automatically saved to MongoDB**
- The **sidebar** shows all past chat sessions grouped by date
- Click any past chat in the sidebar to reload it
- History **persists even when you close VS Code and reopen it**
- Refreshing the page takes you back to upload screen but sidebar keeps all history

---

## Project Structure
```
doc-qa-app/
├── backend/
│   ├── server.js
│   ├── .env                  ← ADD YOUR GROQ KEY HERE
│   ├── routes/
│   │   ├── upload.js
│   │   └── chat.js
│   ├── models/
│   │   ├── Document.js
│   │   └── ChatHistory.js
│   └── utils/
│       ├── parseDocument.js
│       ├── embeddings.js
│       └── ragPipeline.js
└── frontend/
    ├── public/index.html
    └── src/
        ├── App.js
        ├── index.js
        ├── components/
        │   ├── Sidebar.js
        │   ├── FileUpload.js
        │   ├── ChatInterface.js
        │   └── ChatMessage.js
        └── styles/App.css
```

---

## Troubleshooting

| Problem                     | Solution |
|---|---|
| `mongod` is not recognized | Start MongoDB via `net start MongoDB` in admin cmd |
| `net start MongoDB` — Access denied | You must run cmd as Administrator (right-click → Run as administrator) |
| Backend not starting | Make sure MongoDB is running first |
| Model `llama3-8b-8192` decommissioned error | Open `backend/utils/ragPipeline.js` and change model to `llama-3.3-70b-versatile` |
| Upload fails with "check backend" | Make sure `npm run dev` is running in the backend folder |
| File too large error | Maximum file size is 10MB. Use a smaller PDF or DOCX |

