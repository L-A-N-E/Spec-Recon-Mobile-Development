<p align="center">
    <img src="https://upload.wikimedia.org/wikipedia/commons/a/a0/Ford_Motor_Company_Logo.svg" align="center" width="30%">
	<!-- <img width="20%" align="center" alt="logo_spec_recon_branca" src="https://github.com/user-attachments/assets/a45eb9dd-e21a-4dd0-92c9-511a63a8cb93" /> -->
</p>

<h1 align="center">Spec Recon - Mobile Development</h1>

<p align="center">
    Plataforma de Inteligência Competitiva Automotiva desenvolvida para centralizar análises estratégicas, monitoramento de mercado e comparações técnicas automatizadas.
</p>

<p align="center">
	<img src="https://img.shields.io/github/license/L-A-N-E/Spec-Recon-Mobile-Development?style=for-the-badge&logo=opensourceinitiative&logoColor=white&color=0080ff" alt="license">
	<img src="https://img.shields.io/github/last-commit/L-A-N-E/Spec-Recon-Mobile-Development?style=for-the-badge&logo=git&logoColor=white&color=0080ff" alt="last-commit">
	<img src="https://img.shields.io/github/languages/top/L-A-N-E/Spec-Recon-Mobile-Development?style=for-the-badge&color=0080ff" alt="repo-top-language">
	<img src="https://img.shields.io/github/languages/count/L-A-N-E/Spec-Recon-Mobile-Development?style=for-the-badge&color=0080ff" alt="repo-language-count">
</p>

<p align="center">
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB">
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white">
    <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white">
    <img src="https://img.shields.io/badge/TailwindCSS-0F172A?style=for-the-badge&logo=tailwindcss">
    <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white">
    <img src="https://img.shields.io/badge/Ollama-000000?style=for-the-badge&logo=ollama&logoColor=white">
</p>

---

# 📚 Sumário

- [📖 Sobre o Projeto](#-sobre-o-projeto)
- [🚀 Funcionalidades](#-funcionalidades)
- [🛠 Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [🏗 Estrutura do Projeto](#-estrutura-do-projeto)
- [⚙️ Instalação](#️-instalação)
- [▶️ Execução](#️-execução)
- [🛰 Pipeline OSINT (osint-radar/)](#-pipeline-osint-osint-radar)
- [🧠 Assistente Henry — IA local via Ollama](#-assistente-henry--ia-local-via-ollama)
- [🦙 Como instalar e rodar o Ollama no seu PC](#-como-instalar-e-rodar-o-ollama-no-seu-pc)
- [📰 Notícias da Semana e Central de Alertas](#-notícias-da-semana-e-central-de-alertas)
- [🔐 Confiabilidade de Fontes](#-confiabilidade-de-fontes)
- [🧪 Futuras Implementações](#-futuras-implementações)
- [📄 Licença](#-licença)

---

# 📖 Sobre o Projeto

O **Spec Recon** é uma plataforma de inteligência competitiva automotiva desenvolvida para atender uma necessidade estratégica da Ford nas áreas de Estratégia, Marketing e Análise de Dados.

Com o avanço do mercado automotivo e o crescimento acelerado da concorrência global, muitas análises passaram a depender de pesquisas manuais, ferramentas genéricas de Business Intelligence e múltiplas fontes dispersas de informação. Esse cenário gera alto custo operacional, baixa eficiência analítica e dificuldade na tomada de decisões rápidas.

O Spec Recon foi criado justamente para solucionar essa dor, centralizando a coleta, organização e análise de informações automotivas em uma única plataforma inteligente.

A solução permite que equipes estratégicas tenham acesso rápido e estruturado a dados relevantes do mercado, reduzindo o tempo gasto em pesquisas e aumentando a capacidade de identificar tendências, tecnologias emergentes e movimentos da concorrência.

## 🚀 Principais Objetivos

- Centralizar informações estratégicas do setor automotivo;
- Automatizar comparações técnicas entre veículos e plataformas;
- Monitorar continuamente concorrentes e tendências de mercado;
- Facilitar tomadas de decisão baseadas em dados;
- Reduzir o esforço operacional em pesquisas e análises;
- Oferecer uma experiência moderna, acessível e intuitiva.

## ⚡ Principais Funcionalidades

- Radar de Inteligência com **dados reais** coletados por pipeline próprio em Python (ficha técnica + vendas Fenabrave);
- Dashboard estratégico com métricas, insights e **notícias do setor ao vivo**;
- Central de Alertas **dinâmica**, calculada a partir dos mesmos dados do Radar/Dashboard;
- Grid competitivo com comparação técnica automatizada;
- Assistente virtual (**Henry**) com IA rodando localmente via **Ollama**, respondendo com base nos dados coletados e citando as fontes de cada resposta;
- Sistema de verificação e aprendizado de fontes confiáveis;
- Exportação de dados em CSV (ranking de vendas, faturamento por marca, vendas regionais);
- Organização estruturada de dados automotivos;
- Interface responsiva e moderna.

## 🧠 Tecnologias e Conceitos Aplicados

O projeto utiliza conceitos e tecnologias modernas como:

- OSINT (Open Source Intelligence)
- Inteligência Artificial (local, via Ollama)
- Automação de Coleta de Dados (web scraping em Python)
- Business Intelligence
- UX/UI Moderna
- React
- TypeScript
- TailwindCSS
- React Router DOM
- Lucide React
- Vite
- Python (requests, BeautifulSoup4, lxml, pandas)

## 🎯 Proposta do Projeto

Mais do que uma plataforma visual, o Spec Recon busca transformar grandes volumes de dados públicos em inteligência estratégica acionável, permitindo que a Ford tenha mais autonomia, velocidade e precisão na análise competitiva automotiva.

---

# 🚀 Funcionalidades

## 🌐 Landing Page Institucional
- Interface moderna e responsiva;
- Navegação suave entre seções;
- Design futurista inspirado em plataformas enterprise;
- Conteúdo condicional: usuário logado vê "Acessar Plataforma", visitante vê "Cadastro" e "Entrar".

## 🔐 Sistema de Autenticação
- Login corporativo;
- Cadastro corporativo;
- Recuperação de senha;
- Rotas públicas e privadas.

## 📊 Dashboard Estratégico
- Exibição de métricas com dados reais do pipeline OSINT/vendas;
- Indicadores estratégicos;
- Insights automatizados;
- Seção **"Notícias da Semana"**, buscada ao vivo em portais do setor automotivo;
- Exportação de tabelas (ranking de vendas, faturamento por marca, vendas por estado/UF) em **CSV**.

## 🛰 Radar de Inteligência
- Monitoramento de mercado com dados reais coletados por scraping (11 fontes: Wikipedia, EV Database, iCarros, Webmotors, UOL Carros, Autoesporte, Motor1 Brasil, CarrosNaWeb, FlatOut, AutoPapo, entre outras);
- Coleta automatizada de fichas técnicas de 239 veículos, em 42 marcas;
- Rastreamento de tendências e vendas (ranking Fenabrave via carrolens.com.br);
- Rolagem com efeito de desfoque (blur) nas listas longas para melhorar a leitura.

## ⚔ Grid Comparativo
- Comparação side-by-side;
- Diferenças técnicas automatizadas, com specs numéricas normalizadas (potência, torque, autonomia, aceleração, velocidade máxima, peso, capacidade de reboque, capacidade de bateria);
- Estrutura escalável para múltiplos veículos.

## 🤖 Assistente Virtual — Henry
- Interface conversacional, rodando 100% localmente via **Ollama** (sem custo de API, sem chave);
- Responde com base nos dados reais coletados pelo Radar (ficha técnica + vendas/faturamento Fenabrave);
- Quando o dado local não cobre a pergunta, faz busca na web (DuckDuckGo/Wikipedia) e avisa a fonte;
- Confere qualquer link que o usuário enviar na conversa e aponta divergências com os dados locais;
- Mostra sempre as **fontes consultadas** em cada resposta, com selo de "confiável" ou "não verificada";
- Permite ao usuário "aprovar" manualmente uma fonte ainda não confiável (sistema de aprendizado, salvo no navegador).

## 🔔 Central de Alertas
- Alertas gerados dinamicamente a partir dos dados reais (quedas de coleta, marcas em alta/queda forte, sinais de alta confiança);
- Inclui as principais notícias da semana, com link direto para a matéria original.

## 📱 Responsividade
- Navegação mobile;
- Sidebar adaptativa;
- Navbar dinâmica;
- Experiência otimizada para múltiplos dispositivos.

---

# 🛠 Tecnologias Utilizadas

## Front-end
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM

## UI / UX
- Lucide React Icons
- Layout Responsivo
- Glassmorphism
- Microinterações
- Animações suaves

## Coleta de Dados / OSINT (Python)
- `requests` + `BeautifulSoup4` + `lxml` para scraping e parsing de HTML;
- `pandas` para consolidação e exportação dos dados coletados;
- Scripts próprios (`osint-radar/`) que exportam JSON estático consumido pelo front-end (sem backend/API — snapshot gerado sob demanda).

## Inteligência Artificial
- **Ollama** rodando localmente (modelo `llama3.1:8b`) para o Assistente Henry;
- `r.jina.ai` como leitor de página público (sem chave) para contornar bloqueio de CORS ao ler notícias e links enviados pelo usuário;
- Sistema próprio de verificação/aprendizado de fontes confiáveis.

## Arquitetura
- Componentização modular
- Separação entre layouts públicos e privados
- Estrutura escalável
- Organização por módulos
- Separação clara entre app (React/TS) e pipeline de coleta (Python), integrados via arquivos JSON estáticos

---

# 🏗 Estrutura do Projeto

```sh
└── Spec-Recon-Mobile-Development/
    ├── public/
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   │   ├── public/
    │   │   └── private/
    │   ├── context/
    │   │   └── AuthContext.tsx
    │   ├── lib/
    │   │   ├── osint.ts          # leitura dos dados de ficha técnica (Radar/Grid/Dashboard)
    │   │   ├── sales.ts          # leitura dos dados de vendas/faturamento
    │   │   ├── news.ts           # busca ao vivo das notícias da semana
    │   │   ├── alerts.ts         # central de alertas dinâmica
    │   │   ├── webSearch.ts      # fallback de busca web do Henry
    │   │   ├── sourceCheck.ts    # conferência de link enviado pelo usuário no Henry
    │   │   └── trustedSources.ts # registro/aprendizado de fontes confiáveis
    │   ├── layout/
    │   ├── pages/
    │   │   ├── Assistant/        # Henry (chat com IA local via Ollama)
    │   │   ├── Dashboard/
    │   │   ├── Radar/
    │   │   └── Grid/
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── style.css
    ├── osint-radar/               # pipeline Python de coleta (OSINT + vendas)
    │   ├── osint_radar.py         # motor de coleta de ficha técnica (biblioteca de fontes)
    │   ├── build_dataset.py       # roda o catálogo inteiro (239 veículos) e exporta JSON
    │   ├── collect_vehicle.py     # coleta incremental de 1 veículo (merge, não sobrescreve)
    │   ├── sales_radar.py         # coleta ranking de vendas (Fenabrave via carrolens.com.br)
    │   ├── build_sales.py         # junta ano atual + anterior, calcula variação e faturamento estimado
    │   ├── press_sales.py         # ranking mensal via imprensa (Autoesporte/Quatro Rodas)
    │   ├── build_monthly_sales.py # consolida o ranking mensal
    │   ├── regional_sales.py      # coleta vendas por estado/região
    │   ├── build_regional.py      # exporta vendas por estado/região
    │   ├── fipe_prices.py         # estimativa de preço médio (Tabela FIPE)
    │   ├── LOGICA_PIPELINE.md     # documentação detalhada do pipeline
    │   └── requirements.txt
    ├── package.json
    ├── vite.config.ts
    └── README.md
````

---

# ⚙️ Instalação

## Pré-requisitos

Antes de começar, você precisará ter instalado:

* Node.js
* npm
* Python 3.9+ (apenas se for rodar/atualizar o pipeline de coleta em `osint-radar/`)
* [Ollama](https://ollama.com) (apenas se for usar o Assistente Henry — veja a seção [🦙 Como instalar e rodar o Ollama no seu PC](#-como-instalar-e-rodar-o-ollama-no-seu-pc))

---

## Clone o repositório

```bash
git clone https://github.com/L-A-N-E/Spec-Recon-Mobile-Development
```

---

## Entre no diretório

```bash
cd Spec-Recon-Mobile-Development
```

---

## Instale as dependências do front-end

```bash
npm install
```

---

## (Opcional) Instale as dependências do pipeline OSINT

Só necessário se você for rodar/atualizar a coleta de dados (Radar/Grid/Dashboard já vêm com um snapshot pronto em `src/data/`):

```bash
cd osint-radar
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

---

# ▶️ Execução

## Ambiente de desenvolvimento

```bash
npm run dev
```

---

## Build de produção

```bash
npm run build
```

---

## Preview da build

```bash
npm run preview
```

---

## Atualizando os dados do Radar/Grid/Dashboard (opcional)

Com o ambiente Python ativado (`source osint-radar/.venv/bin/activate`), a partir da pasta `osint-radar/`:

```bash
# Ficha técnica — roda o catálogo inteiro (239 veículos), sobrescreve os JSON
python build_dataset.py

# Ficha técnica — só 1 veículo (mais rápido, faz merge em vez de sobrescrever)
python collect_vehicle.py "Volkswagen" "T-Cross"

# Vendas (ranking Fenabrave, acumulado do ano)
python build_sales.py

# Vendas mensais (imprensa)
python build_monthly_sales.py

# Vendas por estado/região
python build_regional.py
```

> ⚠️ O scraping das fontes brasileiras usa busca via DuckDuckGo, que pode bloquear temporariamente (CAPTCHA) após muitas chamadas seguidas — isso é detectado e avisado no console, não falha silenciosamente. Prefira rodar de uma rede residencial/doméstica. Detalhes completos em [`osint-radar/LOGICA_PIPELINE.md`](osint-radar/LOGICA_PIPELINE.md).

---

# 🛰 Pipeline OSINT (osint-radar/)

O Radar, o Grid e o Dashboard são alimentados por um pipeline próprio em Python que roda offline/manualmente e exporta **JSON estático** para o front-end consumir — não existe backend/API, é um snapshot atualizado sob demanda.

Existem duas trilhas de dados independentes:

```
Trilha 1: FICHA TÉCNICA (specs de cada veículo)
  osint_radar.py  →  funções de coleta/parse por fonte (11 fontes registradas)
        ↓
  build_dataset.py  →  roda o catálogo inteiro (239 veículos, 42 marcas)
        ↓ ou, para 1 veículo só
  collect_vehicle.py  →  roda 1 veículo e faz merge incremental
        ↓
  src/data/osintDiscoveries.json + osintVehicleSpecs.json

Trilha 2: VENDAS (ranking de emplacamentos por modelo)
  sales_radar.py  →  ranking anual (Fenabrave, via carrolens.com.br)
  press_sales.py  →  ranking mensal (Autoesporte / Quatro Rodas)
  regional_sales.py → vendas por estado/região (fenabrave.online)
        ↓
  build_sales.py / build_monthly_sales.py / build_regional.py
        ↓
  src/data/salesRankings.json + salesMonthly.json + salesByRegion.json
```

Pontos importantes:

- **Fontes de ficha técnica:** Wikipedia (PT/EN) e EV Database usam API/sitemap próprios (estáveis); os sites brasileiros (iCarros, Webmotors, UOL Carros, Autoesporte, Motor1 Brasil, CarrosNaWeb, FlatOut, AutoPapo) são localizados via busca no DuckDuckGo, o ponto mais frágil do pipeline (sujeito a bloqueio temporário).
- **Faturamento por marca** é sempre uma **estimativa** (preço médio da Tabela FIPE × unidades vendidas) — não é o faturamento contábil real, e isso é comunicado explicitamente nos dados exportados.
- **Ranking mensal x anual:** `salesRankings.json` é o acumulado do ano; `salesMonthly.json` é o recorte de um mês específico coletado via imprensa — são trilhas complementares.
- Scripts incrementais (`collect_vehicle.py`) sempre fazem **merge**, nunca sobrescrevem a base inteira; só os scripts de catálogo completo (`build_dataset.py`, `build_sales.py`) reconstroem os JSON do zero.

Para o detalhamento completo de cada script (regras de parsing, normalização de unidades, limitações conhecidas), veja [`osint-radar/LOGICA_PIPELINE.md`](osint-radar/LOGICA_PIPELINE.md).

---

# 🧠 Assistente Henry — IA local via Ollama

O **Henry** (nome em homenagem a Henry Ford) é o assistente virtual do Spec Recon. Diferente de um chatbot genérico, ele:

1. **Prioriza dados locais** — antes de tudo, verifica se a pergunta é respondida pelos dados coletados pelo Radar (`osint.ts`) ou pelas vendas/faturamento (`sales.ts`);
2. **Cai para busca web** (`webSearch.ts`, DuckDuckGo/Wikipedia) somente quando o dado local não cobre a pergunta, e sempre avisa qual foi a fonte usada;
3. **Confere links enviados pelo usuário** (`sourceCheck.ts`) — sempre que a mensagem contém uma URL, o Henry busca o conteúdo daquela página (via `r.jina.ai`, que contorna bloqueio de CORS) e compara com os dados que já tem, apontando qualquer divergência de números/datas/especificações;
4. **Mostra as fontes de cada resposta** — toda resposta que usa algum dado (local, busca web ou link do usuário) exibe as fontes consultadas, com selo de "confiável" ✅ ou "não verificada" ⚠️;
5. **Aprende com o usuário** — uma fonte não verificada pode ser aprovada manualmente pelo botão "Confiar nesta fonte"; essa decisão fica salva no navegador (`trustedSources.ts`) e nunca acontece automaticamente a partir do conteúdo de uma busca (evita que uma fonte maliciosa se autodeclare confiável).

O modelo de linguagem roda **100% local**, via **Ollama**, sem custo de API e sem enviar dados para serviços de terceiros — só precisa do Ollama ativo na máquina de quem está usando a página.

---

# 🦙 Como instalar e rodar o Ollama no seu PC

O chat do Henry (`/assistant`) só funciona com o [Ollama](https://ollama.com) rodando localmente. Siga o passo a passo abaixo:

## 1. Instale o Ollama

**macOS** (via Homebrew):
```bash
brew install ollama
```
Ou baixe o instalador direto em [ollama.com/download](https://ollama.com/download).

**Windows:**
Baixe e execute o instalador em [ollama.com/download](https://ollama.com/download).

**Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

## 2. Inicie o serviço do Ollama

**macOS (Homebrew):**
```bash
brew services start ollama
```

**Ou manualmente (qualquer sistema), em um terminal separado:**
```bash
ollama serve
```

> No Windows e no macOS (instalador padrão), o Ollama costuma já rodar em segundo plano automaticamente após a instalação — nesse caso não é necessário rodar `ollama serve` manualmente.

## 3. Baixe o modelo usado pelo Henry

O projeto está configurado para usar o `llama3.1:8b` (ver `src/pages/Assistant/index.tsx`, constante `OLLAMA_MODEL`):

```bash
ollama pull llama3.1:8b
```

> Esse modelo tem ~4.7 GB e exige pelo menos 8 GB de RAM livre para rodar com folga (recomendado 16 GB). Se sua máquina tiver mais RAM disponível, o modelo `qwen2.5:14b` tende a ter um desempenho ainda melhor em português — mas para trocar, é preciso também atualizar a constante `OLLAMA_MODEL` no código.

## 4. Confirme que está tudo funcionando

Com o serviço ativo e o modelo baixado, teste diretamente no terminal:

```bash
ollama run llama3.1:8b "Olá, tudo bem?"
```

Se responder normalmente, está pronto. Rode o front-end (`npm run dev`), acesse a página **Henry** (`/assistant`) e mande uma mensagem.

## 5. Solução de problemas

- **"Não consegui falar com o modelo local (Ollama)"** (mensagem exibida no chat): confirme que o serviço está ativo (`ollama serve` ou `brew services start ollama`) e que a porta padrão `11434` não está sendo usada por outro processo.
- **Modelo não encontrado:** rode `ollama list` para conferir os modelos baixados; se `llama3.1:8b` não aparecer, rode `ollama pull llama3.1:8b` novamente.
- **Resposta muito lenta:** normal em máquinas com pouca RAM/CPU — o modelo roda localmente, então o desempenho depende do hardware. Considere um modelo menor (ex.: `llama3.2:3b`) se a máquina for mais limitada.
- O Henry funciona **por navegador/dispositivo**: o Ollama precisa estar rodando na mesma máquina de quem está acessando a página (não há um servidor compartilhado).

---

# 📰 Notícias da Semana e Central de Alertas

## Notícias da Semana (Dashboard)

Busca **ao vivo** (sem snapshot, diferente do resto do app) em três fontes de imprensa/indústria automotiva:

- **AutoData** (RSS oficial, com data por item);
- **AutoForum** (RSS, sem link direto por item — limitação do parser da fonte, avisada na própria interface);
- **Automotive Business** (sem RSS funcional — extrai a seção "Últimas Notícias" da home).

Como nenhuma das três libera CORS para fetch direto do navegador, a leitura passa pelo `r.jina.ai` (leitor de página público e gratuito). Um filtro de palavras-chave (marca, modelo, termos do setor) garante que só entrem notícias realmente relacionadas a automóveis. Os resultados ficam em cache por 30 minutos (compartilhado entre Dashboard e Central de Alertas) para evitar buscas repetidas.

## Central de Alertas

Os alertas deixaram de ser uma lista fixa e passaram a ser **calculados a partir dos dados reais** do Radar e das vendas:

- Queda relevante no volume de coleta;
- Marca em alta ou queda forte de vendas;
- Descobertas de alta confiança;
- Principais notícias da semana (mesma fonte da seção acima), com link direto para a matéria original.

---

# 🔐 Confiabilidade de Fontes

Todo dado apresentado pelo Henry (ou usado nos alertas/dashboard) é rastreável a uma fonte. O registro de fontes confiáveis (`trustedSources.ts`) combina duas camadas:

1. **Lista curada**: grandes veículos de comunicação (G1, UOL, R7/Band) e as bases técnicas já usadas no pipeline OSINT (Wikipedia, EV Database, iCarros, Webmotors, Motor1, CarrosNaWeb, FlatOut, AutoPapo);
2. **Lista aprendida**: cresce apenas quando o próprio usuário aprova manualmente uma fonte ainda não confiável (botão "Confiar nesta fonte"), salva no `localStorage` do navegador.

Nenhuma fonte vira confiável automaticamente só por aparecer em uma busca ou em um link enviado — isso evita que uma fonte comprometida ou de baixa qualidade se autodeclare confiável.

---

# 📸 Preview do Projeto

## 
<img width="100%" alt="mockup" src="https://github.com/user-attachments/assets/3f8e3ed3-1b5f-4c34-9a28-4e1e7e546865" />


## 📱 Mobile

<p align="center">
	<img width="230" alt="img" src="https://github.com/user-attachments/assets/0c43ec24-fe5e-4d35-807b-8c62605d4a3a" />
	<img width="230" alt="img" src="https://github.com/user-attachments/assets/4b5c1d07-df38-44de-b674-66b235e7e09f" />
</p>

---

## 🖥️ Desktop

<p align="center">
	<img width="850" alt="img" src="https://github.com/user-attachments/assets/8c6de681-937c-4ca0-bc2e-44e587eebeac" />
</p>

---

## 🛜 Radar

<p align="center">
	<img width="230" alt="img" src="https://github.com/user-attachments/assets/8e8192bc-92cd-4f5d-8d4c-d358e0196b75" />
	<img width="230" alt="img" src="https://github.com/user-attachments/assets/660d8926-c393-4bc7-a9f2-00080198f593" />
</p>

<p align="center">
	<img width="850" alt="img" src="https://github.com/user-attachments/assets/8c312ba7-4073-4c4d-8601-df86b5d72179" />
</p>

---

## 📱 Dashboard

<p align="center">
	<img width="230" alt="img" src="https://github.com/user-attachments/assets/02cf7e3b-a6d7-4db7-bc81-5e8eacb37d58" />
	<img width="230" alt="img" src="https://github.com/user-attachments/assets/59ec27e5-c2bd-488a-9763-78762dc19efe" />
</p>

<p align="center">
	<img width="850" alt="img" src="https://github.com/user-attachments/assets/ce26aa1c-92ad-450e-8d8b-e385221fdffc" />
</p>

---

## 🖥️ Grid

<p align="center">
	<img width="230" alt="image" src="https://github.com/user-attachments/assets/ec0332dd-8a24-40d0-a3b3-d09de0f5c7b4" />
	<img width="230" alt="image" src="https://github.com/user-attachments/assets/e5ddafd5-dd99-4f7c-af00-857dd00aae16" />
</p>

<p align="center">
    <img width="850" alt="image" src="https://github.com/user-attachments/assets/81d15508-4b1d-445e-a0bb-f657cfb83d97" />
</p>

---

## 💁 Assistente Virtual

<p align="center">
	<img width="230" alt="image" src="https://github.com/user-attachments/assets/2a1be50e-0203-4791-a840-df2de8a37aeb" />
	<img width="230" alt="image" src="https://github.com/user-attachments/assets/0e360133-7763-4534-93b5-6599fc221874" />

</p>

<p align="center">
	<img width="850" alt="image" src="https://github.com/user-attachments/assets/9cec1ab0-4cc7-448d-8727-2f87eff865c8" />

</p>

---

## 🎥 Demonstração em Video
<p align="center">
    <a href="https://youtu.be/sQx0dSIoJ6o" target="_blank">
		<img width="580" alt="tumb" src="https://github.com/user-attachments/assets/1d1ca7cd-f580-4de5-9be9-10379905d0dd" />
    </a>
</p>

---

# 🧪 Futuras Implementações

* [x] Web scraping automatizado (pipeline OSINT em Python, 11 fontes, ficha técnica + vendas);
* [x] Integração com IA generativa (Henry, via Ollama local);
* [x] Sistema de notificações (Central de Alertas dinâmica);
* [x] Dashboard analítico completo;
* [x] Exportação de relatórios (CSV: ranking de vendas, faturamento por marca, vendas regionais);
* [ ] Integração com banco de dados (hoje os dados são JSON estático gerado pelo pipeline Python);
* [ ] Integração com APIs oficiais automotivas (hoje via scraping de fontes públicas);
* [ ] Sistema de permissões (perfis de acesso).

---

# 📄 Licença

Este projeto possui fins acadêmicos e educacionais.

Desenvolvido para estudos de Engenharia de Software e aplicações de Inteligência Competitiva Automotiva.

---

# 👨‍💻 Desenvolvido por

### L.A.N.E — FIAP | Engenharia de Software

Projeto acadêmico desenvolvido para o Challenge Ford 2026.

| [<img src="https://avatars.githubusercontent.com/u/101829188?v=4" width=115><br><sub>Alice Santos Bulhões</sub>](https://github.com/AliceSBulhoes) |  [<img src="https://avatars.githubusercontent.com/u/163866552?v=4" width=115><br><sub>Eduardo Oliveira Cardoso Madid</sub>](https://github.com/EduardoMadid) |  [<img src="https://avatars.githubusercontent.com/u/148162404?v=4" width=115><br><sub>Lucas Henzo Ide Yuki</sub>](https://github.com/LucasYuki1) | [<img src="https://avatars.githubusercontent.com/u/153787379?v=4" width=115><br><sub>Nicolas Haubricht Hainfellner</sub>](https://github.com/NicolasHaubricht) |  [<img src="https://avatars.githubusercontent.com/u/160745486?v=4" width=115><br><sub>Guilherme Melo</sub>](https://github.com/gmelo21)
| :---: | :---: | :---: | :---: | :---: |
| RM:554499 | RM:556349 | RM:554865 | RM:556259 | RM:555310


---

# ⭐ Considerações

O Spec Recon foi idealizado para transformar grandes volumes de dados públicos em inteligência estratégica acionável, oferecendo uma experiência moderna, centralizada e escalável para análise competitiva automotiva.
