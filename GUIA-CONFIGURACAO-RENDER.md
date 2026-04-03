# 🚀 Guia Completo: Shopee Zap Automator no Render ($7/mês)

## 📋 Resumo do Setup

Você vai configurar um **bot WhatsApp automático** que:
- ✅ Envia links de produtos da Shopee com foto e descrição
- ✅ Roda 24/7 na nuvem (Render - $7/mês)
- ✅ Usa **1 número WhatsApp** para enviar para **1 grupo**
- ✅ Permite agendar envios ou enviar sob demanda
- ✅ Rastreia estatísticas de envios (Dashboard Analytics)

---

## 🔧 Passo 1: Preparação Inicial (5 minutos)

### 1.1 Crie uma conta no Render
1. Acesse [render.com](https://render.com)
2. Clique em **"Sign up"** → escolha **GitHub** ou email
3. Confirme seu email
4. Você receberá **$5 de crédito grátis** (suficiente para 1 mês)

### 1.2 Prepare seu WhatsApp
1. Use um **número WhatsApp dedicado** (pode ser um segundo número do mesmo celular)
2. Tenha o celular à mão para escanear **QR Code** depois
3. **NÃO use este número em outro bot** (pode causar bloqueio)

### 1.3 Prepare seus Links da Shopee
1. Acesse sua conta de afiliado na Shopee
2. Copie os **links de produtos** que quer enviar
3. Anote também: **descrição, preço, desconto, foto** (você vai cadastrar no painel)

---

## 🌐 Passo 2: Deploy da Aplicação no Render (10 minutos)

### 2.1 Conecte seu GitHub ao Render
1. No Render, clique em **"New +"** → **"Web Service"**
2. Selecione **"Deploy an existing repository"**
3. Conecte sua conta GitHub (autorize o Render)
4. Procure pelo repositório do **Shopee Zap** ou use este:
   ```
   https://github.com/seu-usuario/shopee-zap
   ```

### 2.2 Configure o Serviço Web
- **Name:** `shopee-zap-web`
- **Environment:** `Node`
- **Build Command:** `pnpm install && pnpm build`
- **Start Command:** `pnpm start`
- **Plan:** `Starter ($7/month)` ✅

### 2.3 Adicione Variáveis de Ambiente
Clique em **"Environment"** e adicione:

```
DATABASE_URL=mysql://seu-usuario:sua-senha@seu-host:3306/shopee_zap
JWT_SECRET=sua-chave-secreta-aqui-32-caracteres
VITE_APP_ID=seu-app-id-manus
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
> - `DATABASE_URL`: Crie um banco MySQL no Render ou use um externo
> - `JWT_SECRET`: Gere uma string aleatória de 32 caracteres

### 2.4 Deploy
1. Clique em **"Create Web Service"**
2. Aguarde ~3-5 minutos pelo build
3. Você verá uma URL como: `https://shopee-zap-xxxxx.onrender.com`

---

## 📱 Passo 3: Conectar WhatsApp via Baileys (5 minutos)

### 3.1 Acesse o Painel Web
1. Abra a URL do Render: `https://shopee-zap-xxxxx.onrender.com`
2. Clique em **"Configurações"** no menu lateral
3. Procure por **"Conexão WhatsApp"**

### 3.2 Escaneie o QR Code

**No Computador (Painel Web):**
1. Clique em **"Gerar QR Code"**
2. Um código QR aparecerá na tela do computador

**No Celular (WhatsApp):**
1. Pegue o celular com o número WhatsApp dedicado
2. Abra **WhatsApp**
3. Vá para **Configurações** → **Dispositivos Conectados** (ou "Aparelhos Conectados")
4. Clique em **"Conectar Dispositivo"**
5. Aponte a câmera para o **QR Code que está no computador**
6. Escaneie o código

**Resultado:**
7. Aguarde a confirmação: **"WhatsApp Conectado ✅"** aparecerá no painel

> **Dica:** Se o QR Code expirar, clique em "Gerar Novo QR Code"

### 3.3 Identifique o ID do Grupo
1. No WhatsApp, abra o grupo onde vai enviar mensagens
2. Clique no nome do grupo → **Informações**
3. Copie o **ID do Grupo** (geralmente começa com `120@g.us`)
4. Volte ao painel e cole em **"ID do Grupo para Envios"**

---

## 📦 Passo 4: Cadastre seus Produtos (10 minutos)

### 4.1 Acesse "Meus Links"
1. No painel, clique em **"Meus Links"** no menu
2. Clique em **"Cadastrar Novo Link"**

### 4.2 Preencha os Dados
- **Título:** Nome do produto (ex: "Fone Bluetooth XYZ")
- **Descrição:** Descrição breve (ex: "Som cristalino, 30h bateria")
- **Link Shopee:** Cole o link de afiliado
- **Preço:** Preço original (ex: R$ 150)
- **Desconto:** Desconto em % (ex: 20)
- **Foto:** Clique para fazer upload (será salva em S3)
- **Categoria:** Escolha (ex: Eletrônicos, Moda, etc)

### 4.3 Salve o Produto
Clique em **"Salvar"** e veja aparecer na lista

---

## ⏰ Passo 5: Configure Agendamentos (5 minutos)

### 5.1 Acesse "Agendamentos"
1. No painel, clique em **"Agendamentos"**
2. Clique em **"Criar Agendamento"**

### 5.2 Configure o Envio
- **Produto:** Selecione um dos seus links cadastrados
- **Horário:** Escolha a hora para enviar (ex: 10:00)
- **Dias da Semana:** Selecione quais dias enviar (ex: Seg-Sex)
- **Mensagem Personalizada:** Adicione um texto customizado
  ```
  Olá pessoal! 👋
  Confira este produto incrível:
  {PRODUTO}
  Aproveite o desconto! 🎉
  ```
- **Repetir Semanalmente:** Ative para envios recorrentes

### 5.3 Salve
Clique em **"Criar"** e veja na lista de agendamentos

---

## 🚀 Passo 6: Primeiro Envio (2 minutos)

### 6.1 Teste Manual
1. Vá para **"Agendamentos"**
2. Clique no botão **"Enviar Agora"** em um agendamento
3. Verifique se a mensagem chegou no grupo WhatsApp

### 6.2 Verifique o Histórico
1. Clique em **"Histórico"** no menu
2. Veja o registro do envio: data, hora, status (Enviado/Falha)

---

## 📊 Passo 7: Acompanhe com Analytics (2 minutos)

### 7.1 Acesse o Dashboard de Analytics
1. Clique em **"Analytics"** no menu lateral
2. Veja os gráficos:
   - **Envios por Dia:** Visualize a tendência
   - **Taxa de Sucesso:** % de mensagens entregues
   - **Envios por Hora:** Qual horário tem mais atividade
   - **Produtos Mais Enviados:** Top 8 produtos
   - **Desempenho por Dia da Semana:** Qual dia funciona melhor

### 7.2 Use os Filtros
- Clique em **"7 dias"**, **"30 dias"** ou **"90 dias"** para mudar o período
- Analise tendências para otimizar horários de envio

---

## 🔐 Passo 8: Configurações Avançadas (Opcional)

### 8.1 Mensagem Padrão
1. Vá para **"Configurações"**
2. Em **"Mensagem Padrão"**, defina um template que aparece em todos os envios:
   ```
   🛍️ Shopee Zap Automator
   ```

### 8.2 Horários Permitidos
1. Em **"Horários Permitidos"**, defina entre que horas o bot pode enviar
   - Exemplo: 08:00 às 22:00 (não enviar à noite)

### 8.3 Permitir Finais de Semana
1. Ative/desative envios no sábado e domingo

### 8.4 Copie sua API Key
1. Em **"Configurações"**, copie a **API Key**
2. Use para integrar com outros sistemas (opcional)

---

## 🐛 Troubleshooting

### ❌ "WhatsApp não conectou"
- Verifique se o número tem WhatsApp ativo
- Tente gerar um novo QR Code
- Aguarde 30 segundos antes de escanear

### ❌ "Mensagem não chegou no grupo"
- Verifique se o bot está com permissão de envio no grupo
- Confirme o **ID do Grupo** está correto
- Verifique em **"Histórico"** se o envio foi registrado

### ❌ "Aplicação caiu no Render"
- Acesse o Render Dashboard
- Clique em **"Logs"** para ver erros
- Reinicie o serviço: **"Manual Deploy"**

### ❌ "Banco de dados não conecta"
- Verifique se a `DATABASE_URL` está correta
- Confirme se o host MySQL está acessível
- Teste a conexão: `mysql -u usuario -p -h host -D database`

---

## 📈 Dicas de Otimização

### 1. Melhor Horário para Enviar
- Analise em **"Analytics"** qual horário tem mais cliques
- Agende envios 15 minutos antes do pico

### 2. Produtos com Melhor Desempenho
- Veja em **"Analytics"** → **"Produtos Mais Enviados"**
- Priorize estes produtos em agendamentos

### 3. Dias Mais Ativos
- Veja em **"Analytics"** → **"Desempenho por Dia da Semana"**
- Aumente frequência nos dias com mais engajamento

### 4. Mensagens Personalizadas
- Use emojis e quebras de linha para melhor legibilidade
- Inclua CTA (Call-to-Action): "Clique aqui", "Aproveite", etc

---

## 💰 Custos Mensais

| Serviço | Preço | Notas |
|---------|-------|-------|
| Render (Web Service) | $7/mês | Starter Plan |
| Banco de Dados MySQL | $0-15/mês | Depende do provedor |
| WhatsApp (Baileys) | $0 | Gratuito |
| **TOTAL** | **$7-22/mês** | Muito barato! |

---

## 🎓 Próximos Passos

1. ✅ Faça seu primeiro envio manual
2. ✅ Configure 2-3 agendamentos recorrentes
3. ✅ Acompanhe Analytics por 1 semana
4. ✅ Otimize horários baseado em dados
5. ✅ Adicione mais produtos conforme necessário

---

## 📞 Suporte

Se tiver dúvidas:
1. Verifique os **Logs** no Render
2. Leia a seção **"Troubleshooting"** acima
3. Teste manualmente em **"Agendamentos"** → **"Enviar Agora"**

**Bom negócio! 🚀**
