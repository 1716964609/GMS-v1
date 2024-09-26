    document.addEventListener('DOMContentLoaded', function() {
        // Global variables
        let currentListId = null;
        let currentTermId = null;

        // API base URL
        const API_BASE_URL = '/console/admin';

        // Utility function for making API calls
        async function apiCall(endpoint, method = 'GET', body = null) {
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
            };
            if (body) options.body = JSON.stringify(body);
            const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
            if (!response.ok) throw new Error('API call failed');
            return method === 'DELETE' ? null : response.json();
        }

        // Function to populate table
        function populateTable(tableBody, data, clickHandler) {
            tableBody.innerHTML = '';
            data.forEach(item => {
                const row = document.createElement('tr');
                const cell = document.createElement('td');
                cell.textContent = item.name || item.jpName || item.keyword;
                cell.addEventListener('click', () => clickHandler(item));
                row.appendChild(cell);
                tableBody.appendChild(row);
            });
        }

        // Load lists on page load
        async function loadLists() {
            const lists = await apiCall('/lists');
            const listTable = document.querySelector('.glossary-lists-content table tbody');
            populateTable(listTable, lists, selectList);
        }

        // Search functionality
        document.querySelector('.search-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            const keyword = document.getElementById('search-input').value;
            const results = await apiCall('/search', 'POST', { keyword });
            const searchResultsTable = document.querySelector('.search-results table tbody');
            populateTable(searchResultsTable, results, selectSearchResult);
        });

        // Select search result
        async function selectSearchResult(result) {
            const content = await apiCall('/list-term', 'POST', { listId: result.listId, termId: result.termId });
            selectList(content.list);
            selectTerm(content.term);
        }

        // Select list
        async function selectList(list) {
            currentListId = list.id;
            document.querySelector('.glossary-list-details-content textarea:nth-child(2)').value = list.name;
            document.querySelector('.glossary-list-details-content textarea:nth-child(4)').value = list.version;
            document.querySelector('.glossary-list-details-content textarea:nth-child(6)').value = list.content;

            const terms = await apiCall('/terms-in-list', 'POST', { listId: list.id });
            const termsTable = document.querySelector('.glossary-terms-content table tbody');
            populateTable(termsTable, terms, selectTerm);
        }

        // Select term
        async function selectTerm(term) {
            currentTermId = term.id;
            const termContent = await apiCall('/termContent', 'POST', { termId: term.id });
            document.querySelector('.glossary-term-details-content textarea:nth-child(2)').value = termContent.jpName;
            document.querySelector('.glossary-term-details-content textarea:nth-child(4)').value = termContent.enName;
            document.querySelector('.glossary-term-details-content textarea:nth-child(6)').value = termContent.version;
            document.querySelector('.glossary-term-details-content textarea:nth-child(8)').value = termContent.content;
        }

        // List CRUD operations
        document.querySelector('.glossary-lists-header button:nth-child(1)').addEventListener('click', createList);
        document.querySelector('.glossary-lists-header button:nth-child(2)').addEventListener('click', updateList);
        document.querySelector('.glossary-lists-header button:nth-child(3)').addEventListener('click', deleteList);

        async function createList() {
            const list = {
                name: document.querySelector('.glossary-list-details-content textarea:nth-child(2)').value,
                version: document.querySelector('.glossary-list-details-content textarea:nth-child(4)').value,
                content: document.querySelector('.glossary-list-details-content textarea:nth-child(6)').value
            };
            await apiCall('/list', 'POST', list);
            loadLists();
        }

        async function updateList() {
            if (!currentListId) {
                alert('Please select a list to update');
                return;
            }
            const list = {
                id: currentListId,
                name: document.querySelector('.glossary-list-details-content textarea:nth-child(2)').value,
                version: document.querySelector('.glossary-list-details-content textarea:nth-child(4)').value,
                content: document.querySelector('.glossary-list-details-content textarea:nth-child(6)').value
            };
            await apiCall('/list', 'POST', list);
            loadLists();
        }

        async function deleteList() {
            if (!currentListId) {
                alert('Please select a list to delete');
                return;
            }
            if (confirm('Are you sure you want to delete this list?')) {
                await apiCall('/list', 'DELETE', { listId: currentListId });
                loadLists();
            }
        }

        // Term CRUD operations
        document.querySelector('.glossary-terms-header button:nth-child(1)').addEventListener('click', createTerm);
        document.querySelector('.glossary-terms-header button:nth-child(2)').addEventListener('click', updateTerm);
        document.querySelector('.glossary-terms-header button:nth-child(3)').addEventListener('click', deleteTerm);

        async function createTerm() {
            if (!currentListId) {
                alert('Please select a list to add a term to');
                return;
            }
            const term = {
                listId: currentListId,
                jpName: document.querySelector('.glossary-term-details-content textarea:nth-child(2)').value,
                enName: document.querySelector('.glossary-term-details-content textarea:nth-child(4)').value,
                version: document.querySelector('.glossary-term-details-content textarea:nth-child(6)').value,
                content: document.querySelector('.glossary-term-details-content textarea:nth-child(8)').value
            };
            await apiCall('/term', 'POST', term);
            selectList({ id: currentListId });
        }

        async function updateTerm() {
            if (!currentTermId) {
                alert('Please select a term to update');
                return;
            }
            const term = {
                id: currentTermId,
                listId: currentListId,
                jpName: document.querySelector('.glossary-term-details-content textarea:nth-child(2)').value,
                enName: document.querySelector('.glossary-term-details-content textarea:nth-child(4)').value,
                version: document.querySelector('.glossary-term-details-content textarea:nth-child(6)').value,
                content: document.querySelector('.glossary-term-details-content textarea:nth-child(8)').value
            };
            await apiCall('/term', 'POST', term);
            selectList({ id: currentListId });
        }

        async function deleteTerm() {
            if (!currentTermId) {
                alert('Please select a term to delete');
                return;
            }
            if (confirm('Are you sure you want to delete this term?')) {
                await apiCall('/term', 'DELETE', { termId: currentTermId });
                selectList({ id: currentListId });
            }
        }

        // Initialize the page
        loadLists();
    });