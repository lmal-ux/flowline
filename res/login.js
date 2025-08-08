const form = document.getElementById('loginForm');
const errorMsg = document.getElementById('errorMsg');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorMsg.classList.add('hidden'); // hide any previous error
  
  const username = form.username.value.trim();
  const password = form.password.value.trim();
  
  if (!username || !password) {
    errorMsg.textContent = 'Please fill in all fields.';
    errorMsg.classList.remove('hidden');
    return;
  }
  
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    });
    
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('auth', 'true');
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/'; // change this if you want to redirect elsewhere
    } else {
      errorMsg.textContent = 'Invalid username or password.';
      errorMsg.classList.remove('hidden');
    }
  } catch (err) {
    errorMsg.textContent = 'Login failed. Please try again.';
    errorMsg.classList.remove('hidden');
  }
});