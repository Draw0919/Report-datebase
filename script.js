document.addEventListener('DOMContentLoaded', () => {

    // === 1. 初始化 Firebase ===
    // ▼▼▼ 這裡應該是您真實的 firebaseConfig ▼▼▼
    const firebaseConfig = {
      apiKey: "AIza...YOUR...KEY",
      authDomain: "YOUR-PROJECT-ID.firebaseapp.com",
      projectId: "YOUR-PROJECT-ID",
      storageBucket: "YOUR-PROJECT-ID.appspot.com",
      messagingSenderId: "123456789",
      appId: "1:12345...web...67890"
    };
    // ▲▲▲ 這裡應該是您真實的 firebaseConfig ▲▲▲

    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    const templatesCol = db.collection('templates');

    // === 2. 獲取頁面元素 ===
    const searchBox = document.getElementById('searchBox');
    const resultsContainer = document.getElementById('resultsContainer');
    let templates = [];

    // === 3. 新增模板 (寫入 Firestore) ===
    const saveTemplateBtn = document.getElementById('saveTemplateBtn');
    const newTitle = document.getElementById('newTitle');
    const newKeywords = document.getElementById('newKeywords');
    const newContent = document.getElementById('newContent');
    const saveStatus = document.getElementById('saveStatus');

    saveTemplateBtn.addEventListener('click', async () => {
        const title = newTitle.value.trim();
        const keywordsStr = newKeywords.value.trim();
        const content = newContent.value.trim();

        if (!title || !keywordsStr || !content) {
            alert('標題、關鍵字和內容皆不可為空！');
            return;
        }
        
        const keywords = keywordsStr.split(',').map(k => k.trim());
        
        const newTemplateObject = {
            title: title,
            keywords: keywords,
            content: content
        };

        try {
            saveTemplateBtn.disabled = true;
            saveStatus.innerText = '儲存中...';

            const docRef = await templatesCol.add(newTemplateObject);
            
            saveStatus.innerText = `儲存成功! (ID: ${docRef.id})`;
            
            newTitle.value = '';
            newKeywords.value = '';
            newContent.value = '';
            
            templates.push(newTemplateObject);
            displayTemplates(templates); // 重新顯示

            setTimeout(() => { saveStatus.innerText = ''; }, 3000);

        } catch (error) {
            console.error("儲存失敗: ", error);
            saveStatus.innerText = '儲存失敗，請查看 Console。';
            alert('儲存失敗！');
        } finally {
            saveTemplateBtn.disabled = false;
        }
    });


    // === 4. 讀取模板 (從 Firestore 讀取) ===
    async function loadTemplatesFromFirestore() {
        try {
            const querySnapshot = await templatesCol.get();

            if (querySnapshot.empty) {
                resultsContainer.innerHTML = '<p>資料庫中尚無模板。請新增您的第一個模板！</p>';
                return;
            }

            templates = [];
            querySnapshot.forEach((doc) => {
                templates.push(doc.data());
            });

            displayTemplates(templates); // 顯示模板
            
            // ★★★ 新增：手動觸發 AOS 刷新 ★★★
            // 確保 AOS 能 "看到" 剛剛動態載入的卡片
            if (window.AOS) {
                AOS.refresh();
            }

        } catch (error) {
            console.error("讀取模板資料時發生錯誤:", error);
            resultsContainer.innerHTML = '<p class="error">無法載入模板資料庫。請檢查 Firebase 設定或 Console 錯誤。</p>';
        }
    }

    // === 5. 監聽搜尋框的輸入 ===
    searchBox.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            displayTemplates(templates); // 如果搜尋框為空，顯示所有模板
            return;
        }

        const filteredTemplates = templates.filter(template => {
            const titleMatch = template.title.toLowerCase().includes(searchTerm);
            const keywordMatch = Array.isArray(template.keywords) && template.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm));
            return titleMatch || keywordMatch;
        });

        displayTemplates(filteredTemplates); // 顯示篩選結果
        
        // ★★★ 新增：手動觸發 AOS 刷新 ★★★
        // 確保 AOS 能 "看到" 搜尋過濾後的卡片
        if (window.AOS) {
            AOS.refresh();
        }
    });

    // === 6. 負責將模板顯示在畫面上 ===
    function displayTemplates(templatesToDisplay) {
        if (templatesToDisplay.length === 0) {
            resultsContainer.innerHTML = '<p>找不到符合條件的模板。</p>';
            return;
        }

        resultsContainer.innerHTML = ''; // 清空舊結果
        
        templatesToDisplay.forEach(template => {
            const templateElement = document.createElement('div');
            templateElement.className = 'template-card';
            
            // ★★★ 新增：為卡片加上 AOS 動畫屬性 ★★★
            templateElement.setAttribute('data-aos', 'fade-up'); 
            
            const keywordsText = Array.isArray(template.keywords) ? template.keywords.join(', ') : '無';

            templateElement.innerHTML = `
                <h2>${template.title}</h2>
                <div class="keywords">
                    <strong>關鍵字:</strong> ${keywordsText}
                </div>
                <div class="content-wrapper">
                    <pre class="template-content">${template.content}</pre>
                </div>
                <button class="copy-btn">複製內容</button>
            `;
            
            resultsContainer.appendChild(templateElement);
        });

        // 為所有「複製內容」按鈕加上事件
        addCopyListeners();
    }

    // === 7. 複製「模板內容」功能的邏輯 (此功能不變) ===
    function addCopyListeners() {
        document.querySelectorAll('.copy-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const content = e.target.previousElementSibling.querySelector('.template-content').innerText;
                
                navigator.clipboard.writeText(content).then(() => {
                    e.target.innerText = '已複製!';
                    e.target.classList.add('copied');
                    setTimeout(() => {
                        e.target.innerText = '複製內容';
                        e.target.classList.remove('copied');
                    }, 1500);
                }).catch(err => {
                    console.error('複製失敗:', err);
                    alert('複製失敗，請手動選取。');
                });
            });
        });
    }

    // === 8. 程式進入點 ===
    loadTemplatesFromFirestore(); // 網頁載入時，自動從 Firebase 讀取資料

});