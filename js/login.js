// Replace these with your actual Supabase project credentials
const SUPABASE_URL = 'https://qeosajhauzqktnjvixha.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlb3NhamhhdXpxa3RuanZpeGhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MjMzMzUsImV4cCI6MjA2NTk5OTMzNX0.UIs2pXekSzPKjy3j_ez8oGIl5hcRdrWLs4BW8dNzJ6U';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


document.getElementById('login-form').addEventListener('submit', async function (e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const messageDiv = document.getElementById('login-message');

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    messageDiv.textContent = `Login failed: ${error.message}`;
    messageDiv.style.color = "red";
  } else if (data.user && data.session) {
    messageDiv.textContent = "Login successful! Redirecting...";
    messageDiv.style.color = "green";
    setTimeout(() => window.location.href = "dashboard.html", 1000);
  } else {
    messageDiv.textContent = "Login failed: Please confirm your email address.";
    messageDiv.style.color = "orange";
  }
});
