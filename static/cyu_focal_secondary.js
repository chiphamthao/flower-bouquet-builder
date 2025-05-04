const focalIds = ["#focal1", "#focal2", "#focal3", "#focal4", "#focal5", "#focal6"];
const secondaryIds = ["#secondary1", "#secondary2", "#secondary3", "#secondary4", "#secondary5", "#secondary6"];

function createDraggables(){
    $(focalIds.join(", ") + ", " + secondaryIds.join(", ")).draggable({
        revert: "invalid",
        start: function () {
            $(this).css("cursor", "move");
        },
        stop: function () {
            $(this).css("cursor", "default");
        }
    });
}

function setupDropAreas(){
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

            const dropTarget = $(this);
            const droppedItem = ui.draggable;

            dropTarget.append(droppedItem);

            saveProgress(dropTarget, droppedItem);

            droppedItem.fadeOut(0, function () {
                droppedItem.remove();
            });

            setTimeout(() => {
                $(this).css("background-color", "white");
            }, 300);
        }
    });

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

            const dropTarget = $(this);
            const droppedItem = ui.draggable;

            dropTarget.append(droppedItem);

            saveProgress(dropTarget, droppedItem);

            droppedItem.fadeOut(0, function () {
                droppedItem.remove();
            });

            setTimeout(() => {
                $(this).css("background-color", "white");
            }, 300);
        }
    });
}


function saveProgress(dropTarget, dropped) {
    const parentId = dropTarget.attr("id");
    const droppedId = dropped.attr("id");

    let progress = {
        "drop-area-1": [],
        "drop-area-2": []
    };

    if (parentId && droppedId && progress.hasOwnProperty(parentId)) {
        progress[parentId].push(droppedId);
        console.log("Saved", droppedId, "into", parentId);
        console.log("Current contents of", parentId + ":", progress[parentId]);
    }

    console.log("Saving progress:", progress);

    $.ajax({
        url: "/save_progress",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify(progress),
        success: function (result) {
            console.log("Saved successfully:", result);
        },
        error: function (request, status, error) {
            console.error("Error saving progress:", request, status, error);
        }
    });
}

function loadProgress() {
    $.ajax({
        url: "/get_progress", // URL to fetch saved progress
        type: "GET",          // GET method to retrieve data
        dataType: "json",     // Expecting JSON response
        success: function (result) {
            if (!result || !result['drop-area-1'] || !result['drop-area-2']) {
                return; // Exit if data is not available
            }

            // Loop through each drop area and append elements
            for (const area in result) {
                result[area].forEach(id => {
                    const el = $("#" + id);
                    if (el.length) {
                        $("#" + area).append(el);
                        el.css({ top: "0px", left: "0px" }); // Reset position
                    }
                });
            }
        },
        error: function (request, status, error) {
            console.error("Error fetching progress data:", request, status, error);
        }
    });
}

$(document).ready(function () {
    createDraggables();
    setupDropAreas();

});