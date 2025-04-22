document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("quizForm");
    const feedback = document.getElementById("feedback");
  
    const correctValue = "C";
  
    form.addEventListener("submit", function (e) {
      e.preventDefault();
  
      const selected = document.querySelector('input[name="answer"]:checked');
      if (!selected) {
        feedback.textContent = "Please select an answer.";
        feedback.className = "feedback incorrect";
        return;
      }
  
      const answer = selected.value;
  
      const radios = document.querySelectorAll('input[name="answer"]');
      radios.forEach((radio) => {
        const label = document.querySelector(`label[for="${radio.id}"]`);
  
        // Disable all options
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
  