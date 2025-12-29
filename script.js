// ===============================================
// NORXCOIN - Web3 Integration & Main Scripts
// ===============================================

// Contract Configuration
const CONFIG = {
    // NORXCOIN Contract
    tokenAddress: '0x9F8ace87A43851aCc21B6a00A84b4F9088563179',
    
    // Staking Contract
    stakingAddress: '0x5b5B4d0bfF42E152E8aA9E614E948797DBF1FB65',
    
    // BSC Network
    chainId: 56, // BSC Mainnet
    chainIdHex: '0x38',
    chainName: 'Binance Smart Chain',
    rpcUrl: 'https://bsc-dataseed.binance.org/',
    explorerUrl: 'https://bscscan.com/',
    
    // GeckoTerminal Pool
    geckoTerminalPoolUrl: 'https://api.geckoterminal.com/api/v2/networks/bsc/pools/0x8ca34c2cb4516f47b843beda65542df6523b61c8d25af4eb22eb98a64f8bb02f',
    
    // PancakeSwap
    pancakeSwapUrl: 'https://pancakeswap.finance/swap?outputCurrency=0x9F8ace87A43851aCc21B6a00A84b4F9088563179'
};

// Contract ABIs
const TOKEN_ABI = [
    // Basic ERC20 functions
    {"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"type":"function"},
    {"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"type":"function"},
    {"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"type":"function"},
    {"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"type":"function"},
    {"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"type":"function"},
    {"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"type":"function"},
    {"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"type":"function"}
];

const STAKING_ABI = [
    // Staking functions from the contract
    {"inputs":[{"internalType":"uint256","name":"_poolId","type":"uint256"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"stake","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"_poolId","type":"uint256"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"unstake","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"_poolId","type":"uint256"}],"name":"claimRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"_poolId","type":"uint256"},{"internalType":"address","name":"_user","type":"address"}],"name":"getUserStakeInfo","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"stakeTime","type":"uint256"},{"internalType":"uint256","name":"lockEndTime","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"_poolId","type":"uint256"}],"name":"getPoolStats","outputs":[{"internalType":"uint256","name":"totalStaked","type":"uint256"},{"internalType":"uint256","name":"rewardPerBlock","type":"uint256"},{"internalType":"uint256","name":"lockPeriod","type":"uint256"},{"internalType":"bool","name":"isPaused","type":"bool"},{"internalType":"uint256","name":"apr","type":"uint256"}],"stateMutability":"view","type":"function"}
];

// Global Variables
let web3 = null;
let userAccount = null;
let tokenContract = null;
let stakingContract = null;
let priceUpdateInterval = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🪙 NORXCOIN Website Initialized');
    
    // Hide loading screen
    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
    }, 1500);
    
    // Initialize components
    initializeWeb3();
    initializeEventListeners();
    initializeTokenomicsChart();
    initGrupbuyCountdown(); // Initialize countdown timer
    updatePriceData();
    
    // Start price updates
    priceUpdateInterval = setInterval(updatePriceData, 30000); // Update every 30 seconds
    
    // Initialize scroll effects
    handleScrollEffects();
});

// ===============================================
// Norx Grupbuy Countdown Timer
// ===============================================

function initGrupbuyCountdown() {
    // Set the launch date: 60 days from now
    const launchDate = new Date();
    launchDate.setDate(launchDate.getDate() + 60);
    launchDate.setHours(0, 0, 0, 0);
    
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = launchDate.getTime() - now;
        
        // Calculate time units
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        // Update the countdown display
        const daysEl = document.querySelector('#grupbuyCountdown #days');
        const hoursEl = document.querySelector('#grupbuyCountdown #hours');
        const minutesEl = document.querySelector('#grupbuyCountdown #minutes');
        const secondsEl = document.querySelector('#grupbuyCountdown #seconds');
        
        if (daysEl) daysEl.textContent = days.toString().padStart(2, '0');
        if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
        if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
        if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');
        
        // If countdown is over
        if (distance < 0) {
            clearInterval(countdownInterval);
            const countdownEl = document.getElementById('grupbuyCountdown');
            if (countdownEl) {
                countdownEl.innerHTML = '<div style="font-size: 36px; color: #D4AF37; text-align: center;">🎉 PLATAFORMA LANÇADA! 🎉</div>';
            }
        }
    }
    
    // Update countdown every second
    const countdownInterval = setInterval(updateCountdown, 1000);
    updateCountdown(); // Initial call
}

// ===============================================
// Web3 Integration
// ===============================================

async function initializeWeb3() {
    // Check if MetaMask is installed
    if (typeof window.ethereum !== 'undefined') {
        console.log('MetaMask detected');
        web3 = new Web3(window.ethereum);
        
        // Check if already connected
        const accounts = await web3.eth.getAccounts();
        if (accounts.length > 0) {
            await handleAccountsChanged(accounts);
        }
        
        // Listen for account changes
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        
        // Listen for network changes
        window.ethereum.on('chainChanged', handleChainChanged);
    } else {
        console.log('MetaMask not detected');
        // Use read-only provider for price data
        web3 = new Web3(new Web3.providers.HttpProvider(CONFIG.rpcUrl));
    }
}

async function connectWallet() {
    if (typeof window.ethereum === 'undefined') {
        showToast('Por favor, instale a MetaMask para continuar', 'error');
        window.open('https://metamask.io/download/', '_blank');
        return;
    }
    
    try {
        // Request account access
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });
        
        // Check network
        const chainId = await web3.eth.getChainId();
        if (chainId !== CONFIG.chainId) {
            await switchNetwork();
        }
        
        await handleAccountsChanged(accounts);
        showToast('Carteira conectada com sucesso!', 'success');
        
    } catch (error) {
        console.error('Error connecting wallet:', error);
        showToast('Erro ao conectar carteira', 'error');
    }
}

async function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        // User disconnected wallet
        userAccount = null;
        updateWalletUI(false);
    } else {
        userAccount = accounts[0];
        updateWalletUI(true);
        
        // Initialize contracts
        if (web3) {
            tokenContract = new web3.eth.Contract(TOKEN_ABI, CONFIG.tokenAddress);
            
            // Initialize staking contract
            stakingContract = new web3.eth.Contract(STAKING_ABI, CONFIG.stakingAddress);
            await updateStakingInfo();
            }
            
            await updateBalance();
        }
    }
}

function handleChainChanged(chainId) {
    // Reload the page to reset state
    window.location.reload();
}

async function switchNetwork() {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: CONFIG.chainIdHex }]
        });
    } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: CONFIG.chainIdHex,
                        chainName: CONFIG.chainName,
                        nativeCurrency: {
                            name: 'BNB',
                            symbol: 'BNB',
                            decimals: 18
                        },
                        rpcUrls: [CONFIG.rpcUrl],
                        blockExplorerUrls: [CONFIG.explorerUrl]
                    }]
                });
            } catch (addError) {
                console.error('Error adding network:', addError);
                showToast('Erro ao adicionar rede BSC', 'error');
            }
        }
    }
}

async function updateBalance() {
    if (!tokenContract || !userAccount) return;
    
    try {
        const balance = await tokenContract.methods.balanceOf(userAccount).call();
        const decimals = await tokenContract.methods.decimals().call();
        const formattedBalance = (balance / Math.pow(10, decimals)).toFixed(2);
        
        document.getElementById('walletBalance').textContent = formattedBalance;
        document.querySelector('.wallet-balance').textContent = `${formattedBalance} NORX`;
    } catch (error) {
        console.error('Error updating balance:', error);
    }
}

function updateWalletUI(connected) {
    const connectBtn = document.getElementById('connectWallet');
    const walletInfo = document.getElementById('walletInfo');
    const stakeBtn = document.getElementById('stakeBtn');
    
    if (connected && userAccount) {
        connectBtn.style.display = 'none';
        walletInfo.style.display = 'flex';
        
        // Show shortened address
        const shortAddress = `${userAccount.slice(0, 6)}...${userAccount.slice(-4)}`;
        document.querySelector('.wallet-address').textContent = shortAddress;
        
        // Enable staking button
        if (stakeBtn) {
            stakeBtn.disabled = false;
            stakeBtn.textContent = 'Fazer Staking';
        }
    } else {
        connectBtn.style.display = 'flex';
        walletInfo.style.display = 'none';
        
        if (stakeBtn) {
            stakeBtn.disabled = true;
            stakeBtn.textContent = 'Conecte sua carteira';
        }
    }
}

// ===============================================
// Staking Functions
// ===============================================

async function stake() {
    if (!stakingContract || !userAccount) {
        showToast('Conecte sua carteira primeiro', 'error');
        return;
    }
    
    const amount = document.getElementById('stakeAmount').value;
    const poolId = document.getElementById('poolSelect').value;
    
    if (!amount || amount <= 0) {
        showToast('Digite uma quantidade válida', 'error');
        return;
    }
    
    try {
        // Convert amount to wei
        const amountWei = web3.utils.toWei(amount, 'ether');
        
        // Show which pool is being used
        const poolNames = ['Flexível', '30 dias', '90 dias'];
        showToast(`Preparando stake no pool ${poolNames[poolId]} (20% APR anual)...`, 'info');
        
        // First approve the staking contract to spend tokens
        const approved = await approveTokens(amountWei);
        if (!approved) return;
        
        // Then stake
        showToast('Fazendo stake... Por favor, confirme a transação', 'info');
        const tx = await stakingContract.methods
            .stake(poolId, amountWei)
            .send({ from: userAccount });
        
        showToast(`✅ Staking de ${amount} NORX realizado com sucesso no pool ${poolNames[poolId]}!`, 'success');
        await updateStakingInfo();
        await updateBalance();
        
        // Clear input
        document.getElementById('stakeAmount').value = '';
        
    } catch (error) {
        console.error('Staking error:', error);
        if (error.message.includes('User denied')) {
            showToast('Transação cancelada pelo usuário', 'warning');
        } else {
            showToast('Erro ao fazer staking: ' + error.message, 'error');
        }
    }
}

async function unstake(poolId, amount) {
    if (!stakingContract || !userAccount) return;
    
    try {
        const amountWei = web3.utils.toWei(amount.toString(), 'ether');
        
        const tx = await stakingContract.methods
            .unstake(poolId, amountWei)
            .send({ from: userAccount });
        
        showToast('Unstake realizado com sucesso!', 'success');
        await updateStakingInfo();
        await updateBalance();
        
    } catch (error) {
        console.error('Unstake error:', error);
        showToast('Erro ao fazer unstake', 'error');
    }
}

async function claimRewards() {
    if (!stakingContract || !userAccount) return;
    
    try {
        // Claim from all pools (you might want to specify which pool)
        const poolId = 0; // Default pool
        
        const tx = await stakingContract.methods
            .claimRewards(poolId)
            .send({ from: userAccount });
        
        showToast('Recompensas resgatadas com sucesso!', 'success');
        await updateStakingInfo();
        await updateBalance();
        
    } catch (error) {
        console.error('Claim error:', error);
        showToast('Erro ao resgatar recompensas', 'error');
    }
}

async function approveTokens(amount) {
    if (!tokenContract || !userAccount) return false;
    
    try {
        // Check current allowance
        const allowance = await tokenContract.methods
            .allowance(userAccount, CONFIG.stakingAddress)
            .call();
        
        if (BigInt(allowance) >= BigInt(amount)) {
            console.log('Tokens já aprovados, pulando aprovação...');
            return true; // Already approved
        }
        
        // Approve
        showToast('📝 Passo 1/2: Aprovando tokens... Confirme a transação no MetaMask', 'info');
        
        const tx = await tokenContract.methods
            .approve(CONFIG.stakingAddress, amount)
            .send({ from: userAccount });
        
        showToast('✅ Passo 1/2 completo: Tokens aprovados! Agora fazendo stake...', 'success');
        
        // Wait a bit for the approval to be registered
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return true;
        
    } catch (error) {
        console.error('Approval error:', error);
        if (error.message.includes('User denied')) {
            showToast('Aprovação cancelada pelo usuário', 'warning');
        } else {
            showToast('Erro ao aprovar tokens: ' + error.message, 'error');
        }
        return false;
    }
}

async function updateStakingInfo() {
    if (!stakingContract || !userAccount) return;
    
    try {
        // Get user stake info for all pools
        const positions = [];
        let totalStaked = 0;
        let totalRewards = 0;
        
        // Check first 3 pools (you can adjust this)
        for (let poolId = 0; poolId < 3; poolId++) {
            try {
                const stakeInfo = await stakingContract.methods
                    .getUserStakeInfo(poolId, userAccount)
                    .call();
                
                if (stakeInfo.stakedAmount > 0) {
                    const staked = web3.utils.fromWei(stakeInfo.stakedAmount, 'ether');
                    const rewards = web3.utils.fromWei(stakeInfo.pendingRewards, 'ether');
                    
                    positions.push({
                        poolId,
                        staked: parseFloat(staked),
                        rewards: parseFloat(rewards),
                        lockEndTime: stakeInfo.lockEndTime
                    });
                    
                    totalStaked += parseFloat(staked);
                    totalRewards += parseFloat(rewards);
                }
            } catch (error) {
                // Pool might not exist, continue
                break;
            }
        }
        
        // Update UI
        updatePositionsUI(positions);
        
        // Update totals
        if (document.getElementById('totalStaked')) {
            document.getElementById('totalStaked').textContent = `${totalStaked.toFixed(2)} NORX`;
        }
        
        if (document.getElementById('pendingRewards')) {
            document.getElementById('pendingRewards').textContent = `${totalRewards.toFixed(4)} NORX`;
        }
        
        // Show/hide rewards section
        const rewardsSection = document.querySelector('.rewards-section');
        if (rewardsSection) {
            rewardsSection.style.display = totalRewards > 0 ? 'block' : 'none';
        }
        
    } catch (error) {
        console.error('Error updating staking info:', error);
    }
}

function updatePositionsUI(positions) {
    const container = document.getElementById('userPositions');
    if (!container) return;
    
    if (positions.length === 0) {
        container.innerHTML = `
            <div class="no-positions">
                <p>Você não tem posições ativas</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    positions.forEach(pos => {
        const poolName = getPoolName(pos.poolId);
        const isLocked = pos.lockEndTime > Date.now() / 1000;
        
        html += `
            <div class="position-item">
                <div class="position-header">
                    <span class="position-pool">${poolName}</span>
                    ${isLocked ? '<span class="position-locked">🔒 Bloqueado</span>' : ''}
                </div>
                <div class="position-details">
                    <div class="position-stat">
                        <span>Em Staking:</span>
                        <span>${pos.staked.toFixed(2)} NORX</span>
                    </div>
                    <div class="position-stat">
                        <span>Recompensas:</span>
                        <span class="text-success">${pos.rewards.toFixed(4)} NORX</span>
                    </div>
                </div>
                ${!isLocked ? `
                    <button class="btn btn-secondary btn-small" onclick="unstake(${pos.poolId}, ${pos.staked})">
                        Retirar
                    </button>
                ` : ''}
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function getPoolName(poolId) {
    const pools = {
        0: 'Pool Flexível',
        1: 'Pool 30 dias',
        2: 'Pool 90 dias'
    };
    return pools[poolId] || `Pool ${poolId}`;
}

function setMaxStake() {
    const balance = document.getElementById('walletBalance').textContent;
    document.getElementById('stakeAmount').value = balance;
}

// ===============================================
// Price Data
// ===============================================

async function updatePriceData() {
    try {
        // Using CORS proxy to avoid CORS issues
        // Alternative proxies: https://cors-anywhere.herokuapp.com/ or https://api.allorigins.win/
        const proxyUrl = 'https://api.codetabs.com/v1/proxy?quest=';
        const apiUrl = CONFIG.geckoTerminalPoolUrl;
        
        // Try direct fetch first
        let response;
        let data;
        
        try {
            response = await fetch(apiUrl);
            data = await response.json();
        } catch (corsError) {
            // If CORS error, try with proxy
            console.log('Direct fetch failed, trying with proxy...');
            response = await fetch(proxyUrl + encodeURIComponent(apiUrl));
            data = await response.json();
        }
        
        if (data && data.data && data.data.attributes) {
            const poolData = data.data.attributes;
            
            // Get price in USD
            const priceUSD = parseFloat(poolData.base_token_price_usd) || 0;
            
            // Get 24h price change
            const priceChange24h = parseFloat(poolData.price_change_percentage_24h) || 0;
            
            // Get volume and market cap
            const volume24h = parseFloat(poolData.volume_usd_24h) || 0;
            
            // Calculate market cap (price * total supply)
            const totalSupply = 1500000000; // 1.5B tokens
            const burnedTokens = 375000000; // 375M burned
            const circulatingSupply = totalSupply - burnedTokens;
            const marketCap = priceUSD * circulatingSupply;
            
            // Get liquidity
            const liquidity = parseFloat(poolData.reserve_in_usd) || 0;
            
            // Update UI
            document.getElementById('currentPrice').querySelector('.price-usd').textContent = 
                priceUSD < 0.01 ? `$${priceUSD.toFixed(8)}` : `$${priceUSD.toFixed(4)}`;
            
            const changeElement = document.getElementById('priceChange');
            changeElement.textContent = `${priceChange24h > 0 ? '+' : ''}${priceChange24h.toFixed(2)}%`;
            changeElement.className = priceChange24h > 0 ? 'price-change positive' : 'price-change negative';
            
            document.getElementById('marketCap').textContent = formatNumber(marketCap);
            document.getElementById('volume24h').textContent = formatNumber(volume24h);
            
            // Update additional stats if available
            if (document.getElementById('liquidity')) {
                document.getElementById('liquidity').textContent = formatNumber(liquidity);
            }
            
            // Update price in BRL if needed
            const usdToBrl = 5.50; // You can fetch this from an API
            const priceBRL = priceUSD * usdToBrl;
            if (document.getElementById('priceBRL')) {
                document.getElementById('priceBRL').textContent = 
                    priceBRL < 0.01 ? `R$${priceBRL.toFixed(6)}` : `R$${priceBRL.toFixed(4)}`;
            }
            
            console.log('✅ Price updated from GeckoTerminal:', priceUSD);
            
        } else {
            console.error('Invalid data from GeckoTerminal');
            // Use fallback data
            updatePriceWithFallback();
        }
        
    } catch (error) {
        console.error('Error fetching price data:', error);
        // Use fallback data
        updatePriceWithFallback();
    }
}

function updatePriceWithFallback() {
    // Fallback simulated data
    const priceData = {
        price: 0.000425,
        change24h: 15.67,
        marketCap: 637500,
        volume24h: 125000
    };
    
    document.getElementById('currentPrice').querySelector('.price-usd').textContent = `$${priceData.price.toFixed(6)}`;
    
    const changeElement = document.getElementById('priceChange');
    changeElement.textContent = `${priceData.change24h > 0 ? '+' : ''}${priceData.change24h.toFixed(2)}%`;
    changeElement.className = priceData.change24h > 0 ? 'price-change positive' : 'price-change negative';
    
    document.getElementById('marketCap').textContent = formatNumber(priceData.marketCap);
    document.getElementById('volume24h').textContent = formatNumber(priceData.volume24h);
}

// ===============================================
// UI Functions
// ===============================================

function initializeTokenomicsChart() {
    const ctx = document.getElementById('tokenomicsChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Queima Inicial', 'Liquidez', 'Staking Rewards', 'Desenvolvimento', 'Marketing', 'Team'],
            datasets: [{
                data: [25, 25, 20, 15, 10, 5],
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                    '#FF9F40'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + '%';
                        }
                    }
                }
            }
        }
    });
}

function initializeEventListeners() {
    // Connect wallet button
    const connectBtn = document.getElementById('connectWallet');
    if (connectBtn) {
        connectBtn.addEventListener('click', connectWallet);
    }
    
    // Stake button
    const stakeBtn = document.getElementById('stakeBtn');
    if (stakeBtn) {
        stakeBtn.addEventListener('click', stake);
    }
    
    // Claim button
    const claimBtn = document.getElementById('claimBtn');
    if (claimBtn) {
        claimBtn.addEventListener('click', claimRewards);
    }
    
    // Mobile menu
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', toggleMobileMenu);
    }
    
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function handleScrollEffects() {
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Animate elements on scroll
        const elements = document.querySelectorAll('.feature-card, .stat-card, .roadmap-item');
        elements.forEach(element => {
            const rect = element.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.8) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    });
    
    // Set initial state for animated elements
    document.querySelectorAll('.feature-card, .stat-card, .roadmap-item').forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
}

function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('mobile-active');
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function copyContract() {
    const contractAddress = document.getElementById('contractAddress').textContent;
    navigator.clipboard.writeText(contractAddress).then(() => {
        showToast('Endereço do contrato copiado!', 'success');
    }).catch(err => {
        console.error('Error copying address:', err);
        showToast('Erro ao copiar endereço', 'error');
    });
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    
    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Remove after 5 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, 5000);
}

// ===============================================
// Utility Functions
// ===============================================

function formatNumber(num) {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
}

function formatAddress(address) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// ===============================================
// Export functions for global use
// ===============================================

window.connectWallet = connectWallet;
window.stake = stake;
window.unstake = unstake;
window.claimRewards = claimRewards;
window.setMaxStake = setMaxStake;
window.copyContract = copyContract;
window.scrollToSection = scrollToSection;

console.log('🚀 NORXCOIN Scripts loaded successfully!');
