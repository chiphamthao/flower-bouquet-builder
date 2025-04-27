$(document).ready(function () {
  const canvasData = canvas_flowers;
  const $canvas = $("#canvas");

  $.each(canvasData, function (_, info) {
    const { left, top, width, height, rotation, src } = info;
    let angle;
    if (typeof rotation === "object" && rotation.degrees !== undefined) {
      angle = rotation.degrees;
    } else if (typeof rotation === "number") {
      angle =
        Math.abs(rotation) <= 2 * Math.PI
          ? rotation * (180 / Math.PI)
          : rotation;
    } else {
      angle = 0;
    }

    $("<img>")
      .attr("src", src)
      .css({
        position: "absolute",
        left: left + "px",
        top: top + "px",
        width: width + "px",
        height: height + "px",
        transform: "rotate(" + angle + "deg)",
        transformOrigin: "center center",
        pointerEvents: "none",
      })
      .appendTo($canvas);
  });

  const types = ["focal", "secondary", "filler", "greens"];
  const sels = current_selections;
  let correct = 0;
  $.each(types, function (_, type) {
    if (sels[type] && sels[type][1] === type) correct++;
  });
  console.log(correct);
  $("#score").text("Your score: " + correct + "/4");
});
