sudo apt update -y

sudo apt upgrade -y 

sudo apt install nodejs

sudo apt install -y npm

sudo apt install -y curl

npm install --save react react-dom

if [ ! -d ~/.nvm ]; then
  curl https://raw.githubusercontent.com/creationix/nvm/v0.11.1/install.sh | bash
  source ~/.nvm/nvm.sh
  source ~/.profile
  source ~/.bashrc
  nvm install 16.9.1
  npm install
  npm run front
fi