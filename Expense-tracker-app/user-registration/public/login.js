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
      alert(response.data.message);
      emailInput.value = "";
      passwordInput.value = "";
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
