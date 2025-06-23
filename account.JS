// База данных (localStorage)
let users = JSON.parse(localStorage.getItem('users')) || [];
let listings = JSON.parse(localStorage.getItem('listings')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Проверка авторизации
function checkAuth() {
  if (!currentUser) {
    window.location.href = 'index.html';
  } else {
    renderProfile();
    renderUserListings();
  }
}

// Отобразить профиль
function renderProfile() {
  document.getElementById('profileUsername').textContent = currentUser.username;
  document.getElementById('profileEmail').textContent = currentUser.email;
  document.getElementById('profileBio').value = currentUser.bio || '';
  const profileImage = document.getElementById('profileImage');
  if (currentUser.profileImage) {
    profileImage.src = currentUser.profileImage;
    profileImage.style.display = 'block';
  }
}

// Сохранить изменения профиля
function saveProfile() {
  const bio = document.getElementById('profileBio').value;
  const imageInput = document.getElementById('profileImageInput');
  const imageFile = imageInput.files[0];

  currentUser.bio = bio;

  if (imageFile) {
    const reader = new FileReader();
    reader.onload = function(e) {
      currentUser.profileImage = e.target.result;
      updateUserData();
      renderProfile();
    };
    reader.readAsDataURL(imageFile);
  } else {
    updateUserData();
    renderProfile();
  }
}

// Обновить данные пользователя
function updateUserData() {
  const userIndex = users.findIndex(user => user.email === currentUser.email);
  if (userIndex !== -1) {
    users[userIndex] = currentUser;
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }
}

// Удаление объявления
function deleteListing(id) {
  listings = listings.filter(listing => listing.id !== id);
  localStorage.setItem('listings', JSON.stringify(listings));
  renderUserListings();
}

// Отобразить объявления пользователя
function renderUserListings() {
  const listingsContainer = document.getElementById('userListings');
  listingsContainer.innerHTML = '';
  const userListings = listings.filter(listing => listing.user === currentUser.email);

  userListings.forEach(listing => {
    const card = document.createElement('div');
    card.className = 'listing-card';
    card.innerHTML = `
      <img src="${listing.image}" alt="${listing.title}">
      <h3>${listing.title}</h3>
      <p>${listing.description}</p>
      <p>Категория: ${listing.category}</p>
      <p>Адрес: ${listing.address}</p>
      <button class="delete-btn" onclick="deleteListing('${listing.id}')">×</button>
    `;
    listingsContainer.appendChild(card);
  });
}

// Выход
document.getElementById('logoutBtn').addEventListener('click', () => {
  currentUser = null;
  localStorage.removeItem('currentUser');
  window.location.href = 'index.html';
});

// Инициализация
checkAuth();