// ===============================================
// NORXCOIN - Web3 Integration & Main Scripts
// ===============================================

const CONFIG = {
    tokenAddress: '0x9F8ace87A43851aCc21B6a00A84b4F9088563179',
    stakingAddress: '0x5b5B4d0bfF42E152E8aA9E614E948797DBF1FB65',
    geckoTerminalPoolUrl: 'https://api.geckoterminal.com/api/v2/networks/bsc/pools/0x8ca34c2cb4516f47b843beda65542df6523b61c8d25af4eb22eb98a64f8bb02f'
};

// ABIs para interação
const STAKING_ABI = [
    { "inputs": [{ "internalType": "uint256", "name": "_poolId", "type": "uint256" }, { "internalType": "uint256", "name": "_amount", "type": "uint256" }], "name": "deposit", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "uint256", "name": "_poolId", "type": "uint256" }], "name": "withdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "uint256", "name": "_poolId", "type": "uint256" }], "name": "claimReward", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "uint256", "name": "_poolId", "type": "uint256" }, { "internalType": "address", "name": "_user", "type": "address" }], "name": "getUserInfo", "outputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "uint256", "name": "rewardDebt", "type": "uint256" }, { "internalType": "uint256", "name": "lastStakeTime", "type": "uint256" }, { "internalType": "uint256", "name": "lastClaimTime", "type": "uint256" }], "stateMutability": "view", "type": "function" }
];

const TOKEN_ABI = [
    { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }
];

let web3;
let userAccount;

// ===============================================
// CONEXÃO E CARREGAMENTO DE DADOS
// ===============================================

async function connectWallet() {
    if (window.ethereum) {
        try {
            web3 = new Web3(window.ethereum);
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            userAccount = accounts[0];
            
            // 1. Atualiza botões
            updateUIConnected();
            
            // 2. Busca dados do Blockchain (Saldo e Staking)
            await loadBlockchainData();
            
            showToast("Conectado e dados carregados!", "success");
            return true;
        } catch (error) {
            showToast("Erro ao conectar.", "error");
            return false;
        }
    } else {
        showToast("Instale a MetaMask!", "error");
        return false;
    }
}

function updateUIConnected() {
    const formattedAddr = userAccount.slice(0, 6) + "..." + userAccount.slice(-4);
    // Atualiza todos os botões de conectar do site
    const btns = ['connectWalletBtn', 'connectBtn'];
    btns.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.innerText = formattedAddr;
    });
}

async function loadBlockchainData() {
    if (!userAccount || !web3) return;

    try {
        const tokenContract = new web3.eth.Contract(TOKEN_ABI, CONFIG.tokenAddress);
        const stakingContract = new web3.eth.Contract(STAKING_ABI, CONFIG.stakingAddress);

        // Buscar saldo de tokens na carteira
        const balanceWei = await tokenContract.methods.balanceOf(userAccount).call();
        const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
        
        // Buscar info de staking (Pool 0)
        const userInfo = await stakingContract.methods.getUserInfo(0, userAccount).call();
        const stakedEth = web3.utils.fromWei(userInfo.amount, 'ether');

        // Atualizar os campos no HTML (IDs do Claude)
        updateElement('userBalance', parseFloat(balanceEth).toFixed(2) + " NORX");
        updateElement('stakedAmount', parseFloat(stakedEth).toFixed(2) + " NORX");
        
    } catch (e) {
        console.error("Erro ao carregar dados do contrato:", e);
    }
}

function updateElement(id, value) {
    const el = document.getElementById(id);
    if(el) el.innerText = value;
}

// ===============================================
// FUNÇÕES DOS BOTÕES (STAKE / UNSTAKE / CLAIM)
// ===============================================

async function stake() {
    if (!userAccount) return connectWallet();

    const input = document.getElementById('stakeAmount');
    const amount = input ? input.value : 0;

    if (!amount || amount <= 0) return showToast("Valor inválido", "error");

    try {
        const tokenContract = new web3.eth.Contract(TOKEN_ABI, CONFIG.tokenAddress);
        const stakingContract = new web3.eth.Contract(STAKING_ABI, CONFIG.stakingAddress);
        const weiAmount = web3.utils.toWei(amount.toString(), 'ether');

        showToast("Autorizando transferência...", "info");
        await tokenContract.methods.approve(CONFIG.stakingAddress, weiAmount).send({ from: userAccount });
        
        showToast("Confirmando Stake...", "info");
        await stakingContract.methods.deposit(0, weiAmount).send({ from: userAccount });
        
        showToast("Stake concluído!", "success");
        loadBlockchainData(); // Recarrega os saldos na tela
    } catch (e) { showToast("Transação falhou.", "error"); }
}

async function unstake() {
    if (!userAccount) return connectWallet();
    try {
        const stakingContract = new web3.eth.Contract(STAKING_ABI, CONFIG.stakingAddress);
        showToast("Processando saque...", "info");
        await stakingContract.methods.withdraw(0).send({ from: userAccount });
        showToast("Saque realizado!", "success");
        loadBlockchainData();
    } catch (e) { showToast("Erro no saque.", "error"); }
}

async function claimRewards() {
    if (!userAccount) return connectWallet();
    try {
        const stakingContract = new web3.eth.Contract(STAKING_ABI, CONFIG.stakingAddress);
        showToast("Coletando recompensas...", "info");
        await stakingContract.methods.claimReward(0).send({ from: userAccount });
        showToast("Sucesso!", "success");
        loadBlockchainData();
    } catch (e) { showToast("Erro ao coletar.", "error"); }
}

// ===============================================
// PREÇO E UI INICIAL
// ===============================================

async function updatePrice() {
    try {
        const res = await fetch(CONFIG.geckoTerminalPoolUrl);
        const data = await res.json();
        const price = data.data.attributes.base_token_price_usd;
        const display = document.getElementById('tokenPrice');
        if(display) display.innerText = `$${parseFloat(price).toFixed(4)}`;
    } catch (e) { console.log("Erro no preço."); }
}

function initCountdown() {
    const launch = new Date();
    launch.setDate(launch.getDate() + 20);
    setInterval(() => {
        const now = new Date().getTime();
        const diff = launch - now;
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        if(document.getElementById('days')) {
            document.getElementById('days').innerText = d;
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

// Inicialização
window.onload = () => {
    updatePrice();
    initCountdown();
    if(document.getElementById('loadingScreen')) document.getElementById('loadingScreen').style.display = 'none';
};

// Exposição para o HTML
window.connectWallet = connectWallet;
window.stake = stake;
window.unstake = unstake;
window.claimRewards = claimRewards;
