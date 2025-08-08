// /res/register.js

document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const username = document.getElementById('username')?.value?.trim();
  const password = document.getElementById('password')?.value;
  const name = document.getElementById('name')?.value?.trim();
  const errorMsg = document.getElementById('errorMsg');
  
  if (!username || !password || !name) {
    errorMsg.textContent = 'All fields are required.';
    errorMsg.classList.remove('hidden');
    return;
  }
  
  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, name }),
    });
    
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('auth', 'true');
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/'; // Redirect to home or dashboard
    } else {
      const error = await res.json();
      errorMsg.textContent = error.message || 'Registration failed.';
      errorMsg.classList.remove('hidden');
    }
  } catch (err) {
    console.log(err)
    errorMsg.textContent = 'Something went wrong.';
    errorMsg.classList.remove('hidden');
  }
});