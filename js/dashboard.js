const SUPABASE_URL = 'https://qeosajhauzqktnjvixha.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlb3NhamhhdXpxa3RuanZpeGhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MjMzMzUsImV4cCI6MjA2NTk5OTMzNX0.UIs2pXekSzPKjy3j_ez8oGIl5hcRdrWLs4BW8dNzJ6U';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


let balance = 0;
let transactions = [];
let fds = [];

function updateUI() {
  console.log("🔄 Updating UI with:", { balance, transactions, fds });

  document.getElementById("total-balance").textContent = balance.toFixed(2);

  const tbody = document.getElementById("transaction-list");
  tbody.innerHTML = '';
  transactions.forEach(tx => {
    tbody.innerHTML += `<tr>
      <td>${tx.name}</td>
      <td>${new Date(tx.timestamp).toLocaleString()}</td>
      <td>${parseFloat(tx.amount).toFixed(2)}</td>
    </tr>`;
  });

  const fdList = document.getElementById("fd-list");
  fdList.innerHTML = '';
  fds.forEach(fd => {
    fdList.innerHTML += `<li>FD ₹${parseFloat(fd.amount).toFixed(2)} on ${new Date(fd.created_at).toLocaleDateString()}</li>`;
  });
}


function showTab(id) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.getElementById(id).classList.add('active');


  document.querySelectorAll('.nav-links a[data-tab]').forEach(a => {
    a.classList.toggle('active', a.dataset.tab === id);
  });
  window.location.hash = `#${id}`;
}

window.addEventListener("DOMContentLoaded", async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return (window.location.href = 'index.html');

  document.getElementById("user-email").textContent = `Logged in as: ${user.email}`;

    // 🧾 Fetch and pre-fill profile info
  const { data: profileData, error: profileError } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!profileData) {
    // Insert default profile if missing
    await supabase.from("user_profiles").insert({ user_id: user.id });
  }

  const form = document.getElementById("profile-form");
  const fields = ["display_name", "phone", "gender", "age", "dob", "address", "aadhaar", "pan"];

  // If values exist, populate them
  if (profileData) {
    fields.forEach(field => {
      const input = document.getElementById(field);
      if (input && profileData[field]) input.value = profileData[field];
    });

    // Prompt if empty fields (simulate force fill)
    const emptyFields = fields.filter(f => !profileData[f]);
    if (emptyFields.length > 0) {
      alert("⚠️ Please complete your profile information.");
    }
  }

  // 💾 Save button handler
  form?.addEventListener("submit", async e => {
    e.preventDefault();

    const updated = {};
    fields.forEach(f => {
      const el = document.getElementById(f);
      if (el?.value) updated[f] = el.value;
    });

    // 🔍 Show Profile Button logic
document.getElementById("show-profile-btn").addEventListener("click", async () => {
  const { data: userProfile, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error || !userProfile) {
    alert("❌ Failed to load profile.");
    return;
  }

  const displaySection = document.getElementById("profile-display");
  displaySection.innerHTML = `
    <div class="profile-summary">
      <div class="field"><strong>Name:</strong> ${userProfile.display_name}</div>
      <div class="field"><strong>Phone:</strong> ${userProfile.phone}</div>
      <div class="field"><strong>Gender:</strong> ${userProfile.gender}</div>
      <div class="field"><strong>Age:</strong> ${userProfile.age}</div>
      <div class="field"><strong>DOB:</strong> ${userProfile.dob}</div>
      <div class="field"><strong>Address:</strong> ${userProfile.address}</div>
      <div class="field"><strong>Aadhaar:</strong> ${userProfile.aadhaar}</div>
      <div class="field"><strong>PAN:</strong> ${userProfile.pan}</div>
      <div style="margin-top: 20px;">
        <button id="edit-profile-btn">✏️ Edit Profile</button>
      </div>
    </div>
  `;

  // ✅ Attach click handler after rendering button
  document.getElementById("edit-profile-btn").addEventListener("click", () => {
    document.getElementById("profile-display").classList.add("hidden");
    document.getElementById("profile-form-section").classList.remove("hidden");
  });

  document.getElementById("profile-form-section").classList.add("hidden");
  displaySection.classList.remove("hidden");
});


    // ✅ Aadhaar validation
const aadhaarInput = document.getElementById("aadhaar").value.trim();
const aadhaarRegex = /^\d{12}$/;
if (aadhaarInput && !aadhaarRegex.test(aadhaarInput)) {
  alert("❌ Invalid Aadhaar. Must be exactly 12 digits.");
  return;
}

// ✅ PAN validation
const panInput = document.getElementById("pan").value.trim();
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
if (panInput && !panRegex.test(panInput)) {
  alert("❌ Invalid PAN. Format must be like AAAAA1111A.");
  return;
}


    updated["updated_at"] = new Date().toISOString();

    const { error } = await supabase
      .from("user_profiles")
      .update(updated)
      .eq("user_id", user.id);

    if (!error) {
      alert("✅ Profile updated successfully.");
      document.getElementById("show-profile-btn").classList.remove("hidden"); // ✅ show button

    } else {
      console.error("Error updating profile", error);
      alert("❌ Failed to update profile.");
    }
  });

  const { data: bData } = await supabase
    .from("balances")
    .select("balance_funds")
    .eq("user_id", user.id)
    .single();
  balance = bData?.balance_funds || 0;

  const { data: txData } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("timestamp", { ascending: false });
  transactions = txData || [];

  const { data: fdData } = await supabase
    .from("fds")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  fds = fdData || [];

  updateUI();

  // 🌟 Load default tab from URL hash
  const defaultTab = location.hash.replace('#', '') || 'profile';
  showTab(defaultTab);

  document.querySelectorAll('.nav-links a[data-tab]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const tabId = a.dataset.tab;
      showTab(tabId);
    });
  });

  document.getElementById("add-funds-btn").addEventListener("click", async () => {
    const amt = parseFloat(prompt("Deposit amount:"));
    if (amt > 0) {
      balance += amt;
      await supabase.from("balances").upsert({ user_id: user.id, balance_funds: balance });
      await supabase.from("transactions").insert({ user_id: user.id, name: "Deposit", amount: amt });
      transactions.unshift({ name: "Deposit", amount: amt, timestamp: new Date().toISOString() });
      updateUI();
    }
  });

  document.getElementById("withdraw-funds-btn").addEventListener("click", async () => {
    const amt = parseFloat(prompt("Withdraw amount:"));
    if (amt > 0 && amt <= balance) {
      balance -= amt;
      await supabase.from("balances").upsert({ user_id: user.id, balance_funds: balance });
      await supabase.from("transactions").insert({ user_id: user.id, name: "Withdrawal", amount: -amt });
      transactions.unshift({ name: "Withdrawal", amount: -amt, timestamp: new Date().toISOString() });
      updateUI();
    } else {
      alert("Invalid or insufficient amount.");
    }
  });

  document.getElementById("create-fd-btn").addEventListener("click", async () => {
    const amt = parseFloat(prompt("FD Amount:"));
    if (amt > 0 && amt <= balance) {
      balance -= amt;
      await supabase.from("balances").upsert({ user_id: user.id, balance_funds: balance });
      const fdCreatedAt = new Date().toISOString();

await supabase.from("fds").insert({
  user_id: user.id,
  amount: amt,
  created_at: fdCreatedAt
});

fds.unshift({ amount: amt, created_at: fdCreatedAt });

// 💾 Log FD creation into transactions
await supabase.from("transactions").insert({
  user_id: user.id,
  name: "FD Created",
  amount: -amt,
  timestamp: fdCreatedAt
});

transactions.unshift({
  name: "FD Created",
  amount: -amt,
  timestamp: fdCreatedAt
});

updateUI();

      updateUI();
    }
  });

  document.getElementById("logout-button").addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "index.html";
  });
});
