const SUPABASE_URL = 'https://qeosajhauzqktnjvixha.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlb3NhamhhdXpxa3RuanZpeGhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MjMzMzUsImV4cCI6MjA2NTk5OTMzNX0.UIs2pXekSzPKjy3j_ez8oGIl5hcRdrWLs4BW8dNzJ6U';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


document.getElementById('signup-form').addEventListener('submit', async function (e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const messageDiv = document.getElementById('signup-message');

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    messageDiv.textContent = `Signup failed: ${error.message}`;
    messageDiv.style.color = "red";
  } else {
    // Get the user ID after signup
    const user = data.user;

    if (user) {
      // Insert empty balance record for the user
      const { error: insertError } = await supabase.from("balances").insert({
        user_id: user.id,
        balance_funds: 0
      });

      if (insertError) {
        console.error("Failed to insert balance row:", insertError.message);
      }
    }

    messageDiv.textContent = "Signup successful! Check your email to confirm.";
    messageDiv.style.color = "green";
  }
});
