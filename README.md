Cách khởi chạy dự án

Clone dự án

    git clone https://github.com/lehuyanh423015/Blockchain-NFTsMarketPlace.git

Cài đặt môi trường

    cd <path-to-project>
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
    \. "$HOME/.nvm/nvm.sh"
    nvm install 18
  
    npm init -y

    npm install --save-dev \
        hardhat@2.22.8 \
        @nomiclabs/hardhat-waffle \
        @nomiclabs/hardhat-ethers \
        ethereum-waffle \
        ethers@5.7.2
    npm install @openzeppelin/contracts@4.9.6

    cd frontend
    npm init -y
  
    npm install \
      next@13.5.6 \
        react@18.2.0 \
        react-dom@18.2.0 \
        ethers@5.7.2 \
        axios

    rm -rf node_modules package-lock.json
    npm install
    npm install -D tailwindcss@3.4.4 postcss@8 autoprefixer@10
  
    npm install --save-dev dotenv

cài extension cho vscode (tuỳ chọn)
  nhấn ctrl + shift + X
  
    Chai snippeta
    WSL
    github copilot
    prisma nextjs
    solidity
    tailwindcss intelliSense

chạy dự án
  vào file .evn.example và làm theo, sau đó chạy các lệnh dưới trong terminal
  
    clear
    cd <root folder> (chứa frontend)
    npx hardhat compile
    npx hardhat run scripts/deploy.js --network sepolia
    
  mở trên một terminal mới
  
      cd frontend
      npm run dev
      truy cập http://localhost:3000, kết nối metamask, chuyển sang mạng testnet sepolia
