$(document).ready(function () {
    $("#focal1, #focal2, #focal3, #focal4, #focal5, #focal6, #secondary1, #secondary2, #secondary3, #secondary4, #secondary5, #secondary6").draggable({
        revert: "invalid",
        start: function (event, ui) {
            $(this).css("cursor", "move");
        },
        stop: function (event, ui) {
            $(this).css("cursor", "default");
        }
    });

    $("#drop-area-1").droppable({
        accept: "#focal1, #focal2, #focal3, #focal4, #focal5, #focal6",
        over: function (event, ui) {
            $(this).addClass("droppable-hover");
        },
        out: function (event, ui) {
            $(this).removeClass("droppable-hover");
        },
        drop: function (event, ui) {
            $(this).removeClass("droppable-hover");
            $(this).css("background-color", "lightgreen");
            ui.draggable.fadeOut();

            setTimeout(() => {
                $(this).css("background-color", "white");
            }, 500);

        }
    });

    $("#drop-area-2").droppable({
        accept: "#secondary1, #secondary2, #secondary3, #secondary4, #secondary5, #secondary6",
        over: function (event, ui) {
            $(this).addClass("droppable-hover");
        },
        out: function (event, ui) {
            $(this).removeClass("droppable-hover");
        },
        drop: function (event, ui) {
            $(this).removeClass("droppable-hover");
            $(this).css("background-color", "lightgreen");
            ui.draggable.fadeOut();

            setTimeout(() => {
                $(this).css("background-color", "white");
            }, 500);
        }
    });
});