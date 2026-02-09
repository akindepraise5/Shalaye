# Shalaye Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐   │
│  │   Popup UI   │    │Content Script│    │  Service Worker  │   │
│  │  (popup.js)  │◄──►│ (content.js) │◄──►│(service-worker.js│   │
│  └──────────────┘    └──────────────┘    └────────┬─────────┘   │
│         │                   │                      │             │
│         │                   │                      │             │
│         ▼                   ▼                      ▼             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐   │
│  │ Chrome APIs  │    │  DOM Access  │    │   AI API Calls   │   │
│  │   Storage    │    │Text Extraction│    │                  │   │
│  └──────────────┘    └──────────────┘    └────────┬─────────┘   │
│                                                    │             │
└────────────────────────────────────────────────────┼─────────────┘
                                                     │
                                                     ▼
                    ┌────────────────────────────────────────────┐
                    │              EXTERNAL APIs                  │
                    ├────────────────────────────────────────────┤
                    │                                            │
                    │  ┌─────────────┐    ┌─────────────────┐   │
                    │  │   GEMINI    │    │      GROQ       │   │
                    │  │  (Primary)  │    │   (Fallback)    │   │
                    │  │             │    │                 │   │
                    │  │ gemini-2.0  │    │ llama-3.3-70b   │   │
                    │  │   flash     │    │   versatile     │   │
                    │  └─────────────┘    └─────────────────┘   │
                    │                                            │
                    └────────────────────────────────────────────┘
```

## Data Flow

### Summarization Flow
```
1. User clicks "Summarize"
         │
         ▼
2. Popup sends message to Content Script
         │
         ▼
3. Content Script extracts page text
         │
         ▼
4. Text sent to Service Worker
         │
         ▼
5. Service Worker calls Gemini API
         │
         ├──► Success: Parse & return summary
         │
         └──► Failure: Fallback to Groq API
                    │
                    ▼
              Return summary to Popup
                    │
                    ▼
              Display to user
```

### Component Responsibilities

| Component | File | Responsibility |
|-----------|------|----------------|
| **Popup** | `popup/popup.js` | UI logic, user interactions, display results |
| **Content Script** | `content/content.js` | Extract page content, show tooltips |
| **Service Worker** | `background/service-worker.js` | API calls, message routing, context menus |
| **Options** | `options/options.js` | User settings management |

## API Failover Strategy

```
┌─────────────────┐
│  API Request    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│  Try Gemini     │────►│    Success?     │
└─────────────────┘     └────────┬────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                   YES                        NO
                    │                         │
                    ▼                         ▼
           ┌──────────────┐          ┌──────────────┐
           │Return Result │          │  Try Groq    │
           └──────────────┘          └──────┬───────┘
                                            │
                                            ▼
                                   ┌──────────────┐
                                   │Return Result │
                                   └──────────────┘
```

## Storage Schema

```javascript
// chrome.storage.local
{
  "theme": "light" | "dark",
  "savedSummaries": [
    {
      "id": "timestamp",
      "url": "https://...",
      "title": "Page Title",
      "summary": "Summary text...",
      "keyPoints": ["Point 1", "Point 2"],
      "timestamp": "ISO date string"
    }
  ]
}
```

## Security Considerations

- API keys stored in service worker (not exposed to content scripts)
- No user data sent to external servers except for summarization
- All saved data stored locally in browser
- Content Security Policy enforced via Manifest V3
