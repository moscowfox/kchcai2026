/* ============================================================
   kchc.ai — 前端交互 & WebGL 流体背景引擎（零依赖原生实现）
   ============================================================ */

/* ------------------------------------------------------------
   1. WebGL 流体 3D 动态背景
   基于分形噪声 + 域扭曲（Domain Warping）的实时着色器，
   呈现青/紫色调的流动星云效果，并响应鼠标位置。
   ------------------------------------------------------------ */
(function initFluidBackground() {
    const canvas = document.getElementById('fluid-canvas');
    if (!canvas) return;

    // 尊重用户的"减少动态效果"系统偏好
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const gl = canvas.getContext('webgl', {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: 'low-power'
    });

    if (!gl) {
        // WebGL 不可用时回退为 CSS 渐变背景
        document.body.classList.add('no-webgl');
        return;
    }

    const vertSrc = `
        attribute vec2 a_pos;
        void main() {
            gl_Position = vec4(a_pos, 0.0, 1.0);
        }
    `;

    const fragSrc = `
        precision highp float;
        uniform vec2  u_res;
        uniform float u_time;
        uniform vec2  u_mouse;

        float hash(vec2 p) {
            p = fract(p * vec2(123.34, 456.21));
            p += dot(p, p + 45.32);
            return fract(p.x * p.y);
        }

        float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            float a = hash(i);
            float b = hash(i + vec2(1.0, 0.0));
            float c = hash(i + vec2(0.0, 1.0));
            float d = hash(i + vec2(1.0, 1.0));
            return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }

        float fbm(vec2 p) {
            float v = 0.0;
            float amp = 0.55;
            mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
            for (int i = 0; i < 5; i++) {
                v += amp * noise(p);
                p = rot * p * 2.02;
                amp *= 0.5;
            }
            return v;
        }

        void main() {
            vec2 uv = (gl_FragCoord.xy * 2.0 - u_res) / min(u_res.x, u_res.y);
            float t = u_time * 0.055;

            // 三层域扭曲，产生流体般的湍流
            vec2 p = uv * 1.35;
            p += 0.30 * vec2(fbm(p + t), fbm(p - t * 0.8));

            vec2 q = vec2(
                fbm(p + vec2(1.7, 9.2) + t * 1.2),
                fbm(p + vec2(8.3, 2.8) - t * 0.9)
            );
            vec2 r = vec2(
                fbm(p + 3.6 * q + vec2(1.7, 9.2) + t * 0.4),
                fbm(p + 3.6 * q + vec2(8.3, 2.8) - t * 0.3)
            );
            float f = fbm(p + 3.2 * r + u_mouse * 0.25);

            // 配色：深空蓝 → 电光青 → 霓虹紫
            vec3 deep   = vec3(0.012, 0.024, 0.055);
            vec3 blue   = vec3(0.030, 0.130, 0.380);
            vec3 cyan   = vec3(0.000, 0.950, 1.000);
            vec3 purple = vec3(0.737, 0.075, 0.996);

            vec3 col = mix(deep, blue, clamp(f * f * 2.4, 0.0, 1.0));
            col = mix(col, purple * 0.50, clamp(length(q) * 0.55, 0.0, 1.0) * smoothstep(0.15, 0.95, r.x));
            col = mix(col, cyan * 0.45, clamp(pow(f, 3.0) * 1.5, 0.0, 1.0));

            // 鼠标光晕
            float d = length(uv - u_mouse);
            col += cyan * 0.07 * exp(-d * 2.6);
            col += purple * 0.04 * exp(-d * 4.5);

            // 暗角，聚焦中心
            col *= 1.0 - 0.38 * dot(uv * 0.62, uv * 0.62);

            gl_FragColor = vec4(col, 1.0);
        }
    `;

    function compile(type, src) {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
            console.warn('Shader error:', gl.getShaderInfoLog(s));
            return null;
        }
        return s;
    }

    const vs = compile(gl.VERTEX_SHADER, vertSrc);
    const fs = compile(gl.FRAGMENT_SHADER, fragSrc);
    if (!vs || !fs) { document.body.classList.add('no-webgl'); return; }

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    // 全屏三角形
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, 'u_res');
    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');

    // 性能：限制渲染分辨率（流体是低频图案，降采样几乎无损画质）
    const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    const SCALE = 0.6;

    function resize() {
        const w = Math.floor(window.innerWidth * DPR * SCALE);
        const h = Math.floor(window.innerHeight * DPR * SCALE);
        if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
            gl.viewport(0, 0, w, h);
        }
    }
    resize();
    window.addEventListener('resize', resize);

    // 鼠标位置（平滑跟随）
    let targetX = 0, targetY = 0, mouseX = 0, mouseY = 0;
    window.addEventListener('pointermove', (e) => {
        const mins = Math.min(window.innerWidth, window.innerHeight);
        targetX = (e.clientX * 2 - window.innerWidth) / mins;
        targetY = -(e.clientY * 2 - window.innerHeight) / mins;
    }, { passive: true });

    let running = true;
    document.addEventListener('visibilitychange', () => {
        running = !document.hidden;
        if (running) requestAnimationFrame(frame);
    });

    const start = performance.now();
    let lastDraw = 0;

    function frame(now) {
        if (!running) return;
        // 静态偏好时只渲染一帧；正常时锁 ~30fps 省电
        if (!reduceMotion) requestAnimationFrame(frame);
        if (now - lastDraw < 33) return;
        lastDraw = now;

        mouseX += (targetX - mouseX) * 0.05;
        mouseY += (targetY - mouseY) * 0.05;

        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.uniform1f(uTime, (now - start) / 1000);
        gl.uniform2f(uMouse, mouseX, mouseY);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    requestAnimationFrame(frame);
})();

/* ------------------------------------------------------------
   2. 卡片 3D 倾斜 + 鼠标光晕跟随（桌面端）
   ------------------------------------------------------------ */
(function initCardTilt() {
    if (window.matchMedia('(hover: none)').matches) return; // 触屏跳过
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const MAX_TILT = 6; // 度

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.card, .logo-item').forEach(card => {
            card.addEventListener('pointermove', (e) => {
                const rect = card.getBoundingClientRect();
                const px = (e.clientX - rect.left) / rect.width;
                const py = (e.clientY - rect.top) / rect.height;

                // 光晕位置（供 CSS 使用）
                card.style.setProperty('--mx', (px * 100) + '%');
                card.style.setProperty('--my', (py * 100) + '%');

                // 3D 倾斜
                const rx = (0.5 - py) * MAX_TILT;
                const ry = (px - 0.5) * MAX_TILT;
                card.style.transform =
                    'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(-6px)';
            });

            card.addEventListener('pointerleave', () => {
                card.style.transform = '';
            });
        });
    });
})();

/* ------------------------------------------------------------
   3. 滚动显现动画
   ------------------------------------------------------------ */
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.scroll-anim, .card, .timeline-item').forEach(el => {
        observer.observe(el);
    });
});

/* ------------------------------------------------------------
   4. 移动端菜单
   ------------------------------------------------------------ */
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');

if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        mobileMenuBtn.textContent = mobileMenu.classList.contains('active') ? '✕' : '☰';
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

/* ------------------------------------------------------------
   5. 导航栏滚动状态
   ------------------------------------------------------------ */
const header = document.querySelector('header');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}, { passive: true });

/* ------------------------------------------------------------
   6. Logo 回顶部 & 锚点平滑滚动
   ------------------------------------------------------------ */
const logo = document.querySelector('.logo');
if (logo) {
    logo.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

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

            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
    });
});

/* ------------------------------------------------------------
   7. 多语言（繁体中文 / English）
   ------------------------------------------------------------ */
const LANG_STORAGE_KEY = 'kchc-lang';
const DEFAULT_LANG = 'zh-TW';

const TRANSLATIONS = {
    'zh-TW': {
        meta: {
            title: '北京康城合創 | kchc.ai - AGI 時代的算力領航者',
            description: '北京康城合創 - AGI 時代的算力領航者，專業的 AI 基礎設施與應用服務綜合提供商',
            keywords: 'AI算力,人工智能,大模型,生物識別,火山引擎,北京康城合創'
        },
        nav: {
            solutions: '解決方案',
            services: '服務體系',
            cases: '客戶案例',
            about: '關於我們',
            contact: '聯繫我們'
        },
        hero: {
            title: '從感知智能<br>到 AGI 時代的算力領航者',
            subtitle: '北京康城合創 —— 您的 AI 基礎設施與應用服務綜合提供商',
            cta: '開啟智能化轉型'
        },
        about: {
            title: '為什麼選擇康城合創',
            card1: {
                title: '技術同源，能力升級',
                text: '從生物識別到大模型，12 年 AI 工程化落地經驗。將金融級的高並發、高安全能力平滑遷移至 AI 算力服務。'
            },
            card2: {
                title: '軟硬一體，雙輪驅動',
                text: '火山引擎雲原生架構 + 高效能 GPU 算力叢集。不僅提供硬體，更提供從底層到應用的全棧環境建置。'
            },
            card3: {
                title: '央企標準，信賴交付',
                text: '沿襲中國人民銀行與國家電網的嚴苛交付標準，確保每一份算力、每一個應用都安全、穩定、合規。'
            }
        },
        solutions: {
            title: '業務版圖',
            engine: {
                title: '創新引擎 · AI 算力與雲基座',
                intro: '面向大模型訓練與推理時代，解決「算力焦慮」。',
                item1: '<strong>AI 算力伺服器整合</strong>：高效能 GPU 叢集解決方案',
                item2: '<strong>火山引擎全系服務</strong>：雲原生、邊緣運算、大數據',
                item3: '<strong>企業級智連安全</strong>：代理「飛連」All-in-One 辦公安全平台'
            },
            foundation: {
                title: '穩健基石 · 智能識別與安防',
                intro: '成熟的感知智能技術，守護國家關鍵基礎設施。',
                item1: '<strong>金融級生物識別</strong>：人行標準活體指紋、高精人臉識別',
                item2: '<strong>智慧空間管理</strong>：智能視訊分析、通道閘機系統',
                item3: '<strong>園區數位化</strong>：訪客管理與安防綜合平台'
            }
        },
        services: {
            title: '服務體系',
            card1: {
                title: '諮詢規劃',
                text: '專業的 AI 轉型諮詢，為企業量身訂製算力與智能化解決方案。'
            },
            card2: {
                title: '系統整合',
                text: '從硬體部署到軟體配置，提供一站式系統整合服務。'
            },
            card3: {
                title: '運維支援',
                text: '7×24 小時技術支援，確保系統穩定運行與持續優化。'
            }
        },
        cases: {
            title: '值得信賴的合作夥伴',
            logo1: '中國人民銀行',
            logo2: '國家電網',
            logo3: '中國化工',
            logo4: '深業集團',
            logo5: '字節跳動 | 火山引擎',
            logo6: '自動駕駛獨角獸企業',
            summary: '服務大量重要客戶與 AI 新勢力，以「高安全、高穩定、高效率」贏得長期信賴。'
        },
        timeline: {
            title: '發展歷程',
            item1: {
                year: '2025 - 未來',
                title: 'AI 元年再出發',
                text: '全面佈局 AI 算力伺服器與行業應用，做 AI 浪潮中的長期主義者。'
            },
            item2: {
                year: '2020 - 2024',
                title: '雲智轉型',
                text: '攜手字節跳動火山引擎，代理飛連與雲服務，服務自動駕駛與 AI 行業客戶。'
            },
            item3: {
                year: '2012 - 2019',
                title: 'AI 原生',
                text: '深耕模式識別和生物識別，服務人行、國網等央企，積累高安全級系統整合經驗，夯實 AI 原生基礎。'
            }
        },
        contact: {
            title: '聯繫我們',
            company: '北京康城合創科技有限公司',
            hotline: '24 小時業務熱線',
            email: '商務郵箱'
        },
        footer: {
            copyright: '© 2012-2026 北京康城合創科技有限公司 版權所有',
            disclaimer: '聲明：僅供向香港地區及非中國大陸地區客戶展示公司業務使用。'
        }
    },
    en: {
        meta: {
            title: 'Beijing Kangcheng Hechuang | kchc.ai - Compute Leader in the AGI Era',
            description: 'Beijing Kangcheng Hechuang — Your comprehensive provider of AI infrastructure and application services, leading the compute frontier in the AGI era.',
            keywords: 'AI compute, artificial intelligence, large language models, biometrics, Volcano Engine, Beijing Kangcheng Hechuang'
        },
        nav: {
            solutions: 'Solutions',
            services: 'Services',
            cases: 'Case Studies',
            about: 'About Us',
            contact: 'Contact Us'
        },
        hero: {
            title: 'From Perceptive Intelligence<br>to a Compute Leader in the AGI Era',
            subtitle: 'Beijing Kangcheng Hechuang — Your comprehensive provider of AI infrastructure and application services',
            cta: 'Start Your Intelligent Transformation'
        },
        about: {
            title: 'Why Choose Kangcheng Hechuang',
            card1: {
                title: 'Shared Technology Roots, Elevated Capabilities',
                text: 'Twelve years of AI engineering experience, from biometrics to large models. We seamlessly extend financial-grade concurrency and security to AI compute services.'
            },
            card2: {
                title: 'Integrated Hardware and Software',
                text: 'Volcano Engine cloud-native architecture plus high-performance GPU compute clusters. We deliver full-stack environments from infrastructure to applications—not just hardware.'
            },
            card3: {
                title: 'State-Owned Enterprise Standards',
                text: 'Built on the rigorous delivery standards of the People\'s Bank of China and State Grid, ensuring every compute resource and application is secure, stable, and compliant.'
            }
        },
        solutions: {
            title: 'Business Portfolio',
            engine: {
                title: 'Innovation Engine · AI Compute & Cloud Foundation',
                intro: 'Addressing compute scarcity in the era of large-model training and inference.',
                item1: '<strong>AI Compute Server Integration</strong>: High-performance GPU cluster solutions',
                item2: '<strong>Volcano Engine Full-Stack Services</strong>: Cloud-native, edge computing, and big data',
                item3: '<strong>Enterprise Secure Connectivity</strong>: Authorized partner for Feilian All-in-One workplace security'
            },
            foundation: {
                title: 'Trusted Foundation · Intelligent Recognition & Security',
                intro: 'Mature perceptual intelligence technologies safeguarding critical national infrastructure.',
                item1: '<strong>Financial-Grade Biometrics</strong>: PBOC-standard liveness fingerprint and high-precision facial recognition',
                item2: '<strong>Smart Space Management</strong>: Intelligent video analytics and access control systems',
                item3: '<strong>Campus Digitalization</strong>: Visitor management and integrated security platforms'
            }
        },
        services: {
            title: 'Service Portfolio',
            card1: {
                title: 'Consulting & Planning',
                text: 'Expert AI transformation consulting with tailored compute and intelligent solutions for your business.'
            },
            card2: {
                title: 'System Integration',
                text: 'End-to-end integration from hardware deployment to software configuration.'
            },
            card3: {
                title: 'Operations & Support',
                text: '24/7 technical support to ensure stable operations and continuous optimization.'
            }
        },
        cases: {
            title: 'Trusted Partners',
            logo1: 'People\'s Bank of China',
            logo2: 'State Grid Corporation of China',
            logo3: 'ChemChina',
            logo4: 'Shenye Group',
            logo5: 'ByteDance | Volcano Engine',
            logo6: 'Leading Autonomous Driving Companies',
            summary: 'Serving major clients and AI innovators with high security, stability, and efficiency—earning long-term trust.'
        },
        timeline: {
            title: 'Our Journey',
            item1: {
                year: '2025 - Future',
                title: 'A New Beginning in the AI Era',
                text: 'Comprehensive deployment of AI compute servers and industry applications—a long-term commitment to the AI wave.'
            },
            item2: {
                year: '2020 - 2024',
                title: 'Cloud & Intelligence Transformation',
                text: 'Partnering with ByteDance Volcano Engine as an authorized Feilian and cloud services partner for autonomous driving and AI industry clients.'
            },
            item3: {
                year: '2012 - 2019',
                title: 'AI-Native Foundations',
                text: 'Deep expertise in pattern and biometric recognition for state-owned enterprises including PBOC and State Grid, building a foundation for AI-native capabilities.'
            }
        },
        contact: {
            title: 'Contact Us',
            company: 'Beijing Kangcheng Hechuang Technology Co., Ltd.',
            hotline: '24/7 Business Hotline',
            email: 'Business Email'
        },
        footer: {
            copyright: '© 2012-2026 Beijing Kangcheng Hechuang Technology Co., Ltd. All Rights Reserved.',
            disclaimer: 'Disclaimer: For display of company business to clients in Hong Kong and regions outside mainland China only.'
        }
    }
};

function getTranslation(lang, key) {
    const parts = key.split('.');
    let value = TRANSLATIONS[lang];

    for (const part of parts) {
        value = value?.[part];
    }

    return value ?? '';
}

function applyLanguage(lang) {
    const safeLang = TRANSLATIONS[lang] ? lang : DEFAULT_LANG;
    const meta = TRANSLATIONS[safeLang].meta;

    document.documentElement.lang = safeLang === 'en' ? 'en' : 'zh-Hant';
    document.title = meta.title;

    const description = document.querySelector('meta[name="description"]');
    const keywords = document.querySelector('meta[name="keywords"]');
    if (description) description.content = meta.description;
    if (keywords) keywords.content = meta.keywords;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
        el.textContent = getTranslation(safeLang, el.getAttribute('data-i18n'));
    });

    document.querySelectorAll('[data-i18n-html]').forEach((el) => {
        el.innerHTML = getTranslation(safeLang, el.getAttribute('data-i18n-html'));
    });

    document.querySelectorAll('.lang-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.lang === safeLang);
    });

    localStorage.setItem(LANG_STORAGE_KEY, safeLang);
}

function initLanguageSwitcher() {
    const savedLang = localStorage.getItem(LANG_STORAGE_KEY);
    const initialLang = savedLang === 'en' ? 'en' : DEFAULT_LANG;
    applyLanguage(initialLang);

    document.querySelectorAll('.lang-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            applyLanguage(btn.dataset.lang);
        });
    });
}

document.addEventListener('DOMContentLoaded', initLanguageSwitcher);

/* ------------------------------------------------------------
   8. 页面加载淡入
   ------------------------------------------------------------ */
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});
