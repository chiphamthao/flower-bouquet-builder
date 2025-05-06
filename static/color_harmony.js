document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("quizForm");
  const feedback = document.getElementById("feedback");
  const correctValue = "C";

  // Restore previous selection from session
  fetch("/get_mcq_color_harmony")
    .then((res) => res.json())
    .then((data) => {
      if (data.answer) {
        const selected = document.querySelector(`input[value="${data.answer}"]`);
        if (selected) {
          selected.checked = true;
          form.dispatchEvent(new Event("submit")); // auto-submit to show feedback
        }
      }
    });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const selected = document.querySelector('input[name="answer"]:checked');
    if (!selected) {
      feedback.textContent = "Please select an answer.";
      feedback.className = "feedback incorrect";
      return;
    }

    const answer = selected.value;

    // Save answer in session via server
    fetch("/save_mcq_color_harmony", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ answer }),
    });

    const radios = document.querySelectorAll('input[name="answer"]');
    radios.forEach((radio) => {
      const label = document.querySelector(`label[for="${radio.id}"]`);
      label.classList.add("disabled");
      radio.disabled = true;

      if (radio.value === correctValue) {
        label.classList.add("correct-answer");
      } else {
        label.classList.add("incorrect-answer");
      }
    });

    if (answer === correctValue) {
      feedback.textContent = "Correct! Pink and orange are analogous while purple is analogous-adjacent!";
      feedback.className = "feedback correct";
    } else {
      feedback.textContent = "Not quite! Pink and orange are analogous while purple is analogous-adjacent!";
      feedback.className = "feedback incorrect";
    }
  });
});
