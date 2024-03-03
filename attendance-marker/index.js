document.addEventListener("DOMContentLoaded", function () {
  const markAttendanceBtn = document.getElementById("markAttendanceBtn");

  markAttendanceBtn.addEventListener("click", function (event) {
    event.preventDefault(); // Prevent form submission

    // Collect all present and absent values
    const presentStudents = document.querySelectorAll(
      'input[name][value="present"]:checked'
    );
    const absentStudents = document.querySelectorAll(
      'input[name][value="absent"]:checked'
    );

    // Display attendance results
    displayAttendanceResults(presentStudents, absentStudents);
  });

  function displayAttendanceResults(presentStudents, absentStudents) {
    const resultsDiv = document.getElementById("attendanceResults");

    // Clear previous results
    resultsDiv.innerHTML = "";

    // Display present students with a tick emoji
    if (presentStudents.length > 0) {
      const presentList = document.createElement("ul");
      presentList.innerHTML = "<h3>Present Students</h3>";
      presentStudents.forEach(function (student) {
        const listItem = document.createElement("li");
        listItem.textContent = student.id + " ✔️";
        presentList.appendChild(listItem);
      });
      resultsDiv.appendChild(presentList);
    } else {
      resultsDiv.innerHTML += "<p>No students marked as present.</p>";
    }

    // Display absent students with a cross emoji
    if (absentStudents.length > 0) {
      const absentList = document.createElement("ul");
      absentList.innerHTML = "<h3>Absent Students</h3>";
      absentStudents.forEach(function (student) {
        const listItem = document.createElement("li");
        listItem.textContent = student.id + " ❌";
        absentList.appendChild(listItem);
      });
      resultsDiv.appendChild(absentList);
    } else {
      resultsDiv.innerHTML += "<p>No students marked as absent.</p>";
    }
  }
});
