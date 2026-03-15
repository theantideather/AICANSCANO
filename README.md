# AICanScanO Web — AI-Powered Oral Cancer Early Detection

A web application that lets users upload intra-oral photographs and receive an AI-assisted risk assessment for oral cancer and suspicious lesions.

> **⚠️ Disclaimer:** This is a **prototype/research tool**, not a medical device. It does not provide medical diagnoses. Always consult a qualified healthcare professional for any oral health concerns.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. (Optional) Configure the Roboflow API key
#    Create a .env file:
echo "ROBOFLOW_API_KEY=your_key_here" > .env

# 3. Start the server
npm start

# 4. Open in browser
open http://localhost:3000
```

The app works **without an API key** — it will return simulated risk assessments for demo purposes.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ROBOFLOW_API_KEY` | No (mock mode if unset) | Your Roboflow API key ([get one free](https://app.roboflow.com/)) |
| `ROBOFLOW_MODEL_ENDPOINT` | No | Model endpoint URL (defaults to `https://detect.roboflow.com/oral-cancer-dataset/1`) |
| `PORT` | No | Server port (defaults to `3000`) |

---

## API Used

**Roboflow Universe — oral-cancer-dataset** (hosted inference)

- Public model trained on oral cancer image data
- Free tier: 1,000 inferences/month
- REST API with base64 image upload
- [Browse on Roboflow Universe](https://universe.roboflow.com/)

### Getting a Key

1. Sign up at [app.roboflow.com](https://app.roboflow.com/)
2. Go to **Settings → API Keys**
3. Copy your API key
4. Add it to a `.env` file in this directory

---

## Project Structure

```
aicanscan-web/
├── server.js          # Express backend, /analyze endpoint, Roboflow integration
├── package.json       # Dependencies
├── .env               # API keys (create this yourself, not committed)
├── README.md
└── public/
    ├── index.html     # Single-page layout
    ├── styles.css     # Dark futuristic theme, glassmorphism
    └── app.js         # Upload, preview, API call, result rendering
```

---

## Limitations

- **Not clinically validated.** Model performance on real-world images may differ significantly from research benchmarks.
- **Mock mode by default.** Without a Roboflow API key, responses are simulated.
- **Image quality matters.** Poor lighting, blur, or incorrect framing may affect results.
- **No data persistence.** Images are processed in memory and not stored.

---

## License

MIT
