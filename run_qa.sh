#!/bin/bash

# Função para checar o sistema operacional
check_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "Sistema Linux detectado."
        check_docker
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "Sistema MacOS detectado."
        check_docker_mac
    elif [[ "$OSTYPE" == "cygwin" || "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        echo "Sistema Windows detectado."
        check_docker_windows
    else
        echo "Sistema operacional não suportado."
        exit 1
    fi
}

# Função para checar se o Docker está instalado no Linux/Mac
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo "Docker não está instalado. Tentando instalar o Docker..."
        install_docker
    else
        echo "Docker já está instalado."
    fi
}

# Função para checar o Docker no Windows
check_docker_windows() {
    if ! command -v docker &> /dev/null; then
        echo "Docker não está instalado no Windows. Por favor, instale o Docker manualmente via Docker Desktop."
    else
        echo "Docker já está instalado no Windows."
    fi
}

# Função para instalar o Docker no Mac
check_docker_mac() {
    if ! command -v docker &> /dev/null; then
        echo "Docker não está instalado. Tentando instalar o Docker..."
        install_docker_mac
    else
        echo "Docker já está instalado."
    fi
}

# Função para instalar o Docker no Linux
install_docker() {
    set -e  # Faz o script parar em qualquer erro
    trap 'echo "Erro na linha $LINENO. Falha ao instalar o Docker. Por favor, instale o Docker manualmente."; exit 1' ERR

    # Atualizando e instalando dependências
    sudo apt-get update
    sudo apt-get install -y ca-certificates curl

    # Criando o diretório para a chave GPG
    sudo install -m 0755 -d /etc/apt/keyrings

    # Baixando a chave GPG do Docker
    sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
    sudo chmod a+r /etc/apt/keyrings/docker.asc

    # Adicionando o repositório Docker ao apt sources
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    # Atualizando a lista de pacotes e instalando o Docker
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    echo "Docker instalado com sucesso!"

    echo "Executando o container de teste do Docker..."
    sudo docker run hello-world
}

# Função para instalar o Docker no Mac
install_docker_mac() {
    echo "Instalando Docker no Mac..."
    # O Docker Desktop é a maneira recomendada de instalar o Docker no Mac
    brew install --cask docker

    echo "Por favor, abra o Docker Desktop para concluir a instalação."
}

# Função para gerenciar containers e imagens (Linux/Mac)
manage_containers_images() {
    echo "Excluindo containers antigos..."
    docker rm -f web-vcnafacul api-vcnafacul ms-vcnafacul

    echo "Excluindo imagens antigas..."
    docker rmi -f vcnafacul/web vcnafacul/api vcnafacul/simulado

    echo "Buildando nova imagem e subindo containers..."
    docker-compose up
}

# Checando o sistema operacional e agindo conforme necessário
check_os

# Gerenciando containers e imagens (se não for Windows)
if [[ "$OSTYPE" != "win32" && "$OSTYPE" != "msys" && "$OSTYPE" != "cygwin" ]]; then
    manage_containers_images
fi

echo "Script concluído."
