const mainImageInput = document.getElementById('mainImage');
const logoImageInput = document.getElementById('logoImage');
const logoSizeInput = document.getElementById('logoSize');
const logoPosInput = document.getElementById('logoPos');
const logoBgCheck = document.getElementById('logoBgCheck');
const logoBgColorInput = document.getElementById('logoBgColor');
const logoBgColorWrapper = document.getElementById('logoBgColorWrapper');
const logoBgPaddingInput = document.getElementById('logoBgPadding');
const logoBgPaddingWrapper = document.getElementById('logoBgPaddingWrapper');
const logoBgRadiusInput = document.getElementById('logoBgRadius');
const logoBgRadiusWrapper = document.getElementById('logoBgRadiusWrapper');

const downloadBtn = document.getElementById('downloadBtn');
const downloadAvifBtn = document.getElementById('downloadAvifBtn');
const canvas = document.getElementById('previewCanvas');
const ctx = canvas.getContext('2d');
const placeholder = document.getElementById('placeholder');

const tabUpload = document.getElementById('tabUpload');
const tabAI = document.getElementById('tabAI');
const panelUpload = document.getElementById('panelUpload');
const panelAI = document.getElementById('panelAI');
const apiKeyInput = document.getElementById('apiKeyInput');
const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
const aiPrompt = document.getElementById('aiPrompt');
const generateAiBtn = document.getElementById('generateAiBtn');
const aiStatus = document.getElementById('aiStatus');

const textLayersList = document.getElementById('textLayersList');
const addTextBtn = document.getElementById('addTextBtn');
const textLayerTemplate = document.getElementById('textLayerTemplate');

// Local storage for API Key
const savedKey = localStorage.getItem('gemini_api_key');
if (savedKey) apiKeyInput.value = savedKey;

// State variables
let mainImg = null;
let logoImg = null;

// Removed MAX_WIDTH to keep original resolution!

// Elements array to hold all interactive objects
let textLayers = [];
let layerCounter = 0;

let logoElement = { cx: null, cy: null, width: 0, height: 0, isDragging: false };
let startX = 0;
let startY = 0;

// Function to add a new text layer
function addTextLayer(defaultText = '', defaultColor = '#ffffff', defaultSize = 40) {
    const layerId = ++layerCounter;
    const clone = textLayerTemplate.content.cloneNode(true);
    const layerDiv = clone.querySelector('.text-layer');
    
    const textInput = layerDiv.querySelector('.layer-text');
    const colorInput = layerDiv.querySelector('.layer-color');
    const sizeInput = layerDiv.querySelector('.layer-size');
    const removeBtn = layerDiv.querySelector('.remove-layer-btn');
    const alignBtns = layerDiv.querySelectorAll('.align-btn');
    
    layerDiv.querySelector('.layer-title').innerText = `Yazı ${layerId}`;
    
    textInput.value = defaultText;
    colorInput.value = defaultColor;
    sizeInput.value = defaultSize;
    
    let currentAlign = 'center';

    const layerObj = {
        id: layerId,
        textInput,
        colorInput,
        sizeInput,
        align: currentAlign,
        cx: null,
        cy: null,
        x: null, // anchor X
        y: null, // top Y
        width: 0,
        height: 0,
        isDragging: false,
        element: layerDiv
    };
    
    // Listeners
    textInput.addEventListener('input', drawCanvas);
    colorInput.addEventListener('input', drawCanvas);
    sizeInput.addEventListener('input', drawCanvas);
    
    alignBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            alignBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            layerObj.align = btn.dataset.align;
            
            // Hizalama değiştiğinde aynı zamanda ekrana da hizala (snap)
            if (mainImg && canvas.width > 0) {
                if (layerObj.align === 'center') {
                    layerObj.x = canvas.width / 2;
                } else if (layerObj.align === 'left') {
                    layerObj.x = canvas.width * 0.05;
                } else if (layerObj.align === 'right') {
                    layerObj.x = canvas.width * 0.95;
                }
            }
            drawCanvas();
        });
    });
    
    removeBtn.addEventListener('click', () => {
        textLayers = textLayers.filter(l => l.id !== layerId);
        layerDiv.remove();
        drawCanvas();
    });
    
    textLayersList.appendChild(layerDiv);
    textLayers.push(layerObj);
    
    if (mainImg) drawCanvas();
}

// Initialize with two default text layers
addTextLayer('2026 SEO Trendleri', '#ffffff', 40);
addTextLayer('Yeni Nesil Stratejiler', '#eab308', 26);

addTextBtn.addEventListener('click', () => {
    addTextLayer();
});

logoSizeInput.addEventListener('input', drawCanvas);
logoBgColorInput.addEventListener('input', drawCanvas);
logoBgPaddingInput.addEventListener('input', drawCanvas);
logoBgRadiusInput.addEventListener('input', drawCanvas);

// Logo settings toggles
logoBgCheck.addEventListener('change', () => {
    if (logoBgCheck.checked) {
        logoBgColorWrapper.style.display = 'flex';
        logoBgPaddingWrapper.style.display = 'flex';
        logoBgRadiusWrapper.style.display = 'flex';
    } else {
        logoBgColorWrapper.style.display = 'none';
        logoBgPaddingWrapper.style.display = 'none';
        logoBgRadiusWrapper.style.display = 'none';
    }
    drawCanvas();
});

// Special listener for logo position to force snap to corner
logoPosInput.addEventListener('change', () => {
    logoElement.cx = null; // Reset to force recalculation
    logoElement.cy = null;
    drawCanvas();
});

// Tab listeners
tabUpload.addEventListener('click', () => {
    tabUpload.classList.add('active');
    tabAI.classList.remove('active');
    panelUpload.style.display = 'block';
    panelAI.style.display = 'none';
});

tabAI.addEventListener('click', () => {
    tabAI.classList.add('active');
    tabUpload.classList.remove('active');
    panelAI.style.display = 'block';
    panelUpload.style.display = 'none';
});

// API Logic
saveApiKeyBtn.addEventListener('click', () => {
    localStorage.setItem('gemini_api_key', apiKeyInput.value);
    saveApiKeyBtn.innerText = 'Kaydedildi!';
    setTimeout(() => saveApiKeyBtn.innerText = 'Kaydet', 2000);
});

generateAiBtn.addEventListener('click', async () => {
    const prompt = aiPrompt.value;
    const apiKey = apiKeyInput.value;
    
    if (!prompt || !apiKey) {
        aiStatus.innerText = 'Lütfen API Anahtarı ve Prompt giriniz.';
        return;
    }
    
    generateAiBtn.disabled = true;
    aiStatus.innerText = 'Görsel üretiliyor (Nano Banana), bu biraz sürebilir...';
    
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    imageConfig: {
                        aspectRatio: "16:9"
                    }
                }
            })
        });
        
        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        
        if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content || !data.candidates[0].content.parts) {
            throw new Error("Görsel üretilemedi.");
        }
        
        const imagePart = data.candidates[0].content.parts.find(p => p.inlineData);
        if (!imagePart) {
            throw new Error("Görsel verisi bulunamadı.");
        }
        
        const base64Image = imagePart.inlineData.data;
        const mimeType = imagePart.inlineData.mimeType || 'image/png';
        const imageUrl = `data:${mimeType};base64,${base64Image}`;
        
        const img = new Image();
        img.onload = () => {
            mainImg = img;
            placeholder.style.display = 'none';
            canvas.style.display = 'block';
            downloadBtn.disabled = false;
            downloadAvifBtn.disabled = false;
            
            // Original width and height
            canvas.width = img.width;
            canvas.height = img.height;
            
            resetPositions();
            drawCanvas();
            
            aiStatus.innerText = 'Görsel başarıyla üretildi!';
            setTimeout(() => aiStatus.innerText = '', 3000);
            generateAiBtn.disabled = false;
        };
        img.onerror = () => {
             aiStatus.innerText = 'Görsel yüklenirken hata oluştu.';
             generateAiBtn.disabled = false;
        };
        img.src = imageUrl;

    } catch (err) {
        aiStatus.innerText = 'Hata: ' + err.message;
        generateAiBtn.disabled = false;
    }
});

mainImageInput.addEventListener('change', handleMainImageUpload);
logoImageInput.addEventListener('change', handleLogoUpload);
downloadBtn.addEventListener('click', () => downloadImage('webp'));
downloadAvifBtn.addEventListener('click', () => downloadImage('avif'));

// Mouse events for canvas drag and drop
canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mouseup', handleMouseUp);
canvas.addEventListener('mouseout', handleMouseUp);

// Mobile touch support
canvas.addEventListener('touchstart', handleTouchStart, {passive: false});
canvas.addEventListener('touchmove', handleTouchMove, {passive: false});
canvas.addEventListener('touchend', handleMouseUp);

function resetPositions() {
    textLayers.forEach((layer, index) => {
        layer.x = null;
        layer.y = null;
    });
    logoElement.cx = null;
    logoElement.cy = null;
}

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX = e.clientX;
    let clientY = e.clientY;
    
    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    }

    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}

function isHit(el, x, y) {
    const padding = 10;
    
    // Logo (uses cx, cy)
    if (el === logoElement) {
        if (el.cx === null || el.cy === null) return false;
        const left = el.cx - (el.width / 2) - padding;
        const right = el.cx + (el.width / 2) + padding;
        const top = el.cy - (el.height / 2) - padding;
        const bottom = el.cy + (el.height / 2) + padding;
        return (x >= left && x <= right && y >= top && y <= bottom);
    }
    
    // Text layers (uses x, y based on alignment)
    if (el.x === null || el.y === null) return false;
    let left, right;
    if (el.align === 'center') {
        left = el.x - (el.width / 2) - padding;
        right = el.x + (el.width / 2) + padding;
    } else if (el.align === 'right') {
        left = el.x - el.width - padding;
        right = el.x + padding;
    } else {
        left = el.x - padding;
        right = el.x + el.width + padding;
    }
    const top = el.y - padding;
    const bottom = el.y + el.height + padding;
    
    return (x >= left && x <= right && y >= top && y <= bottom);
}

function handleMouseDown(e) {
    if (!mainImg) return;
    e.preventDefault();
    const pos = getMousePos(e);
    startX = pos.x;
    startY = pos.y;

    // Check collision in reverse order of rendering (top most first)
    // Logo is drawn last, so it's on top
    if (logoImg && isHit(logoElement, pos.x, pos.y)) {
        logoElement.isDragging = true;
        canvas.style.cursor = 'grabbing';
        return;
    }
    
    // Then texts
    for (let i = textLayers.length - 1; i >= 0; i--) {
        const layer = textLayers[i];
        if (layer.textInput.value && isHit(layer, pos.x, pos.y)) {
            layer.isDragging = true;
            canvas.style.cursor = 'grabbing';
            return;
        }
    }
}

function handleTouchStart(e) {
    if(e.touches.length === 1 && mainImg) {
        handleMouseDown(e);
    }
}

function handleMouseMove(e) {
    const isAnyDragging = logoElement.isDragging || textLayers.some(l => l.isDragging);
    
    if (!isAnyDragging) {
        if (!mainImg) return;
        const pos = getMousePos(e);
        let hovered = false;
        
        if (logoImg && isHit(logoElement, pos.x, pos.y)) hovered = true;
        if (!hovered) {
            for (let i = 0; i < textLayers.length; i++) {
                if (textLayers[i].textInput.value && isHit(textLayers[i], pos.x, pos.y)) {
                    hovered = true;
                    break;
                }
            }
        }
        
        canvas.style.cursor = hovered ? 'grab' : 'default';
        return;
    }
    
    e.preventDefault();
    const pos = getMousePos(e);
    const dx = pos.x - startX;
    const dy = pos.y - startY;

    if (logoElement.isDragging) { logoElement.cx += dx; logoElement.cy += dy; }
    textLayers.forEach(layer => {
        if (layer.isDragging) { layer.x += dx; layer.y += dy; }
    });

    startX = pos.x;
    startY = pos.y;
    drawCanvas();
}

function handleTouchMove(e) {
    if(e.touches.length === 1 && mainImg) {
        handleMouseMove(e);
    }
}

function handleMouseUp(e) {
    logoElement.isDragging = false;
    textLayers.forEach(l => l.isDragging = false);
    canvas.style.cursor = 'default';
}

function handleMainImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    e.target.nextElementSibling.innerText = file.name;

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            mainImg = img;
            placeholder.style.display = 'none';
            canvas.style.display = 'block';
            downloadBtn.disabled = false;
            downloadAvifBtn.disabled = false;
            
            // Use original dimensions, WordPress will handle resizing
            canvas.width = img.width;
            canvas.height = img.height;
            
            resetPositions();
            drawCanvas();
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    e.target.nextElementSibling.innerText = file.name;

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            logoImg = img;
            logoElement.cx = null; // Reset to force placement
            if (mainImg) drawCanvas();
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function wrapTextAndMeasure(context, text, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    const lines = [];
    let maxLineWidth = 0;

    for(let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        lines.push(line.trim());
        if (context.measureText(line.trim()).width > maxLineWidth) maxLineWidth = context.measureText(line.trim()).width;
        line = words[n] + ' ';
      }
      else {
        line = testLine;
      }
    }
    lines.push(line.trim());
    if (context.measureText(line.trim()).width > maxLineWidth) maxLineWidth = context.measureText(line.trim()).width;

    return { lines, width: maxLineWidth, height: lines.length * lineHeight };
}

// Function to draw rounded rectangle for logo background
function fillRoundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
}

function drawCanvas() {
    if (!mainImg) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw main image (NO DARK OVERLAY ANYMORE!)
    ctx.drawImage(mainImg, 0, 0, canvas.width, canvas.height);

    // DRAW TEXT LAYERS
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';

    textLayers.forEach((layer, index) => {
        const text = layer.textInput.value;
        if (!text) {
            layer.width = 0;
            layer.height = 0;
            return;
        }

        // Relative scaling
        const sizeMultiplier = layer.sizeInput.value / 40; 
        const fontSize = Math.max(Math.floor(canvas.width * 0.08 * sizeMultiplier), 16); 
        
        ctx.font = `900 ${fontSize}px 'Inter', sans-serif`;
        ctx.fillStyle = layer.colorInput.value;
        
        ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;

        const maxTextWidth = canvas.width * 0.9;
        const lineHeight = fontSize * 1.2;
        
        const measured = wrapTextAndMeasure(ctx, text, maxTextWidth, lineHeight);
        layer.width = measured.width;
        layer.height = measured.height;

        // Initial Placement
        if (layer.x === null) {
            if (layer.align === 'center') layer.x = canvas.width / 2;
            else if (layer.align === 'left') layer.x = canvas.width * 0.05;
            else if (layer.align === 'right') layer.x = canvas.width * 0.95;
            
            layer.y = canvas.height * 0.15 + (index * canvas.height * 0.12);
        }

        // Calculate top left bounding box coords
        let startX;
        if (layer.align === 'center') {
            startX = layer.x - (layer.width / 2);
        } else if (layer.align === 'right') {
            startX = layer.x - layer.width;
        } else {
            startX = layer.x; // left
        }

        let currentY = layer.y;
        measured.lines.forEach(line => {
            const lineWidth = ctx.measureText(line).width;
            let offsetX = 0;
            if (layer.align === 'center') offsetX = (layer.width - lineWidth) / 2;
            else if (layer.align === 'right') offsetX = layer.width - lineWidth;
            // Left align needs no offset
            
            ctx.fillText(line, startX + offsetX, currentY);
            currentY += lineHeight;
        });
    });

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // --- DRAW LOGO ---
    if (logoImg) {
        const logoSizePct = logoSizeInput.value / 100;
        const maxLogoWidth = canvas.width * logoSizePct;
        const maxLogoHeight = canvas.height * logoSizePct * 1.5; 
        
        let ratio = maxLogoWidth / logoImg.width;
        let logoWidth = maxLogoWidth;
        let logoHeight = logoImg.height * ratio;

        if (logoHeight > maxLogoHeight) {
            ratio = maxLogoHeight / logoImg.height;
            logoHeight = maxLogoHeight;
            logoWidth = logoImg.width * ratio;
        }

        logoElement.width = logoWidth;
        logoElement.height = logoHeight;

        // Calculate bounds with padding if bg is enabled
        const hasBg = logoBgCheck.checked;
        const padding = hasBg ? (canvas.width * (logoBgPaddingInput.value / 1000)) : 0; // 0 to 5% padding
        
        const totalWidth = logoElement.width + (padding * 2);
        const totalHeight = logoElement.height + (padding * 2);

        // Initial Placement or Snap via Dropdown
        if (logoElement.cx === null) {
            const pos = logoPosInput.value;
            const margin = canvas.width * 0.04;
            
            if (pos === 'br') {
                logoElement.cx = canvas.width - (totalWidth/2) - margin;
                logoElement.cy = canvas.height - (totalHeight/2) - margin;
            } else if (pos === 'bl') {
                logoElement.cx = (totalWidth/2) + margin;
                logoElement.cy = canvas.height - (totalHeight/2) - margin;
            } else if (pos === 'tr') {
                logoElement.cx = canvas.width - (totalWidth/2) - margin;
                logoElement.cy = (totalHeight/2) + margin;
            } else if (pos === 'tl') {
                logoElement.cx = (totalWidth/2) + margin;
                logoElement.cy = (totalHeight/2) + margin;
            }
        }

        // Draw background if checked
        if (hasBg) {
            ctx.fillStyle = logoBgColorInput.value;
            const bgX = logoElement.cx - (totalWidth / 2);
            const bgY = logoElement.cy - (totalHeight / 2);
            const radius = Math.min(logoBgRadiusInput.value * 2, totalWidth/2, totalHeight/2);
            fillRoundRect(ctx, bgX, bgY, totalWidth, totalHeight, radius);
        }

        // Draw logo image
        const imgX = logoElement.cx - (logoElement.width / 2);
        const imgY = logoElement.cy - (logoElement.height / 2);
        ctx.drawImage(logoImg, imgX, imgY, logoElement.width, logoElement.height);
    }
}

function downloadImage(format) {
    if (!mainImg) return;
    
    let mimeType = format === 'avif' ? 'image/avif' : 'image/webp';
    let dataUrl = canvas.toDataURL(mimeType, 0.9);
    
    if (format === 'avif' && dataUrl.startsWith('data:image/png')) {
        alert("Tarayıcınız AVIF formatında dışa aktarmayı desteklemiyor. Otomatik olarak WEBP formatında indirilecek.");
        mimeType = 'image/webp';
        dataUrl = canvas.toDataURL(mimeType, 0.9);
        format = 'webp';
    }
    
    const link = document.createElement('a');
    link.download = `blog-gorseli-${Date.now()}.${format}`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Ensure fonts are loaded before calculating initial text boundaries to prevent alignment shifts
document.fonts.ready.then(() => {
    if (mainImg) drawCanvas();
});
