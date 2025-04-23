document.addEventListener('DOMContentLoaded', function () {
    const dragItems = document.querySelectorAll('.greens-item');
    const dropZones = document.querySelectorAll('.drop-zone');
    const submitBtn = document.getElementById('checkAnswers');
    const feedback = document.getElementById('feedback');
    const resetBtn = document.getElementById('resetActivity');
    let draggedItem = null;

    // Drag-and-drop functionality
    dragItems.forEach(item => {
        item.addEventListener('dragstart', function () {
            draggedItem = item;
            setTimeout(() => item.style.opacity = 0.5, 0);
        });

        item.addEventListener('dragend', function () {
            setTimeout(() => {
                item.style.opacity = 1;
                draggedItem = null;
            }, 0);
        });
    });

    dropZones.forEach(zone => {
        zone.addEventListener('dragover', function (e) {
            e.preventDefault();
            zone.classList.add('over');
        });

        zone.addEventListener('dragleave', function () {
            zone.classList.remove('over');
        });

        zone.addEventListener('drop', function (e) {
            e.preventDefault();
            if (draggedItem) {
                zone.appendChild(draggedItem);
                draggedItem.style.opacity = 1;
                zone.classList.remove('over');
            }
        });
    });

    // Submit button logic
    submitBtn.addEventListener('click', function () {
        let total = 0;
        let correct = 0;

        dragItems.forEach(item => item.style.border = 'none');

        dropZones.forEach(zone => {
            const expectedType = zone.getAttribute('data-type');
            const children = zone.querySelectorAll('.greens-item');

            children.forEach(item => {
                total++;
                const actualType = item.getAttribute('data-type');
                if (actualType === expectedType) {
                    correct++;
                    item.style.border = '3px solid green';
                } else {
                    item.style.border = '3px solid red';
                }
            });
        });

        if (correct === total && total > 0) {
            feedback.innerText = `✅ Correct! You got all ${correct} right!`;
            feedback.style.color = 'green';
        } else {
            feedback.innerText = `❌ Not quite, scroll back up to reread the information! (${correct} out of ${total} correct)`;
            feedback.style.color = 'red';
        }
    });

    // Reset button logic
    resetBtn.addEventListener('click', function () {
        feedback.innerText = '';
        dragItems.forEach(item => {
            item.style.border = 'none';
            document.querySelector('.greens-grid').appendChild(item);
        });
    });
});
