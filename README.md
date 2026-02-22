# 🧠 HumanizedBrain
### **The Premium AI Document Humanizer SaaS**

[![Next.js](https://img.shields.io/badge/Next.js-15+-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-1.5_Flash-4285F4?style=for-the-badge&logo=google-gemini)](https://aistudio.google.com/)
[![Claude AI](https://img.shields.io/badge/Claude_3.5-Sonnet-D97757?style=for-the-badge&logo=anthropic)](https://www.anthropic.com/)

**HumanizedBrain** is a production-ready SaaS designed to give AI-generated text a "human soul." It bypasses advanced detectors (GPTZero, Originality.ai) by injecting linguistic "burstiness" and "perplexity" while preserving 100% of the original document's formatting.

---

## ✨ Features

- **💎 Glassmorphism UI**: A high-end, premium dashboard built with a modern aesthetic, vibrant gradients, and smooth Framer Motion animations.
- **🔄 Split-View Editor**: Compare your original (AI-detected) text side-by-side with the humanized version in real-time.
- **📄 Format Preservation**: Sophisticated document processing for **PDF** and **DOCX** files that keeps headers, tables, and styles intact.
- **🤖 Dual AI Engine**: Support for **Claude 3.5 Sonnet** (Premium) and **Gemini 1.5 Flash** (Free Tier), with an automatic "Smart Simulation" fallback.
- **🛡️ Zero Hallucination**: Mathematical precision in preserving the original meaning and factual accuracy of your content.
- **⚡ Pro-Grade Stack**: Built with Next.js 15 (App Router), Tailwind v4, shadcn/ui, and Zustand for ultra-fast, reactive performance.

---

## 🚀 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (Turbopack)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Document Processing**: `pdf-lib` (PDF) & `mammoth.js` (DOCX)
- **AI Integration**: `@google/generative-ai` & `@anthropic-ai/sdk`
- **Typography**: Inter & Geist Mono

---

## 🛠️ Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-username/humanized-brain.git
cd humanized-brain
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory and add your API keys:

```env
# AI Service Keys (At least one is required for AI mode)
GEMINI_API_KEY=your_gemini_api_key
ANTHROPIC_API_KEY=your_claude_api_key
```
*Note: If no keys are provided, the app will run in "Smart Simulation" mode for local development.*

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

---

## 🧠 How It Works

1. **Extraction**: The system extracts raw content from your uploaded `.pdf` or `.docx` using client-side buffers.
2. **Analysis**: AI identifies typical "robotic" fingerprints such as redundant transitions and uniform sentence lengths.
3. **Humanization**:
    *   **Phase 1**: Content is rewritten to increase linguistic complexity (**Perplexity**).
    *   **Phase 2**: Sentence structures are varied to create natural rhythm (**Burstiness**).
4. **Export**: The humanized text is re-injected into a downloadable format, maintaining your original layout.

---

## 📁 Project Structure

```text
├── app/                  # Next.js App Router (API & Layout)
├── components/           # UI & Feature Components
│   ├── dashboard/       # Glassmorphism Dashboard logic
│   ├── editor/          # Side-by-side split editor
│   └── ui/              # shadcn/ui primitives
├── lib/                  # Core Business Logic
│   ├── ai/              # Gemini & Claude prompt chains
│   ├── docs/            # PDF/DOCX processing utilities
│   └── store/           # Zustand global state management
└── public/               # Static assets
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">Built with 💜 for the future of AI-Human collaboration.</p>
