# Jeeves Sidebar (VS Code Extension)

A friendly local AI assistant who lives in your VS Code sidebar.  
Built with ❤️ by **Liziloo**.

## Features

- Sidebar chat interface with streaming output  
- Markdown + code block rendering  
- Persistent chat history  
- Right–click "Ask Jeeves About This Code"  
- User-configurable server URL  
- MIT license – free to use and modify  

## Requirements

You must be running a compatible local Jeeves AI server (FastAPI, Node, etc.).  
Default URL: `http://localhost:8140/ask`  
Configurable in **Settings → Extensions → Jeeves**.

## Extension Settings

- `jeeves.serverUrl` – URL for your AI backend  
- `jeeves.temperature` – optional model temperature  

## Development

```bash
npm install
npm run compile
