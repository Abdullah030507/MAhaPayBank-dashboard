// signup.js

const SUPABASE_URL     = 'https://qeosajhauzqktnjvixha.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlb3NhamhhdXpxa3RuanZpeGhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MjMzMzUsImV4cCI6MjA2NTk5OTMzNX0.UIs2pXekSzPKjy3j_ez8oGIl5hcRdrWLs4BW8dNzJ6U';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.getElementById('signup-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email    = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const message  = document.getElementById('signup-message');

  // 1) signUp with explicit redirect override
  const { data, error } = await supabase.auth.signUp(
    { email, password },
    {
      options: {
        // force confirmation link to land on YOUR auth-callback.html
        emailRedirectTo:
          'https://abdullah030507.github.io/MAhaPayBank-dashboard/auth-callback.html'
      }
    }
  );

  if (error) {
    message.textContent = `Signup failed: ${error.message}`;
    message.style.color   = 'red';
    return;
  }

  // 2) after sign-up, create initial balance row
  const user = data.user;
  if (user) {
    const { error: insertError } = await supabase
      .from('balances')
      .insert({ user_id: user.id, balance_funds: 0 });

    if (insertError) {
      console.error('Failed to insert balance row:', insertError.message);
    }
  }

  // 3) inform the user
  message.textContent = '✅ Signup successful! Check your email to confirm.';
  message.style.color = 'green';
});
