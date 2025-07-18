// 导航栏交互
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');

    // 移动端菜单切换
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // 点击导航链接后关闭移动端菜单
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // 滚动时导航栏效果
    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        }
        
        lastScrollY = window.scrollY;
    });

    // 滚动动画观察器
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // 观察需要动画的元素
    const animateElements = document.querySelectorAll('.service-card, .feature-item, .contact-item');
    animateElements.forEach(el => {
        observer.observe(el);
    });

    // 平滑滚动到锚点
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 70; // 考虑固定导航栏高度
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 服务卡片悬停效果增强
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-15px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // 邮箱点击效果
    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
    emailLinks.forEach(link => {
        link.addEventListener('click', function() {
            // 简单的点击反馈
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });

    // 添加加载动画
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
    });

    // 微信二维码区域交互提示
    const qrPlaceholder = document.querySelector('.qr-placeholder');
    if (qrPlaceholder) {
        qrPlaceholder.addEventListener('click', function() {
            this.style.animation = 'pulse 0.6s ease-in-out';
            setTimeout(() => {
                this.style.animation = '';
            }, 600);
        });
    }

    // 页面滚动进度指示器（可选）
    function updateScrollProgress() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.body.offsetHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        
        // 如果需要显示滚动进度条，可以取消下面的注释
        // const progressBar = document.querySelector('.scroll-progress');
        // if (progressBar) {
        //     progressBar.style.width = scrollPercent + '%';
        // }
    }

    window.addEventListener('scroll', updateScrollProgress);

    // 数字计数动画（如果页面有数字统计的话）
    function animateNumbers() {
        const numbers = document.querySelectorAll('.number-counter');
        numbers.forEach(number => {
            const target = parseInt(number.getAttribute('data-target'));
            const increment = target / 100;
            let current = 0;
            
            const updateNumber = () => {
                if (current < target) {
                    current += increment;
                    number.textContent = Math.ceil(current);
                    requestAnimationFrame(updateNumber);
                } else {
                    number.textContent = target;
                }
            };
            
            updateNumber();
        });
    }

    // 检测用户设备类型
    function detectDevice() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isTablet = /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
        
        document.body.classList.add(
            isMobile ? 'mobile-device' : 
            isTablet ? 'tablet-device' : 
            'desktop-device'
        );
    }

    detectDevice();

    // 表单验证（如果未来需要添加联系表单）
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // 错误处理
    window.addEventListener('error', function(e) {
        console.log('页面错误:', e.error);
    });

    // 性能监控（开发环境）
    if (performance && performance.mark) {
        performance.mark('page-interactive');
    }

    // 数据展示功能
    initDataDemo();
});

// 数据展示相关功能
let excelData = [];
let currentPage = 1;
let rowsPerPage = 10;

async function initDataDemo() {
    try {
        await loadExcelData();
        renderStats();
        renderTable();
        setupTableControls();
    } catch (error) {
        console.error('数据加载失败:', error);
        document.getElementById('dataTableBody').innerHTML = 
            '<tr><td colspan="7" class="loading">数据加载失败，请检查网络连接</td></tr>';
    }
}

async function loadExcelData() {
    try {
        const response = await fetch('elonmusk.xlsx');
        if (!response.ok) {
            throw new Error('Excel文件加载失败');
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        
        // 获取第一个工作表
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // 转换为JSON格式
        excelData = XLSX.utils.sheet_to_json(worksheet);
        
        console.log('成功加载', excelData.length, '条数据');
        console.log('数据示例:', excelData.slice(0, 2));
        
    } catch (error) {
        console.error('Excel加载错误:', error);
        throw error;
    }
}

function renderStats() {
    if (excelData.length === 0) return;
    
    const totalTweets = excelData.length;
    const totalLikes = excelData.reduce((sum, row) => {
        const likes = parseInt(row.likeCount || row.LikeCount || row.点赞数 || 0);
        return sum + likes;
    }, 0);
    const totalViews = excelData.reduce((sum, row) => {
        const views = parseInt(row.viewCount || row.ViewCount || row.浏览数 || 0);
        return sum + views;
    }, 0);
    
    console.log('统计数据:', { totalTweets, totalLikes, totalViews });
    
    // 数字动画
    animateNumber('totalTweets', totalTweets);
    animateNumber('totalLikes', totalLikes);
    animateNumber('totalViews', totalViews);
}

function animateNumber(elementId, targetValue) {
    const element = document.getElementById(elementId);
    const duration = 2000;
    const start = 0;
    const increment = targetValue / (duration / 50);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= targetValue) {
            current = targetValue;
            clearInterval(timer);
        }
        
        element.textContent = formatNumber(Math.floor(current));
    }, 50);
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
}

function renderTable() {
    const tbody = document.getElementById('dataTableBody');
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const pageData = excelData.slice(startIndex, endIndex);
    
    if (pageData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="loading">没有数据</td></tr>';
        return;
    }
    
    const rows = pageData.map(row => {
        const date = new Date(row.date || row.Date || row.时间).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const content = (row.rawContent || row.RawContent || row.内容 || '').toString().substring(0, 100) + 
                       (row.rawContent && row.rawContent.toString().length > 100 ? '...' : '');
        
        const username = row['user.username'] || row['User.Username'] || row.username || row.用户名 || '';
        const likeCount = parseInt(row.likeCount || row.LikeCount || row.点赞数 || 0);
        const retweetCount = parseInt(row.retweetCount || row.RetweetCount || row.转发数 || 0);
        const viewCount = parseInt(row.viewCount || row.ViewCount || row.浏览数 || 0);
        const url = row.url || row.URL || row.链接 || '#';
        
        return `
            <tr>
                <td>${date}</td>
                <td><strong>${username}</strong></td>
                <td class="content-cell" title="${content.replace(/"/g, '&quot;')}">${content}</td>
                <td class="number-cell">${formatNumber(likeCount)}</td>
                <td class="number-cell">${formatNumber(retweetCount)}</td>
                <td class="number-cell">${formatNumber(viewCount)}</td>
                <td class="link-cell">
                    <a href="${url}" target="_blank" rel="noopener">查看</a>
                </td>
            </tr>
        `;
    }).join('');
    
    tbody.innerHTML = rows;
    renderPagination();
}

function renderPagination() {
    const totalPages = Math.ceil(excelData.length / rowsPerPage);
    const pagination = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = `
        <button onclick="goToPage(1)" ${currentPage === 1 ? 'disabled' : ''}>首页</button>
        <button onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>上一页</button>
    `;
    
    // 显示页码
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button onclick="goToPage(${i})" ${i === currentPage ? 'class="active"' : ''}>${i}</button>
        `;
    }
    
    paginationHTML += `
        <button onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>下一页</button>
        <button onclick="goToPage(${totalPages})" ${currentPage === totalPages ? 'disabled' : ''}>末页</button>
        <span class="page-info">第 ${currentPage} 页，共 ${totalPages} 页</span>
    `;
    
    pagination.innerHTML = paginationHTML;
}

function goToPage(page) {
    const totalPages = Math.ceil(excelData.length / rowsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderTable();
    }
}

function setupTableControls() {
    // 刷新数据按钮
    document.getElementById('refreshData').addEventListener('click', async () => {
        document.getElementById('refreshData').textContent = '刷新中...';
        try {
            await loadExcelData();
            renderStats();
            currentPage = 1;
            renderTable();
        } catch (error) {
            console.error('刷新失败:', error);
        } finally {
            document.getElementById('refreshData').textContent = '刷新数据';
        }
    });
    
    // 每页显示行数控制
    document.getElementById('rowsPerPage').addEventListener('change', (e) => {
        rowsPerPage = parseInt(e.target.value);
        currentPage = 1;
        renderTable();
    });
    
    // 下载按钮点击统计
    document.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const fileType = btn.classList.contains('excel') ? 'Excel' : 'CSV';
            console.log(`下载${fileType}文件`);
            
            // 简单的下载反馈
            const originalText = btn.innerHTML;
            btn.innerHTML = `<i class="fas fa-download"></i> 下载中...`;
            
            setTimeout(() => {
                btn.innerHTML = originalText;
            }, 1000);
        });
    });
}

// CSS动画类
const style = document.createElement('style');
style.textContent = `
    .animate-in {
        animation: fadeInUp 0.8s ease forwards;
    }
    
    .loaded .hero-content h1,
    .loaded .hero-content p,
    .loaded .hero-buttons {
        animation-play-state: running;
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    .hamburger.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }
    
    .hamburger.active span:nth-child(2) {
        opacity: 0;
    }
    
    .hamburger.active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }
    
    .service-card {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .feature-item {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s ease;
    }
    
    .feature-item.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .contact-item {
        opacity: 0;
        transform: translateX(-30px);
        transition: all 0.6s ease;
    }
    
    .contact-item.animate-in {
        opacity: 1;
        transform: translateX(0);
    }
    
    /* 加载状态 */
    body:not(.loaded) .hero-content h1,
    body:not(.loaded) .hero-content p,
    body:not(.loaded) .hero-buttons {
        animation-play-state: paused;
    }
`;

document.head.appendChild(style); 