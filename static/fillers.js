let correctCount = 0;
let hiddenItems = [];

$(document).ready(function () {
    // Load saved progress
    $.get('/get_progress_fillers', function (data) {
        correctCount = data.correctCount;
        hiddenItems = data.hiddenItems;

        $("#score").text(`Score: ${correctCount}/8`);

        hiddenItems.forEach(id => {
            $("#" + id).hide();
        });
    });

    // Setup draggables
    $("#regular1, #regular2, #regular3, #regular4, #unique1, #unique2, #unique3, #unique4").draggable({
        revert: false,
        start: function () {
            $(this).css("cursor", "move");
        },
        stop: function () {
            $(this).css("cursor", "default");
        }
    });

    function saveProgress() {
        $.ajax({
            url: "/save_progress_fillers",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                correctCount: correctCount,
                hiddenItems: hiddenItems
            })
        });
    }

    function handleDrop(dropArea, acceptedIds) {
        $(dropArea).droppable({
            accept: "*",
            over: function () {
                $(this).addClass("droppable-hover");
            },
            out: function () {
                $(this).removeClass("droppable-hover");
            },
            drop: function (event, ui) {
                $(this).removeClass("droppable-hover");
                const draggedId = ui.draggable.attr("id");

                if (acceptedIds.includes("#" + draggedId)) {
                    $(this).css("background-color", "lightgreen");
                    correctCount++;
                    $("#score").text(`Score: ${correctCount}/8`);
                } else {
                    $(this).css("background-color", "lightcoral");
                }

                ui.draggable.fadeOut();
                hiddenItems.push(draggedId);
                saveProgress();

                setTimeout(() => {
                    $(this).css("background-color", "white");
                }, 500);
            }
        });
    }

    handleDrop("#drop-area-1", ["#regular1", "#regular2", "#regular3", "#regular4"]);
    handleDrop("#drop-area-2", ["#unique1", "#unique2", "#unique3", "#unique4"]);
});
