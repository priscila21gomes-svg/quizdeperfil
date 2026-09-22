# Quiz de perfil — operacional ou analítico

Site com o quiz do time de logística reversa (colaborador) e o painel de
acompanhamento (administrador), pronto para publicar no GitHub + Vercel.

## O que tem aqui

- `index.html` — a página inteira (quiz + painel).
- `api/responses.js` — a função da Vercel que grava e lista as respostas
  em um banco Upstash Redis.

## Passo a passo

### 1. Criar o banco de dados (Upstash Redis)

1. Depois de importar o projeto na Vercel (passo 3), vá em **Storage** →
   **Create Database** → **Upstash Redis** (gratuito) e conecte ao projeto.
   A Vercel já cria sozinha as variáveis `UPSTASH_REDIS_REST_URL` e
   `UPSTASH_REDIS_REST_TOKEN`.

### 2. Subir para o GitHub

1. Crie um repositório novo (pode ser **privado**), por exemplo
   `quiz-perfil-logistica-reversa`.
2. Envie os dois arquivos (`index.html` e a pasta `api/`) para esse
   repositório, do mesmo jeito que você já fez no projeto do Weight
   Control.

### 3. Publicar na Vercel

1. Em [vercel.com](https://vercel.com), **Add New → Project** e importe
   esse repositório.
2. Não precisa mudar nenhuma configuração de build — é um projeto estático
   com uma função em `api/`, a Vercel reconhece sozinha.
3. Antes ou depois do primeiro deploy, conecte o banco Upstash (passo 1).
4. Em **Settings → Environment Variables**, adicione:
   - `ADMIN_PASSWORD` → a senha do painel de administrador (escolha uma
     senha forte; ela não fica escrita em nenhum arquivo do código).
5. Clique em **Deploy** (ou **Redeploy**, se already published, para
   aplicar a variável nova).

Pronto: o link que a Vercel gerar já abre o quiz.

### Para atualizar depois

Sempre que eu te passar uma nova versão do `index.html` ou do
`api/responses.js`, é só enviar o arquivo atualizado para o mesmo
repositório no GitHub — a Vercel publica a nova versão sozinha.

## Como funciona por trás

- O visitante responde ao quiz; a página envia o resultado para
  `/api/responses` (POST), que grava no Upstash Redis.
- Cada navegador guarda um código próprio (no armazenamento local do
  celular ou computador). Se a mesma pessoa refizer o quiz no mesmo
  aparelho, a resposta anterior dela é substituída, em vez de duplicar.
- O administrador digita a senha, que é conferida no servidor (na função
  `api/responses.js`), nunca no navegador — por isso ela fica segura mesmo
  com o código do site visível.
- O painel busca as respostas ao abrir a aba "Acompanhamento" e atualiza
  sozinho a cada 20 segundos; há também um botão "Atualizar".
- A exportação em CSV é gerada no próprio navegador, a partir dos dados
  já carregados no painel.

## Sobre a senha do administrador

Troque `ADMIN_PASSWORD` sempre que quiser. Quem sabe a senha entra no
painel; não existem contas ou permissões separadas por pessoa. Se um dos
líderes (Gabriela, Edson, André ou Márcio) também precisar acessar, basta
compartilhar essa mesma senha com eles.
