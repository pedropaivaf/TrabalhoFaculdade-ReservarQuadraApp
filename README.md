# Reservar Quadra App

Aplicativo mobile para reserva de quadras esportivas, desenvolvido em React Native com Expo como trabalho da disciplina de desenvolvimento mobile.

## Funcionalidades

- **Cadastro e login** de usuários, com dados salvos localmente (AsyncStorage)
- **Sessão mantida**: quem já está logado abre o app direto nas quadras
- **Rotas protegidas**: as abas só podem ser acessadas com login
- **Quadras**: lista das quadras com esporte, preço por hora e horários do dia
- **Reserva por horário**:
  - horários que já passaram ficam bloqueados
  - horários já reservados ficam bloqueados
  - cada usuário pode ter apenas **uma reserva ativa** por vez
  - tela de confirmação antes de reservar
- **Minhas Reservas**: lista das reservas do usuário, com opção de cancelar (com confirmação)
- **Assistente IA**: o usuário descreve o que procura (ex: *"futsal depois das 20h, até R$ 100"*) e a IA (Google Gemini) sugere a melhor quadra e horário entre os disponíveis, com opção de reservar direto
- **Perfil**: exibe o nome do usuário e permite sair da conta

## Tecnologias

- React Native + Expo
- Expo Router (navegação por arquivos: Stack + Bottom Tabs)
- TypeScript
- AsyncStorage
- API do Google Gemini (consumida com `fetch`)

## Como rodar

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Crie um arquivo `.env` na raiz do projeto com a chave da API do Gemini (gerada em https://aistudio.google.com/apikey):
   ```
   EXPO_PUBLIC_GEMINI_API_KEY=sua_chave_aqui
   ```
   > Sem a chave, o app funciona normalmente, exceto a aba IA.

3. Inicie o projeto:
   ```bash
   npx expo start
   ```
   - `w` para abrir no navegador
   - `a` para abrir no emulador Android
   - ou leia o QR Code com o app **Expo Go**

## Estrutura

```
app/
├── _layout.tsx          # Stack principal
├── index.tsx            # Login
├── cadastro.tsx         # Cadastro
└── (abas)/
    ├── _layout.tsx      # Bottom Tabs + proteção de rota
    ├── quadras.tsx      # Lista de quadras e reserva
    ├── reservas.tsx     # Minhas reservas e cancelamento
    ├── ia.tsx           # Assistente de reserva com IA
    └── perfil.tsx       # Perfil e sair
src/
├── components/
│   └── ModalConfirmacao.tsx
├── types/
│   ├── Quadra.ts
│   ├── Reservas.ts
│   ├── Usuario.ts
│   └── data/quadras.json
└── utils/
    └── reservas.ts      # Funções de data e horário
styles/
└── global.ts
```

## Autor

Pedro Paiva Ferreira
