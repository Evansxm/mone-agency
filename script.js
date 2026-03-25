document.addEventListener('DOMContentLoaded', function() {
    // 1. Gallery Generation
    const gallery = document.getElementById('gallery');
    const images = [
        'images/mone001.png', 'images/mone002.png', 'images/mone003.png',
        'images/mone004.png', 'images/mone005.png', 'images/mone006.png',
        'images/mone007.png', 'images/mone008.png', 'images/mone009.png',
        'images/mone010.png', 'images/mone011.png', 'images/mone012.png',
        'images/mone013.png', 'images/mone014.png', 'images/mone015.png'
    ];

    images.forEach(src => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        const img = document.createElement('img');
        img.src = src;
        img.alt = 'Mone Agency Portfolio';
        img.loading = 'lazy';
        item.appendChild(img);
        gallery.appendChild(item);
    });

    // 2. Upload Zone Logic
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('photos');
    const fileList = document.getElementById('fileList');
    const MAX_FILES = 10;
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB

    uploadZone.addEventListener('click', () => fileInput.click());

    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.style.backgroundColor = 'rgba(26, 26, 26, 0.05)';
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

    function handleFiles(files) {
        fileList.innerHTML = '';
        const validFiles = [];

        if (files.length > MAX_FILES) {
            alert(`Maximum ${MAX_FILES} photos allowed.`);
            return;
        }

        for (let i = 0; i < files.length; i++) {
            if (files[i].size > MAX_SIZE) {
                alert(`File ${files[i].name} exceeds 2MB limit.`);
                continue;
            }
            validFiles.push(files[i].name);
        }

        fileList.innerHTML = validFiles.length > 0 
            ? `Selected: ${validFiles.join(', ')}` 
            : 'No valid files selected.';
    }

    // 3. Form Submission Handling
    const modelForm = document.getElementById('modelForm');
    modelForm.addEventListener('submit', function(e) {
        const btn = this.querySelector('.btn-submit');
        btn.textContent = 'Processing...';
        btn.disabled = true;
        
        // Formspree handles the actual redirect/success
        // We just provide visual feedback
    });

    // 4. Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});
