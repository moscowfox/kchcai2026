#!/bin/bash
# 网页终端部署脚本 - 直接在腾讯云网页终端中执行

echo "=========================================="
echo "  网站部署脚本 - 使用网页终端"
echo "=========================================="
echo ""

# 1. 创建网站目录
echo "[1/4] 创建网站目录..."
mkdir -p /var/www/html
chmod 755 /var/www/html

# 2. 创建 index.html 文件
echo "[2/4] 创建 index.html..."
cat > /var/www/html/index.html << 'INDEX_EOF'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="description" content="北京康城合创 - AGI时代的算力领航者，专业的AI基础设施与应用服务综合提供商">
    <meta name="keywords" content="AI算力,人工智能,大模型,生物识别,火山引擎,北京康城合创">
    <title>北京康城合创 | kchc.ai - AGI时代的算力领航者</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>

    <!-- 导航栏 -->
    <header>
        <div class="logo">kchc.ai</div>
        <nav class="nav-links">
            <a href="#solutions">解决方案</a>
            <a href="#services">服务体系</a>
            <a href="#cases">客户案例</a>
            <a href="#about">关于我们</a>
            <a href="#contact">联系我们</a>
        </nav>
        <div class="mobile-menu-btn" id="mobileMenuBtn">☰</div>
        <div class="mobile-menu" id="mobileMenu">
            <a href="#solutions">解决方案</a>
            <a href="#services">服务体系</a>
            <a href="#cases">客户案例</a>
            <a href="#about">关于我们</a>
            <a href="#contact">联系我们</a>
        </div>
    </header>

    <!-- Hero 首屏 -->
    <section class="hero">
        <h1>从感知智能<br>到AGI时代的算力领航者</h1>
        <p>北京康城合创 —— 您的AI基础设施与应用服务综合提供商</p>
        <div onclick="document.getElementById('contact').scrollIntoView({behavior: 'smooth'})" class="cta-btn">
            开启智能化转型
        </div>
    </section>

    <!-- 核心优势 -->
    <section class="scroll-anim" id="about">
        <div class="section-title"><span>为什么选择康城合创</span></div>
        <div class="features">
            <div class="card">
                <div class="icon-box">✦</div>
                <h3>技术同源，能力升级</h3>
                <p>从生物识别到大模型，12年AI工程化落地经验。将金融级的高并发、高安全能力平滑迁移至AI算力服务。</p>
            </div>
            <div class="card">
                <div class="icon-box">☁</div>
                <h3>软硬一体，双轮驱动</h3>
                <p>火山引擎云原生架构 + 高性能GPU算力集群。不仅提供硬件，更提供从底层到应用的全栈环境搭建。</p>
            </div>
            <div class="card">
                <div class="icon-box">🛡</div>
                <h3>央企标准，信赖交付</h3>
                <p>沿袭中国人民银行与国家电网的严苛交付标准，确保每一份算力、每一个应用都安全、稳定、合规。</p>
            </div>
        </div>
    </section>

    <!-- 业务版图 -->
    <section class="scroll-anim" id="solutions">
        <div class="section-title"><span>业务版图</span></div>
        <div class="business-layout">
            <!-- 创新引擎 -->
            <div class="biz-group biz-engine card">
                <h3 style="color: var(--accent-purple);">🚀 创新引擎 · AI算力与云基座</h3>
                <p style="margin-bottom: 20px;">面向大模型训练与推理时代，解决"算力焦虑"。</p>
                <ul class="biz-list">
                    <li><strong>AI算力服务器集成</strong>：高性能GPU集群解决方案</li>
                    <li><strong>火山引擎全系服务</strong>：云原生、边缘计算、大数据</li>
                    <li><strong>企业级智连安全</strong>：代理"飞连"All-in-One办公安全平台</li>
                </ul>
            </div>
            <!-- 稳健基石 -->
            <div class="biz-group biz-foundation card">
                <h3 style="color: var(--accent-cyan);">🏛 稳健基石 · 智能识别与安防</h3>
                <p style="margin-bottom: 20px;">成熟的感知智能技术，守护国家关键基础设施。</p>
                <ul class="biz-list">
                    <li><strong>金融级生物识别</strong>：人行标准活体指纹、高精人脸识别</li>
                    <li><strong>智慧空间管理</strong>：智能视频分析、通道闸机系统</li>
                    <li><strong>园区数字化</strong>：访客管理与安防综合平台</li>
                </ul>
            </div>
        </div>
    </section>

    <!-- 服务体系 -->
    <section class="scroll-anim" id="services">
        <div class="section-title"><span>服务体系</span></div>
        <div class="features">
            <div class="card">
                <div class="icon-box">💼</div>
                <h3>咨询规划</h3>
                <p>专业的AI转型咨询，为企业量身定制算力与智能化解决方案。</p>
            </div>
            <div class="card">
                <div class="icon-box">⚙️</div>
                <h3>系统集成</h3>
                <p>从硬件部署到软件配置，提供一站式系统集成服务。</p>
            </div>
            <div class="card">
                <div class="icon-box">🔧</div>
                <h3>运维支持</h3>
                <p>7×24小时技术支持，确保系统稳定运行与持续优化。</p>
            </div>
        </div>
    </section>

    <!-- 客户案例 -->
    <section class="scroll-anim" id="cases">
        <div class="section-title"><span>值得信赖的合作伙伴</span></div>
        <div class="logos">
            <div class="logo-item">中国人民银行</div>
            <div class="logo-item">国家电网</div>
            <div class="logo-item">中国化工</div>
            <div class="logo-item">深业集团</div>
            <div class="logo-item">字节跳动 | 火山引擎</div>
            <div class="logo-item">自动驾驶独角兽企业</div>
        </div>
        <div style="text-align: center; margin-top: 40px; color: var(--text-sub);">
            <p>服务大量国家级基础设施与AI新势力，以"零差错"赢得长期信赖。</p>
        </div>
    </section>

    <!-- 发展历程 -->
    <section class="scroll-anim">
        <div class="section-title"><span>发展历程</span></div>
        <div class="timeline">
            <div class="timeline-item">
                <span class="year">2025 - 未来</span>
                <h3>AI元年再出发</h3>
                <p>全面布局AI算力服务器与行业应用，做AI浪潮中的长期主义者。</p>
            </div>
            <div class="timeline-item">
                <span class="year">2020 - 2024</span>
                <h3>云智转型</h3>
                <p>携手字节跳动火山引擎，代理飞连与云服务，服务自动驾驶与AI客户。</p>
            </div>
            <div class="timeline-item">
                <span class="year">2012 - 2019</span>
                <h3>基石奠定</h3>
                <p>深耕生物识别，服务人行、国网等央企，积累高安全级系统集成经验。</p>
            </div>
        </div>
    </section>

    <!-- 联系我们 -->
    <section class="contact-section scroll-anim" id="contact">
        <div class="section-title"><span>联系我们</span></div>
        <p style="color: var(--text-sub);">北京康城合创科技有限公司</p>
        <p style="color: var(--text-sub); margin-bottom: 30px;">北京市丰台区</p>
        
        <div class="contact-box">
            <div class="contact-item">
                <h4>24小时业务热线</h4>
                <p><a href="tel:18518156777">185-1815-6777</a></p>
            </div>
            <div class="contact-item">
                <h4>公司总机</h4>
                <p><a href="tel:01063893886">010-6389-3886</a></p>
            </div>
            <div class="contact-item">
                <h4>商务邮箱</h4>
                <p><a href="mailto:zuobing@atlantis9.com" style="font-size: 20px;">zuobing@atlantis9.com</a></p>
            </div>
        </div>
    </section>

    <footer>
        <p>© 2012-2025 Beijing Kangcheng Hechuang Technology Co., Ltd. All Rights Reserved.</p>
        <p>www.kchc.ai</p>
    </footer>

    <script src="script.js"></script>
</body>
</html>
INDEX_EOF

# 3. 创建 styles.css 文件（由于文件较大，使用 heredoc）
echo "[3/4] 创建 styles.css..."
# 这里需要读取完整的 styles.css 内容
# 由于文件较大，建议先检查文件是否存在，如果不存在则创建

# 4. 创建 script.js 文件
echo "[4/4] 创建 script.js..."
cat > /var/www/html/script.js << 'SCRIPT_EOF'
// 滚动显现动画逻辑
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// 观察所有需要动画的元素
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.scroll-anim, .card, .timeline-item').forEach(el => {
        observer.observe(el);
    });
});

// 移动端菜单切换
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');

if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        if (mobileMenu.classList.contains('active')) {
            mobileMenuBtn.textContent = '✕';
        } else {
            mobileMenuBtn.textContent = '☰';
        }
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            mobileMenuBtn.textContent = '☰';
        });
    });

    document.addEventListener('click', (e) => {
        if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            mobileMenu.classList.remove('active');
            mobileMenuBtn.textContent = '☰';
        }
    });
}

// 导航栏滚动效果
let lastScroll = 0;
const header = document.querySelector('header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// Logo 点击返回顶部
const logo = document.querySelector('.logo');
if (logo) {
    logo.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// 平滑滚动到锚点
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#' || href === '#!') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// 添加页面加载动画
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease-in';
        document.body.style.opacity = '1';
    }, 100);
});
SCRIPT_EOF

# 5. 设置文件权限
echo ""
echo "设置文件权限..."
chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html

echo ""
echo "=========================================="
echo "  文件创建完成！"
echo "=========================================="
echo ""
echo "注意: styles.css 文件需要单独创建（文件较大）"
echo "请参考下一步操作"
echo ""
