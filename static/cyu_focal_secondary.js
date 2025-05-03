$(document).ready(function () {
    const focalIds = ["#focal1", "#focal2", "#focal3", "#focal4", "#focal5", "#focal6"];
    const secondaryIds = ["#secondary1", "#secondary2", "#secondary3", "#secondary4", "#secondary5", "#secondary6"];

    // Make all draggables draggable
    $(focalIds.join(", ") + ", " + secondaryIds.join(", ")).draggable({
        revert: "invalid",
        start: function () {
            $(this).css("cursor", "move");
        },
        stop: function () {
            $(this).css("cursor", "default");
        }
    });

    // Set up droppable for focal flowers
    $("#drop-area-1").droppable({
        accept: focalIds.join(", "),
        over: function () {
            $(this).addClass("droppable-hover");
        },
        out: function () {
            $(this).removeClass("droppable-hover");
        },
        drop: function (event, ui) {
            $(this).removeClass("droppable-hover");
            $(this).css("background-color", "lightgreen");

            const dropped = ui.draggable;

            // Position the dropped element absolutely
            $(this).append(dropped);
            dropped.css({
                position: "absolute",
                top: "0px",  // or set a specific top value based on your layout
                left: "0px", // or set a specific left value based on your layout
                zIndex: "10"  // ensure the image is on top of other elements if necessary
            });

            saveProgress();

            // Remove the dragged flower from the drag area
            dropped.fadeOut(300, function () {
                dropped.remove();  // Remove the element after fade out
            });

            setTimeout(() => {
                $(this).css("background-color", "white");
            }, 500);
        }
    });

    // Set up droppable for secondary flowers
    $("#drop-area-2").droppable({
        accept: secondaryIds.join(", "),
        over: function () {
            $(this).addClass("droppable-hover");
        },
        out: function () {
            $(this).removeClass("droppable-hover");
        },
        drop: function (event, ui) {
            $(this).removeClass("droppable-hover");
            $(this).css("background-color", "lightgreen");

            const dropped = ui.draggable;

            // Position the dropped element absolutely
            $(this).append(dropped);
            dropped.css({
                position: "absolute",
                top: "0px",  // or set a specific top value based on your layout
                left: "0px", // or set a specific left value based on your layout
                zIndex: "10"  // ensure the image is on top of other elements if necessary
            });

            saveProgress();

            // Remove the dragged flower from the drag area
            dropped.fadeOut(300, function () {
                dropped.remove();  // Remove the element after fade out
            });

            setTimeout(() => {
                $(this).css("background-color", "white");
            }, 500);
        }
    });

    // Save drop positions
    function saveProgress() {
        let progress = {
            "drop-area-1": [],
            "drop-area-2": []
        };

        $("#drop-area-1").children(".draggable").each(function () {
            progress["drop-area-1"].push(this.id);
        });

        $("#drop-area-2").children(".draggable").each(function () {
            progress["drop-area-2"].push(this.id);
        });

        sessionStorage.setItem("dragDropProgress", JSON.stringify(progress));
    }

    // Load saved positions on page load
    function loadProgress() {
        const saved = sessionStorage.getItem("dragDropProgress");
        if (!saved) return;

        const progress = JSON.parse(saved);

        for (const area in progress) {
            progress[area].forEach(id => {
                const el = $("#" + id);
                if (el.length) {
                    $("#" + area).append(el);
                    el.css({ top: "0px", left: "0px" }); // reset position
                }
            });
        }
    }

    loadProgress();
});