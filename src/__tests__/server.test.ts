import request from 'supertest';
import app from '../server';

describe('Server', () => {

  test('GET /api/code-generation should return 401', async () => {
    const response = await request(app).get('/api/code-generation');
    expect(response.statusCode).toBe(401);
  });
});

/*describe('Testes de Integração - Registo de Utilizador', () => {
    it('Deve registar um novo utilizador com sucesso', async () => {
        const response = await request(app)
            .post('/api/users/register')
            .send({
                username: 'utilizadorTeste2',
                password: 'senhaSegura123'
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('message', 'User created successfully');
    });
});*/

describe('Testes de Integração - Login de Utilizador', () => {
    it('Deve autenticar um utilizador existente e retornar um token', async () => {
        const response = await request(app)
            .post('/api/users/login')
            .send({
                username: 'utilizadorTeste',
                password: 'senhaSegura123'
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
    });

    it('Deve retornar erro para credenciais inválidas', async () => {
        const response = await request(app)
            .post('/api/users/login')
            .send({
                username: 'utilizadorInexistente',
                password: 'senhaErrada'
            });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });
});
