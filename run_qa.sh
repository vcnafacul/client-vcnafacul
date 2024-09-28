#!/bin/bash

# Variável para controlar a exclusão de imagens
REMOVE_IMAGES=true

# Função para processar flags
process_flags() {
    while [[ "$1" != "" ]]; do
        case "$1" in
            --no-rmi)
                REMOVE_IMAGES=false
                ;;
            *)
                echo "Opção inválida: $1"
                exit 1
                ;;
        esac
        shift
    done
}

# Função para checar se o Docker está instalado
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo "Docker não está instalado. Tentando instalar o Docker..."
        install_docker
    else
        echo "Docker já está instalado."
    fi
}

# Função para instalar o Docker
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

# Função para gerenciar os containers e imagens
manage_containers_images() {

    echo "Excluindo containers antigos..."
    docker rm -f web-vcnafacul api-vcnafacul ms-vcnafacul

     if [ "$REMOVE_IMAGES" = true ]; then
        echo "Excluindo imagens antigas..."
        docker rmi -f vcnafacul/web vcnafacul/api vcnafacul/simulado

        echo "Buildando aplicação..."
        npm run build:development
    else
        echo "Preservando as imagens."
    fi

    echo "Buildando nova imagem e subindo containers..."
    docker-compose up
}

# Processando as flags passadas ao script
process_flags "$@"

# Checando se o Docker está instalado e instalando se necessário
check_docker

# Gerenciando containers e imagens
manage_containers_images

echo "Script concluído."
