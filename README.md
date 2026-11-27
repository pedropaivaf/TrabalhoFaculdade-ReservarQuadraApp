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
│   ├── CardQuadra.tsx       # Card de quadra com os horários
│   ├── ItemReserva.tsx      # Card de reserva com cancelar
│   └── ModalConfirmacao.tsx # Tela de confirmação reutilizável
├── events/
│   └── reservaEvent.ts      # Avisa as abas quando uma reserva muda
├── types/
│   ├── Quadra.ts
│   ├── Reservas.ts
│   ├── Usuario.ts
│   └── data/quadras.json
└── utils/
    └── reservas.ts      # Funções de data, horário e disponibilidade
styles/
└── global.ts
```

## Requisitos

### Requisitos Funcionais (RF)

| ID | Requisito | Descrição |
|---|---|---|
| RF01 | Cadastrar usuário | O sistema deve permitir o cadastro com nome, e-mail e senha. |
| RF02 | Autenticar usuário | O sistema deve permitir o login com e-mail e senha cadastrados. |
| RF03 | Manter sessão | O sistema deve manter o usuário logado ao reabrir o app, levando-o direto à tela de quadras. |
| RF04 | Encerrar sessão | O sistema deve permitir que o usuário saia da conta pelo Perfil. |
| RF05 | Listar quadras | O sistema deve exibir as quadras com nome, esporte, preço por hora e horários do dia. |
| RF06 | Indicar disponibilidade | O sistema deve diferenciar visualmente horários livres e indisponíveis (já passaram ou já reservados). |
| RF07 | Reservar horário | O sistema deve permitir reservar um horário livre tocando nele. |
| RF08 | Confirmar reserva | O sistema deve exibir uma tela de confirmação (quadra, esporte, horário e preço) antes de salvar a reserva. |
| RF09 | Listar minhas reservas | O sistema deve exibir as reservas do usuário logado, com quadra, esporte, data e horário. |
| RF10 | Cancelar reserva | O sistema deve permitir cancelar uma reserva ativa, com tela de confirmação. |
| RF11 | Atualizar disponibilidade entre telas | Ao reservar ou cancelar, as demais telas devem refletir a mudança sem precisar reiniciar o app. |
| RF12 | Assistente de reserva com IA | O sistema deve receber um pedido em texto livre (ex.: "futsal depois das 20h, até R$ 100") e sugerir uma quadra e um horário livres, com o motivo da escolha. |
| RF13 | Reservar pela sugestão da IA | O sistema deve permitir reservar a sugestão da IA, com a mesma tela de confirmação. |
| RF14 | Exibir perfil | O sistema deve exibir o nome e o e-mail do usuário logado. |

### Regras de Negócio (RN)

| ID | Regra |
|---|---|
| RN01 | O nome deve ter pelo menos 3 caracteres. |
| RN02 | O e-mail deve ter formato válido e ser único no cadastro. Maiúsculas e minúsculas não são diferenciadas. |
| RN03 | A senha deve ter pelo menos 6 caracteres. |
| RN04 | As reservas são feitas somente para o dia atual. |
| RN05 | Um horário que já começou ou já passou não pode ser reservado. O horário 00:00 é tratado como o último do dia. |
| RN06 | Um horário reservado por qualquer usuário fica indisponível para todos. |
| RN07 | Cada usuário pode ter apenas **uma reserva ativa** por vez. Reserva ativa é a do dia atual cujo horário ainda não começou. |
| RN08 | Somente reservas ativas podem ser canceladas. Reservas cujo horário já passou aparecem como "Concluída". |
| RN09 | As telas de quadras, reservas, IA e perfil só podem ser acessadas por usuário logado. |
| RN10 | A IA só pode sugerir horários livres. O app valida a resposta da IA antes de exibi-la. |
| RN11 | Se o pedido não informar o esporte, a IA sugere a opção mais barata. Se o horário pedido não estiver livre, sugere o horário livre mais próximo. |

### Requisitos Não Funcionais (RNF)

| ID | Categoria | Requisito |
|---|---|---|
| RNF01 | Plataforma | O app deve ser desenvolvido em React Native com Expo e funcionar no Android e no navegador (Web). |
| RNF02 | Linguagem | O código deve ser escrito em TypeScript, com tipos para Quadra, Reserva e Usuário. |
| RNF03 | Navegação | A navegação deve usar Expo Router (rotas por arquivo), com Stack na raiz e Bottom Tabs nas telas principais. |
| RNF04 | Persistência | Os dados (usuários, sessão e reservas) devem ser salvos localmente no aparelho com AsyncStorage. |
| RNF05 | Integração | O assistente deve consumir a API do Google Gemini via `fetch`, com resposta em formato JSON definido. |
| RNF06 | Segurança | A chave da API deve ficar em arquivo `.env`, fora do controle de versão. |
| RNF07 | Disponibilidade | A consulta à IA deve ter tempo limite de 15 segundos e usar um modelo reserva se o principal falhar. Se ambos falharem, o app deve exibir uma mensagem amigável, sem travar. |
| RNF08 | Usabilidade | Ações importantes (reservar e cancelar) devem pedir confirmação. Erros de validação devem exibir mensagens claras. |
| RNF09 | Interface | O app deve usar tema escuro, respeitar a área segura da tela (SafeAreaView) e ter ícones nas abas. |
| RNF10 | Manutenibilidade | Elementos repetidos devem ser componentes reutilizáveis (cards e modal de confirmação), e as regras de horário devem ficar centralizadas em funções utilitárias. |

### Modelo de dados

| Entidade | Campos |
|---|---|
| Usuario | id, nome, email, senha |
| Quadra | id, nome, esporte, precoHora, horarios |
| Reserva | id, usuarioEmail, quadraId, quadraNome, esporte, data, horario |

**Armazenamento (AsyncStorage):**

| Chave | Conteúdo |
|---|---|
| `usuarios_cadastrados` | Lista de usuários |
| `usuario_logado` | Usuário da sessão atual |
| `reservas` | Lista de reservas de todos os usuários |

As quadras e seus horários ficam no arquivo `src/types/data/quadras.json`.

### Telas

| Tela | Rota | Requisitos |
|---|---|---|
| Login | `/` | RF02, RF03 |
| Cadastro | `/cadastro` | RF01 |
| Quadras | `/quadras` | RF05, RF06, RF07, RF08, RF11 |
| Reservas | `/reservas` | RF09, RF10, RF11 |
| IA | `/ia` | RF12, RF13 |
| Perfil | `/perfil` | RF04, RF14 |

### Rastreabilidade (requisito → código)

| Requisito | Arquivo |
|---|---|
| RF01, RN01–RN03 | `app/cadastro.tsx` |
| RF02, RF03 | `app/index.tsx` |
| RN09 | `app/(abas)/_layout.tsx` |
| RF05–RF08, RN04–RN07 | `app/(abas)/quadras.tsx`, `src/components/CardQuadra.tsx`, `src/utils/reservas.ts` |
| RF09, RF10, RN08 | `app/(abas)/reservas.tsx`, `src/components/ItemReserva.tsx` |
| RF11 | `src/events/reservaEvent.ts` |
| RF12, RF13, RN10, RN11, RNF05–RNF07 | `app/(abas)/ia.tsx` |
| RF04, RF14 | `app/(abas)/perfil.tsx` |
| RF08, RF10 (confirmação) | `src/components/ModalConfirmacao.tsx` |

### Limitações conhecidas

- Os dados ficam salvos apenas no aparelho. Usuários em celulares diferentes não veem as reservas uns dos outros.
- A senha é armazenada sem criptografia. Em produção, a autenticação ficaria em um servidor, com senha protegida por hash.
- A chave da API fica embutida no app final. Em produção, a chamada à IA passaria por um servidor.
- As reservas são apenas para o dia atual.
- A comunicação entre telas usa `NativeEventEmitter`, que não é suportado no iOS sem um módulo nativo. Esta versão é voltada para Android e Web.

## Autor

Pedro Paiva Ferreira
