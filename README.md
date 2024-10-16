<div align="center" id="top"> 
   <a href="https://vcnafacul.com.br" target="_blank"><img src="src/assets/vcnafacul.png" alt="Logo"></a>
</div>

<h1 align="center">Frontend Você na Facul</h1>
<p align="center">
   <img alt="Principal linguagem do projeto" src="https://img.shields.io/github/languages/top/dev-vcnafacul/client-vcnafacul">
   <img alt="Quantidade de linguagens utilizadas" src="https://img.shields.io/github/languages/count/dev-vcnafacul/client-vcnafacul">
   <img alt="Tamanho do repositório" src="https://img.shields.io/github/repo-size/dev-vcnafacul/client-vcnafacul?color=blue">
   <img alt="Licença" src="https://img.shields.io/github/license/dev-vcnafacul/client-vcnafacul?color=inactive">
   <img alt="Github issues" src="https://img.shields.io/github/issues/dev-vcnafacul/client-vcnafacul" />
   <img alt="Github pull requests" src="https://img.shields.io/github/issues-pr/dev-vcnafacul/client-vcnafacul" />
 </p>

 <h2>Descrição</h2>
 <p>Somos uma equipe de voluntários trabalhando por um bem maior: a EDUCAÇÃO. Queremos que o ambiente universitário seja justo e igualitário, e que o desejo de ingressar no ensino superior não dependa de cor, gênero, orientação sexual ou classe social.
</p>

<h2>Ambiente</h2>
<div>
   <h5>Desenvolvimento</h5>
   <p>Para rodar o projeto em ambiente de <strong>Desenvolvimento</strong>, siga os passos abaixo:</p>
   <ol>
      <li>Clone o repositório</li>
      <li>Execute o comando <code>yarn</code> para instalar as dependências</li>
      <li>Verifique se existe o arquivo <code>.env.development</code> na raiz do projeto</li>
      <li>Execute o comando <code>yarn dev</code> para rodar o projeto</li>
      <li>Abra o navegador e acesse <code>http://localhost:5173</code></li>
      <li>Para fins de login, clone o repositório de backend em <a href="https://github.com/vcnafacul/api-vcnafacul" style="text-decoration: none;"><code>api-vcnafacul</code></a></li>
   </ol>
   <h5>Homologação</h5>
   <p>Para rodar o projeto em ambiente de <strong>Homologação</strong> ...</p>
   <ul>
      <li>Se seu sistema for windows, necessário instalar Docker Desktop</li>
      <li>Para os demais sistemas ou utilizando o <strong>
         Windows Subsystem for Linux</strong> <code>wsl</code>, o docker é necessário, mas caso não possua, será instalado durante o processo de subida da aplicação.</li>
   </ul>
   <div>
      <p>Processo de Up do ambiente de homologação</p>
      <ol>
         <li>Verifique se existe o arquivo <code>.env.qa</code>, caso não, crie um a partir de <code>.env.qa.example</code> e preencha as informações pertinentes</li>
         <li>Rode o script <code>./run_qa.sh</code></li>
         <ul>
            <li>Em sistemas windows, o arquivo deve ser executado no terminal <code>git bash</code></li>
         </ul>
         <li>O processo de up das aplicações <code>client-vcnafacul</code>, <code>api-vcnafacul</code> e <code>ms-vcnafacul</code> levá um tempo para</li>
         <ul>
            <li>Instalar o docker, caso não possua</li>
            <li>Baixar as imagens do projeto do repositorio do <strong>Docker Hub</strong></li>
            <li>Subir a aplicação</li>
         </ul>
         <li>Uma vez o processo ser finalizado com <code>done</code>, abra o navegador e acesse <code>http://localhost:5173</code></li>
      </ol>
   </div>
</div>

<h2>Principais tecnologias neste projeto</h2>
<ul>
   <li><img align="center" alt="Logo React" height="20" width="40" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg"><a href="https://react.dev/">React</a></li>
   <li><img align="center" alt="Logo Typescript" height="20" width="40" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-plain.svg"><a href="https://www.typescriptlang.org/">Typescript</a></li>
   <li><img align="center" alt="Logo Vite" height="20" width="40" src="https://raw.githubusercontent.com/devicons/devicon/ca28c779441053191ff11710fe24a9e6c23690d6/icons/vitejs/vitejs-original.svg"><a href="https://vite.dev/">Vite</a></li>
   <li><img align="center" alt="Logo Tailwind" height="20" width="40" src="https://raw.githubusercontent.com/devicons/devicon/ca28c779441053191ff11710fe24a9e6c23690d6/icons/tailwindcss/tailwindcss-original.svg"><a href="https://tailwindcss.com/">Tailwind</a></li>
   <li><img align="center" alt="Logo Zustand" height="20" width="40" src="https://user-images.githubusercontent.com/958486/218346783-72be5ae3-b953-4dd7-b239-788a882fdad6.svg"><a href="https://zustand-demo.pmnd.rs/">Zustand</a></li>
</ul>

<h2>Principais tecnologias nos demais projetos</h2>
<ul>
   <li><img align="center" alt="Logo Nest" height="20" width="40" src="https://raw.githubusercontent.com/devicons/devicon/ca28c779441053191ff11710fe24a9e6c23690d6/icons/nestjs/nestjs-original.svg"><a href="https://nestjs.com/">Nest JS</a></li>
   <li><img align="center" alt="Logo Postgresql" height="20" width="40" src="https://raw.githubusercontent.com/devicons/devicon/ca28c779441053191ff11710fe24a9e6c23690d6/icons/postgresql/postgresql-original.svg"><a href="https://www.postgresql.org/">Postgresql</a></li>
   <li><img align="center" alt="Logo Nginx" height="20" width="40" src="https://raw.githubusercontent.com/devicons/devicon/ca28c779441053191ff11710fe24a9e6c23690d6/icons/nginx/nginx-original.svg"><a href="https://nginx.org/en/">Nginx</a></li>
   <li><img align="center" alt="Logo Node" height="20" width="40" src="https://raw.githubusercontent.com/devicons/devicon/ca28c779441053191ff11710fe24a9e6c23690d6/icons/nodejs/nodejs-original.svg"><a href="https://nodejs.org/en">Node</a></li>
   <li><img align="center" alt="Logo Mysql" height="20" width="40" src="https://raw.githubusercontent.com/devicons/devicon/ca28c779441053191ff11710fe24a9e6c23690d6/icons/mysql/mysql-original-wordmark.svg"><a href="https://www.mysql.com/">MySQL</a></li>
   <li><img align="center" alt="Logo Swagger" height="20" width="40" src="https://raw.githubusercontent.com/devicons/devicon/ca28c779441053191ff11710fe24a9e6c23690d6/icons/swagger/swagger-original.svg"><a href="https://swagger.io/">Swagger</a></li>
   <li><img align="center" alt="Logo Docker" height="20" width="40" src="https://raw.githubusercontent.com/devicons/devicon/ca28c779441053191ff11710fe24a9e6c23690d6/icons/docker/docker-original.svg"><a href="https://www.docker.com/">Docker</a></li>
   <li><img align="center" alt="Logo Figma" height="20" width="40" src="https://raw.githubusercontent.com/devicons/devicon/ca28c779441053191ff11710fe24a9e6c23690d6/icons/figma/figma-original.svg"><a href="https://www.figma.com/">Figma</a></li>
   <li><img align="center" alt="Logo Mongo" height="20" width="40" src="https://raw.githubusercontent.com/devicons/devicon/ca28c779441053191ff11710fe24a9e6c23690d6/icons/mongodb/mongodb-original.svg"><a href="https://www.mongodb.com/">Mongo</a></li>
   <li><img align="center" alt="Logo Flutter" height="20" width="40" src="https://raw.githubusercontent.com/devicons/devicon/ca28c779441053191ff11710fe24a9e6c23690d6/icons/flutter/flutter-original.svg"><a href="https://flutter.dev/">Flutter</a></li>
   <li><img align="center" alt="Logo Android" height="20" width="40" src="https://raw.githubusercontent.com/devicons/devicon/ca28c779441053191ff11710fe24a9e6c23690d6/icons/android/android-original.svg"><a href="https://developer.android.com/studio?gad_source=1&gclid=Cj0KCQjwyL24BhCtARIsALo0fSCm5HC_WNjMLeSGsHUKnDvYUvNm9x7AwLrVOCATI_eQU-l-ssdlUm8aApfWEALw_wcB&gclsrc=aw.ds&hl=pt-br">Android Studio</a></li>
</ul>

## Contribuição

Sinta-se à vontade para abrir uma issue ou um pull request caso queira contribuir. Toda ajuda é bem-vinda!

## Contato

Se tiver alguma dúvida, entre em contato através do nosso site [Você na Facul](https://vcnafacul.com.br).
