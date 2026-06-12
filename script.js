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
   7. 页面加载淡入
   ------------------------------------------------------------ */
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});
