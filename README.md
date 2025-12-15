# 📜 Sistema de Emissão de Certificados

Sistema automatizado para geração e envio em massa de certificados personalizados, integrado com o Make (Integromat) para automação de workflows.

## 🎯 Visão Geral

Este sistema permite:
- Upload de planilhas CSV/Excel com dados de alunos
- Validação e formatação automática de dados (CPF, telefone, email)
- Personalização do certificado com posicionamento de texto configurável
- Geração de PDFs personalizados para cada aluno
- Envio automático via webhook para o Make

## 🔄 Fluxo de Trabalho

### Etapas do Sistema

```
1. Configuração do Webhook
   ↓
2. Upload da Planilha
   ↓
3. Processamento dos Dados
   ↓
4. Configuração do Certificado
   ↓
5. Envio em Massa
```

### 1. Configuração do Webhook
- Cole a URL do webhook do Make
- Teste a conexão antes de prosseguir

### 2. Upload da Planilha
A planilha deve conter as seguintes colunas:
| Coluna | Descrição |
|--------|-----------|
| `nome` | Nome completo do aluno |
| `cpf` | CPF do aluno (com ou sem formatação) |
| `telefone` | Número de telefone/WhatsApp |
| `email` | E-mail do aluno |
| `certificado` | "SIM" para emitir, qualquer outro valor para ignorar |

### 3. Processamento dos Dados
O sistema automaticamente:
- Converte nomes para MAIÚSCULAS
- Remove texto "copy" dos nomes
- Formata CPF com máscara (XXX.XXX.XXX-XX)
- Adiciona prefixo +55 em telefones brasileiros
- Filtra apenas alunos com `certificado = "SIM"`

### 4. Configuração do Certificado
- **Upload da imagem**: Envie a imagem base do certificado (PNG/JPG)
- **Posição X/Y**: Ajuste onde o nome será posicionado
- **Tamanho da fonte**: Configure o tamanho do texto
- **Cor da fonte**: Escolha a cor do nome
- **Preview em tempo real**: Visualize como ficará com o primeiro aluno

### 5. Envio em Massa
- Pause/retome o envio a qualquer momento
- Retry automático em caso de falha (máx. 3 tentativas)
- Progresso em tempo real
- Relatório final com sucessos e erros
- Download do relatório em CSV

---

## 🔗 Configuração do Make (Integromat)

### Criando o Webhook

1. Acesse o [Make](https://www.make.com/)
2. Crie um novo cenário
3. Adicione o módulo **Webhooks > Custom webhook**
4. Copie a URL gerada
5. Cole no campo de configuração do sistema

### Estrutura do Payload Recebido

O webhook receberá um POST com a seguinte estrutura JSON:

```json
{
  "aluno": {
    "nome": "JOÃO DA SILVA",
    "cpf": "123.456.789-00",
    "email": "joao@email.com",
    "telefone": "+5511999999999"
  },
  "certificadoPDF": "data:application/pdf;base64,JVBERi0xLjQK..."
}
```

### Campos do Payload

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `aluno.nome` | string | Nome formatado em maiúsculas |
| `aluno.cpf` | string | CPF formatado (XXX.XXX.XXX-XX) |
| `aluno.email` | string | E-mail validado |
| `aluno.telefone` | string | Telefone com +55 |
| `certificadoPDF` | string | PDF do certificado em base64 |

### Exemplo de Cenário no Make

```
[Webhook] → [Decode Base64 PDF] → [Google Drive: Upload] → [Gmail: Enviar Email]
```

#### Módulos Sugeridos:

1. **Webhooks > Custom webhook**
   - Recebe os dados do sistema

2. **Tools > Set variable** (opcional)
   - Extraia o PDF do base64

3. **Google Drive > Upload a File**
   - Salve o certificado na nuvem
   - Use o nome do aluno como nome do arquivo

4. **Gmail > Send an Email**
   - Envie o certificado por email
   - Anexe o PDF salvo
   - Personalize com o nome do aluno

5. **WhatsApp Business / Twilio** (opcional)
   - Envie notificação por WhatsApp

---

## 🛠️ Tecnologias Utilizadas

- **React 18** - Interface do usuário
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes de UI
- **jsPDF** - Geração de PDFs no frontend
- **PapaParse** - Processamento de CSV
- **xlsx** - Processamento de Excel

## 📦 Instalação Local

```bash
# Clone o repositório
git clone <URL_DO_REPOSITORIO>

# Navegue até a pasta
cd <NOME_DO_PROJETO>

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

## 💡 Dicas de Uso

1. **Teste o webhook primeiro** antes de fazer upload da planilha
2. **Use imagens de alta qualidade** para o certificado base
3. **Verifique o preview** antes de iniciar o envio em massa
4. **Mantenha a planilha limpa** - remova linhas vazias
5. **Use o filtro "SIM"** na coluna certificado para controlar quem recebe

## ⚠️ Limitações

- Formatos de imagem suportados: PNG e JPG
- O PDF é gerado no navegador (cliente)
- Requer conexão estável para envio em massa

## 📄 Licença

Este projeto é privado e de uso exclusivo.

---

Desenvolvido com ❤️ usando [Lovable](https://lovable.dev)
