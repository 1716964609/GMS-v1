document.addEventListener('DOMContentLoaded', function() {
        // Global variables
        let currentListId = null;
        let currentTermId = null;

        // API base URL
        const API_BASE_URL = '/console/admin';

        loadLists();

        // Attach event listeners for list buttons
        document.getElementById('create-list-btn').addEventListener('click', () => {
            clearListForm(); // Clear the list form
            showModal('list-modal');  // Show modal for creating a list
        });
        document.getElementById('update-list-btn').addEventListener('click', () => showModal('list-modal'));  // Show modal for updating a list

        // Attach event listeners for term buttons
        document.getElementById('create-term-btn').addEventListener('click', () => {
            clearTermForm(); // Clear the term form
            showModal('term-modal');  // Show modal for creating a term
        });
        document.getElementById('update-term-btn').addEventListener('click', () => showModal('term-modal'));  // Show modal for updating a term

        // Close modal when the close button is clicked
        document.getElementById('close-list').addEventListener('click', () => closeModal('list-modal'));  // Adjust as needed for the specific modal
        document.getElementById('close-term').addEventListener('click', () => closeModal('term-modal'));  // Adjust as needed for the specific modal

        // Initialize the buttons as disabled
        document.getElementById('update-list-btn').disabled = true;
        document.getElementById('update-term-btn').disabled = true;
        document.getElementById('delete-list-btn').disabled = true;
        document.getElementById('delete-term-btn').disabled = true;

        
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
            document.getElementById('list-for-term-id').value = lists[0].listId;
            document.getElementById('list-for-term-name').value =lists[0].listName;
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
            document.getElementById('list-id').value = content.list.listId;
            document.getElementById('list-name').value = content.list.listName;
            document.getElementById('list-description').value = content.list.description;
            document.getElementById('version-created-list').value = content.list.versionCreated;
            document.getElementById('version-now-list').value = content.list.versionNow;
            document.getElementById('version-abandoned-list').value = content.list.versionAbandoned;
            document.getElementById('update-list-btn').disabled = false;
            document.getElementById('delete-list-btn').disabled = false;

            // Populate term details
            document.querySelector('.glossary-term-details-content textarea:nth-child(2)').value = content.term.jpTerm; // JP Term Name
            document.querySelector('.glossary-term-details-content textarea:nth-child(4)').value = content.term.engTerm; // EN Term Name
            document.querySelector('.glossary-term-details-content textarea:nth-child(6)').value = content.term.versionNow; // Term Version
            document.querySelector('.glossary-term-details-content textarea:nth-child(8)').value = content.term.description; // Term Content
            document.querySelector('.glossary-term-details-content textarea:nth-child(10)').value = content.list.listName; // Term Content
            document.getElementById('term-id').value = content.term.termId; // Populate Term Id
            document.getElementById('jp-term').value = content.term.jpTerm; // Populate JP Term
            document.getElementById('eng-term').value = content.term.engTerm; // Populate EN Term
            document.getElementById('term-description').value = content.term.description; // Populate Description
            document.getElementById('version-created-term').value = term.versionCreated; // Populate Version Created
            document.getElementById('version-now-term').value = content.term.versionNow; // Populate Current Version
            document.getElementById('version-abandoned-term').value = content.term.versionAbandoned; // Populate Version Abandoned
            // populateListSelect;
            document.getElementById('list-for-term-id').value = list.listId;
            document.getElementById('list-for-term-name').value =list.listName;
            document.getElementById('update-term-btn').disabled = false;
            document.getElementById('delete-term-btn').disabled = false;


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
            document.getElementById('list-id').value = item.listId;
            document.getElementById('list-name').value = item.listName;
            document.getElementById('list-description').value = item.description;
            document.getElementById('version-created-list').value = item.versionCreated;
            document.getElementById('version-now-list').value = item.versionNow;
            document.getElementById('version-abandoned-list').value = item.versionAbandoned;
            document.getElementById('update-list-btn').disabled = false;
            document.getElementById('delete-list-btn').disabled = false;

            // Clear term details
            document.querySelector('.glossary-term-details-content textarea:nth-child(2)').value = ""; // JP Term Name
            document.querySelector('.glossary-term-details-content textarea:nth-child(4)').value = ""; // EN Term Name
            document.querySelector('.glossary-term-details-content textarea:nth-child(6)').value = ""; // Term Version
            document.querySelector('.glossary-term-details-content textarea:nth-child(8)').value = ""; // Term Content
            document.querySelector('.glossary-term-details-content textarea:nth-child(10)').value = ""; // Term Content
            document.getElementById('term-id').value = ""; // Clear Term Id
            document.getElementById('jp-term').value = ""; // Clear JP Term
            document.getElementById('eng-term').value = ""; // Clear EN Term
            document.getElementById('term-description').value = ""; // Clear Description
            document.getElementById('version-created-term').value = ""; // Clear Version Created
            document.getElementById('version-now-term').value = ""; // Clear Current Version
            document.getElementById('version-abandoned-term').value = ""; // Clear Version Abandoned

            document.getElementById('list-for-term-id').value = item.listId;
            document.getElementById('list-for-term-name').value =item.listName;

            document.getElementById('update-term-btn').disabled = true;
            document.getElementById('delete-term-btn').disabled = true;


            //add fetch terms and populate
            const terms = await apiCall('/terms-in-list', 'POST', { listId: item.listId });
            const termsTable = document.querySelector('.glossary-terms-content table tbody');
            termsTable.innerHTML = ''; // Clear previous terms
            terms.forEach(term => {
                term.listName = item.listName;
                term.listId = item.listId;
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
            document.getElementById('term-id').value = term.termId; // Populate Term Id
            document.getElementById('jp-term').value = term.jpTerm; // Populate JP Term
            document.getElementById('eng-term').value = term.engTerm; // Populate EN Term
            document.getElementById('term-description').value = term.description; // Populate Description
            document.getElementById('version-created-term').value = term.versionCreated; // Populate Version Created
            document.getElementById('version-now-term').value = term.versionNow; // Populate Current Version
            document.getElementById('version-abandoned-term').value = term.versionAbandoned; // Populate Version Abandoned
            // populateListSelect;
            document.getElementById('list-for-term-id').value = term.listId;
            document.getElementById('list-for-term-name').value =term.listName;
            document.getElementById('update-term-btn').disabled = false;
            document.getElementById('delete-term-btn').disabled = false;

        }

        // Function to show the modal
        function showModal(modalId) {
            document.getElementById(modalId).style.display = 'block'; // Show the modal
        }

        // Function to close the modal
        function closeModal(modalId) {
            document.getElementById(modalId).style.display = 'none'; // Hide the modal
        }

        // Close the modal if the user clicks anywhere outside of it
        window.onclick = function(event) {
            const listModal = document.getElementById('list-modal');
            const termModal = document.getElementById('term-modal');
            
            // Check if the clicked target is either modal
            if (event.target === listModal) {
                closeModal('list-modal');
            } else if (event.target === termModal) {
                closeModal('term-modal');
            }
        };

        function clearListForm(){
            document.getElementById('list-id').value = "";
            document.getElementById('list-name').value = "";
            document.getElementById('list-description').value = "";
            document.getElementById('version-created-list').value = "";
            document.getElementById('version-now-list').value = "";
            document.getElementById('version-abandoned-list').value = "";
            document.getElementById('update-list-btn').disabled = true;
            document.getElementById('delete-list-btn').disabled = true;
        }
        
        function clearTermForm(){
            document.getElementById('term-id').value = ""; // Clear Term Id
            document.getElementById('jp-term').value = ""; // Clear JP Term
            document.getElementById('eng-term').value = ""; // Clear EN Term
            document.getElementById('term-description').value = ""; // Clear Description
            document.getElementById('version-created-term').value = ""; // Clear Version Created
            document.getElementById('version-now-term').value = ""; // Clear Current Version
            document.getElementById('version-abandoned-term').value = ""; // Clear Version Abandoned
            document.getElementById('update-term-btn').disabled = true;
            document.getElementById('delete-term-btn').disabled = true;
        }


        // Attach event listener for the submit button of the list form
        document.getElementById('list-form').addEventListener('submit', async function(e) {
            e.preventDefault(); // Prevent default form submission

            const listData = {
                // The listId field is disabled, so use null if it's empty
                listId: document.getElementById('list-id').value ? parseInt(document.getElementById('list-id').value) : null,
                listName: document.getElementById('list-name').value,
                description: document.getElementById('list-description').value,
                versionCreated: parseInt(document.getElementById('version-created-list').value),
                versionNow: parseInt(document.getElementById('version-now-list').value),
                versionAbandoned: document.getElementById('version-abandoned-list').value ? parseInt(document.getElementById('version-abandoned-list').value) : null,
            };

            await apiCall('/list', 'POST', listData); // Make API call
            closeModal('list-modal'); // Close the modal after successful submission
            loadLists(); // Reload the lists to reflect changes
        });

        // Attach event listener for the submit button of the term form
        document.getElementById('term-form').addEventListener('submit', async function(e) {
            e.preventDefault(); // Prevent default form submission

            const termData = {
                jpTerm: document.getElementById('jp-term').value,
                engTerm: document.getElementById('eng-term').value,
                description: document.getElementById('term-description').value,
                versionCreated: parseInt(document.getElementById('version-created-term').value),
                versionNow: parseInt(document.getElementById('version-now-term').value),
                versionAbandoned: document.getElementById('version-abandoned-term').value ? parseInt(document.getElementById('version-abandoned-term').value) : null,
                list: {
                    listId: parseInt(document.getElementById('list-id').value),
                    listName: document.getElementById('list-name').value,
                    description: document.getElementById('list-description').value,
                    versionCreated: parseInt(document.getElementById('version-created-list').value),
                    versionNow: parseInt(document.getElementById('version-now-list').value),
                    versionAbandoned: document.getElementById('version-abandoned-list').value ? parseInt(document.getElementById('version-abandoned-list').value) : null,
                },
            };

            await apiCall('/term', 'POST', termData); // Make API call
            closeModal('term-modal'); // Close the modal after successful submission
            selectTerm(termData);
        });


    });