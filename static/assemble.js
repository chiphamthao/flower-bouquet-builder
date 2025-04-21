function refreshPalette() {
  const types = ["focal", "secondary", "filler", "greens"];
  const $palette = $("#palette").empty();

  types.forEach((type) => {
    const sel = current_selections[type];
    if (sel) {
      const [name, flowerType, url] = sel;
      const $item = $(`
        <div class="flower-item" data-type="${flowerType}" data-name="${name}">
          <img src="${url}" alt="${name}"/>
        </div>
      `);
      $palette.append($item);

      // make palette item draggable
      $item.draggable({
        helper: "clone",
        revert: "invalid",
        opacity: 0.7,
        zIndex: 200,
      });
    }
  });
}

$(document).ready(function () {
  $("#canvas").css("position", "relative");
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
  if (typeof current_selections !== "undefined") {
    display_page(current_selections);
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

      if (current_selections[type]) {
        // Get the flower's type from the tuple (second element)
        const flowerType = current_selections[type][1];

        // Simply check if the flower type matches the key in current_selections
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

  $("#submit-theme").on("click", submitTheme);

  // 3) On Enter key inside the textarea…
  $("#color-theme").on("keypress", function (e) {
    if (e.which === 13) {
      e.preventDefault();
      submitTheme();
    }
  });

  function submitTheme() {
    const theme = $("#color-theme").val().trim();
    if (!theme) {
      return $(".theme-message")
        .text("Please enter a color theme.")
        .addClass("error")
        .removeClass("success");
    }
    $.ajax({
      url: "/save_theme",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ color_theme: theme }),
      success: function (resp) {
        current_selections = resp.current_selections;
        display_page(current_selections);
        $(".theme-message")
          .text("Color theme saved.")
          .addClass("success")
          .removeClass("error");
      },
      error: function () {
        $(".theme-message")
          .text("Error saving theme; try again.")
          .addClass("error")
          .removeClass("success");
      },
    });
  }

  // Make palette-items draggable into the new canvas
  $(".flower-sidebar .flower-item").draggable({
    helper: "clone",
    revert: "invalid",
    opacity: 0.7,
    zIndex: 200,
  });

  // Canvas droppable handler
  $("#canvas").droppable({
    // ui.helper.hide();
    accept: ".flower-item",
    drop: function (event, ui) {
      const $canvas = $(this),
        off = $canvas.offset(),
        x = ui.offset.left - off.left,
        y = ui.offset.top - off.top,
        $orig = ui.draggable.find("img");

      // 1) build the <img> element
      const aspect = $orig.height() / $orig.width(),
        initW = 250,
        initH = initW * aspect,
        $img = $("<img>", {
          src: $orig.attr("src"),
          alt: $orig.attr("alt"),
          class: "canvas-flower",
        }).css({
          position: "absolute",
          left: x + "px",
          top: y + "px",
          width: initW + "px",
          height: initH + "px",
        });

      // 2) append it and make it resizable (this wraps it in a .ui-wrapper)
      $canvas.append($img);
      $img.resizable({
        containment: "#canvas",
        aspectRatio: true,
        handles: "n, e, s, w, ne, nw, se, sw",
        autoHide: true,
      });

      // 3) grab its wrapper and make *that* draggable
      const $wrapper = $img.parent(); // this is the .ui-wrapper
      $wrapper.draggable({
        cancel: ".ui-resizable-handle, .ui-rotatable-handle",
        cursor: "move",
        containment: "#canvas"
      });
      // 4) insert your rotate handle *then* initialize the plugin on this wrapper
      // if ($.fn.rotatable) {
      //   $wrapper.append('<div class="ui-rotatable-handle"></div>');
      //   $wrapper.rotatable({ handle: ".ui-rotatable-handle" });
      // }
      // // immediately hides *both* resizable + rotatable handles:
      //  $wrapper.find(".ui-resizable-handle, .ui-rotatable-handle").hide();
    },
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
      if (response.current_selections) {
        current_selections = response.current_selections;
        display_page(current_selections);
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
        current_selections = response.current_selections; // Update the global variable
        display_page(current_selections);
      }
    },
    error: function (xhr, status, error) {
      console.error("Error clearing position:", error);
    },
  });
}

function display_page(current_selections) {
  const types = ["focal", "secondary", "filler", "greens"];
  $(".drop-zone").empty();
  console.log(current_selections["color_theme"]);
  // for each slot type, if we have data, inject its <img>
  for (let type of types) {
    if (current_selections[type]) {
      const $img = $("<img>", {
        src: current_selections[type][2],
        alt: current_selections[type][0],
        "data-type": current_selections[type][1],
      }).css({
        "max-width": "100%",
        "max-height": "100%",
        "object-fit": "contain",
      });

      // append into the matching zone
      $(`.drop-zone[data-type="${type}"]`).append($img);
    }
  }

  $("#color-theme").val(current_selections.color_theme || "");
  refreshPalette();
}

$(document).on("click", ".canvas-flower", function (e) {
  e.stopPropagation(); // don’t let parent handlers clear it immediately
  $(".canvas-flower").removeClass("selected");
  $(this).addClass("selected");
});

// 2) Click outside any flower to clear selection
$(document).on("click", "#canvas", function () {
  $(".canvas-flower").removeClass("selected");
});

// 3) Listen for the Delete key
$(document).on("keydown", function (e) {
  if (e.key === "Delete" || e.keyCode === 46 || e.keyCode === 8) {
    const $sel = $(".canvas-flower.selected");
    if ($sel.length) {
      $sel.remove();
    }
  }
});
