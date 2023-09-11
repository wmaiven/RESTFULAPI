const jwt = require("jsonwebtoken");

// Chave secreta para geração e verificação de tokens JWT
const JWTSecret = "djkshahjksdajksdhasjkdhasjkdhasjkdhasjkd";
// Middleware de autenticação para proteger rotas
function auth(req, res, next) {
    // Verifica a presença de um token JWT no cabeçalho da requisição
    const authToken = req.headers['authorization'];

    if (authToken != undefined) {
        // Divide o token para extrair seu valor
        const bearer = authToken.split(' ');
        let token = bearer[1];

        // Verifica se o token é válido usando a chave secreta
        jwt.verify(token, JWTSecret, (err, data) => {
            if (err) {
                res.status(401);
                res.json({ err: "Token inválido!" });
            } else {
                // Se o token for válido, adiciona informações do usuário à requisição
                req.token = token;
                req.loggedUser = { id: data.id, email: data.email, name: data.name};
                req.empresa = "weslley enterprise";
                next();
            }
        });
    } else {
        // Se não houver token no cabeçalho, retorna erro de autenticação
        res.status(401);
        res.json({ err: "Token inválido!" });
    }
}

module.exports = {
    auth: auth,
    JWTSecret: JWTSecret
};