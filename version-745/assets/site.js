function setMobileMenu() {
  var toggle = document.querySelector(".js-menu-toggle");
  var menu = document.querySelector(".js-mobile-menu");
  if (!toggle || !menu) {
    return;
  }
  var openIcon = toggle.querySelector(".menu-icon-open");
  var closeIcon = toggle.querySelector(".menu-icon-close");
  toggle.addEventListener("click", function() {
    var isOpen = menu.classList.toggle("hidden") === false;
    toggle.setAttribute("aria-expanded", String(isOpen));
    if (openIcon && closeIcon) {
      openIcon.classList.toggle("hidden", isOpen);
      closeIcon.classList.toggle("hidden", !isOpen);
    }
  });
}

function setHeroCarousel() {
  var hero = document.querySelector(".js-hero");
  if (!hero) {
    return;
  }
  var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(hero.querySelectorAll(".js-hero-dot"));
  var previous = hero.querySelector(".js-hero-prev");
  var next = hero.querySelector(".js-hero-next");
  var index = 0;
  var timer;

  function showSlide(nextIndex) {
    if (!slides.length) {
      return;
    }
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach(function(slide, slideIndex) {
      var active = slideIndex === index;
      slide.classList.toggle("opacity-100", active);
      slide.classList.toggle("opacity-0", !active);
    });
    dots.forEach(function(dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === index);
    });
  }

  function restart() {
    window.clearInterval(timer);
    timer = window.setInterval(function() {
      showSlide(index + 1);
    }, 5200);
  }

  if (previous) {
    previous.addEventListener("click", function() {
      showSlide(index - 1);
      restart();
    });
  }
  if (next) {
    next.addEventListener("click", function() {
      showSlide(index + 1);
      restart();
    });
  }
  dots.forEach(function(dot) {
    dot.addEventListener("click", function() {
      showSlide(Number(dot.getAttribute("data-slide")) || 0);
      restart();
    });
  });
  restart();
}

function setFilters() {
  var lists = Array.prototype.slice.call(document.querySelectorAll(".js-filter-list"));
  if (!lists.length) {
    return;
  }
  var searchInputs = Array.prototype.slice.call(document.querySelectorAll(".js-search-input"));
  var selects = Array.prototype.slice.call(document.querySelectorAll(".js-filter-select"));
  var queryParams = new URLSearchParams(window.location.search);
  var initialQuery = queryParams.get("q") || "";

  searchInputs.forEach(function(input) {
    if (initialQuery && !input.value) {
      input.value = initialQuery;
    }
  });

  function getSearchValue() {
    var value = "";
    searchInputs.forEach(function(input) {
      if (input.value.trim()) {
        value = input.value.trim().toLowerCase();
      }
    });
    return value;
  }

  function getFilterValue(name) {
    var value = "";
    selects.forEach(function(select) {
      if (select.getAttribute("data-filter") === name && select.value) {
        value = select.value;
      }
    });
    return value;
  }

  function applyFilters() {
    var keyword = getSearchValue();
    var region = getFilterValue("region");
    var year = getFilterValue("year");
    var type = getFilterValue("type");
    lists.forEach(function(list) {
      Array.prototype.slice.call(list.querySelectorAll(".movie-card")).forEach(function(card) {
        var haystack = (card.getAttribute("data-search") || "").toLowerCase();
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchRegion = !region || card.getAttribute("data-region") === region;
        var matchYear = !year || card.getAttribute("data-year") === year;
        var matchType = !type || card.getAttribute("data-type") === type;
        card.classList.toggle("is-hidden", !(matchKeyword && matchRegion && matchYear && matchType));
      });
    });
  }

  searchInputs.forEach(function(input) {
    input.addEventListener("input", applyFilters);
  });
  selects.forEach(function(select) {
    select.addEventListener("change", applyFilters);
  });
  applyFilters();
}

function initMoviePlayer(options) {
  var video = document.getElementById(options.videoId);
  var button = document.getElementById(options.buttonId);
  var url = options.url;
  var hlsInstance = null;
  var attached = false;

  if (!video || !button || !url) {
    return;
  }

  function attachStream() {
    if (attached) {
      return Promise.resolve();
    }
    attached = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      return Promise.resolve();
    }
    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(url);
      hlsInstance.attachMedia(video);
      return new Promise(function(resolve) {
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function() {
          resolve();
        });
      });
    }
    video.src = url;
    return Promise.resolve();
  }

  function start() {
    button.classList.add("is-hidden");
    attachStream().then(function() {
      var playRequest = video.play();
      if (playRequest && typeof playRequest.catch === "function") {
        playRequest.catch(function() {
          button.classList.remove("is-hidden");
        });
      }
    });
  }

  button.addEventListener("click", start);
  video.addEventListener("click", function() {
    if (video.paused) {
      start();
    }
  });
  video.addEventListener("play", function() {
    button.classList.add("is-hidden");
  });
  window.addEventListener("beforeunload", function() {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

setMobileMenu();
setHeroCarousel();
setFilters();
