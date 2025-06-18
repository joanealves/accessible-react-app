Portal de Acessibilidade Digital
Este projeto é um portal de demonstração interativo focado em acessibilidade digital. Ele permite ativar e testar diversos recursos de acessibilidade web, como leitor de tela, intérprete de Libras, alto contraste, navegação por teclado e fontes para dislexia, para entender como eles beneficiam diferentes usuários.


Recursos Implementados
O portal oferece uma série de funcionalidades para tornar a experiência de navegação mais inclusiva:

Leitor de Tela: Converte texto selecionado em áudio. As configurações avançadas permitem ajustar velocidade e volume da fala, e ativar a reprodução automática.
Intérprete de Libras: Traduz o texto selecionado na área de demonstração para a Língua Brasileira de Sinais (Libras), exibindo um avatar.
Alto Contraste: Aplica filtros visuais para aumentar o contraste dos elementos da página, facilitando a leitura para pessoas com baixa visão.
Navegação por Teclado: Garante que todos os elementos interativos sejam acessíveis e navegáveis usando apenas o teclado (teclas Tab, Enter, Escape).
Fonte para Dislexia: Altera a fonte do texto para uma tipografia especialmente projetada para auxiliar pessoas com dislexia na leitura.
Guia de Leitura: Destaca a linha de texto onde o cursor está posicionado, ajudando no acompanhamento visual da leitura.
Feedback Audível (Announcer): Fornece anúncios em tempo real sobre ações e mudanças no estado da aplicação, ideal para usuários de leitores de tela.
Skip-to-Content (Pular para o Conteúdo): Permite que usuários de teclado pulem diretamente para o conteúdo principal, evitando a navegação repetitiva por menus.
Modal Acessível: Modais de informação que são controláveis por teclado e anunciam seu estado para tecnologias assistivas.
Gestão de Preferências: Utiliza um contexto global (A11yContext e ThemeContext) para gerenciar as preferências de acessibilidade e tema, persistindo as escolhas do usuário.
Tecnologias Utilizadas
React: Biblioteca JavaScript para construção de interfaces de usuário.
HTML & CSS (inline): Estruturação e estilização dos componentes.
JavaScript (ES6+): Lógica da aplicação.
ESLint (eslint-plugin-jsx-a11y): Ferramenta de linting para garantir boas práticas de acessibilidade no código JSX.
Como Rodar o Projeto
Siga os passos abaixo para configurar e rodar o projeto em sua máquina local.

Pré-requisitos
Certifique-se de ter o Node.js e o npm (ou Yarn) instalados em seu sistema.

Node.js (versão LTS recomendada)
npm (gerenciador de pacotes do Node.js, vem com o Node.js)
Instalação
Clone o repositório:

Bash

git clone <https://github.com/joanealves/accessible-react-app>
cd accessible-react-app

Instale as dependências:

Bash

npm install
# ou
yarn install
Executando a Aplicação
Após a instalação das dependências, você pode iniciar o servidor de desenvolvimento:

Bash

npm start
# ou
yarn start
Isso abrirá a aplicação em seu navegador padrão em http://localhost:3000 (ou outra porta disponível).

Acessibilidade e Boas Práticas
Este projeto visa demonstrar a importância da acessibilidade digital. Ele incorpora e adere a diversas diretrizes das WCAG (Web Content Accessibility Guidelines), focando nos quatro princípios fundamentais:

Perceptível: Informações e componentes de UI apresentados de maneira que possam ser percebidos por todos os usuários.
Operável: Componentes de UI e navegação devem ser operáveis por diferentes métodos (mouse, teclado).
Compreensível: Informações e a operação da interface do usuário devem ser compreensíveis.
Robusto: Conteúdo deve ser robusto o suficiente para ser interpretado por uma ampla variedade de agentes de usuário, incluindo tecnologias assistivas.
O uso do ESLint com eslint-plugin-jsx-a11y ajuda a identificar e corrigir problemas comuns de acessibilidade durante o desenvolvimento.

Contribuindo
Contribuições são bem-vindas! Se você tiver sugestões de melhorias, detecção de bugs ou novas funcionalidades, sinta-se à vontade para:

Abrir uma Issue descrevendo o problema ou a sugestão.
Criar um Pull Request com suas alterações, explicando o que foi modificado e porquê.
Licença
Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

