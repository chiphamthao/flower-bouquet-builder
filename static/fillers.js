let correctCount = 0;

$(document).ready(function () {
    $("#regular1, #regular2, #regular3, #regular4, #unique1, #unique2, #unique3, #unique4").draggable({
        revert: false, // ✅ allow manual revert
        start: function () {
            $(this).css("cursor", "move");
        },
        stop: function () {
            $(this).css("cursor", "default");
        }
    });

    function handleDrop(dropArea, acceptedIds) {
        $(dropArea).droppable({
            accept: "*",  // ✅ accept everything, handle logic manually
            over: function () {
                $(this).addClass("droppable-hover");
            },
            out: function () {
                $(this).removeClass("droppable-hover");
            },
            drop: function (event, ui) {
                $(this).removeClass("droppable-hover");
                const draggedId = "#" + ui.draggable.attr("id");

                if (acceptedIds.includes(draggedId)) {
                    $(this).css("background-color", "lightgreen");
                    correctCount++;
                    $("#score").text(`Score: ${correctCount}/8`);
                } else {
                    $(this).css("background-color", "lightcoral");
                }

                ui.draggable.fadeOut();

                setTimeout(() => {
                    $(this).css("background-color", "white");
                }, 500);
            }
        });
    }

    handleDrop("#drop-area-1", ["#regular1", "#regular2", "#regular3", "#regular4"]);
    handleDrop("#drop-area-2", ["#unique1", "#unique2", "#unique3", "#unique4"]);
});
