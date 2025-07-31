#!/bin/bash

set -e

echo "Actualizando sistema..."
sudo apt update && sudo apt upgrade -y

echo "Actualizando repositorio git..."
git pull

echo "Verificando Docker..."
if ! command -v docker &> /dev/null; then
  echo "Instalando Docker..."
  sudo apt install -y docker.io
  sudo systemctl enable docker
  sudo systemctl start docker
else
  echo "Docker ya está instalado."
fi

echo "Verificando Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
  echo "Instalando Docker Compose..."
  sudo apt install -y docker-compose
else
  echo "Docker Compose ya está instalado."
fi

echo "Verificando Nmap..."
if ! command -v nmap &> /dev/null; then
  echo "Instalando Nmap..."
  sudo apt install -y nmap
else
  echo "Nmap ya está instalado."
fi

echo "Verificando Python 3 y pip..."
if ! command -v python3 &> /dev/null; then
  echo "Instalando Python 3..."
  sudo apt install -y python3
fi

if ! command -v pip3 &> /dev/null; then
  echo "Instalando pip3..."
  sudo apt install -y python3-pip
fi

echo "Verificando Node.js y npm..."
if ! command -v node &> /dev/null; then
  echo "Instalando Node.js y npm..."
  sudo apt install -y nodejs npm
fi

echo "Construyendo contenedores Docker..."
sudo docker-compose down -v
sudo docker-compose up --build


# DEBO HACER ESTO 
#chmod +x setup.sh
#./setup.sh