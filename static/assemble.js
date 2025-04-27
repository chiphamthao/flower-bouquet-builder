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

  $palette.append(
    $(`<div class="flower-item" data-type="Wrapping Paper" data-name="Wrapping Paper">
    <img src="static/images/wrap_paper.png" alt="Wrapping Paper"/>
  </div>`).draggable({
      helper: "clone",
      revert: "invalid",
      opacity: 0.7,
      zIndex: 200,
    })
  );
}

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

function addCanvasFlower(info) {
  const { id, src, left, top, width, height, rotation = 0 } = info;
  const $canvas = $("#canvas");

  // 1) Outer wrapper for dragging
  const $dragWrapper = $("<div>")
    .addClass("drag-wrapper")
    .css({
      position: "absolute",
      left: `${left}px`,
      top: `${top}px`,
    })
    .data("id", id)
    .appendTo($canvas);

  // 2) Inner wrapper for rotating and resizing
  const $rotateWrapper = $("<div>")
    .addClass("rotate-wrapper")
    .css({
      width: `${width}px`,
      height: `${height}px`,
      transformOrigin: "50% 50%",
    })
    .appendTo($dragWrapper);

  // 3) The flower image filling the inner wrapper
  const $img = $("<img>", { src, class: "canvas-flower" })
    .css({ width: "100%", height: "100%" })
    .appendTo($rotateWrapper);

  $rotateWrapper.resizable({
    aspectRatio: true,
    handles: "n,e,s,w,ne,nw,se,sw",
    stop: (e, ui) => {
      // 1) new size
      const { width: w, height: h } = ui.size;

      // 2) how far the inner wrapper moved
      const rel = $rotateWrapper.position(); // {left, top} relative to dragWrapper

      // 3) compute new outer wrapper coords
      const parentPos = $dragWrapper.position();
      const newLeft = parentPos.left + rel.left;
      const newTop = parentPos.top + rel.top;

      // 4) reset inner wrapper back to top-left of dragWrapper
      $rotateWrapper.css({
        width: `${w}px`,
        height: `${h}px`,
        top: `0px`,
        left: `0px`,
        transformOrigin: `${w / 2}px ${h / 2}px`,
      });

      // 5) move the dragWrapper to absorb that shift
      $dragWrapper.css({ left: `${newLeft}px`, top: `${newTop}px` });

      // 6) post the true position & size
      const lastAngle = $rotateWrapper.data("rotationObj")?.current || 0;
      postUpdate({
        id,
        src,
        left: newLeft,
        top: newTop,
        width: w,
        height: h,
        rotation: lastAngle,
      });
    },
  });

  // 5) Draggable on the outer wrapper
  $dragWrapper.draggable({
    containment: "#canvas",
    stop: (e, ui) => {
      const lastAngle = $rotateWrapper.data("rotationObj")?.current || 0;
      postUpdate({
        id,
        src,
        left: $dragWrapper.position().left,
        top: $dragWrapper.position().top,
        width: $rotateWrapper.width(),
        height: $rotateWrapper.height(),
        rotation: lastAngle,
      });
    },
  });

  // 6) Rotatable on the inner wrapper
  $rotateWrapper.rotatable({
    rotationCenterOffset: { top: height / 2, left: width / 2 },
    wheelRotate: false,
    stop: (e, ui) => {
      $rotateWrapper.data("rotationObj", ui.angle);
      postUpdate({
        id,
        src,
        left: $dragWrapper.position().left,
        top: $dragWrapper.position().top,
        width: $rotateWrapper.width(),
        height: $rotateWrapper.height(),
        rotation: ui.angle.current,
      });
    },
  });

  // 7) Restore saved state on load
  // position
  $dragWrapper.css({ left: `${left}px`, top: `${top}px` });
  // rotation
  const initAngle = typeof rotation === "object" ? rotation.current : rotation;
  $rotateWrapper.rotatable("angle", initAngle);
  // full CSS matrix (if any)
}

function postUpdate(data) {
  console.log("posting update", data);
  $.ajax({
    url: "/update_canvas",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify(data),
    success: function (response) {
      canvas_flowers = response.canvas_flowers;
    },
    error: function (xhr, status, error) {
      console.error("Error updating canvas:", error);
    },
  });
}

$(document).ready(function () {
  if (typeof current_selections !== "undefined") {
    display_page(current_selections);
  }
  if (typeof canvas_flowers !== "undefined") {
    console.log(canvas_flowers);
    canvas_flowers.forEach(addCanvasFlower);
  }

  $("#canvas").css("position", "relative");

  $(".drop-zone").droppable({
    accept: ".flower-item",
    hoverClass: "drag-over",
    drop: function (event, ui) {
      const $drop = $(this);
      const $orig = ui.draggable.find("img");
      const data = {
        flowerType: ui.draggable.data("type"),
        flowerName: ui.draggable.data("name"),
        imageURL: $orig.attr("src"),
        dropZoneType: $drop.data("type"),
      };
      $drop.empty().append(
        $("<img>", {
          src: data.imageURL,
          alt: data.flowerName,
          "data-type": data.flowerType,
        }).css({
          opacity: 0,
          "max-width": "100%",
          "max-height": "100%",
          "object-fit": "contain",
          transition: "opacity 0.3s ease",
        })
      );
      setTimeout(() => $drop.find("img").css("opacity", 1), 50);
      saveDroppedFlower(data);
    },
  });

  $("#canvas")
    .droppable({
      accept: ".flower-item",
      drop: (e, ui) => {
        const off = $("#canvas").offset();
        const left = ui.offset.left - off.left,
          top = ui.offset.top - off.top;
        const $orig = ui.draggable.find("img");
        const initW = 250,
          initH = initW * ($orig.height() / $orig.width());
        const id = "f-" + Date.now(),
          src = $orig.attr("src");

        addCanvasFlower({
          id,
          src,
          left,
          top,
          width: initW,
          height: initH,
          rotation: 0,
        });
        postUpdate({
          id,
          src,
          left,
          top,
          width: initW,
          height: initH,
          rotation: 0,
        });
      },
    })
    .css("position", "relative");

  $(".flower-item").draggable({
    helper: "clone",
    revert: "invalid",
    cursor: "move",
    opacity: 0.7,
    zIndex: 200,
  });

  $("#check-bouquet").on("click", function () {
    const types = ["focal", "secondary", "filler", "greens"];
    let hasError = false;
    $(".check-item").each(function (index) {
      const type = types[index];
      const $ind = $(this).find(".validation-indicator");
      $(this).removeClass("correct");
      $ind.removeClass("correct incorrect");
      if (current_selections[type] && current_selections[type][1] === type) {
        $(this).addClass("correct");
        $ind.addClass("correct");
      } else {
        $ind.addClass("incorrect");
        hasError = true;
      }
    });
    const $msg = $(".validation-message");
    $msg.removeClass("show error success");
    setTimeout(
      () =>
        $msg
          .text(hasError ? "Please check your selections again!" : "Perfect!")
          .addClass(`show ${hasError ? "error" : "success"}`),
      100
    );
  });

  $("#submit-theme").on("click", submitTheme);
  $("#color-theme").on("keypress", function (e) {
    if (e.which === 13) {
      e.preventDefault();
      submitTheme();
    }
  });

  $(".drop-zone").on("contextmenu", function (e) {
    e.preventDefault();
    const $drop = $(this);
    const type = $drop.data("type");
    const $img = $drop.find("img");
    if ($img.length) {
      $img.css({ opacity: 0, transition: "opacity 0.3s ease" });
      setTimeout(() => $drop.empty(), 300);
    }
    clearDroppedFlower({ flowerType: type });
  });

  $(document).on("keydown", function (e) {
    if (e.key === "Delete" || e.keyCode === 46 || e.keyCode === 8) {
      const $sel = $(".canvas-flower.selected");
      if ($sel.length) {
        const $wrap = $sel.closest(".drag-wrapper");
        const id = $wrap.data("id");
        if (!id) {
          console.warn("No ID on wrapper, skipping delete");
          return;
        }

        // 2) Remove from DOM
        $wrap.remove();
        $sel.remove();

        // 3) Tell server to delete
        $.ajax({
          url: "/delete_canvas", // or better: "/delete_canvas"
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify({ id, deleted: true }),
          success(response) {
            canvas_flowers = response.canvas_flowers;
            display_page(current_selections);
          },
          error(xhr, status, err) {
            console.error("Failed to delete canvas flower:", err);
          },
        });
      }
    }
  });

  $(document).on("click", ".canvas-flower", function (e) {
    e.stopPropagation();
    $(".drag-wrapper, .canvas-flower").removeClass("selected");
    $(this).addClass("selected").closest(".drag-wrapper").addClass("selected");
  });

  // clicking outside clears selection
  $(document).on("click", "#canvas", function () {
    $(".drag-wrapper, .canvas-flower").removeClass("selected");
  });
});
