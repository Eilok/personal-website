// Listen for mouse wheel events
window.addEventListener("wheel", function(event) {
    // Determine whether the ctrl key is pressed
    if (event.ctrlKey) {
      // Block default behavior to prevent page scrolling
      event.preventDefault();
    }
  }, { passive: false });

window.addEventListener("resize", function () {
    if (window.innerWidth != originalWidth) {
      window.innerWidth = originalWidth;
    }
  });