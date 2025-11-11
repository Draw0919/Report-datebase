document.addEventListener('DOMContentLoaded', () => {
    // === 原有元素 ===
    const searchBox = document.getElementById('searchBox');
    const resultsContainer = document.getElementById('resultsContainer');
    let templates = []; // 用來儲存所有模板

    // === 1. 新增模板產生器元素 ===
    const generateBtn = document.getElementById('generateBtn');
    const newTitle = document.getElementById('newTitle');
    const newKeywords = document.getElementById('newKeywords');
    const newContent = document.getElementById('newContent');
    const outputContainer = document.getElementById('outputContainer');
    const jsonOutput = document.getElementById('jsonOutput');
    const copyJsonBtn = document.getElementById('copyJsonBtn');

    // === 2. 幫「產生 JSON」按鈕加上事件 ===
    generateBtn.addEventListener('click', () => {
        const title = newTitle.value.trim();
        const keywordsStr = newKeywords.value.trim();
        const content = newContent.value.trim();

        if (!title || !keywordsStr || !content) {
            alert('標題、關鍵字和內容皆不可為空！');
            return;
        }

        // 將逗號分隔的關鍵字字串，轉換為 JSON 陣列
        const keywords = keywordsStr.split(',').map(k => k.trim());
        
        const newTemplateObject = {
            title: title,
            keywords: keywords,
            content: content
        };
        
        // 格式化 JSON (null, 2 是為了排版好看)
        const jsonString = JSON.stringify(newTemplateObject, null, 2);
        
        jsonOutput.innerText = jsonString;
        outputContainer.classList.remove('hidden'); // 顯示結果區塊
    });

    // === 3. 幫「複製 JSON」按鈕加上事件 ===
    copyJsonBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(jsonOutput.innerText).then(() => {
            copyJsonBtn.innerText = '已複製!';
            copyJsonBtn.classList.add('copied');
            setTimeout(() => {
                copyJsonBtn.innerText = '複製 JSON';
                copyJsonBtn.classList.remove('copied');
            }, 1500);
        }).catch(err => {
            console.error('複製 JSON 失敗:', err);
            alert('複製失敗，請手動選取。');
        });
    });


    // === 4. 讀取模板 JSON 檔案 (原有功能) ===
    fetch('templates.json')
        .then(response => response.json())
        .then(data => {
            templates = data;
            displayTemplates(templates); // 初始顯示所有模板
        })
        .catch(error => {
            console.error('讀取模板資料時發生錯誤:', error);
            resultsContainer.innerHTML = '<p class="error">無法載入模板資料庫。</p>';
        });

    // === 5. 監聽搜尋框的輸入 (原有功能) ===
    searchBox.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            displayTemplates(templates); // 如果搜尋框為空，顯示所有模板
            return;
        }

        // 篩選模板
        const filteredTemplates = templates.filter(template => {
            const titleMatch = template.title.toLowerCase().includes(searchTerm);
            const keywordMatch = template.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm));
            return titleMatch || keywordMatch;
        });

        // 顯示篩選結果
        displayTemplates(filteredTemplates);
    });

    // === 6. 負責將模板顯示在畫面上 (原有功能) ===
    function displayTemplates(templatesToDisplay) {
        if (templatesToDisplay.length === 0) {
            resultsContainer.innerHTML = '<p>找不到符合條件的模板。</p>';
            return;
        }

        resultsContainer.innerHTML = ''; // 清空舊結果
        templatesToDisplay.forEach(template => {
            const templateElement = document.createElement('div');
            templateElement.className = 'template-card';
            
            templateElement.innerHTML = `
                <h2>${template.title}</h2>
                <div class="keywords">
                    <strong>關鍵字:</strong> ${template.keywords.join(', ')}
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

    // === 7. 複製「模板內容」功能的邏輯 (原有功能) ===
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
});