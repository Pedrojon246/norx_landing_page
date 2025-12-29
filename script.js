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

const TOKEN_ABI = [
    { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }
];

let web3;
let userAccount;

// ===============================================
// CONEXÃO DE CARTEIRA
// ===============================================
async function connectWallet() {
    if (window.ethereum) {
        try {
            web3 = new Web3(window.ethereum);
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            userAccount = accounts[0];
            
            // Atualiza o botão da Navbar
            const navBtn = document.getElementById('connectWalletBtn');
            if(navBtn) navBtn.innerText = userAccount.slice(0, 6) + "..." + userAccount.slice(-4);
            
            // Atualiza o botão de dentro da seção de Staking (se existir)
            const stakeBtn = document.getElementById('connectBtn');
            if(stakeBtn) stakeBtn.innerText = "Carteira Pronta";

            showToast("Carteira conectada!", "success");
            return true;
        } catch (error) {
            showToast("Conexão recusada.", "error");
            return false;
        }
    } else {
        showToast("Instale a MetaMask!", "error");
        return false;
    }
}

// ===============================================
// LÓGICA DE STAKING (DEPOSIT)
// ===============================================
async function stake() {
    if (!userAccount) {
        const connected = await connectWallet();
        if (!connected) return;
    }

    // Pega o valor do input (ID usado pelo Claude é 'stakeAmount')
    const inputField = document.getElementById('stakeAmount');
    const amount = inputField ? inputField.value : 0;

    if (!amount || amount <= 0) {
        showToast("Insira uma quantidade de NORX.", "error");
        return;
    }

    try {
        const tokenContract = new web3.eth.Contract(TOKEN_ABI, CONFIG.tokenAddress);
        const stakingContract = new web3.eth.Contract(STAKING_ABI, CONFIG.stakingAddress);
        const weiAmount = web3.utils.toWei(amount.toString(), 'ether');

        showToast("1/2: Autorizando NORX...", "info");
        await tokenContract.methods.approve(CONFIG.stakingAddress, weiAmount).send({ from: userAccount });
        
        showToast("2/2: Confirmando Staking...", "info");
        await stakingContract.methods.deposit(0, weiAmount).send({ from: userAccount });
        
        showToast("Sucesso! Tokens em Stake.", "success");
    } catch (error) {
        console.error(error);
        showToast("Falha na transação.", "error");
    }
}

// ===============================================
// REIVINDICAR RECOMPENSAS
// ===============================================
async function claimRewards() {
    if (!userAccount) return showToast("Conecte a carteira!", "error");
    try {
        const stakingContract = new web3.eth.Contract(STAKING_ABI, CONFIG.stakingAddress);
        showToast("Coletando prêmios...", "info");
        await stakingContract.methods.claimReward(0).send({ from: userAccount });
        showToast("Prêmios coletados!", "success");
    } catch (e) { showToast("Erro ao coletar.", "error"); }
}

// ===============================================
// SACAR TUDO (WITHDRAW)
// ===============================================
async function unstake() {
    if (!userAccount) return showToast("Conecte a carteira!", "error");
    try {
        const stakingContract = new web3.eth.Contract(STAKING_ABI, CONFIG.stakingAddress);
        showToast("Solicitando saque total...", "info");
        await stakingContract.methods.withdraw(0).send({ from: userAccount });
        showToast("Saque concluído!", "success");
    } catch (e) { showToast("Erro no saque.", "error"); }
}

// ===============================================
// PREÇO E TIMER
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
    if(!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
}

// ===============================================
// INICIALIZAÇÃO
// ===============================================
window.onload = () => {
    updatePrice();
    startCountdown();
    const loader = document.getElementById('loadingScreen');
    if(loader) loader.style.display = 'none';
};

// EXPOSIÇÃO GLOBAL PARA O HTML
window.connectWallet = connectWallet;
window.stake = stake;
window.unstake = unstake;
window.claimRewards = claimRewards;
