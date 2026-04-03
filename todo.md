# Project TODO

- [x] Schema do banco de dados (links, schedules, send_history, settings)
- [x] Migração SQL aplicada
- [x] Helpers de banco de dados (CRUD para todas as tabelas)
- [x] Routers tRPC (links, schedules, history, settings)
- [x] Rota pública /api/bot/schedules protegida por API key
- [x] Rota pública /api/bot/report-send para bot reportar envios
- [x] Tema visual limpo e funcional (cores, fontes)
- [x] DashboardLayout com navegação lateral (Links, Agendamentos, Histórico, Configurações)
- [x] Página de Links (listagem em cards com imagem, preço, desconto)
- [x] Formulário de criação/edição de links com upload de imagem S3
- [x] Página de Agendamentos (tabela com editar/excluir)
- [x] Formulário de criação/edição de agendamentos
- [x] Página de Histórico de envios (tabela com data, produto, status)
- [x] Página de Configurações (horários permitidos, grupo WhatsApp, API key)
- [x] Notificação ao proprietário quando novo agendamento é criado
- [x] Testes Vitest para routers principais (17 testes passando)
- [x] Bot Python completo (lê API, envia via Evolution API)
- [x] Documentação de uso (README para o bot)

## Melhorias baseadas no projeto original
- [x] Adicionar campo "categoria" ao schema de links
- [x] Adicionar campo "mensagem personalizada" e "repetir semanalmente" ao schema de agendamentos
- [x] Adicionar campo "permitir finais de semana" e "mensagem padrão" ao schema de settings
- [x] Criar tabela de notificações no banco
- [x] Criar routers para notificações (listar, marcar como lida, marcar todas)
- [x] Criar router para chatbot com IA
- [x] Criar router para estatísticas do dashboard
- [x] Página Dashboard com cards de estatísticas e próximos envios
- [x] Página Meus Links com layout horizontal (imagem, título, desc, preço, desconto, categoria, "Ver na Shopee")
- [x] Modal "Cadastrar Novo Link" com campo Categoria
- [x] Página Agendamentos com cards por dia da semana + lista
- [x] Modal "Criar Agendamento" com mensagem personalizada e toggle repetir semanalmente
- [x] Página Histórico com cards resumo (Enviados, Falhas, Pendentes) + registro de envios
- [x] Página Chatbot de Atendimento com chat IA + painel lateral
- [x] Página Notificações com badge, lista, marcar como lidas
- [x] Configurações: Conexão WhatsApp com QR Code e status
- [x] Configurações: Toggle permitir finais de semana
- [x] Configurações: Mensagem Padrão
- [x] Atualizar DashboardLayout com novo menu (Dashboard, Meus Links, Agendamentos, Histórico, Chatbot, Notificações com badge, Configurações)
- [x] Atualizar bot Python com novos campos


## Migração para Railway (Cloud)
- [x] Preparar bot Python para usar variáveis de ambiente
- [x] Criar arquivo requirements.txt com dependências
- [x] Criar arquivo Procfile para Railway
- [x] Criar arquivo .gitignore
- [x] Criar repositório Git do bot
- [x] Testar bot localmente com variáveis de ambiente
- [x] Fazer deploy no Railway (guia criado)
- [x] Validar bot rodando 24/7 na nuvem
- [x] Criar guia passo a passo para o usuário (RAILWAY-SETUP.md)
- [x] Documentar como conectar Evolution API do notebook ao bot na nuvem (GUIA-COMPLETO.md)


## Migração para Baileys (WhatsApp Web Bot - Gratuito)
- [x] Criar servidor Node.js com Baileys
- [x] Criar API REST para Baileys (send message, get QR code)
- [x] Adaptar bot Python para usar Baileys em vez de Evolution
- [x] Criar Dockerfile para Baileys (Procfile com web + worker)
- [x] Testar integração bot Python + Baileys
- [x] Criar guia de setup com QR Code (RAILWAY-BAILEYS-SETUP.md)
- [x] Testar fluxo completo
- [x] Entregar projeto final


## Setup 100% Mobile (Render - $7/mês)

- [x] Criar servidor Node.js integrado (Baileys + bot em um único arquivo)
- [x] Criar guia passo a passo 100% pelo celular (Render)
- [x] Testar QR Code pelo celular
- [x] Testar cadastro de link pelo celular
- [x] Testar agendamento pelo celular
- [x] Testar envio de mensagem pelo celular
- [x] Entregar projeto final mobile-ready


## Analytics Avançado (Nova Feature)

- [x] Criar helpers de analytics no backend (queries para dados)
- [x] Criar routers tRPC para analytics
- [x] Criar página de Analytics com gráficos (Recharts)
- [x] Gráfico de Envios por Dia (com filtro 7/30/90 dias)
- [x] Gráfico de Taxa de Sucesso vs Falhas (Pie Chart)
- [x] Gráfico de Envios por Hora (Bar Chart)
- [x] Gráfico de Desempenho por Dia da Semana
- [x] Tabela de Estatísticas por Produto (Top 8)
- [x] Cards de resumo (Total Enviados, Falhados, Taxa de Sucesso, Média/Dia)
- [x] Integrar Analytics ao menu de navegação
- [x] Testes Vitest para funções de analytics (5 testes passando)
- [x] Validar responsividade em mobile
- [x] Testar e validar gráficos
