function login(event) {
  event.preventDefault();

  const emailInput = document.querySelector('input[name="email"]');
  const passwordInput = document.querySelector('input[name="password"]');

  const email = emailInput.value;
  const password = passwordInput.value;

  axios
    .post("http://localhost:3000/login", {
      email: email,
      password: password,
    })
    .then((response) => {
      console.log("Response data:", response.data); // Log the response data

      const token = response.data.token; // Assuming your API response contains a token
      localStorage.setItem("token", token); // Save token in localStorage
      alert(response.data.message);
      emailInput.value = "";
      passwordInput.value = "";
      window.location.href = "expense.html";
    })
    .catch((error) => {
      if (error.response) {
        if (error.response.status === 401) {
          alert("User not authorised");
        } else if (error.response.status === 404) {
          alert("User not Found");
        } else {
          alert("Error logging in");
        }
      } else {
        alert("Error logging in");
      }
      console.error("There was an error!", error);
    });
}
function showForgotPasswordForm() {
  const loginForm = document.getElementById("login-page");
  const forgotPasswordForm = document.getElementById("forgot-password-form");

  loginForm.style.display = "none"; // Hide login form
  forgotPasswordForm.style.display = "block"; // Show forgot password form
}

async function submitForgotPassword(event) {
  event.preventDefault();

  const emailInput = document.querySelector('input[name="forgot-email"]').value;

  try {
    const response = await axios.post(
      "http://localhost:3000/password/forgotpassword",
      {
        email: emailInput,
      }
    );
    alert(response.data.message);
  } catch (error) {
    console.error("Error sending forgot password request:", error);
    alert("Error sending forgot password request");
  }
}
