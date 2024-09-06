// Import packages
const express = require('express');
const ytdl = require('ytdl-core');
const http = require('http');
const cors = require('cors'); 
const fs = require('fs');
const app = express();
const path = require('path');
const ffmpegPath = require('ffmpeg-static');
const Ffmpeg = require('fluent-ffmpeg');

const server = http.createServer({
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
},app);

const multer = require('multer');


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


/*----------------------------------------------------------*/



app.use(cors());
app.use(express.json())


app.use(express.static('public'));
//------------------------------------------

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    return cb(null, "public/users")
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
app.post('/traduz',  upload.single('file'), (req, res) => {
  const db = readDB();
  let teto=req.body.texto
  let tetos=req.body.lang

  const index = db.langs.findIndex(use => use.texto == teto && use.lang == tetos)

  console.log(String(teto))
  console.log(String(tetos))
  if (index != -1) {
    
   console.log(String(teto))
   console.log(String(tetos))
   
    const trads=db.langs[index]
    const extT= trads.trad
    res.status(201).json(String(extT));
  }else{
 
 

   if(String(teto) == null || String(teto) == undefined || String(teto) == "" || String(teto) == " "){
    console.log("texto vazio")
    return
   }

   if(String(tetos) == null || String(tetos) == undefined || String(tetos) == "" || String(tetos) == " "){
    console.log("Idioma vazio")
    return
   }

   console.log(String(teto))
   console.log(String(tetos))
   try {
    traduz(String(teto), String(tetos))
    async function traduz(teto, tetos) {
      const translatedText = await translate(teto, tetos );
      const des = {
        texto : String(teto),
        trad: String(translatedText),
        lang: tetos
      }
      db.langs.push(des)
      writeDB(db)
      console.log(translatedText)
    //   imageUrl.push(String(translatedText))
      res.status(201).json(String(translatedText));
    }
   } catch (error) {
    console.log(error)
   }

  }
})

// -------------------------------------------------------------

app.post('/upload', upload.single('file'), (req, res) => {

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
app.get('/users', (req, res) => {
  const db = readDB();
  res.json(db.users);
});


app.get(`/users/:id`, (req, res) => {
  const db = readDB();
  const id = req.params.id
  const index = db.users.findIndex(use => use.id == id)

  if (index != -1) {
    const newU = db.users[index]
    res.status(200).json(newU)
  }
})


app.post('/userhs', (req, res) => {
  const db = readDB();
  const id = req.body.id
  const index = db.users.findIndex(use => use.id == id)
  console.log(id)

  if (index != -1) {
    console.log(index)
    const resu= db.users[index].nome
   // console.log(resu)
    res.json(resu); 
  }
  else{
    res.json('user not found');
  }
});

app.post('/users', (req, res) => {
  const db = readDB();
  const newUser = req.body;
  db.users.push(newUser);
  writeDB(db);
  res.status(201).json(newUser);
});

app.post('/userM', (req, res) => {
  const db = readDB();
  const id = req.body.id;
  
  const index = db.users.findIndex(use => use.id == id)
  if(index != -1){
      res.status(201).json({ok: id});      
  }
  else{
    const imgP = req.body.imgP;
    const imgC = req.body.imgC;
    const nome = req.body.nome;

    const des =   {
      id: id,
      Iperfil: imgP,
      Icapa: imgC,
      nome: nome,
      email: id,
      senha: id,
      tipo: "user"
    }  
    
    db.users.push(des);
    writeDB(db);
    res.status(201).json(db.users);  
  }

});

app.post('/userL', (req, res) => {
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
app.get('/musics', (req, res) => {
    const db = readDB();
    res.json(db.musics);
  });

  app.get(`/musics/:id`, (req, res) => {
    const db = readDB();
    const id = req.params.id
    const index = db.musics.findIndex(use => use.id == id)

    if (index != -1) {
      const newU = db.musics[index]
      res.status(200).json(newU)
    }
  })
  
  app.get(`/musis/:id`, (req, res) => {
    const db = readDB();
    const id = req.params.id
    const index = db.musics.findIndex(use => use.song == id)

    if (index != -1) {
      const newU = db.musics[index]
      res.status(200).json(newU)
    }
    
  })

  app.get(`/cates/:id`, (req, res) => {
    const db = readDB();
    const id = req.params.id
    const index = db.cates.findIndex(use => use.id == id)

    if (index != -1) {
      const newU = db.cates[index]
      res.status(200).json(newU)
    }
    
  })

  app.post('/musics', (req, res) => {
    const db = readDB();
    const newUser = req.body;
    db.musics.push(newUser);
    writeDB(db);
    res.status(201).json(newUser);
  });
  
  //-----------------------------------------------------
  //-----------------------------------------------------
app.get('/cates', (req, res) => {
    const db = readDB();
    res.json(db.cates);
  });
  
  app.post('/cates', (req, res) => {
    const db = readDB();
    const newUser = req.body;
    db.cates.push(newUser);
    writeDB(db);
    res.status(201).json(newUser);
  });
  
  //-----------------------------------------------------

  //-----------------------------------------------------
  //-----------------------------------------------------
    //-----------------------------------------------------
app.get('/reacts', (req, res) => {
  const db = readDB();
  res.json(db.reacts);
});

app.post('/reacts', (req, res) => {
  const db = readDB();
  const newUser = req.body;
  db.reacts.push(newUser);
  writeDB(db);
  res.status(201).json(newUser);
});

//-----------------------------------------------------
app.post('/serch', (req, res) => {
  const newUser = req.body.nome;
  const ytsr = require('ytsr');

  ytsr(newUser, { limit: 10 }).then(results => {
    const narra= results.items
    const nar=narra[0]
  res.status(201).json(narra.flat());
  }).catch(err => console.error(err));
})
// -----------------------------------------------------
function subs(texto) {
  return texto.replace(/\s+/g, '_');
}

const youtubedl = require('youtube-dl-exec')



app.post('/song', (req, res) => {
  const nome = req.body.nome
const url = req.body.url
const outputDir = path.resolve(__dirname, 'public'); // Diretório onde o arquivo será salvo
const output = `${outputDir}/${nome}.webm`; // Nome do arquivo de saída

 youtubedl(url, {
    extractAudio: true, // Extrai apenas o áudio
    audioFormat: 'mp3', // Define o formato de áudio como MP3
    output: output, // Define o caminho e nome do arquivo de saída
    noCheckCertificates: true, // Desativa a verificação de certificados SSL
    noWarnings: true, // Oculta avisos
    preferFreeFormats: true, // Prefere formatos gratuitos
    addMetadata: true, 
    progress: true// Adiciona metadados ao arquivo de áudio
}).then(outputs => {
  console.log('audio downloaded in 720p:', output)
  res.status(201).json(output);
})
     .catch(error => console.error(error));
})
// -----------------------------------------------------

Ffmpeg.setFfmpegPath(ffmpegPath)

app.post('/conv', (req, res) => {
  const nome = req.body.nome
  const url = req.body.urls
  console.log(nome)
  console.log(url)
  const outputDir = path.resolve(__dirname, 'public');
const fileName = `${outputDir}/${url}.webm`
console.log(fileName)
 Ffmpeg(fileName)
 .toFormat('mp3')
 .saveToFile(`${outputDir}/${nome}.mp3`)
 .on('end', () => {
   console.log('Conversão Completa');
   res.status(201).json(`${nome}.mp3`);
 })
 .on('error', (err) => {
   console.error('Erro durante a conversão:', err);
   res.status(500).json({ error: 'Falha na conversão do arquivo' });
 });

})
  //-----------------------------------------------------
app.get('/follow', (req, res) => {
    const db = readDB();
    res.json(db.follow);
  });

  app.post('/follow', (req, res) => {
    const db = readDB();
    const newUser = req.body;
    const id = req.body.id
    const idC = req.body.idC
    const index = db.follow.findIndex(use => use.id == id && use.idC == idC)
  
    if (index != -1) {
      db.follow.splice(index, 1)
      writeDB(db);
      res.status(201).json('nao');
    }else{
      db.follow.push(newUser);
      writeDB(db);
      res.status(201).json('sim');
    }
  
  });
  
  app.post('/folo', (req, res) => {
    const db = readDB();
    const newUser = req.body;
    const id = req.body.id
    const idC = req.body.idC
    const index = db.follow.findIndex(use => use.id == id && use.idC == idC)
  
    if (index != -1) {
      res.status(201).json('sim');
    }else{
      res.status(201).json('nao');
    }
  
  });
  
  //-----------------------------------------------------
  //-----------------------------------------------------
app.get('/destaque', (req, res) => {
    const db = readDB();
    res.json(db.destaque);
  });
  
  app.post('/destaque', (req, res) => {
    const db = readDB();
    const newUser = req.body;
    const id = req.body.id
    const index = db.destaque.findIndex(use => use.id == id)

    if (index != -1) {
      db.destaque.splice(index, 1)
      writeDB(db);
      res.status(201).json('nao');
    }else{
      db.destaque.push(newUser);
      writeDB(db);
      res.status(201).json('sim');
    }

  });
  
  app.post('/desta', (req, res) => {
    const db = readDB();
    const newUser = req.body;
    const id = req.body.id
    const index = db.destaque.findIndex(use => use.id == id)

    if (index != -1) {
      res.status(201).json('sim');
    }else{
      res.status(201).json('nao');
    }

  });
  
  //-----------------------------------------------------
//-----------------------------------------------------
app.get('/popular', (req, res) => {
    const db = readDB();
    res.json(db.popular);
  });
  

  app.post('/popular', (req, res) => {
    const db = readDB();
    const newUser = req.body;
    const id = req.body.id
    const index = db.popular.findIndex(use => use.id == id)

    if (index != -1) {
      db.popular.splice(index, 1)
      writeDB(db);
      res.status(201).json('nao');
    }else{
      db.popular.push(newUser);
      writeDB(db);
      res.status(201).json('sim');
    }

  });
  
  app.post('/popu', (req, res) => {
    const db = readDB();
    const newUser = req.body;
    const id = req.body.id
    const index = db.popular .findIndex(use => use.id == id)

    if (index != -1) {
      res.status(201).json('sim');
    }else{
      res.status(201).json('nao');
    }

  });
  //-----------------------------------------------------
  app.get('/seguids', (req, res) => {
    const db = readDB();
    res.json(db.seguids);
  });

  app.post('/seguids', (req, res) => {
    const db = readDB();
    const newUser = req.body;
    const id = req.body.id
    const index = db.seguids.findIndex(use => use.id == id)

    if (index != -1) {
      db.seguids.splice(index, 1)
      writeDB(db);
      res.status(201).json('nao');
    }else{
      db.seguids.push(newUser);
      writeDB(db);
      res.status(201).json('sim');
    }

  });
  
  app.post('/segui', (req, res) => {
    const db = readDB();
    const newUser = req.body;
    const id = req.body.id
    const index = db.seguids .findIndex(use => use.id == id)

    if (index != -1) {
      res.status(201).json('sim');
    }else{
      res.status(201).json('nao');
    }
 
  });
  //-----------------------------------------------------
app.get('/recomend', (req, res) => {
    const db = readDB();
    res.json(db.recomend);
  });
  

  app.post('/recomend', (req, res) => {
    const db = readDB();
    const newUser = req.body;
    const id = req.body.id
    const index = db.recomend.findIndex(use => use.id == id)
  
    if (index != -1) {
      db.recomend.splice(index, 1)
      writeDB(db);
      res.status(201).json('nao');
    }else{
      db.recomend.push(newUser);
      writeDB(db);
      res.status(201).json('sim');
    }
  
  });
  
  app.post('/reco', (req, res) => {
    const db = readDB();
    const newUser = req.body;
    const id = req.body.id
    const index = db.recomend .findIndex(use => use.id == id)
  
    if (index != -1) {
      res.status(201).json('sim');
    }else{
      res.status(201).json('nao');
    }
  
  });
  
  //-----------------------------------------------------
    //-----------------------------------------------------
app.get('/playlist', (req, res) => {
  const db = readDB();
  res.json(db.playlist);
});

app.post('/playlist', (req, res) => {
  const db = readDB();
  const newUser = req.body;
  db.playlist.push(newUser);
  writeDB(db);
  res.status(201).json(db.playlist);
});

app.post('/playlists', (req, res) => {
  const db = readDB();
  const newUser = req.body;
  const id = req.body.id
  const idUs = req.body.idUs
  const idC = req.body.idC
  const index = db.playlist.findIndex(use => use.id == id && use.idUs == idUs)

  if (index != -1) {
    let play =  db.playlist[index].musis
    const indexs = play.findIndex(use => use == idC)
    if (indexs != -1) {
      res.status(201).json("Já existe");
    }else{
      play.push(idC);
      writeDB(db);
      res.status(201).json(db.playlist);
    }
  
  }
});

//-----------------------------------------------------
  //-----------------------------------------------------
  app.get('/regiao', (req, res) => {
    const db = readDB();
    res.json(db.regiao);
  });
  
  app.post('/regiao', (req, res) => {
    const db = readDB();
    const newUser = req.body;
    db.regiao.push(newUser);
    writeDB(db);
    res.status(201).json(newUser);
  });
  
  //-----------------------------------------------------
  app.get('/favorities', (req, res) => {
    const db = readDB();
    res.json(db.favorities);
  });

  app.post('/favorities', (req, res) => {
    const db = readDB();
    const newUser = req.body;
    const id = req.body.id
    const idC = req.body.idC
    const index = db.favorities.findIndex(use => use.id == id && use.idC == idC)
  
    if (index != -1) {
      db.favorities.splice(index, 1)
      writeDB(db);
      res.status(201).json('nao');
    }else{
      db.favorities.push(newUser);
      writeDB(db);
      res.status(201).json('sim');
    }
  
  });
  
  app.post('/favo', (req, res) => {
    const db = readDB();
    const newUser = req.body;
    const id = req.body.id
    const idC = req.body.idC
    const index = db.favorities.findIndex(use => use.id == id && use.idC == idC)
  
    if (index != -1) {
      res.status(201).json('sim');
    }else{
      res.status(201).json('nao');
    }
  
  });
  // ------------------------------------------------------
  app.post('/cache', (req, res) => {
    const db = readDB();
    const newUser = req.body;
    const id = req.body.id
    const index = db.caches.findIndex(use => use.id == id)
  
    if (index != -1) {
      let mus = db.caches[index]
      res.status(201).json({msg: 'sim', item: mus});
    }else{
      res.status(201).json({msg: 'nao'});
    }
  
  });

  app.post('/cache', (req, res) => {
    const db = readDB();
    const newUser = req.body;
    db.caches.push(newUser);
    writeDB(db);
    res.status(201).json(newUser);
  });

  app.post('/musis/:id', (req, res) => {
    const db = readDB();
    const id = req.params.id
    const index = db.musics.findIndex(use => use.song == id)
  
    if (index != -1) {
      let mus = db.musics[index]
      res.status(201).json(mus);
    }
  
  });

  const port = process.env.PORT || 9001;
app.listen(port, () => console.log(`Listening to port ${port}`));
