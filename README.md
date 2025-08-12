### Personal Drive

Aplicação Next.js para gerenciar arquivos localmente (listar, enviar, criar pastas, excluir e baixar), protegida por autenticação simples para administrador.

### Requisitos

- Node.js 20+ e npm 10+ (para executar sem Docker)
- Docker e Docker Compose (opcional, para executar via containers)

### Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com as variáveis abaixo. Valores padrão são seguros para desenvolvimento, mas altere para produção.

| Variável | Descrição | Padrão (dev) |
|---|---|---|
| `AUTH_SECRET` | Segredo usado para assinar o JWT de sessão | `dev-secret-change` |
| `ADMIN_USER` | Usuário administrador | `admin` |
| `ADMIN_PASS` | Senha do administrador | `admin` |
| `UPLOAD_DIR` | Diretório (relativo à raiz do projeto ou absoluto) onde os arquivos serão armazenados | `uploads` |

Exemplo de `.env`:

```env
AUTH_SECRET=troque-este-segredo
ADMIN_USER=admin
ADMIN_PASS=admin
UPLOAD_DIR=uploads
```

### Executando com Docker (recomendado para produção)

1) Garanta que o `.env` exista na raiz do projeto.

2) Suba os serviços:

```bash
docker compose up -d --build
```

3) Acesse a aplicação em `http://localhost:3456`.

4) Faça login com `ADMIN_USER` e `ADMIN_PASS` definidos no `.env`.

Comandos úteis:

```bash
# Ver logs
docker compose logs -f

# Reiniciar após alterações
docker compose up -d --build

# Parar e remover containers
docker compose down
```

### Executando sem Docker

1) Instale as dependências:

```bash
npm ci
```

2) Desenvolvimento (hot reload em `http://localhost:3000`):

```bash
npm run dev
```

3) Produção (build + start):

```bash
npm run build

npm run start
```

Abra `http://localhost:3000` (ou a porta que configurar)

### Endereços úteis

- Aplicação: `/` (após login)
- Login: `/login`

### Scripts disponíveis

- `npm run dev`: inicia em modo desenvolvimento (Turbopack)
- `npm run build`: gera o build de produção
- `npm run start`: inicia o servidor de produção (usa `PORT` se definida)
- `npm run lint`: executa o linter
