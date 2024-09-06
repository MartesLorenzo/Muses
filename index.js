// Import packages
const express = require("express");
const home = require("./routes/home");
const ytdl = require('ytdl-core');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors'); 
const fs = require('fs');
const app = express();
const { execFile } = require('child_process');
const path = require('path');
const ffmpegPath = require('ffmpeg-static');
const Ffmpeg = require('fluent-ffmpeg');

// Middlewares
app.use(express.json());

// Routes
app.use("/home", home);

app.get('/video', (req, res) => {
    const videoUrl = 'https://www.youtube.com/watch?v=Wcgc6N7mWag';
    res.header('Content-Disposition', 'attachment; filename="video.mp4"');
    ytdl(videoUrl, { format: 'mp4' }).pipe(res);
  });
  
  app.get('/audio', (req, res) => {
    const videoUrl = 'https://www.youtube.com/watch?v=Wcgc6N7mWag';
    res.header('Content-Disposition', 'attachment; filename="audio.webm"');
    ytdl(videoUrl, { filter: 'audioonly' }).pipe(res);
  });
  
  
// connection
const port = process.env.PORT || 9001;
app.listen(port, () => console.log(`Listening to port ${port}`));
