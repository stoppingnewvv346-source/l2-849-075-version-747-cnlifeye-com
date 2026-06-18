(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function filterCards() {
    var input = document.getElementById('movie-search');
    var cards = document.querySelectorAll('.searchable-card');
    if (!input || !cards.length) {
      return;
    }

    var keyword = normalize(input.value);
    cards.forEach(function (card) {
      var text = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-type'),
        card.getAttribute('data-region'),
        card.getAttribute('data-tags'),
        card.textContent
      ].join(' '));
      card.classList.toggle('search-hidden', keyword && text.indexOf(keyword) === -1);
    });
  }

  var searchInput = document.getElementById('movie-search');
  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query) {
      searchInput.value = query;
    }
    searchInput.addEventListener('input', filterCards);
    filterCards();
  }

  var filterButtons = document.querySelector('[data-filter-buttons]');
  if (filterButtons) {
    filterButtons.addEventListener('click', function (event) {
      var button = event.target.closest('button[data-filter]');
      if (!button) {
        return;
      }

      filterButtons.querySelectorAll('button').forEach(function (item) {
        item.classList.remove('is-active');
      });
      button.classList.add('is-active');

      var value = normalize(button.getAttribute('data-filter'));
      document.querySelectorAll('.searchable-card').forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-type'),
          card.getAttribute('data-region'),
          card.getAttribute('data-tags'),
          card.textContent
        ].join(' '));
        card.classList.toggle('search-hidden', value !== 'all' && text.indexOf(value) === -1);
      });
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('is-active', itemIndex === index);
      });
    }

    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    window.setInterval(function () {
      show(index + 1);
    }, 6500);
  }
})();
