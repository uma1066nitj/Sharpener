const BASEURL = "http://localhost:3000/";

document.getElementById("loginform").addEventListener("submit", loginUser);

function loginUser(e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const user = { email, password };
  axios
    .post(`${BASEURL}user/login`, user)
    .then((res) => {
      if (res === 200) {
        console.log(user);
      } else {
        console.log("User Login Failed");
        throw new Error("Failed to login");
      }
    })
    .catch((err) => {
      document.body.innerHTML += `<div style="color:red;">${err} <div>`;
    });
}
