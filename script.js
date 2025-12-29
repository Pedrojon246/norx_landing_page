// ===============================================
// NORXCOIN - Web3 Integration & Main Scripts
// ===============================================

const CONFIG = {
    tokenAddress: '0x9F8ace87A43851aCc21B6a00A84b4F9088563179',
    stakingAddress: '0x5b5B4d0bfF42E152E8aA9E614E948797DBF1FB65',
    geckoTerminalPoolUrl: 'https://api.geckoterminal.com/api/v2/networks/bsc/pools/0x8ca34c2cb4516f47b843beda65542df6523b61c8d25af4eb22eb98a64f8bb02f'
};

const STAKING_ABI = [
    { "inputs": [{ "internalType": "uint256", "name": "_poolId", "type": "uint256" }, { "internalType": "uint256", "name": "_amount", "type": "uint256" }], "name": "deposit", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "uint256", "name": "_poolId", "type": "uint256" }], "name": "withdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "uint256", "name": "_poolId", "type": "uint256" }], "name": "claimReward", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
];

let web3;
let userAccount;

// FUNÇÃO PARA BUSCAR PREÇO REAL (Faltava esta!)
async function updatePrice() {
    try {
        const response = await fetch(CONFIG.geckoTerminalPoolUrl);
        const data = await response.json();
        const price = data.data.attributes.base_token_price_usd;
        const priceElement = document.getElementById('tokenPrice');
        if(priceElement) priceElement.innerText = `$${parseFloat(price).toFixed(4)}`;
    } catch (e) {
        console.error("Erro ao buscar preço");
    }
}

// FUNÇÃO DO CONTADOR (Faltava esta!)
function startCountdown() {
    const launchDate = new Date();
    launchDate.setDate(launchDate.getDate() + 20); // 20 dias a partir de hoje

    setInterval(() => {
        const now = new Date().getTime();
        const diff = launchDate - now;

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        if(document.getElementById('days')) document.getElementById('days').innerText = d;
        if(document.getElementById('hours')) document.getElementById('hours').innerText = h;
        if(document.getElementById('minutes')) document.getElementById('minutes').innerText = m;
        if(document.getElementById('seconds')) document.getElementById('seconds').innerText = s;
    }, 1000);
}

// FUNÇÃO CONECTAR CARTEIRA
async function connectWallet() {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            userAccount = accounts[0];
            web3 = new Web3(window.ethereum);
            document.getElementById('connectBtn').innerText = userAccount.slice(0,6) + "...";
            showToast("Carteira conectada!", "success");
        } catch (e) { showToast("Erro ao conectar", "error"); }
    } else { showToast("Instale a MetaMask!", "error"); }
}

// FUNÇÕES DE STAKING
async function stake() {
    if (!userAccount) return showToast("Conecte a carteira!", "error");
    showToast("Funcionalidade de Staking em integração...", "info");
}

function showToast(message, type) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
}

// EXECUÇÃO AO CARREGAR
window.onload = () => {
    updatePrice();
    startCountdown();
    // Esconde a tela de carregamento
    const loader = document.getElementById('loadingScreen');
    if(loader) loader.style.display = 'none';
};

window.connectWallet = connectWallet;
window.stake = stake;
