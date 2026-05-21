# Chat PDF App — Requirements Document

A Python desktop application that lets a user upload a PDF file and have a conversational Q&A session with its contents, powered by the OpenAI API.

---

## Functional Requirements

| ID | Requirement | 
|----|-------------|
| FR-01 | User can upload exactly one PDF at a time |
| FR-02 | PDF text is extracted and held in memory |
| FR-03 | Loaded PDF filename is shown in the toolbar/header |
| FR-04 | User types messages in an input box and sends via button or Enter key |
| FR-05 | Full PDF text is included as system context in every API call |
| FR-06 | Entire conversation history is sent with each API call |
| FR-07 | AI response is displayed in full once the API call completes |
| FR-08 | Chat history is in-memory only — lost when app closes |
| FR-09 | Chat history is visible and scrollable |
| FR-10 | A loading/busy indicator is shown while waiting for AI response |
| FR-11 | Errors are shown inline in the chat or via a dialog (bad PDF, API failure, empty query)|
| FR-12 | A "Clear" action resets chat history. | 
| FR-13 | User can load a new PDF (replaces the current one, resets chat) |
| FR-14 | Chat messages must be clearly distinguished (User vs AI bubble style) |

---

## Architectural Decisions

| ID | Requirement | Decision | Alternatives Considered |
|----|-------------|----------|--------------------------|
| AD-01 | state change events  | NO    | Yes : events from state change triggers UI Updates |
| AD-02 | Session State        | In-memory only |  |
| AD-03 | API key Storage      | `.env` file    | Hardcoded, OS keychain |
| AD-04 | PDF Parsing          | PyMuPDF (fitz) | PdfReader, pdfplumber |
| AD-05 | GUI Framework        | PyQt6 | PySide, Tkinter |
| AD-06 | LLM Provider         | GPT-4o-mini | GPT-4o, Local model (Ollama), Claude API |
| AD-07 | Context Strategy     | Not used | Chunk + cosine similarity (numpy) |
| AD-08 | Vector DB            | Not used |  |
| AD-09 | Embeddings           | Not used | text-embedding-3-small |

---

## Non-Functional Requirements


## ⚙️ Non-Functional Requirements

| ID | Requirement | Decision | Alternatives Considered |
|----|-------------|----------|--------------------------|
| NFR-01 | Handling API call | on main thread(blocking) | Background thread (non-blocking, more complex) |


> **Note** The API call is intentionally kept on the main thread for simplicity. This means the UI will be unresponsive while the AI response is being fetched. A background thread approach (e.g. using `QThread`) would prevent freezing but adds architectural complexity — deferred to a future iteration.


---

## Decisions — Chat PDF App

### API call threading

| Alternative | Description & Reason |
|---|---|
| ✅ **Main thread (blocking)** | UI freezes during the call. Simple with no thread management |
| QThread (non-blocking)| API call runs in a background thread, keeping the UI responsive. Complex. |

---

### AD-01 · State change events

| Alternative | Description & Reason |
|---|---|
| ✅ **Direct method calls** | Simple. UI is updated by explicitly calling methods on components. |
| State-driven updates| State change emits signals. Complex and cleaner. For large apps. |

---

### AD-02 · Session state

| Alternative | Description & Reason |
|---|---|
| ✅ **In-memory only** | Chat history and PDF content live in memory. implest approach; no disk I/O or session management(lost on close) |
| Persist to disk (JSON/SQLite)| History saved to a file and reloaded on next launch (persist across sessions). complex use case. |

---


### AD-06 · API key storage

| Alternative | Description & Reason |
|---|---|
| ✅ **.env file** | Simple, developer-friendly convention. Key stays out of source code, loaded via python-dotenv at startup. Easy to set up and familiar to any Python developer. |
| Hardcoded in source| Fastest to implement but a security risk — key gets committed to version control. Never acceptable even for personal projects. |
| OS keychain| Most secure option (uses system credential store). Adds OS-specific code and extra dependencies — too heavy for a personal desktop tool. |

---

### AD-05 · PDF parsing

| Alternative | Description & Reason |
|---|---|
| ✅ **PyMuPDF (fitz)** | Fast, robust text extraction with good handling of complex layouts, multi-column text, and embedded fonts. Well-maintained and widely used. |
| PdfReader (pypdf)| Pure Python, no native dependency. But text extraction quality is lower for complex PDFs — spacing and layout issues are common. |
| pdfplumber| Excellent for structured/tabular PDFs. Heavier dependency than needed for simple text extraction in a chat context. |

---

### AD-03 · GUI framework

| Alternative | Description & Reason |
|---|---|
| ✅ **PyQt6** | Mature, well-documented, native-looking widgets, powerful signal/slot system, and strong layout management. Best fit for a structured MVC-style desktop app. |
| PySide6| Nearly identical to PyQt6 (same Qt bindings, official Qt license). Rejected only to avoid maintaining two equivalent options — PyQt6 has slightly more community examples. |
| Tkinter| Built into Python stdlib — zero install. But styling is dated, layout system is limited, and bubble-style chat UIs are painful to build. |
| CustomTkinter| Modern-looking Tkinter wrapper. Easier theming, but still inherits Tkinter's layout limitations and has a smaller ecosystem. |
| Python web (Streamlit / Gradio)| Python-powered web UI, runs in browser |
| React Native (mobile)| Cross-platform mobile app |


---

### AD-04 · LLM provider

| Alternative | Description & Reason |
|---|---|
| ✅ **GPT-4o-mini** | Faster, cheaper, good quality at lower cost |
| GPT-4o | Highest capability; higher cost(10×) and latency. Overkill for Chat PDF. |
| Local model- Ollama | offline, No API costs . Requires local GPU/CPU, slower responses. |
| Let user pick model in settings | Expose a model selector in the UI |
| Claude API | Strong reasoning, large context and higher cost|

---

### PDF content to be send to LLM(Context strategy)

| Alternative | Description & Reason |
|---|---|
| ✅ **Send entire PDF text** | simple, costly |
| Summarise PDF | Fast and lossy. One-time summarisation |
| Chunk PDF  |  For large docs. Vector search / RAG (scalable, accurate, complex)|
| Vector DB (FAISS / ChromaDB) | For large document collection |

---

### AD-08 & AD-09 · Vector DB & Embeddings

| Alternative | Description & Reason |
|---|---|
| ✅ **Not used** (chosen) | No retrieval pipeline needed — full text fits in context. Keeping these out removes the need for FAISS, ChromaDB, or the OpenAI embeddings endpoint entirely. |
| text-embedding-3-small + FAISS** | Embeds PDF chunks and retrieves relevant ones per query. Necessary for very large documents (>100 pages) but adds significant complexity and cost for this use case. |

---

### Display AI Response

| Alternative | Description & Reason |
|---|---|
| ✅ **After completion** | Simple. Wait for the full API response, then display it |
| Stream tokens | Response appears word-by-word as the API streams it |

---


## Out of Scope

- Multiple PDFs open simultaneously
- Persisting chat history to disk
- RAG / vector search / chunking strategies
- Streaming token output (typewriter effect)
- Embedded PDF viewer
- Background threading for API calls 
- Context retrieval via chunking + embedding search (FAISS or simple cosine similarity)

---


### Q1. What is the primary use case?

| Option | Description |
|--------|-------------|
| ✅ **Upload & chat with a single PDF at a time** | One PDF loaded at a time; must re-upload to change |
| Upload & chat with multiple PDFs simultaneously | Multiple PDFs open and queryable at once |
| Both — switch between PDFs or query across them | Hybrid mode with cross-PDF queries |

**Decision:** Upload & chat with a single PDF at a time.

---

### Q9. What should the main UI look like?

| Option | Description |
|--------|-------------|
| ✅ **Just a chat window + PDF filename shown** | Minimal UI: toolbar with filename, chat history area, input box |
| Embedded PDF viewer alongside chat | Split-pane: PDF rendered on one side, chat on the other |
| Separate panel showing extracted PDF text | Raw extracted text visible in a side panel |

**Decision:** Minimal UI — chat window with PDF filename shown.

---
