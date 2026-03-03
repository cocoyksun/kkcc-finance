// KKCC的理财本 - 主要功能
class FinanceApp {
    constructor() {
        this.positions = JSON.parse(localStorage.getItem('positions')) || [];
        this.currentPosition = null;
        this.currentTradeType = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.addWelcomeAnimation();
        
        // 设置今日日期为默认值
        const today = new Date().toISOString().split('T')[0];
        const tradeDateInput = document.getElementById('tradeDate');
        if (tradeDateInput) {
            tradeDateInput.value = today;
        }
    }

    bindEvents() {
        // 开始按钮
        document.getElementById('startBtn').addEventListener('click', () => {
            this.showMainApp();
        });

        // Tab切换
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // 新增持仓按钮
        document.getElementById('addPositionBtn').addEventListener('click', () => {
            this.showAddModal();
        });

        // 弹窗关闭事件
        document.getElementById('closeAddModal').addEventListener('click', () => {
            this.closeModal('addModal');
        });

        document.getElementById('cancelAdd').addEventListener('click', () => {
            this.closeModal('addModal');
        });

        document.getElementById('confirmAdd').addEventListener('click', () => {
            this.addPosition();
        });

        // 交易弹窗事件
        document.getElementById('closeTradeModal').addEventListener('click', () => {
            this.closeModal('tradeModal');
        });

        document.getElementById('cancelTrade').addEventListener('click', () => {
            this.closeModal('tradeModal');
        });

        document.getElementById('confirmTrade').addEventListener('click', () => {
            this.addTrade();
        });

        // 返回按钮
        document.getElementById('backBtn').addEventListener('click', () => {
            this.showMainApp();
        });

        // 点击弹窗背景关闭
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });
    }

    addWelcomeAnimation() {
        const welcomeCard = document.getElementById('welcomePage');
        if (welcomeCard) {
            welcomeCard.style.opacity = '0';
            welcomeCard.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                welcomeCard.style.transition = 'all 0.6s ease';
                welcomeCard.style.opacity = '1';
                welcomeCard.style.transform = 'translateY(0)';
            }, 300);
        }
    }

    showMainApp() {
        document.getElementById('welcomePage').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        document.getElementById('detailPage').style.display = 'none';
        this.switchTab('positions'); // 默认显示持仓列表
        this.renderPositions();
    }

    switchTab(tabName) {
        // 切换tab按钮状态
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // 切换tab内容
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(tabName + 'Panel').classList.add('active');
    }

    showAddModal() {
        document.getElementById('addModal').classList.add('show');
        document.getElementById('positionName').value = '';
        document.getElementById('positionName').focus();
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
    }

    addPosition() {
        const name = document.getElementById('positionName').value.trim();
        if (!name) {
            alert('请输入项目名称');
            return;
        }

        // 检查是否已存在同名项目
        if (this.positions.find(p => p.name === name)) {
            alert('该项目已存在');
            return;
        }

        const position = {
            id: Date.now(),
            name: name,
            trades: [],
            totalAmount: 0,
            totalShares: 0,
            avgPrice: 0
        };

        this.positions.push(position);
        this.saveToLocal();
        this.renderPositions();
        this.closeModal('addModal');
    }

    showTradeModal(positionId, tradeType) {
        this.currentPosition = this.positions.find(p => p.id === positionId);
        this.currentTradeType = tradeType;

        const modal = document.getElementById('tradeModal');
        const title = document.getElementById('tradeModalTitle');
        
        title.textContent = tradeType === 'buy' ? '加仓' : '减仓';
        modal.classList.add('show');

        // 清空表单
        document.getElementById('tradeShares').value = '';
        document.getElementById('tradePrice').value = '';
        document.getElementById('tradeFee').value = '5';

        // 设置今日日期
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('tradeDate').value = today;

        document.getElementById('tradeShares').focus();
    }

    addTrade() {
        const date = document.getElementById('tradeDate').value;
        const shares = parseFloat(document.getElementById('tradeShares').value);
        const price = parseFloat(document.getElementById('tradePrice').value);
        const fee = parseFloat(document.getElementById('tradeFee').value) || 0;

        if (!date || !shares || !price) {
            alert('请填写完整信息');
            return;
        }

        if (shares <= 0 || price <= 0) {
            alert('股数和单价必须大于0');
            return;
        }

        // 计算交易金额
        const amount = shares * price + (this.currentTradeType === 'buy' ? fee : -fee);

        const trade = {
            id: Date.now(),
            date: date,
            type: this.currentTradeType,
            shares: shares,
            price: price,
            fee: fee,
            amount: amount
        };

        this.currentPosition.trades.push(trade);
        this.updatePositionStats(this.currentPosition);
        this.saveToLocal();
        this.renderPositions();
        this.closeModal('tradeModal');
    }

    updatePositionStats(position) {
        let totalAmount = 0;
        let totalShares = 0;

        position.trades.forEach(trade => {
            if (trade.type === 'buy') {
                totalAmount += trade.amount;
                totalShares += trade.shares;
            } else {
                totalAmount -= trade.amount;
                totalShares -= trade.shares;
            }
        });

        position.totalAmount = totalAmount;
        position.totalShares = totalShares;
        position.avgPrice = totalShares > 0 ? totalAmount / totalShares : 0;
    }

    renderPositions() {
        const container = document.getElementById('positionsList');
        
        if (this.positions.length === 0) {
            container.innerHTML = `
                <div class="empty-positions">
                    <p>📈 暂无持仓记录</p>
                    <p class="sub-text">点击上方"新增"按钮开始添加</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.positions.map(position => {
            const amountDisplay = position.totalAmount.toFixed(2);
            const sharesDisplay = position.totalShares;
            
            return `
                <div class="position-item">
                    <div class="position-header">
                        <div class="position-name">${position.name}</div>
                        <div class="position-amount">¥${amountDisplay}</div>
                    </div>
                    <div class="position-info">
                        <small style="color: #6c757d;">持仓股数: ${sharesDisplay} | 平均成本: ¥${position.avgPrice.toFixed(2)}</small>
                    </div>
                    <div class="position-actions">
                        <button class="action-btn add-stock-btn" onclick="app.showTradeModal(${position.id}, 'buy')">+</button>
                        <button class="action-btn remove-stock-btn" onclick="app.showTradeModal(${position.id}, 'sell')">-</button>
                        <button class="action-btn detail-btn" onclick="app.showDetail(${position.id})">→</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    showDetail(positionId) {
        const position = this.positions.find(p => p.id === positionId);
        if (!position) return;

        document.getElementById('welcomePage').style.display = 'none';
        document.getElementById('mainApp').style.display = 'none';
        document.getElementById('detailPage').style.display = 'block';

        document.getElementById('detailTitle').textContent = `${position.name} - 交易记录`;

        const content = document.getElementById('detailContent');
        
        if (position.trades.length === 0) {
            content.innerHTML = `
                <div class="empty-state">
                    <p>📋 暂无交易记录</p>
                    <p class="sub-text">开始加仓或减仓来记录交易</p>
                </div>
            `;
            return;
        }

        // 按日期倒序排列
        const sortedTrades = [...position.trades].sort((a, b) => new Date(b.date) - new Date(a.date));

        content.innerHTML = sortedTrades.map(trade => {
            const typeClass = trade.type === 'buy' ? 'buy' : 'sell';
            const typeText = trade.type === 'buy' ? '买入' : '卖出';
            
            return `
                <div class="trade-record ${typeClass}">
                    <div class="trade-record-header">
                        <span class="trade-type ${typeClass}">${typeText}</span>
                        <span class="trade-date">${trade.date}</span>
                    </div>
                    <div class="trade-details">
                        <div class="trade-detail-item">
                            <span class="trade-detail-label">股数:</span>
                            <span class="trade-detail-value">${trade.shares}</span>
                        </div>
                        <div class="trade-detail-item">
                            <span class="trade-detail-label">单价:</span>
                            <span class="trade-detail-value">¥${trade.price.toFixed(2)}</span>
                        </div>
                        <div class="trade-detail-item">
                            <span class="trade-detail-label">手续费:</span>
                            <span class="trade-detail-value">¥${trade.fee.toFixed(2)}</span>
                        </div>
                        <div class="trade-detail-item">
                            <span class="trade-detail-label">总金额:</span>
                            <span class="trade-detail-value">¥${trade.amount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    saveToLocal() {
        localStorage.setItem('positions', JSON.stringify(this.positions));
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    console.log('KKCC的理财本已加载');
    window.app = new FinanceApp();
});
