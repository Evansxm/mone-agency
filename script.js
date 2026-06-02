document.addEventListener('DOMContentLoaded', function() {
    var gallery = document.getElementById('gallery');
    var images = [
        'images/mone001.png', 'images/mone002.png', 'images/mone003.png',
        'images/mone004.png', 'images/mone005.png', 'images/mone006.png',
        'images/mone007.png', 'images/mone008.png', 'images/mone009.png',
        'images/mone010.png', 'images/mone011.png', 'images/mone012.png',
        'images/mone013.png', 'images/mone014.png', 'images/mone015.png',
        'images/mone016.png', 'images/mone017.png', 'images/mone018.png'
    ];

    var modelNames = [
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

    images.forEach(function(src, index) {
        var item = document.createElement('div');
        item.className = 'gallery-item';
        var img = document.createElement('img');
        img.src = src;
        img.alt = modelNames[index] || 'Mone Agency model portfolio image ' + (index + 1);
        img.loading = 'lazy';
        if (index < 3) img.fetchPriority = 'high';
        item.appendChild(img);
        gallery.appendChild(item);
    });

    var uploadZone = document.getElementById('uploadZone');
    var fileInput = document.getElementById('photos');
    var fileList = document.getElementById('fileList');
    var MAX_FILES = 10;
    var MAX_SIZE = 2 * 1024 * 1024;
    var uploadedFiles = [];

    if (uploadZone && fileInput) {
        uploadZone.addEventListener('click', function() { fileInput.click(); });

        uploadZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            uploadZone.style.backgroundColor = 'rgba(255, 0, 255, 0.08)';
        });

        uploadZone.addEventListener('dragleave', function() {
            uploadZone.style.backgroundColor = 'transparent';
        });

        uploadZone.addEventListener('drop', function(e) {
            e.preventDefault();
            uploadZone.style.backgroundColor = 'transparent';
            handleFiles(e.dataTransfer.files);
        });

        fileInput.addEventListener('change', function(e) {
            handleFiles(e.target.files);
        });
    }

    function handleFiles(files) {
        if (!fileList) return;
        var validFiles = [];
        var oversized = 0;

        for (var i = 0; i < files.length; i++) {
            if (files[i].size > MAX_SIZE) {
                oversized++;
            } else {
                validFiles.push(files[i]);
            }
        }

        if (uploadedFiles.length + validFiles.length > MAX_FILES) {
            alert('Maximum ' + MAX_FILES + ' photos allowed.');
            return;
        }

        for (var j = 0; j < validFiles.length; j++) {
            uploadedFiles.push(validFiles[j]);
        }

        renderFileList();
        syncFileInput();

        if (oversized > 0) {
            var err = document.createElement('p');
            err.textContent = oversized + ' file(s) exceeded 2MB limit and were not included.';
            err.style.cssText = 'font-size:0.7rem;letter-spacing:1px;color:var(--magenta);margin-top:8px;';
            fileList.appendChild(err);
        }
    }

    function renderFileList() {
        if (!fileList) return;
        fileList.innerHTML = '';
        if (uploadedFiles.length === 0) {
            var p = document.createElement('p');
            p.style.cssText = 'font-size:0.7rem;opacity:0.5;';
            p.textContent = 'No files selected.';
            fileList.appendChild(p);
            return;
        }
        for (var i = 0; i < uploadedFiles.length; i++) {
            var p = document.createElement('p');
            p.textContent = '\u2713 ' + uploadedFiles[i].name;
            p.style.cssText = 'font-size:0.7rem;letter-spacing:1px;opacity:0.8;margin:4px 0;';
            fileList.appendChild(p);
        }
    }

    function syncFileInput() {
        if (!fileInput) return;
        var dt = new DataTransfer();
        for (var i = 0; i < uploadedFiles.length; i++) {
            dt.items.add(uploadedFiles[i]);
        }
        fileInput.files = dt.files;
    }

    function resetFileInput() {
        uploadedFiles = [];
        renderFileList();
        if (fileInput) fileInput.value = '';
    }

    var GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzXr7kPFs7Cgx88H07qMz5m0XrQsYTJWtybZydEkNdI1AKqYhBF5vKGIwJPe_H65Ngi/exec';

    var modelForm = document.getElementById('modelForm');
    if (modelForm) {
        modelForm.addEventListener('submit', function(e) {
            e.preventDefault();

            var btn = this.querySelector('.btn-submit');
            if (btn) {
                btn.textContent = 'Submitting...';
                btn.disabled = true;
            }

            var formData = new FormData(this);

            for (var i = 0; i < uploadedFiles.length; i++) {
                formData.append('photos[]', uploadedFiles[i]);
            }

            var xhr = new XMLHttpRequest();
            xhr.open('POST', GOOGLE_APPS_SCRIPT_URL, true);

            xhr.onload = function() {
                if (btn) {
                    btn.textContent = 'Submit Application';
                    btn.disabled = false;
                }
                var successEl = document.createElement('div');
                successEl.style.cssText = 'text-align:center;padding:20px;margin-top:20px;border:1px solid rgba(255,0,255,0.3);background:rgba(255,0,255,0.05);';
                successEl.innerHTML = '<p style="color:var(--magenta);letter-spacing:1px;font-size:0.8rem;">Application submitted! We will be in touch shortly.</p>';
                modelForm.insertBefore(successEl, modelForm.querySelector('.btn-submit').nextSibling);
                modelForm.reset();
                resetFileInput();
                setTimeout(function() { if (successEl.parentNode) successEl.remove(); }, 8000);
            };

            xhr.onerror = function() {
                fallbackSubmit();
            };

            xhr.timeout = 15000;
            xhr.ontimeout = function() {
                fallbackSubmit();
            };

            try {
                xhr.send(formData);
            } catch(err) {
                fallbackSubmit();
            }
        });
    }

    function fallbackSubmit() {
        var btn = document.querySelector('.btn-submit');
        if (btn) {
            btn.textContent = 'Submit Application';
            btn.disabled = false;
        }
        var fallbackEl = document.createElement('div');
        fallbackEl.style.cssText = 'text-align:center;padding:20px;margin-top:20px;border:1px solid rgba(255,255,0,0.3);background:rgba(255,255,0,0.05);';
        fallbackEl.innerHTML = '<p style="color:var(--sand);letter-spacing:1px;font-size:0.8rem;">Could not submit automatically. Please email your application to <a href="mailto:mone.agency@mail.com" style="color:var(--magenta);">mone.agency@mail.com</a></p>';
        modelForm.insertBefore(fallbackEl, modelForm.querySelector('.btn-submit').nextSibling);
        setTimeout(function() { if (fallbackEl.parentNode) fallbackEl.remove(); }, 15000);
    }

    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            var target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    if (window.location.search.includes('applied=true')) {
        var successEl = document.createElement('div');
        successEl.style.cssText = 'position:fixed;top:100px;left:50%;transform:translateX(-50%);background:rgba(10,10,10,0.95);border:1px solid var(--magenta);padding:20px 40px;z-index:9999;text-align:center;';
        successEl.innerHTML = '<p style="color:var(--sand);letter-spacing:2px;font-size:0.8rem;">Application received. We will be in touch soon.</p>';
        document.body.appendChild(successEl);
        setTimeout(function() { successEl.remove(); }, 6000);
        window.history.replaceState({}, '', window.location.pathname);
    }
});
