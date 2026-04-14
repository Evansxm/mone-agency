document.addEventListener('DOMContentLoaded', function() {
    const gallery = document.getElementById('gallery');
    const images = [
        'images/mone001.png', 'images/mone002.png', 'images/mone003.png',
        'images/mone004.png', 'images/mone005.png', 'images/mone006.png',
        'images/mone007.png', 'images/mone008.png', 'images/mone009.png',
        'images/mone010.png', 'images/mone011.png', 'images/mone012.png',
        'images/mone013.png', 'images/mone014.png', 'images/mone015.png',
        'images/mone016.png', 'images/mone017.png', 'images/mone018.png'
    ];

    const modelNames = [
        'Model talent from Mone Agency roster — South Africa',
        'Editorial fashion model — Mone Agency',
        'High-fashion portrait — Mone Agency South Africa',
        'Mone Agency model — luxury editorial talent',
        'South African fashion model — Mone Agency',
        'Elite model portfolio — Mone Agency',
        'Fashion editorial talent — Mone Agency Cape Town',
        'Model scouting portfolio — Mone Agency',
        'Mone Agency talent — commercial fashion',
        'Premium model — Mone Agency Sandton',
        'Elite roster model — Mone Agency',
        'Fashion talent — Mone Agency South Africa',
        'Editorial portrait — Mone Agency',
        'High-fashion talent — Mone Agency',
        'Model portfolio — Mone Agency PMB',
        'Mone Agency talent — runway ready',
        'Fashion editorial — Mone Agency',
        'Elite model — Mone Agency South Africa'
    ];

    images.forEach((src, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        const img = document.createElement('img');
        img.src = src;
        img.alt = modelNames[index] || `Mone Agency model portfolio image ${index + 1}`;
        img.loading = 'lazy';
        img.fetchpriority = index < 3 ? 'high' : 'auto';
        item.appendChild(img);
        gallery.appendChild(item);
    });

    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('photos');
    const fileList = document.getElementById('fileList');
    const MAX_FILES = 10;
    const MAX_SIZE = 2 * 1024 * 1024;

    if (uploadZone && fileInput) {
        uploadZone.addEventListener('click', () => fileInput.click());

        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.style.backgroundColor = 'rgba(255, 0, 255, 0.08)';
        });

        uploadZone.addEventListener('dragleave', () => {
            uploadZone.style.backgroundColor = 'transparent';
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.style.backgroundColor = 'transparent';
            handleFiles(e.dataTransfer.files);
        });

        fileInput.addEventListener('change', (e) => {
            handleFiles(e.target.files);
        });
    }

    function handleFiles(files) {
        if (!fileList) return;
        fileList.innerHTML = '';
        let validCount = 0;
        let oversized = 0;

        if (files.length > MAX_FILES) {
            alert(`Maximum ${MAX_FILES} photos allowed.`);
            return;
        }

        for (let i = 0; i < files.length; i++) {
            if (files[i].size > MAX_SIZE) {
                oversized++;
                continue;
            }
            validCount++;
            const p = document.createElement('p');
            p.textContent = `✓ ${files[i].name}`;
            p.style.cssText = 'font-size:0.7rem;letter-spacing:1px;opacity:0.8;margin:4px 0;';
            fileList.appendChild(p);
        }

        if (oversized > 0) {
            const err = document.createElement('p');
            err.textContent = `${oversized} file(s) exceeded 2MB limit and were not included.`;
            err.style.cssText = 'font-size:0.7rem;letter-spacing:1px;color:var(--magenta);margin-top:8px;';
            fileList.appendChild(err);
        }

        if (validCount === 0 && oversized === 0) {
            fileList.innerHTML = '<p style="font-size:0.7rem;opacity:0.5;">No files selected.</p>';
        }
    }

    const modelForm = document.getElementById('modelForm');
    if (modelForm) {
        modelForm.addEventListener('submit', function(e) {
            const btn = this.querySelector('.btn-submit');
            if (btn) {
                btn.textContent = 'Submitting...';
                btn.disabled = true;
            }
            const successMsg = document.createElement('p');
            successMsg.textContent = 'Application submitted! We will be in touch shortly.';
            successMsg.style.cssText = 'text-align:center;color:var(--magenta);margin-top:20px;letter-spacing:1px;font-size:0.8rem;';
            this.appendChild(successMsg);
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    if (window.location.search.includes('applied=true')) {
        const successEl = document.createElement('div');
        successEl.style.cssText = 'position:fixed;top:100px;left:50%;transform:translateX(-50%);background:rgba(10,10,10,0.95);border:1px solid var(--magenta);padding:20px 40px;z-index:9999;text-align:center;';
        successEl.innerHTML = '<p style="color:var(--sand);letter-spacing:2px;font-size:0.8rem;">Application received. We will be in touch soon.</p>';
        document.body.appendChild(successEl);
        setTimeout(() => successEl.remove(), 6000);
        window.history.replaceState({}, '', window.location.pathname);
    }
});
