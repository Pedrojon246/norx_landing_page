// ===============================================
// NORXCOIN - Web3 Integration & Main Scripts
// ===============================================

const CONFIG = {
    tokenAddress: '0x9F8ace87A43851aCc21B6a00A84b4F9088563179',
    stakingAddress: '0x5b5B4d0bfF42E152E8aA9E614E948797DBF1FB65',
    chainId: 56,
    chainIdHex: '0x38',
    geckoTerminalPoolUrl: 'https://api.geckoterminal.com/api/v2/networks/bsc/pools/0x8ca34c2cb4516f47b843beda65542df6523b61c8d25af4eb22eb98a64f8bb02f'
};

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

// ===============================================
// FUNÇÃO DE CONEXÃO (FIXED)
// ===============================================
async function connectWallet() {
    console.log("Iniciando conexão...");
    if (window.ethereum) {
        try {
            web3 = new Web3(window.ethereum);
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            userAccount = accounts[0];
            
            // Atualiza os botões do site
            const buttons = [document.getElementById('connectWalletBtn'), document.getElementById('connectBtn')];
            buttons.forEach(btn => {
                if(btn) btn.innerText = userAccount.slice(0, 6) + "..." + userAccount.slice(-4);
            });
            
            showToast("Carteira conectada com sucesso!", "success");
            return true;
        } catch (error) {
            showToast("Usuário recusou a conexão.", "error");
            return false;
        }
    } else {
        showToast("MetaMask não detectada!", "error");
        return false;
    }
}

// ===============================================
// FUNÇÕES DE STAKING (FIXED)
// ===============================================
async function stake() {
    if (!userAccount) {
        const connected = await connectWallet();
        if (!connected) return;
    }

    const amountInput = document.getElementById('stakeAmount');
    const amount = amountInput ? amountInput.value : 0;

    if (!amount || amount <= 0) {
        showToast("Insira uma quantidade válida de NORX", "error");
        return;
    }

    try {
        const tokenContract = new web3.eth.Contract(TOKEN_ABI, CONFIG.tokenAddress);
        const stakingContract = new web3.eth.Contract(STAKING_ABI, CONFIG.stakingAddress);
        const weiAmount = web3.utils.toWei(amount.toString(), 'ether');

        showToast("Solicitando aprovação (Approve)...", "info");
        await tokenContract.methods.approve(CONFIG.stakingAddress, weiAmount).send({ from: userAccount });
        
        showToast("Enviando para o Staking...", "info");
        await stakingContract.methods.deposit(0, weiAmount).send({ from: userAccount });
        
        showToast("Stake realizado com sucesso!", "success");
    } catch (error) {
        console.error(error);
        showToast("Erro na transação ou cancelado.", "error");
    }
}

async function unstake() {
    if (!userAccount) return showToast("Conecte a carteira", "error");
    try {
        const stakingContract = new web3.eth.Contract(STAKING_ABI, CONFIG.stakingAddress);
        showToast("Solicitando saque...", "info");
        await stakingContract.methods.withdraw(0).send({ from: userAccount });
        showToast("Saque realizado!", "success");
    } catch (e) { showToast("Erro ao sacar", "error"); }
}

async function claimRewards() {
    if (!userAccount) return showToast("Conecte a carteira", "error");
    try {
        const stakingContract = new web3.eth.Contract(STAKING_ABI, CONFIG.stakingAddress);
        showToast("Coletando recompensas...", "info");
        await stakingContract.methods.claimReward(0).send({ from: userAccount });
        showToast("Recompensas coletadas!", "success");
    } catch (e) { showToast("Erro ao coletar", "error"); }
}

// ===============================================
// UTILITÁRIOS (PREÇO E TIMER)
// ===============================================
async function updatePrice() {
    try {
        const res = await fetch(CONFIG.geckoTerminalPoolUrl);
        const data = await res.json();
        const price = data.data.attributes.base_token_price_usd;
        const display = document.getElementById('tokenPrice');
        if(display) display.innerText = `$${parseFloat(price).toFixed(4)}`;
    } catch (e) { console.log("Erro ao carregar preço"); }
}

function initCountdown() {
    const launch = new Date();
    launch.setDate(launch.getDate() + 20);
    setInterval(() => {
        const now = new Date().getTime();
        const diff = launch - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if(document.getElementById('days')) {
            document.getElementById('days').innerText = days;
            document.getElementById('hours').innerText = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            document.getElementById('minutes').innerText = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            document.getElementById('seconds').innerText = Math.floor((diff % (1000 * 60)) / 1000);
        }
    }, 1000);
}

function showToast(message, type) {
    const container = document.getElementById('toast-container');
    if(!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
}

// ===============================================
// INICIALIZAÇÃO E EXPOSIÇÃO GLOBAL
// ===============================================
window.onload = () => {
    updatePrice();
    initCountdown();
    const loader = document.getElementById('loadingScreen');
    if(loader) loader.style.display = 'none';
};

// ESSENCIAL: Expõe as funções para o HTML
window.connectWallet = connectWallet;
window.stake = stake;
window.unstake = unstake;
window.claimRewards = claimRewards;
