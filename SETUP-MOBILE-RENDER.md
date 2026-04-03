# 📱 Setup 100% Mobile - Shopee Zap no Render ($7/mês)

## ⚡ Resumo
Você vai configurar tudo **pelo celular** em ~30 minutos:
- ✅ Criar conta no Render
- ✅ Fazer deploy da aplicação
- ✅ Conectar banco de dados gratuito
- ✅ Gerar QR Code e conectar WhatsApp
- ✅ Fazer primeiro envio

**Custo total: $7/mês** 💰

---

## 🔧 Passo 1: Criar Conta no Render (5 minutos)

### 1.1 Abra o navegador do celular
- Acesse: **https://render.com**
- Clique em **"Sign Up"** (canto superior direito)

### 1.2 Escolha como criar conta
- Clique em **"GitHub"** (recomendado)
- Ou use **"Email"** se preferir

### 1.3 Complete o cadastro
- Confirme seu email
- Você receberá **$5 de crédito grátis** (suficiente para 1 mês)

✅ **Pronto! Você tem conta no Render**

---

## 🚀 Passo 2: Fazer Deploy da Aplicação (10 minutos)

### 2.1 Acesse o Render Dashboard
- Você já está logado no Render
- Clique em **"New +"** (botão azul no topo)
- Selecione **"Web Service"**

### 2.2 Conecte seu GitHub
- Clique em **"Deploy an existing repository"**
- Autorize o Render a acessar seu GitHub
- Procure pelo repositório: **shopee-zap**
- Clique em **"Select"**

### 2.3 Configure o serviço
Preencha os campos:

```
Name: shopee-zap-web
Environment: Node
Build Command: pnpm install && pnpm build
Start Command: pnpm start
Plan: Starter ($7/month) ✅
```

### 2.4 Adicione as variáveis de ambiente
Clique em **"Environment"** e adicione estas variáveis:

```
DATABASE_URL=mysql://seu-usuario:sua-senha@seu-host/shopee_zap
JWT_SECRET=gere-uma-string-aleatoria-aqui-32-caracteres
VITE_APP_ID=seu-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
OWNER_OPEN_ID=seu-open-id
OWNER_NAME=Seu Nome
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=sua-chave-api
VITE_FRONTEND_FORGE_API_KEY=sua-chave-frontend
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
BAILEYS_PORT=3001
BAILEYS_API_URL=http://localhost:3001
```

> **Onde conseguir essas variáveis?**
> - Você já tem na plataforma Manus (veja as secrets do projeto)
> - Para `DATABASE_URL`, veja o Passo 3

### 2.5 Clique em "Create Web Service"
- Aguarde ~5 minutos pelo build
- Você verá uma URL como: `https://shopee-zap-xxxxx.onrender.com`
- **Salve esta URL!** Você vai usar para acessar o painel

✅ **Pronto! Sua aplicação está na nuvem**

---

## 🗄️ Passo 3: Conectar Banco de Dados Gratuito (5 minutos)

### 3.1 Escolha um provedor gratuito

**Opção A: Clever Cloud (Recomendado)**
1. Acesse: **https://www.clever-cloud.com**
2. Clique em **"Sign Up"**
3. Crie conta com GitHub ou email
4. Clique em **"Create an application"**
5. Escolha **"MySQL"**
6. Selecione o plano **"Starter (free)"**
7. Clique em **"Create"**
8. Copie a `DATABASE_URL` que aparecerá

**Opção B: Railway (Alternativa)**
1. Acesse: **https://railway.app**
2. Clique em **"Start Project"**
3. Escolha **"MySQL"**
4. Copie a `DATABASE_URL`

### 3.2 Atualize a variável no Render
1. Volte ao Render Dashboard
2. Clique no seu serviço **"shopee-zap-web"**
3. Vá para **"Environment"**
4. Procure por `DATABASE_URL`
5. Substitua pelo valor que você copiou
6. Clique em **"Save"**
7. O Render vai fazer redeploy automaticamente (~2 minutos)

✅ **Pronto! Banco de dados conectado**

---

## 📱 Passo 4: Acessar o Painel (2 minutos)

### 4.1 Abra a URL do seu painel
- Copie a URL que você salvou: `https://shopee-zap-xxxxx.onrender.com`
- Cole no navegador do celular
- Clique em **"Entrar"**

### 4.2 Faça login
- Clique em **"Entrar"** (botão azul)
- Você será redirecionado para login Manus
- Faça login com sua conta

✅ **Pronto! Você está no painel**

---

## 📱 Passo 5: Conectar WhatsApp (5 minutos)

### 5.1 Acesse Configurações
- No painel, clique em **"Configurações"** (menu lateral)
- Procure por **"Conexão WhatsApp"**

### 5.2 Gere o QR Code
- Clique em **"Gerar QR Code"**
- Um código QR aparecerá na tela

### 5.3 Escaneie com WhatsApp
1. Pegue o celular com o número WhatsApp dedicado
2. Abra **WhatsApp**
3. Vá para **Configurações** → **Dispositivos Conectados**
4. Clique em **"Conectar Dispositivo"**
5. Aponte a câmera para o **QR Code** que está na tela
6. Escaneie o código

### 5.4 Aguarde a confirmação
- O painel mostrará: **"WhatsApp Conectado ✅"**
- Pronto! Seu bot está conectado

✅ **Pronto! WhatsApp conectado**

---

## 📦 Passo 6: Cadastre um Produto (5 minutos)

### 6.1 Vá para "Meus Links"
- No menu lateral, clique em **"Meus Links"**
- Clique em **"Cadastrar Novo Link"**

### 6.2 Preencha os dados
- **Título:** Nome do produto (ex: "Fone Bluetooth")
- **Descrição:** Descrição breve
- **Link Shopee:** Cole o link de afiliado
- **Preço:** Preço original (ex: R$ 150)
- **Desconto:** Desconto em % (ex: 20)
- **Foto:** Clique para fazer upload
- **Categoria:** Escolha uma categoria

### 6.3 Salve
- Clique em **"Salvar"**
- O produto aparecerá na lista

✅ **Pronto! Produto cadastrado**

---

## ⏰ Passo 7: Crie um Agendamento (5 minutos)

### 7.1 Vá para "Agendamentos"
- No menu lateral, clique em **"Agendamentos"**
- Clique em **"Criar Agendamento"**

### 7.2 Configure o envio
- **Produto:** Selecione o produto que cadastrou
- **Horário:** Escolha a hora (ex: 10:00)
- **Dias da Semana:** Selecione os dias
- **Mensagem Personalizada:** (opcional)
  ```
  Olá! 👋
  Confira este produto incrível:
  {PRODUTO}
  Aproveite! 🎉
  ```
- **Repetir Semanalmente:** Ative para envios recorrentes

### 7.3 Salve
- Clique em **"Criar"**
- O agendamento aparecerá na lista

✅ **Pronto! Agendamento criado**

---

## 🚀 Passo 8: Faça o Primeiro Envio (2 minutos)

### 8.1 Teste manual
- Na lista de agendamentos, clique em **"Enviar Agora"**
- Aguarde alguns segundos

### 8.2 Verifique no WhatsApp
- Abra o grupo no WhatsApp
- A mensagem deve chegar em poucos segundos
- Se chegou, **parabéns! Seu bot está funcionando! 🎉**

### 8.3 Verifique o histórico
- No painel, clique em **"Histórico"**
- Você verá o registro do envio (data, hora, status)

✅ **Pronto! Primeiro envio realizado**

---

## 📊 Passo 9: Acompanhe com Analytics (Opcional)

### 9.1 Acesse Analytics
- No menu lateral, clique em **"Analytics"**
- Veja os gráficos de desempenho

### 9.2 Analise os dados
- **Envios por Dia:** Visualize a tendência
- **Taxa de Sucesso:** % de mensagens entregues
- **Produtos Mais Enviados:** Top 8 produtos
- **Desempenho por Dia da Semana:** Qual dia funciona melhor

---

## 🎯 Resumo Final

| Passo | O que fazer | Tempo |
|-------|-----------|-------|
| 1 | Criar conta Render | 5 min |
| 2 | Deploy da aplicação | 10 min |
| 3 | Conectar banco de dados | 5 min |
| 4 | Acessar o painel | 2 min |
| 5 | Conectar WhatsApp | 5 min |
| 6 | Cadastrar produto | 5 min |
| 7 | Criar agendamento | 5 min |
| 8 | Fazer primeiro envio | 2 min |
| **TOTAL** | | **~39 minutos** |

---

## 💰 Custos Confirmados

- **Render:** $7/mês ✅
- **Banco de Dados:** $0/mês ✅
- **WhatsApp:** $0/mês ✅
- **TOTAL:** **$7/mês** 💚

---

## 🆘 Troubleshooting

### ❌ "Erro ao fazer deploy"
- Aguarde 5 minutos e atualize a página
- Se persistir, clique em **"Manual Deploy"** no Render

### ❌ "WhatsApp não conectou"
- Gere um novo QR Code
- Escaneie novamente
- Aguarde 30 segundos

### ❌ "Mensagem não chegou"
- Verifique em **"Histórico"** se o envio foi registrado
- Teste manualmente: **"Enviar Agora"**
- Confirme que o bot tem permissão no grupo

### ❌ "Banco de dados não conecta"
- Verifique se a `DATABASE_URL` está correta
- Teste a conexão no provedor (Clever Cloud, Railway, etc)

---

## 🎓 Próximos Passos

1. ✅ Faça 2-3 envios de teste
2. ✅ Configure 3-4 agendamentos recorrentes
3. ✅ Acompanhe Analytics por 1 semana
4. ✅ Otimize horários baseado em dados
5. ✅ Adicione mais produtos conforme necessário

---

## 📞 Dúvidas?

Se tiver problemas em qualquer passo:
1. Verifique a seção **"Troubleshooting"** acima
2. Leia novamente o passo com atenção
3. Teste manualmente no painel

**Bom negócio! 🚀**
