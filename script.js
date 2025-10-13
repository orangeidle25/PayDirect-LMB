document.addEventListener('DOMContentLoaded', () => {
    // Get all the elements we need to work with
    const bankItems = document.querySelectorAll('.bank-item');
    const modalOverlay = document.getElementById('popup-modal');
    const closeModalButton = document.getElementById('close-modal');
    const modalBankLink = document.getElementById('modal-bank-link');
    const modalTitle = document.getElementById('modal-title');

    // Function to open the modal
    const openModal = (bankName, bankLink) => {
        // Update the modal's content with the specific bank's info
        modalTitle.textContent = `Instructions for ${bankName}`;
        modalBankLink.href = bankLink;
        
        // Show the modal with a smooth transition
        modalOverlay.style.display = 'flex';
        setTimeout(() => {
            modalOverlay.classList.add('active');
        }, 10); // A small delay ensures the transition plays
    };

    // Function to close the modal
    const closeModal = () => {
        modalOverlay.classList.remove('active');
        // Wait for the transition to finish before hiding the element
        setTimeout(() => {
            modalOverlay.style.display = 'none';
        }, 300); // This duration should match the CSS transition time
    };

    // Add a click event listener to each bank item
    bankItems.forEach(item => {
        item.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent the link from navigating

            // Get the bank's name and link from the data attributes
            const bankName = item.dataset.name;
            const bankLink = item.dataset.link;
            
            openModal(bankName, bankLink);
        });
    });

    // Add event listener to the close button
    closeModalButton.addEventListener('click', closeModal);

    // Add event listener to close the modal if the user clicks on the overlay
    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) {
            closeModal();
        }
    });
});