const isLoggedIn = localStorage.getItem('auth') === 'true';
const avatar = document.getElementById('avatar');
const menu = document.getElementById('profile-menu');
const userMenu = document.getElementById('user-profile-menu');
const nonUserMenu = document.getElementById('non-user-profile-menu');

avatar.addEventListener('click', () => {menu.classList.toggle('hidden')})

if (isLoggedIn) {
  nonUserMenu.style.display = 'none'
  try {
    const user = JSON.parse(localStorage.getItem('user'))
  } catch (e) {
  }
} else {
  userMenu.style.display = 'none'
}

(async () => {
  if (isLoggedIn) return;
  
  try {
    const res = await fetch('/api/me', {
      method: 'GET',
      credentials: 'include',
    });
    if (res.ok) {
      const data = await res.json();
      const user = data.me;
      if (user?.userId) {
        localStorage.setItem('auth', 'true');
        localStorage.setItem('user', JSON.stringify(user));
        alert('Please reload the page');
      } else {
        localStorage.setItem('auth', 'false');
      }
    } else {
      localStorage.setItem('auth', 'false');
    }
  } catch (err) {
    localStorage.setItem('auth', 'false');
  }
})();

