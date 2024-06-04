function signup(event) {
  event.preventDefault();

  const nameInput = document.querySelector('input[name="name"]');
  const emailInput = document.querySelector('input[name="email"]');
  const passwordInput = document.querySelector('input[name="password"]');

  const name = nameInput.value;
  const email = emailInput.value;
  const password = passwordInput.value;

  axios
    .post("http://localhost:3000/signup", {
      name: name,
      email: email,
      password: password,
    })
    .then((response) => {
      alert(response.data.message);
      nameInput.value = "";
      emailInput.value = "";
      passwordInput.value = "";
    })
    .catch((error) => {
      if (error.response && error.response.status === 409) {
        alert("User already exists");
      } else {
        alert("Error signing up");
      }
      console.error("There was an error!", error);
    });
}
