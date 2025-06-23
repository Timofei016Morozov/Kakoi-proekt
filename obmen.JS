// База данных (localStorage)
let users = JSON.parse(localStorage.getItem('users')) || [];
let listings = JSON.parse(localStorage.getItem('listings')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Генерация уникального ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Проверка авторизации
function checkAuth() {
  const addListingBtn = document.getElementById('addListingBtn');
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const accountBtn = document.getElementById('accountBtn');
  const searchInput = document.getElementById('searchInput');

  if (currentUser) {
    addListingBtn.style.display = 'block';
    loginBtn.style.display = 'none';
    registerBtn.style.display = 'none';
    logoutBtn.style.display = 'inline';
    accountBtn.style.display = 'inline';
  } else {
    addListingBtn.style.display = 'none';
    loginBtn.style.display = 'inline';
    registerBtn.style.display = 'inline';
    logoutBtn.style.display = 'none';
    accountBtn.style.display = 'none';
  }

  // Очищаем строку поиска при загрузке
  if (searchInput) {
    searchInput.value = '';
  }
}

// Регистрация
function register() {
  const username = document.getElementById('registerUsername').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const error = document.getElementById('registerError');

  if (!username || !email || !password) {
    error.style.display = 'block';
    error.textContent = 'Заполните все поля';
    return;
  }

  if (users.find(user => user.email === email)) {
    error.style.display = 'block';
    error.textContent = 'Email уже зарегистрирован';
    return;
  }

  users.push({ username, email, password, profileImage: '', bio: '' });
  localStorage.setItem('users', JSON.stringify(users));
  alert('Регистрация успешна! Теперь вы можете войти.');
  document.getElementById('registerModal').style.display = 'none';
}

// Вход
function login() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const error = document.getElementById('loginError');

  const user = users.find(user => user.email === email && user.password === password);
  if (user) {
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    checkAuth();
    document.getElementById('loginModal').style.display = 'none';
  } else {
    error.style.display = 'block';
    error.textContent = 'Неверный email или пароль';
  }
}

// Выход
document.getElementById('logoutBtn').addEventListener('click', () => {
  currentUser = null;
  localStorage.removeItem('currentUser');
  checkAuth();
  window.location.href = 'index.html';
});

// Добавить объявление
function addListing() {
  const title = document.getElementById('listingTitle').value;
  const description = document.getElementById('listingDescription').value;
  const category = document.getElementById('listingCategory').value;
  const address = document.getElementById('listingAddress').value;
  const imageInput = document.getElementById('listingImage');
  const imageFile = imageInput.files[0];

  if (!title || !description || !category || !address || !imageFile) {
    alert('Заполните все поля и выберите изображение');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const imageData = e.target.result;
    listings.push({ id: generateId(), title, description, category, address, image: imageData, user: currentUser.email });
    localStorage.setItem('listings', JSON.stringify(listings));
    document.getElementById('addListingModal').style.display = 'none';
    document.getElementById('imagePreview').style.display = 'none';
    renderListings();
  };
  reader.readAsDataURL(imageFile);
}

// Предпросмотр изображения
document.getElementById('listingImage').addEventListener('change', function(e) {
  const imagePreview = document.getElementById('imagePreview');
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      imagePreview.src = e.target.result;
      imagePreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
});

// Удаление объявления
function deleteListing(id) {
  listings = listings.filter(listing => listing.id !== id);
  localStorage.setItem('listings', JSON.stringify(listings));
  renderListings();
}

// Нормализованный поиск
function normalizeSearch(text) {
  return text.toLowerCase().trim().replace(/\s+/g, ' ');
}

// Отобразить объявления
function renderListings() {
  const listingsContainer = document.getElementById('listings');
  const search = normalizeSearch(document.getElementById('searchInput').value);
  const category = document.getElementById('categoryFilter').value;

  listingsContainer.innerHTML = '';
  const filteredListings = listings.filter(listing => {
    const title = normalizeSearch(listing.title);
    const description = normalizeSearch(listing.description);
    const categoryMatch = category === '' || listing.category === category;
    const searchMatch = !search || title.includes(search) || description.includes(search);
    return categoryMatch && searchMatch;
  });

  filteredListings.forEach(listing => {
    const card = document.createElement('div');
    card.className = 'listing-card';
    card.innerHTML = `
      <img src="${listing.image}" alt="${listing.title}">
      <h3>${listing.title}</h3>
      <p>${listing.description}</p>
      <p>Категория: ${listing.category}</p>
      <p>Адрес: ${listing.address}</p>
      <p>Пользователь: ${listing.user}</p>
      ${listing.user === currentUser?.email ? `<button class="delete-btn" onclick="deleteListing('${listing.id}')">×</button>` : ''}
    `;
    listingsContainer.appendChild(card);
  });
}

// Модальные окна
document.getElementById('loginBtn').addEventListener('click', () => {
  document.getElementById('loginModal').style.display = 'flex';
});

document.getElementById('registerBtn').addEventListener('click', () => {
  document.getElementById('registerModal').style.display = 'flex';
});

document.getElementById('addListingBtn').addEventListener('click', () => {
  document.getElementById('addListingModal').style.display = 'flex';
});

// Закрытие модальных окон при клике вне их
window.addEventListener('click', (e) => {
  if (e.target.className === 'modal') {
    e.target.style.display = 'none';
    document.getElementById('imagePreview').style.display = 'none';
  }
});

// Фильтр и поиск
document.getElementById('searchInput').addEventListener('input', renderListings);
document.getElementById('categoryFilter').addEventListener('change', renderListings);

// Инициализация
checkAuth();
renderListings();