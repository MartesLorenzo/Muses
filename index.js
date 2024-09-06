const express = require('express');
const ytdl = require('ytdl-core');

const http = require('http');
// const { Server } = require('socket.io');
const cors = require('cors'); 
const eapp = express();
const server = http.createServer(eapp);
// const io = new Server(server);
const fs = require('fs');
const multer = require('multer');

eapp.get('/video', (req, res) => {
  const videoUrl = 'https://www.youtube.com/watch?v=Wcgc6N7mWag';
  res.header('Content-Disposition', 'attachment; filename="video.mp4"');
  ytdl(videoUrl, { format: 'mp4' }).pipe(res);
});

eapp.get('/audio', (req, res) => {
  const videoUrl = 'https://www.youtube.com/watch?v=Wcgc6N7mWag';
  res.header('Content-Disposition', 'attachment; filename="audio.webm"');
  ytdl(videoUrl, { filter: 'audioonly' }).pipe(res);
});


/*----------------------------------------------------------*/



eapp.use(cors());
eapp.use(express.json())

//------------------------------------------

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    return cb(null, "Uploads")
  },
  filename: function (req, file, cb){
    return cb(null, `${Date.now()}_${file.originalname}`)
  }
})

const upload = multer({storage})


const axios = require('axios');

async function translate(text, targetLang, sourceLang = 'pt') {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURI(text)}`;

  try {
      const response = await axios.get(url);
      const translations = response.data[0];
      const translatedText = translations.map(translation => translation[0]).join('');
      return translatedText;
  } catch (error) {
      console.error('Erro ao traduzir:', error);
      throw error;
  }
}


module.exports = translate;
//-----------------------------------------------------------



eapp.post('/upload', upload.single('file'), (req, res) => {

  const filename = req.file.filename
  const imageUrl = `${filename}`; 
// Update URL with new filename

res.json({ imageUrl });
});
// Endpoint para adicionar um novo usuário
const readDB = () => {
  const data = fs.readFileSync('muse.json');
  return JSON.parse(data);
};

// Função para escrever no banco de dados JSON
const writeDB = (data) => {
  fs.writeFileSync('muse.json', JSON.stringify(data, null, 2));
};

// Endpoint para obter todos os usuários
//-----------------------------------------------------
eapp.get('/users', (req, res) => {
  const db = readDB();
  res.json(db.users);
});

eapp.post('/users', (req, res) => {
  const db = readDB();
  const newUser = req.body;
  db.users.push(newUser);
  writeDB(db);
  res.status(201).json(newUser);
});

eapp.post('/userL', (req, res) => {
  const db = readDB();
  const email = req.body.email;
  const senha = req.body.senha;
  
  const index = db.users.findIndex(use => use.email == email && use.senha == senha)
  if(index != -1){
      res.status(201).json({ok: db.users[index]});      
  }
  else{
    res.status(404).json({error: 'Invalid'});     
  }

});

//-----------------------------------------------------
//-----------------------------------------------------
eapp.get('/musics', (req, res) => {
    const db = readDB();
    res.json(db.musics);
  });
  
  eapp.post('/musics', (req, res) => {
    const db = readDB();
    const newUser = req.body;
    db.musics.push(newUser);
    writeDB(db);
    res.status(201).json(newUser);
  });
  
  //-----------------------------------------------------
  //-----------------------------------------------------
eapp.get('/cates', (req, res) => {
    const db = readDB();
    res.json(db.cates);
  });
  
  eapp.post('/cates', (req, res) => {
    const db = readDB();
    const newUser = req.body;
    db.cates.push(newUser);
    writeDB(db);
    res.status(201).json(newUser);
  });
  
  //-----------------------------------------------------

  //-----------------------------------------------------
eapp.get('/chats', (req, res) => {
    const db = readDB();
    res.json(db.chats);
  });
  
  eapp.post('/chats', (req, res) => {
    const db = readDB();
    const newUser = req.body;
    db.chats.push(newUser);
    writeDB(db);
    res.status(201).json(newUser);
  });
  
  //-----------------------------------------------------
  //-----------------------------------------------------
eapp.get('/follow', (req, res) => {
    const db = readDB();
    res.json(db.follow);
  });
  
  eapp.post('/follow', (req, res) => {
    const db = readDB();
    const newUser = req.body;
    db.follow.push(newUser);
    writeDB(db);
    res.status(201).json(newUser);
  });
  
  //-----------------------------------------------------
  //-----------------------------------------------------
eapp.get('/destaque', (req, res) => {
    const db = readDB();
    res.json(db.destaque);
  });
  
  eapp.post('/destaque', (req, res) => {
    const db = readDB();
    const newUser = req.body;
    db.destaque.push(newUser);
    writeDB(db);
    res.status(201).json(newUser);
  });
  
  //-----------------------------------------------------
//-----------------------------------------------------
eapp.get('/popular', (req, res) => {
    const db = readDB();
    res.json(db.popular);
  });
  
  eapp.post('/popular', (req, res) => {
    const db = readDB();
    const newUser = req.body;
    db.popular.push(newUser);
    writeDB(db);
    res.status(201).json(newUser);
  });
  
  //-----------------------------------------------------
  //-----------------------------------------------------
eapp.get('/recomend', (req, res) => {
    const db = readDB();
    res.json(db.recomend);
  });
  
  eapp.post('/recomend', (req, res) => {
    const db = readDB();
    const newUser = req.body;
    db.recomend.push(newUser);
    writeDB(db);
    res.status(201).json(newUser);
  });
  
  //-----------------------------------------------------


eapp.listen(3000, () => {
    console.log('Server is running on port 3000');
  });