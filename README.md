# Solfege Hand Sign Interpreter 🎵✋

A browser-based music education tool that uses your webcam to detect solfege hand signs and play corresponding notes in real time. Built with p5.js, ml5.js (handpose), and Web Audio API.

## 🌟 Features

- Real-time hand tracking via webcam  
- Detects 8 solfege signs: Do, Re, Mi, Fa, Sol, La, Ti, High Do  
- Plays corresponding notes in the selected musical key  
- Visual feedback on detected hand sign and pitch  
- Fully responsive UI with light/dark aesthetics  
- Interactive help modal for beginners

## 📸 How It Works

1. Click **"Start Camera"** to activate webcam  
2. Select a **musical key** (C–B Major) from the dropdown  
3. Show your **hand signs** to play solfege notes  
4. Visual + audio feedback will reflect your input

## 🎼 Supported Hand Signs

| Sign       | Fingers Used                     |
|------------|----------------------------------|
| Do         | Index only                       |
| Re         | Index + Middle                   |
| Mi         | Index + Middle + Ring            |
| Fa         | All fingers except thumb         |
| Sol        | All five fingers                 |
| La         | Ring + Pinky only                |
| Ti         | Middle + Ring + Pinky            |
| High Do    | Thumb + Pinky                    |

## 🧠 Technologies Used

- [p5.js](https://p5js.org/) – Canvas and audio synthesis  
- [ml5.js](https://ml5js.org/) – Handpose model  
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) – Sound generation  
- HTML5 + CSS3 – Modern responsive UI

## 🛠 Setup Instructions

### 1. Clone the repository or download the ZIP

```bash
git clone git@github.com:georges-macheta/LectureLounge.git
