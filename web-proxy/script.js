// משתני מערכת
let currentUrl = '';
const proxyFrame = document.getElementById('proxyFrame');
const urlInput = document.getElementById('urlInput');
const loading = document.getElementById('loading');

// היסטוריה
let history = [];
let historyIndex = -1;

// אתחול
document.addEventListener('DOMContentLoaded', () => {
    // אפשר טעינת URL בלחיצה על Enter
    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loadUrl();
        }
    });

    // מעקב אחרי טעינת iframe
    proxyFrame.addEventListener('load', () => {
        hideLoading();
        updateUrlBar();
    });
});

// טעינת URL
function loadUrl() {
    let url = urlInput.value.trim();
    
    if (!url) {
        alert('אנא הכנס כתובת אתר');
        return;
    }

    // הוספת https:// אם חסר
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }

    // בדיקת תקינות URL
    try {
        new URL(url);
    } catch (e) {
        alert('כתובת האתר לא תקינה');
        return;
    }

    showLoading();
    
    // שימוש בשירות proxy חיצוני
    const proxyUrl = getProxyUrl(url);
    
    proxyFrame.src = proxyUrl;
    currentUrl = url;
    
    // עדכון היסטוריה
    addToHistory(url);
}

// קבלת URL של proxy
function getProxyUrl(url) {
    // ניסיון מספר 1: AllOrigins (עובד טוב לרוב האתרים)
    return `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    
    // אפשרויות נוספות שניתן להחליף ביניהן:
    // return `https://corsproxy.io/?${encodeURIComponent(url)}`;
    // return `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`;
    // return `https://thingproxy.freeboard.io/fetch/${encodeURIComponent(url)}`;
}

// חזרה אחורה
function goBack() {
    if (historyIndex > 0) {
        historyIndex--;
        const url = history[historyIndex];
        urlInput.value = url;
        showLoading();
        proxyFrame.src = getProxyUrl(url);
        currentUrl = url;
    }
}

// קדימה
function goForward() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        const url = history[historyIndex];
        urlInput.value = url;
        showLoading();
        proxyFrame.src = getProxyUrl(url);
        currentUrl = url;
    }
}

// רענון עמוד
function refreshPage() {
    if (currentUrl) {
        showLoading();
        proxyFrame.src = getProxyUrl(currentUrl);
    }
}

// חזרה לבית
function goHome() {
    urlInput.value = '';
    proxyFrame.src = '';
    currentUrl = '';
    hideLoading();
}

// הוספה להיסטוריה
function addToHistory(url) {
    // הסרת כל ההיסטוריה קדימה אם עברנו אחורה
    if (historyIndex < history.length - 1) {
        history = history.slice(0, historyIndex + 1);
    }
    
    history.push(url);
    historyIndex = history.length - 1;
}

// עדכון שורת URL
function updateUrlBar() {
    try {
        // ניסיון לקבל את ה-URL הנוכחי מה-iframe
        if (proxyFrame.contentWindow && proxyFrame.contentWindow.location) {
            const frameUrl = proxyFrame.contentWindow.location.href;
            if (frameUrl && frameUrl !== 'about:blank') {
                urlInput.value = currentUrl;
            }
        }
    } catch (e) {
        // CORS מונע גישה - זה תקין
        urlInput.value = currentUrl;
    }
}

// הצגת טעינה
function showLoading() {
    loading.classList.add('active');
}

// הסתרת טעינה
function hideLoading() {
    loading.classList.remove('active');
}

// טיפול בשגיאות
proxyFrame.addEventListener('error', () => {
    hideLoading();
    alert('אירעה שגיאה בטעינת העמוד. נסה אתר אחר או רענן את העמוד.');
});

// מניעת בעיות CORS
proxyFrame.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation');
