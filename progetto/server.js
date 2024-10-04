const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs'); // Modulo per leggere il file

// Creiamo l'applicazione Express
const app = express();

app.use(bodyParser.json());

// Endpoint di login
app.post('/login', (req,res)=> {
    const { username, password } = req.body;
    console.log(`Richiesta di login per l'utente ${username}`);
    console.log(`Password: ${password}`);

    fs.readFile('utenti.json', 'utf8', (err,data) => {
        if(err){
            res.status(500).json({ message: 'Errore nella lettura del file utenti.json' });
            return;
        }

        try{
            const utenti = JSON.parse(data);

            const user = utenti.find( u => u.user === username && u.pwd === password);

            if ( user ){
                res.status(200).json({
                    "status": "OK",
                    "user": user.user,
                    "ruolo": user.ruolo
                });
            } else{
                res.status(401).json({ message: 'Credenziali non valide' });
            }
        } catch (err){
            res.status(500).json({ message: 'Errore nel parsing del file utenti.json' });
        }
    });
});

// Endpoint per ottenere la lista degli utenti
app.get('/utenti', (req, res) => {
   fs.readFile('utenti.json', 'utf8', (err,data) => {
    if (err){
        res.status(500).json({ message: 'Errore nella lettura del file utenti.json'});
        return;
    }
    try {
        const utenti = JSON.parse(data);
        res.status(200).json(utenti);
    } catch (err) {
        res.status(500).json({ message: 'Errore nel parsing del file utenti.json' });
    }
   });
});

app.post('/utenti', (req,res) => {
    const { user, pwd, ruolo} = req.body;

    if (!user || !pwd || !ruolo) {
        return res.status(400).json({ message:'Dati mancancti: username, password o ruolo'});
    }

    fs.readFile('utenti.json', 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({ message:'Errore nella letteratura del file utenti.json' });
            return;
        }

        try {
            const utenti = JSON.parse(data);

            const userExists = utenti.find( u => u.user === user);
            if (userExists) {
                return res.status(400).json({ message: 'Utente già esistente' });
            }

            // Aggiungi il nuovo utente
            const nuovoUtente = { user, pwd, ruolo};
            utenti.push(nuovoUtente);

            // Salva il file aggiornato
            fs.writeFile('utenti.json', JSON.stringify(utenti, null, 2), (err) => {
                if (err) {
                    res.status(500).json({ message: 'Errore nel savataggio del file utenti.json' });
                    return;
                }

                res.status(201).json({ message: 'Utente aggiunto con successo', nuovoUtente});
            });
        } catch (err) {
            res.status(500).json({ message: 'Errore nel parsing del file utenti.json' });
        }
    });
});

// Avviare il server sulla porta 3000
const PORT =3000;
app.listen(PORT,()=>{
    console.log(`server in esecuzione sulla porta ${PORT}`);

});
