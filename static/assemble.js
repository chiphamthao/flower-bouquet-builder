$(document).ready(function () {
  // Initialize draggable on flower items
  $(".flower-item").draggable({
    helper: "clone",
    revert: "invalid",
    cursor: "move",
    opacity: 0.6,
    zIndex: 100,
    start: function (event, ui) {
      $(this).addClass("dragging");
    },
    stop: function (event, ui) {
      $(this).removeClass("dragging");
    },
  });

  // Initialize droppable on drop zones
  $(".drop-zone").droppable({
    accept: ".flower-item",
    hoverClass: "drag-over",
    drop: function (event, ui) {
      const $dropZone = $(this);
      const $draggedItem = ui.draggable;
      const $originalImg = $draggedItem.find("img");
      const dropZoneType = $dropZone.data("type");
      const flowerName = $draggedItem.data("name");
      const originalFlowerType = $draggedItem.data("type");

      const $newImg = $("<img>", {
        src: $originalImg.attr("src"),
        alt: $originalImg.attr("alt"),
        "data-type": originalFlowerType,
      }).css({
        opacity: 0,
        "max-width": "100%",
        "max-height": "100%",
        "object-fit": "contain",
        transition: "opacity 0.3s ease",
      });

      // Clear existing content and add new image
      $dropZone.empty().append($newImg);

      // Trigger reflow and fade in
      setTimeout(() => {
        $newImg.css("opacity", 1);
      }, 50);

      // Save to server
      saveDroppedFlower({
        flowerType: originalFlowerType,
        flowerName: flowerName,
        imageURL: $originalImg.attr("src"),
        dropZoneType: dropZoneType,
      });
    },
  });

  // Right click to clear drop zones
  $(".drop-zone").on("contextmenu", function (e) {
    e.preventDefault();
    const $dropZone = $(this);
    const flowerType = $dropZone.data("type");

    // Fade out before removing
    const $img = $dropZone.find("img");
    if ($img.length) {
      $img.css({
        opacity: 0,
        transition: "opacity 0.3s ease",
      });
      setTimeout(() => {
        $dropZone.empty();
      }, 300);
    }

    // Clear on server
    clearDroppedFlower({
      flowerType: flowerType,
    });
  });

  // Initial display
  if (typeof current_flowers !== "undefined") {
    display_flowers(current_flowers);
  }

  // Add the bouquet checking functionality
  $("#check-bouquet").on("click", function () {
    const types = ["focal", "secondary", "filler", "greens"];
    let hasError = false;

    // Reset all check items
    $(".check-item").each(function () {
      $(this).removeClass("correct");
      $(this).find(".validation-indicator").removeClass("correct incorrect");
    });

    // Check each type
    types.forEach((type, index) => {
      const $checkItem = $(`.check-item:eq(${index})`);
      const $indicator = $checkItem.find(".validation-indicator");

      if (current_flowers[type]) {
        // Get the flower's type from the tuple (second element)
        const flowerType = current_flowers[type][1];

        // Simply check if the flower type matches the key in current_flowers
        if (type === flowerType) {
          $checkItem.addClass("correct");
          $indicator.addClass("correct");
        } else {
          $indicator.addClass("incorrect");
          hasError = true;
        }
      } else {
        $indicator.addClass("incorrect");
        hasError = true;
      }
    });

    // Show appropriate message
    const $message = $(".validation-message");
    $message.removeClass("show error success");

    setTimeout(() => {
      if (hasError) {
        $message
          .text("Please check your selections again!")
          .addClass("show error");
      } else {
        $message.text("Perfect!").addClass("show success");
      }
    }, 100);
  });
});

function saveDroppedFlower(data) {
  $.ajax({
    url: "/save_flower",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      flowerType: data.flowerType,
      flowerName: data.flowerName,
      imageURL: data.imageURL,
      dropZoneType: data.dropZoneType,
    }),
    success: function (response) {
      console.log("Flower saved successfully:", response);
      if (response.current_flowers) {
        current_flowers = response.current_flowers;
        display_flowers(current_flowers);
      }
    },
    error: function (xhr, status, error) {
      console.error("Error saving flower:", error);
    },
  });
}

function clearDroppedFlower(data) {
  $.ajax({
    url: "/clear_flower",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({ flowerType: data.flowerType }),
    success: function (response) {
      console.log("Position cleared successfully:", response);
      if (response.current_flowers) {
        current_flowers = response.current_flowers; // Update the global variable
        display_flowers(current_flowers);
      }
    },
    error: function (xhr, status, error) {
      console.error("Error clearing position:", error);
    },
  });
}

function display_flowers(flowers) {
  const types = ["focal", "secondary", "filler", "greens"];
  console.log(flowers);
  $(".drop-zone").empty();
  console.log("redisplaying.....");
  // for each slot type, if we have data, inject its <img>
  for (let type of types) {
    if (flowers[type]) {
      const $img = $("<img>", {
        src: flowers[type][2],
        alt: flowers[type][0],
        "data-type": flowers[type][1],
      }).css({
        "max-width": "100%",
        "max-height": "100%",
        "object-fit": "contain",
      });

      // append into the matching zone
      $(`.drop-zone[data-type="${type}"]`).append($img);
    }
  }
}
