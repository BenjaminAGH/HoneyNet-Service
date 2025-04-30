#!/bin/bash

if ! command -v curl &> /dev/null
then
    echo "curl no encontrado. Instalando..."
    sudo apt update && sudo apt install -y curl
else
    echo "curl ya está instalado."
fi

if ! command -v nvm &> /dev/null
then
    echo "Instalando NVM..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
    export NVM_DIR="$HOME/.nvm"

    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
else
    echo "NVM ya está instalado."
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

echo "Instalando Node.js v23..."
nvm install 23
nvm use 23

echo "Instalando dependencias del backend..."
npm install

echo "Iniciando el backend..."
npm start

