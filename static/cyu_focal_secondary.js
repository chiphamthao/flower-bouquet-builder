const focalIds = ["#focal1", "#focal2", "#focal3", "#focal4", "#focal5", "#focal6"];
const secondaryIds = ["#secondary1", "#secondary2", "#secondary3", "#secondary4", "#secondary5", "#secondary6"];

let progress = {
    "drop-area-1": [],
    "drop-area-2": []
};

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

          //  dropTarget.append(droppedItem);

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
        url: "/get_progress",
        type: "GET",
        dataType: "json",
        success: function (result) {

            progress = result;

            const allIds = result['drop-area-1'].concat(result['drop-area-2']);
            const allSelectors = allIds.map(id => `#${id}`);

            // Hide all elements not in the result (i.e. dropped items)
            $(".draggable").each(function () {
                if (allSelectors.includes("#" + $(this).attr("id"))) {
                    $(this).remove();
                }
            });
        },
        error: function (request, status, error) {
            console.error("Error fetching progress data:", request, status, error);
        }
    });
}

function refreshDraggables(result) {

progress = {
    "drop-area-1": [],
    "drop-area-2": []
};
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

$(document).ready(function () {
    createDraggables();
    setupDropAreas();
    loadProgress();
});