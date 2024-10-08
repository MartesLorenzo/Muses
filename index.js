const express = require('express');
const ytdl = require('ytdl-core');
const cors = require('cors'); 
const fs = require('fs');
const eapp = express();
const { execFile } = require('child_process');
const path = require('path');
const ffmpegPath = require('ffmpeg-static');
const Ffmpeg = require('fluent-ffmpeg');

const home = require("./routes/home");

const multer = require('multer');
// --------------------------------------------------------------

eapp.use(cors());
eapp.use(express.json())


 eapp.use(express.static('public'));
// ---------------------------------------------------------------
const readDB = () => {
    const data = fs.readFileSync('public/muse.json');
    return JSON.parse(data);
  };
  
  // Função para escrever no banco de dados JSON
  const writeDB = (data) => {
    fs.writeFileSync('public/muse.json', JSON.stringify(data, null, 2));
  };
  
// ---------------------------------------------------------------

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
eapp.post('/traduz',  upload.single('file'), (req, res) => {
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

eapp.post('/upload', upload.single('file'), (req, res) => {

  const filename = req.file.filename
  const imageUrl = `${filename}`; 
// Update URL with new filename

res.json({ imageUrl });
});
// Endpoint para adicionar um novo usuário

// Endpoint para obter todos os usuários
//-----------------------------------------------------
eapp.get('/users', (req, res) => {
  const db = readDB();
  res.json(db.users);
});


eapp.get(`/users/:id`, (req, res) => {
  const db = readDB();
  const id = req.params.id
  const index = db.users.findIndex(use => use.id == id)

  if (index != -1) {
    const newU = db.users[index]
    res.status(200).json(newU)
  }
})


eapp.post('/userhs', (req, res) => {
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

eapp.post('/users', (req, res) => {
  const db = readDB();
  const newUser = req.body;
  db.users.push(newUser);
  writeDB(db);
  res.status(201).json(newUser);
});

eapp.post('/userM', (req, res) => {
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

  eapp.get(`/musics/:id`, (req, res) => {
    const db = readDB();
    const id = req.params.id
    const index = db.musics.findIndex(use => use.id == id)

    if (index != -1) {
      const newU = db.musics[index]
      res.status(200).json(newU)
    }
  })
  
  eapp.get(`/musis/:id`, (req, res) => {
    const db = readDB();
    const id = req.params.id
    const index = db.musics.findIndex(use => use.song == id)

    if (index != -1) {
      const newU = db.musics[index]
      res.status(200).json(newU)
    }
    
  })

  eapp.get(`/cates/:id`, (req, res) => {
    const db = readDB();
    const id = req.params.id
    const index = db.cates.findIndex(use => use.id == id)

    if (index != -1) {
      const newU = db.cates[index]
      res.status(200).json(newU)
    }
    
  })

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
  //-----------------------------------------------------
    //-----------------------------------------------------
eapp.get('/reacts', (req, res) => {
  const db = readDB();
  res.json(db.reacts);
});

eapp.post('/reacts', (req, res) => {
  const db = readDB();
  const newUser = req.body;
  db.reacts.push(newUser);
  writeDB(db);
  res.status(201).json(newUser);
});

//-----------------------------------------------------
eapp.post('/serch', (req, res) => {
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



eapp.post('/song', (req, res) => {
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

eapp.post('/conv', (req, res) => {
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
eapp.get('/follow', (req, res) => {
    const db = readDB();
    res.json(db.follow);
  });

  eapp.post('/follow', (req, res) => {
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
  
  eapp.post('/folo', (req, res) => {
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
eapp.get('/destaque', (req, res) => {
    const db = readDB();
    res.json(db.destaque);
  });
  
  eapp.post('/destaque', (req, res) => {
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
  
  eapp.post('/desta', (req, res) => {
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
eapp.get('/popular', (req, res) => {
    const db = readDB();
    res.json(db.popular);
  });
  

  eapp.post('/popular', (req, res) => {
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
  
  eapp.post('/popu', (req, res) => {
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
  eapp.get('/seguids', (req, res) => {
    const db = readDB();
    res.json(db.seguids);
  });

  eapp.post('/seguids', (req, res) => {
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
  
  eapp.post('/segui', (req, res) => {
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
eapp.get('/recomend', (req, res) => {
    const db = readDB();
    res.json(db.recomend);
  });
  

  eapp.post('/recomend', (req, res) => {
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
  
  eapp.post('/reco', (req, res) => {
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
eapp.get('/playlist', (req, res) => {
  const db = readDB();
  res.json(db.playlist);
});

eapp.post('/playlist', (req, res) => {
  const db = readDB();
  const newUser = req.body;
  db.playlist.push(newUser);
  writeDB(db);
  res.status(201).json(db.playlist);
});

eapp.post('/playlists', (req, res) => {
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
  eapp.get('/regiao', (req, res) => {
    const db = readDB();
    res.json(db.regiao);
  });
  
  eapp.post('/regiao', (req, res) => {
    const db = readDB();
    const newUser = req.body;
    db.regiao.push(newUser);
    writeDB(db);
    res.status(201).json(newUser);
  });
  
  //-----------------------------------------------------
  eapp.get('/favorities', (req, res) => {
    const db = readDB();
    res.json(db.favorities);
  });

  eapp.post('/favorities', (req, res) => {
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
  
  eapp.post('/favo', (req, res) => {
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
  eapp.post('/cache', (req, res) => {
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

  eapp.post('/cache', (req, res) => {
    const db = readDB();
    const newUser = req.body;
    db.caches.push(newUser);
    writeDB(db);
    res.status(201).json(newUser);
  });

  eapp.post('/musis/:id', (req, res) => {
    const db = readDB();
    const id = req.params.id
    const index = db.musics.findIndex(use => use.song == id)
  
    if (index != -1) {
      let mus = db.musics[index]
      res.status(201).json(mus);
    }
  
  });

  
    // Routes
    eapp.use("/home", home);

  const port = process.env.PORT || 9001;
  eapp.listen(port, () => console.log(`Listening to port ${port}`));
