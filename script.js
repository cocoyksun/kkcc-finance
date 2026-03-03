// KKCC的理财本 - 基础JavaScript功能
document.addEventListener('DOMContentLoaded', function() {
    console.log('KKCC的理财本已加载');
    
    // 获取开始按钮
    const startBtn = document.querySelector('.primary-btn');
    
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            alert('功能正在开发中，敬请期待！');
        });
    }
    
    // 添加一些交互动画
    const welcomeCard = document.querySelector('.welcome-card');
    if (welcomeCard) {
        // 页面加载时的淡入动画
        welcomeCard.style.opacity = '0';
        welcomeCard.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            welcomeCard.style.transition = 'all 0.6s ease';
            welcomeCard.style.opacity = '1';
            welcomeCard.style.transform = 'translateY(0)';
        }, 300);
    }
});