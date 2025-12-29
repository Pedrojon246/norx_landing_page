// ===============================================
// NORXCOIN - Web3 Integration & Main Scripts
// ===============================================

const CONFIG = {
    tokenAddress: '0x9F8ace87A43851aCc21B6a00A84b4F9088563179',
    stakingAddress: '0x5b5B4d0bfF42E152E8aA9E614E948797DBF1FB65',
    geckoTerminalPoolUrl: 'https://api.geckoterminal.com/api/v2/networks/bsc/pools/0x8ca34c2cb4516f47b843beda65542df6523b61c8d25af4eb22eb98a64f8bb02f',
    chainIdHex: '0x38' // BSC Mainnet
};

// ABIs Necessárias
const STAKING_ABI = [
    { "inputs": [{ "internalType": "uint256", "name": "_poolId", "type": "uint256" }, { "internalType": "uint256", "name": "_amount", "type": "uint256" }], "name": "deposit", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "uint256", "name": "_poolId", "type": "uint256" }], "name": "withdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "uint256", "name": "_poolId", "type": "uint256" }], "name": "claimReward", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
];

const TOKEN_ABI = [
    { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }
];

let web3;
let userAccount;

// 1. Conectar Carteira (Corrigida e Exposta)
async function connectWallet() {
    console.log("Tentando conectar...");
    if (window.ethereum) {
        try {
            web3 = new Web3(window.ethereum);
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            userAccount = accounts[0];
            
            // Atualiza o texto de todos os botões de conexão
            const btn = document.getElementById('connectWalletBtn') || document.getElementById('connectBtn');
            if(btn) btn.innerText = userAccount.slice(0, 6) + "..." + userAccount.slice(-4);
            
            showToast("Carteira Conectada!", "success");
        } catch (error) {
            console.error(error);
            showToast("Conexão recusada.", "error");
        }
    } else {
        showToast("MetaMask não detectada!", "error");
    }
}

// 2. Função de Stake (Com Approve automático)
async function stake() {
    if (!userAccount) return showToast("Conecte a carteira primeiro!", "error");
    
    const amountInput = document.getElementById('stakeAmount') || document.getElementById('stakeAmountInput');
    const amount = amountInput.value;
    
    if (!amount || amount <= 0) return showToast("Insira um valor válido", "error");

    try {
        const tokenContract = new web3.eth.Contract(TOKEN_ABI, CONFIG.tokenAddress);
        const stakingContract = new web3.eth.Contract(STAKING_ABI, CONFIG.stakingAddress);
        const weiAmount = web3.utils.toWei(amount, 'ether');

        showToast("Aprovação solicitada na MetaMask...", "info");
        await tokenContract.methods.approve(CONFIG.stakingAddress, weiAmount).send({ from: userAccount });
        
        showToast("Enviando para Staking...", "info");
        await stakingContract.methods.deposit(0, weiAmount).send({ from: userAccount });
        
        showToast("Stake realizado com sucesso!", "success");
    } catch (error) {
        console.error(error);
        showToast("Erro na transação.", "error");
    }
}

// 3. Funções Auxiliares (Preço e Timer)
async function updatePrice() {
    try {
        const response = await fetch(CONFIG.geckoTerminalPoolUrl);
        const data = await response.json();
        const price = data.data.attributes.base_token_price_usd;
        const display = document.getElementById('tokenPrice') || document.getElementById('tokenPriceDisplay');
        if(display) display.innerText = `$${parseFloat(price).toFixed(4)}`;
    } catch (e) { console.log("Erro ao carregar preço."); }
}

function startCountdown() {
    const launch = new Date();
    launch.setDate(launch.getDate() + 20);
    setInterval(() => {
        const now = new Date().getTime();
        const diff = launch - now;
        if(document.getElementById('days')) {
            document.getElementById('days').innerText = Math.floor(diff / (1000 * 60 * 60 * 24));
            document.getElementById('hours').innerText = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            document.getElementById('minutes').innerText = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            document.getElementById('seconds').innerText = Math.floor((diff % (1000 * 60)) / 1000);
        }
    }, 1000);
}

function showToast(message, type) {
    const container = document.getElementById('toast-container');
    if(!container) return alert(message);
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
}

// Inicialização
window.onload = () => {
    updatePrice();
    startCountdown();
    if(document.getElementById('loadingScreen')) {
        document.getElementById('loadingScreen').style.display = 'none';
    }
};

// Expõe as funções para o HTML
window.connectWallet = connectWallet;
window.stake = stake;
