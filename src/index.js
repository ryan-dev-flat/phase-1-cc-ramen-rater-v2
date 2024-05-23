const API_URL = 'http://localhost:3000';

let ramens = [];

function fetchRamens() {
  return fetch(`${API_URL}/ramens`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch(error => {
      console.error('Failed to fetch ramens:', error);
      return []; // Return an empty array on error
    });
}

async function fetchRamen(id) {
  try {
    const response = await fetch(`${API_URL}/ramens/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch ramen with id ${id}:`, error);
    return null;
  }
}

function displayRamens() {
  const ramenMenu = document.querySelector('#ramen-menu');
  ramenMenu.innerHTML = ''; // Clear the menu before appending new images
  ramens.forEach(ramen => {
    const img = document.createElement('img');
    img.src = ramen.image;
    img.dataset.id = ramen.id.toString(); // Store the id for later use
    img.addEventListener('click', handleClick);
    ramenMenu.appendChild(img);

    // Add delete button for each ramen
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => deleteRamen(ramen));
    ramenMenu.appendChild(deleteButton);
  });
  // Display the details for the first ramen as soon as the page loads
  if (ramens.length > 0) {
    handleClick({ target: ramenMenu.querySelector('img') });
  }
}

function handleClick(event) {
  const ramen = ramens.find(ramen => ramen.id == event.target.dataset.id); // Use == instead of ===
  document.querySelector('#ramen-detail .detail-image').src = ramen.image;
  document.querySelector('#ramen-detail .name').textContent = ramen.name;
  document.querySelector('#ramen-detail .restaurant').textContent = ramen.restaurant;
  document.querySelector('#rating-display').textContent = ramen.rating;
  document.querySelector('#comment-display').textContent = ramen.comment;
}

function addSubmitListener() {
  document.querySelector('#new-ramen').addEventListener('submit', event => {
    event.preventDefault();
    
    const newRamen = {
      name: (event.target.elements.name.value),
      restaurant: (event.target.elements.restaurant.value),
      image: (`${event.target.elements.image.value}`), // Update the image path here
      rating: (event.target.elements.rating.value),
     comment: (event.target.elements.comment.value)  
    };
    fetch(`http://localhost:3000/ramens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newRamen),
    }).then(response => {
      if (!response.ok){
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
      .then(ramen => {
        ramens.push(ramen);
        const img = document.createElement('img');
        img.src = ramen.image; // The server should return the new ramen with an id and image path
        img.dataset.id = ramen.id.toString();
        img.addEventListener('click', handleClick);
        document.querySelector('#ramen-menu').appendChild(img);
      })
      .catch(error => console.error('Failed to create new ramen:', error));
  });

  document.querySelector('#edit-ramen').addEventListener('submit', event => {
    event.preventDefault();
    const currentRamen = ramens.find(ramen => ramen.id == document.querySelector('#ramen-detail .detail-image').dataset.id); // Use == instead of ===
    const updatedRamen = {
      name: String(currentRamen.name),
      restaurant: String(currentRamen.restaurant),
      image: String(currentRamen.image),
      rating: String(document.querySelector('#edit-rating').value),
      comment: String(document.querySelector('#edit-comment').value)
    };
    updateRamen(currentRamen, updatedRamen);
  });
}

function updateRamen(ramen, updatedRamen) {
  fetch(`${API_URL}/ramens/${ramen.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedRamen),
  }).then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
    .then(updatedRamenData => {
      // Update the ramen in the ramens array and the DOM
      const index = ramens.findIndex(r => r.id == ramen.id); // Use == instead of ===
      ramens[index] = updatedRamenData;
      handleClick({ target: document.querySelector(`#ramen-menu img[data-id="${ramen.id}"]`) });
    })
    .catch(error => console.error('Failed to update ramen:', error));
}

function deleteRamen(ramen) {
  // Remove the ramen from the ramen-menu div
  const img = document.querySelector(`#ramen-menu img[data-id="${ramen.id}"]`);
  img.remove();

  // Remove the ramen from the ramens array
  ramens = ramens.filter(r => r.id != ramen.id); // Use != instead of !==

  // If the deleted ramen is currently displayed, clear the details
  if (document.querySelector('#ramen-detail .detail-image').src == ramen.image) { // Use == instead of ===
    document.querySelector('#ramen-detail .detail-image').src = '';
    document.querySelector('#ramen-detail .name').textContent = '';
    document.querySelector('#ramen-detail .restaurant').textContent = '';
    document.querySelector('#rating-display').textContent = '';
    document.querySelector('#comment-display').textContent = '';
  }

  // Send a DELETE request to the server
  fetch(`${API_URL}/ramens/${ramen.id}`, {
    method: 'DELETE',
  }).catch(error => console.error('Failed to delete ramen:', error));
}

// Main 
function main() {
  fetchRamens().then(ramensData => {
    ramens = ramensData;
    displayRamens();
    addSubmitListener();
  });
}

// Main function after the DOM has fully loaded
document.addEventListener('DOMContentLoaded', main);
