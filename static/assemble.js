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
      const flowerType = $dropZone.data("type");
      const flowerName = $draggedItem.data("name");

      const $newImg = $("<img>", {
        src: $originalImg.attr("src"),
        alt: $originalImg.attr("alt"),
        "data-type": flowerType,
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
        flowerType: flowerType,
        flowerName: flowerName,
        imageUrl: $originalImg.attr("src"),
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
});

function saveDroppedFlower(data) {
  $.ajax({
    url: "/save_flower",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      flowerType: data.flowerType,
      flowerName: data.flowerName,
      imageUrl: data.imageUrl,
    }),
    success: function (response) {
      console.log("Flower saved successfully:", response);
      if (response.current_selections) {
        display_flowers(response.current_selections);
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
      if (response.current_selections) {
        display_flowers(response.current_selections);
      }
    },
    error: function (xhr, status, error) {
      console.error("Error clearing position:", error);
    },
  });
}

function display_flowers(flowers) {
  const types = ["focal", "secondary", "filler", "greens"];
  $(".drop-zone").empty();

  // for each slot type, if we have data, inject its <img>
  for (let type of types) {
    const info = flowers[type];
    if (info) {
      const $img = $("<img>", {
        src: "/static/images/" + info.toLowerCase() + ".png",
        alt: info,
        "data-type": type,
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
