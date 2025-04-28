$(document).ready(function () {
    // Make the draggable box draggable
    $("#focal1").draggable({
        revert: "invalid", // return if not dropped in correct place
        start: function (event, ui) {
            $(this).css("cursor", "move");
        },
        stop: function (event, ui) {
            $(this).css("cursor", "default");
        }
    });

    // Set up drop area 1 (correct drop zone)
    $("#drop-area-1").droppable({
        accept: "#focal1",
        over: function (event, ui) {
            $(this).addClass("droppable-hover");
        },
        out: function (event, ui) {
            $(this).removeClass("droppable-hover");
        },
        drop: function (event, ui) {
            $(this).removeClass("droppable-hover");
            $(this).css("background-color", "lightgreen");
            ui.draggable.fadeOut(); // Make the box disappear
        }
    });

    // Set up drop area 2 (incorrect drop zone)
    $("#drop-area-2").droppable({
        accept: "#focal1",
        over: function (event, ui) {
            $(this).addClass("droppable-hover");
        },
        out: function (event, ui) {
            $(this).removeClass("droppable-hover");
        },
        drop: function (event, ui) {
            $(this).removeClass("droppable-hover");
            $(this).css("background-color", "lightcoral"); // Wrong: turn red
            ui.draggable.draggable("option", "revert", true); // Snap back
        }
    });
});


    //turn box 1 into a draggable element
    //allow user to drag it to either drop area 1 or drop area 2
    //if box 1 == drop area 1 -> then drop area turns green and box 1 disappears
    //if box 1 != drop area 1 -> then drop area turns red and box 1 returns to its original place