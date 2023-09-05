// Importação de módulos necessários
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");

// Chave secreta para geração e verificação de tokens JWT
const JWTSecret = "djkshahjksdajksdhasjkdhasjkdhasjkdhasjkd";

// Middleware para permitir solicitações de diferentes origens (CORS)
app.use(cors());

// Middleware para fazer o parse de dados no corpo das requisições em formato JSON
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Middleware de autenticação para proteger rotas
function auth(req, res, next) {
    // Verifica a presença de um token JWT no cabeçalho da requisição
    const authToken = req.headers['authorization'];

    if (authToken != undefined) {
        // Divide o token para extrair seu valor
        const bearer = authToken.split(' ');
        var token = bearer[1];

        // Verifica se o token é válido usando a chave secreta
        jwt.verify(token, JWTSecret, (err, data) => {
            if (err) {
                res.status(401);
                res.json({ err: "Token inválido!" });
            } else {
                // Se o token for válido, adiciona informações do usuário à requisição
                req.token = token;
                req.loggedUser = { id: data.id, email: data.email };
                req.empresa = "Guia do programador";
                next();
            }
        });
    } else {
        // Se não houver token no cabeçalho, retorna erro de autenticação
        res.status(401);
        res.json({ err: "Token inválido!" });
    }
}

// Banco de dados em memória (para fins de demonstração)
var DB = {
    games: [
        // ...
    ],
    users: [
        // ...
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
        var id = parseInt(req.params.id);
        var game = DB.games.find(g => g.id == id);
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
    var { title, price, year } = req.body;
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
        var id = parseInt(req.params.id);
        var index = DB.games.findIndex(g => g.id == id);
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
        var id = parseInt(req.params.id);
        var game = DB.games.find(g => g.id == id);
        if (game != undefined) {
            var { title, price, year } = req.body;
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
    var { email, password } = req.body;

    if (email != undefined) {
        var user = DB.users.find(u => u.email == email);
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
