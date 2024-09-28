    document.addEventListener('DOMContentLoaded', function() {
        // Global variables
        let currentListId = null;
        let currentTermId = null;

        // API base URL
        const API_BASE_URL = '/console/admin';

        loadLists();
        
        // Search functionality
        document.querySelector('.search-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            const keyword = document.getElementById('search-input').value;
            if(keyword.length > 0){
                const results = await apiCall('/search', 'POST', { keyword });
                const searchResultsTable = document.querySelector('.search-results table tbody');
                populateSearchTable(searchResultsTable, results, selectSearchResult);
            }
        });

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
                cell.textContent = item.listName; // Display only the list name
                row.dataset.listName = item.listName;
                row.dataset.listId = item.listId; // Store the listId for later use
                row.dataset.description = item.description; // Store other attributes if needed
                row.dataset.versionCreated = item.versionCreated; // Example for other attributes
                row.dataset.versionNow = item.versionNow;
                row.dataset.versionAbandoned = item.versionAbandoned;
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

        // Function to populate table
        function populateSearchTable(tableBody, data, clickHandler) {
            tableBody.innerHTML = '';
            data.forEach(item => {
                const row = document.createElement('tr');
                const cell = document.createElement('td');
                cell.textContent = item.termName; // Display only the term name
                row.dataset.termName = item.termName;
                row.dataset.termId = item.termId; // Store the termId for later use
                row.dataset.listId = item.listId; // Store the listId for later use
                row.dataset.versionAbandoned = item.versionAbandoned;
                cell.addEventListener('click', () => clickHandler(item));
                row.appendChild(cell);
                tableBody.appendChild(row);
            });
        }
         // Select search result
        async function selectSearchResult(result) {
            const content = await apiCall('/list-term', 'POST', { listId: result.listId, termId: result.termId });

            // Populate list details
            document.querySelector('.glossary-list-details-content textarea:nth-child(2)').value = content.list.listName; // List name
            document.querySelector('.glossary-list-details-content textarea:nth-child(4)').value = content.list.versionNow; // Version
            document.querySelector('.glossary-list-details-content textarea:nth-child(6)').value = content.list.description; // Content

            // Populate term details
            document.querySelector('.glossary-term-details-content textarea:nth-child(2)').value = content.term.jpTerm; // JP Term Name
            document.querySelector('.glossary-term-details-content textarea:nth-child(4)').value = content.term.engTerm; // EN Term Name
            document.querySelector('.glossary-term-details-content textarea:nth-child(6)').value = content.term.versionNow; // Term Version
            document.querySelector('.glossary-term-details-content textarea:nth-child(8)').value = content.term.description; // Term Content
            document.querySelector('.glossary-term-details-content textarea:nth-child(10)').value = content.list.listName; // Term Content

            // Clear previous terms in the table
            const termsTable = document.querySelector('.glossary-terms-content table tbody');
            termsTable.innerHTML = '';
            const termRow = document.createElement('tr');
            const termCell = document.createElement('td');
            termCell.textContent = content.term.jpTerm; // Display JP Term Name
            termCell.dataset.jpTerm = content.term.jpTerm;
            termCell.dataset.termId = content.term.termId; // Store termId for later use
            termCell.dataset.engTerm = content.term.engTerm; // Store other attributes if needed
            termCell.dataset.versionNow = content.term.versionNow;
            termCell.dataset.versionCreated = content.term.versionCreated;
            termCell.dataset.versionAbandoned = content.term.versionAbandoned;
            termCell.dataset.description = content.term.description;
            
            termRow.appendChild(termCell);
            termsTable.appendChild(termRow);
        }

        // Select list
        async function selectList(item) {
            // Populate related text areas with data from the clicked row
            document.querySelector('.glossary-list-details-content textarea:nth-child(2)').value = item.listName; // List Name
            document.querySelector('.glossary-list-details-content textarea:nth-child(4)').value = item.versionNow; // Version Now
            document.querySelector('.glossary-list-details-content textarea:nth-child(6)').value = item.description; // Description

            //add fetch terms and populate
            const terms = await apiCall('/terms-in-list', 'POST', { listId: item.listId });
            const termsTable = document.querySelector('.glossary-terms-content table tbody');
            termsTable.innerHTML = ''; // Clear previous terms
            terms.forEach(term => {
                term.listName = item.listName;
                const termRow = document.createElement('tr');
                const termCell = document.createElement('td');
                termCell.textContent = term.jpTerm; // Display JP Term Name
                termRow.dataset.jpTerm = term.jpTerm;
                termRow.dataset.termId = term.termId; // Store termId for later use
                termRow.dataset.engTerm = term.engTerm; // Store other attributes if needed
                termRow.dataset.versionNow = term.versionNow;
                termRow.dataset.versionCreated = term.versionCreated;
                termRow.dataset.versionAbandoned = term.versionAbandoned;
                termRow.dataset.description = term.description;
                termRow.addEventListener('click', () => selectTerm(term)); // Add click event to select term
                termRow.appendChild(termCell);
                termsTable.appendChild(termRow);
            });
        }

        // Select term
        async function selectTerm(term) {
            // Populate text areas with attributes from the clicked term row
            document.querySelector('.glossary-term-details-content textarea:nth-child(2)').value = term.jpTerm; // JP Term Name
            document.querySelector('.glossary-term-details-content textarea:nth-child(4)').value = term.engTerm; // EN Term Name
            document.querySelector('.glossary-term-details-content textarea:nth-child(6)').value = term.versionNow; // Term Version
            document.querySelector('.glossary-term-details-content textarea:nth-child(8)').value = term.description; // Term Content
            document.querySelector('.glossary-term-details-content textarea:nth-child(10)').value = term.listName; // List Belonging
        }



    });

     // // List CRUD operations
        // document.querySelector('.glossary-lists-header button:nth-child(1)').addEventListener('click', createList);
        // document.querySelector('.glossary-lists-header button:nth-child(2)').addEventListener('click', updateList);
        // document.querySelector('.glossary-lists-header button:nth-child(3)').addEventListener('click', deleteList);

        // async function createList() {
        //     const list = {
        //         name: document.querySelector('.glossary-list-details-content textarea:nth-child(2)').value,
        //         version: document.querySelector('.glossary-list-details-content textarea:nth-child(4)').value,
        //         content: document.querySelector('.glossary-list-details-content textarea:nth-child(6)').value
        //     };
        //     await apiCall('/list', 'POST', list);
        //     loadLists();
        // }

        // async function updateList() {
        //     if (!currentListId) {
        //         alert('Please select a list to update');
        //         return;
        //     }
        //     const list = {
        //         id: currentListId,
        //         name: document.querySelector('.glossary-list-details-content textarea:nth-child(2)').value,
        //         version: document.querySelector('.glossary-list-details-content textarea:nth-child(4)').value,
        //         content: document.querySelector('.glossary-list-details-content textarea:nth-child(6)').value
        //     };
        //     await apiCall('/list', 'POST', list);
        //     loadLists();
        // }

        // async function deleteList() {
        //     if (!currentListId) {
        //         alert('Please select a list to delete');
        //         return;
        //     }
        //     if (confirm('Are you sure you want to delete this list?')) {
        //         await apiCall('/list', 'DELETE', { listId: currentListId });
        //         loadLists();
        //     }
        // }

        // // Term CRUD operations
        // document.querySelector('.glossary-terms-header button:nth-child(1)').addEventListener('click', createTerm);
        // document.querySelector('.glossary-terms-header button:nth-child(2)').addEventListener('click', updateTerm);
        // document.querySelector('.glossary-terms-header button:nth-child(3)').addEventListener('click', deleteTerm);

        // async function createTerm() {
        //     if (!currentListId) {
        //         alert('Please select a list to add a term to');
        //         return;
        //     }
        //     const term = {
        //         listId: currentListId,
        //         jpName: document.querySelector('.glossary-term-details-content textarea:nth-child(2)').value,
        //         enName: document.querySelector('.glossary-term-details-content textarea:nth-child(4)').value,
        //         version: document.querySelector('.glossary-term-details-content textarea:nth-child(6)').value,
        //         content: document.querySelector('.glossary-term-details-content textarea:nth-child(8)').value
        //     };
        //     await apiCall('/term', 'POST', term);
        //     selectList({ id: currentListId });
        // }

        // async function updateTerm() {
        //     if (!currentTermId) {
        //         alert('Please select a term to update');
        //         return;
        //     }
        //     const term = {
        //         id: currentTermId,
        //         listId: currentListId,
        //         jpName: document.querySelector('.glossary-term-details-content textarea:nth-child(2)').value,
        //         enName: document.querySelector('.glossary-term-details-content textarea:nth-child(4)').value,
        //         version: document.querySelector('.glossary-term-details-content textarea:nth-child(6)').value,
        //         content: document.querySelector('.glossary-term-details-content textarea:nth-child(8)').value
        //     };
        //     await apiCall('/term', 'POST', term);
        //     selectList({ id: currentListId });
        // }

        // async function deleteTerm() {
        //     if (!currentTermId) {
        //         alert('Please select a term to delete');
        //         return;
        //     }
        //     if (confirm('Are you sure you want to delete this term?')) {
        //         await apiCall('/term', 'DELETE', { termId: currentTermId });
        //         selectList({ id: currentListId });
        //     }
        // }