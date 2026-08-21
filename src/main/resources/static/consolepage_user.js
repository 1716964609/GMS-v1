/* ============================================================
   PoC 用語管理系统 - 用户面板 (浏览专用) JS 修正版
   ============================================================ */

document.addEventListener('DOMContentLoaded', function() {
    const API_BASE_URL = '/console/admin';

    loadLists();

    // 搜索表单
    document.querySelector('.search-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        await searchKeyword();
    });

    async function searchKeyword() {
        const keyword = document.getElementById('search-input').value;
        const searchResultsTable = document.querySelector('.search-results table tbody');
        if (keyword.length > 0) {
            const results = await apiCall('/search', 'POST', { keyword });
            populateSearchTable(searchResultsTable, results, selectSearchResult);
        } else {
            searchResultsTable.innerHTML = '';
        }
    }

    /**
     * 关键修正：搜索结果点击逻辑
     * 不再调用 selectList (防止加载整个列表)，而是精准展示单条数据
     */
    async function selectSearchResult(result) {
        try {
            const content = await apiCall('/list-term', 'POST', { listId: result.listId, termId: result.termId });

            // 1. 填充第三列：数据集详情
            const listFields = document.querySelectorAll('.glossary-list-details-content textarea');
            listFields[0].value = content.list.listName;
            listFields[1].value = content.list.versionNow;
            listFields[2].value = content.list.description;

            // 2. 填充第四列：只显示选中的这个词汇 (重点修正)
            const termsTable = document.querySelector('.glossary-terms-content table tbody');
            termsTable.innerHTML = ''; // 清空列表
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.textContent = content.term.jpTerm;
            // 绑定点击事件，万一用户再点一次这个词也能显示详情
            cell.addEventListener('click', () => selectTerm(content.term, content.list.listName));
            row.appendChild(cell);
            termsTable.appendChild(row);

            // 3. 填充第五列：词汇详细解析
            selectTerm(content.term, content.list.listName);

        } catch (error) {
            console.error("加载详情失败:", error);
        }
    }

    /**
     * 点击左侧数据集时：加载整个数据集列表 (保留原有逻辑)
     */
    async function selectList(item) {
        const listFields = document.querySelectorAll('.glossary-list-details-content textarea');
        listFields[0].value = item.listName;
        listFields[1].value = item.versionNow;
        listFields[2].value = item.description;

        const termsTable = document.querySelector('.glossary-terms-content table tbody');
        termsTable.innerHTML = '<tr><td>ローディング...</td></tr>';

        const terms = await apiCall('/terms-in-list', 'POST', { listId: item.listId });
        termsTable.innerHTML = '';
        terms.forEach(term => {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.textContent = term.jpTerm;
            cell.addEventListener('click', () => selectTerm(term, item.listName));
            row.appendChild(cell);
            termsTable.appendChild(row);
        });
    }

    /**
     * 填充第五列详情
     */
    function selectTerm(term, listName) {
        const fields = document.querySelectorAll('.glossary-term-details-content textarea');
        fields[0].value = term.jpTerm;
        fields[1].value = term.engTerm;
        fields[2].value = term.versionNow;
        fields[3].value = term.description;
        fields[4].value = listName || "不明";
    }

    // 通用辅助函数
    async function apiCall(endpoint, method = 'GET', body = null) {
        const csrfResponse = await fetch("/csrf-token");
        const csrfData = await csrfResponse.json();
        const options = {
            method,
            headers: { 'Content-Type': 'application/json', [csrfData.headerName]: csrfData.token },
        };
        if (body) options.body = JSON.stringify(body);
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        return response.json();
    }

    async function loadLists() {
        const lists = await apiCall('/lists');
        const listTable = document.querySelector('.glossary-lists-content table tbody');
        populateTable(listTable, lists, selectList);
    }

    function populateTable(tableBody, data, clickHandler) {
        tableBody.innerHTML = '';
        data.forEach(item => {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.textContent = item.listName;
            cell.addEventListener('click', () => clickHandler(item));
            row.appendChild(cell);
            tableBody.appendChild(row);
        });
    }

    function populateSearchTable(tableBody, data, clickHandler) {
        tableBody.innerHTML = '';
        data.forEach(item => {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.textContent = item.termName;
            cell.addEventListener('click', () => clickHandler(item));
            row.appendChild(cell);
            tableBody.appendChild(row);
        });
    }

    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
});