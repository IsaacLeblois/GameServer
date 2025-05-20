# 🕹️ Futuristic Multiplayer Demo – Obsidian Portfolio

This is a **real-time multiplayer demo** built for the Obsidian portfolio. It simulates multiple users controlling glowing blocks on a shared futuristic grid using **WebSockets** and **HTML5 Canvas**. The interface features a cyberpunk aesthetic, smooth animations, and live interaction between connected clients.

## 🌟 Highlights

- ⚡ Real-time updates between players using WebSocket  
- ✨ Neon-style UI and animated modal interface  
- 🧠 Smooth client-side interpolation for movement  
- 🧭 Floating game controls with reactive key feedback  
- 📡 Dynamic "Searching server..." animation while connecting  

## 🛠️ Built With

- HTML5 + CSS3 + Vanilla JavaScript  
- WebSocket API  
- Hosted with **Netlify** (Frontend) and **Render** (Backend)  

## 🎮 Controls

Use the **arrow keys** to move your block:

```
↑ Up  
↓ Down  
← Left  
→ Right
```

When a key is pressed, the corresponding direction is highlighted in the floating control display.

## 📦 Setup

1. Clone or download this repository.
2. Run your WebSocket server and ensure it supports `wss://` (for HTTPS sites like Netlify).
3. Replace the `ws://` URL in the script with your `wss://your-server.com`.
4. Deploy the frontend (e.g., with Netlify).

## 🌐 Live Demo

Check out the live version:  
👉 [obsserver.netlify.app](https://obsserver.netlify.app)
