// Importação de módulos necessários
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const {auth} = require('./middleware/auth');
const {JWTSecret} = require('./middleware/auth');

// Middleware para permitir solicitações de diferentes origens (CORS)
app.use(cors());

// Middleware para fazer o parse de dados no corpo das requisições em formato JSON
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Banco de dados em memória (para fins de demonstração)
const DB = {
    games: [
        {
            id: 23,
            title: "Call of duty MW",
            year: 2019,
            price: 60
        },
        {
            id: 65,
            title: "Sea of thieves",
            year: 2018,
            price: 40
        },
        {
            id: 2,
            title: "Minecraft",
            year: 2012,
            price: 20
        }
    ],
    users: [
        {
            id: 1,
            name: "Victor Lima",
            email: "victordevtb@guiadoprogramador.com",
            password: "nodejs<3"
        },
        {
            id: 20,
            name: "Guilherme",
            email: "guigg@gmail.com",
            password: "java123"
        },
        {
            id: 49,
            name: "weslley",
            email: "testeapi@gmail.com",
            password: "1234"
        }
    ]
}

// Rota para listar todos os jogos (requer autenticação)
app.get("/games", auth, (req, res) => {
    res.statusCode = 200;
    res.json({ empresa: req.empresa, user: req.loggedUser, games: DB.games });
});

// Rota para obter detalhes de um jogo específico (requer autenticação)
app.get("/game/:id", auth, (req, res) => {
    if (isNaN(req.params.id)) {
        res.sendStatus(400);
    } else {
        let id = parseInt(req.params.id);
        let game = DB.games.find(g => g.id == id);
        if (game != undefined) {
            res.statusCode = 200;
            res.json(game);
        } else {
            res.sendStatus(404);
        }
    }
});

// Rota para adicionar um novo jogo (requer autenticação)
app.post("/game", auth, (req, res) => {
    let { title, price, year } = req.body;
    DB.games.push({
        id: 2323,
        title,
        price,
        year
    });
    res.sendStatus(200);
})

// Rota para excluir um jogo pelo ID (requer autenticação)
app.delete("/game/:id", auth, (req, res) => {
    if (isNaN(req.params.id)) {
        res.sendStatus(400);
    } else {
        let id = parseInt(req.params.id);
        let index = DB.games.findIndex(g => g.id == id);
        if (index == -1) {
            res.sendStatus(404);
        } else {
            DB.games.splice(index, 1);
            res.sendStatus(200);
        }
    }
});

// Rota para atualizar informações de um jogo pelo ID (não requer autenticação)
app.put("/game/:id", (req, res) => {
    if (isNaN(req.params.id)) {
        res.sendStatus(400);
    } else {
        let id = parseInt(req.params.id);
        let game = DB.games.find(g => g.id == id);
        if (game != undefined) {
            let { title, price, year } = req.body;
            if (title != undefined) {
                game.title = title;
            }
            if (price != undefined) {
                game.price = price;
            }
            if (year != undefined) {
                game.year = year;
            }
            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    }
});

// Rota para autenticação de usuário (login)
app.post("/auth", (req, res) => {
    let { email, password } = req.body;

    if (email != undefined) {
        let user = DB.users.find(u => u.email == email);
        if (user != undefined) {
            if (user.password == password) {
                // Gera um token JWT para o usuário autenticado
                jwt.sign({ id: user.id, email: user.email }, JWTSecret, { expiresIn: '48h' }, (err, token) => {
                    if (err) {
                        res.status(400);
                        res.json({ err: "Falha interna" });
                    } else {
                        res.status(200);
                        res.json({ token: token });
                    }
                })
            } else {
                res.status(401);
                res.json({ err: "Credenciais inválidas!" });
            }
        } else {
            res.status(404);
            res.json({ err: "O E-mail enviado não existe na base de dados!" });
        }
    } else {
        res.status(400);
        res.send({ err: "O E-mail enviado é inválido" });
    }
});

// Inicialização do servidor na porta 45679
app.listen(45679, () => {
    console.log("API RODANDO!");
});
