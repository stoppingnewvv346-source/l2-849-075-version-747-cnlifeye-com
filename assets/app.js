(function () {
    function selectAll(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function setupHeaderSearch() {
        selectAll('[data-search-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                var value = input ? input.value.trim() : '';
                if (!value) {
                    event.preventDefault();
                    window.location.href = './search.html';
                }
            });
        });
    }

    function setupHeroCards() {
        var cards = selectAll('[data-hero-card]');
        if (cards.length < 2) {
            return;
        }
        var current = 0;
        window.setInterval(function () {
            cards[current].classList.remove('is-active');
            current = (current + 1) % cards.length;
            cards[current].classList.add('is-active');
        }, 3600);
    }

    function setupSearchPage() {
        var grid = document.querySelector('[data-search-grid]');
        if (!grid) {
            return;
        }
        var cards = selectAll('.search-result-card', grid);
        var input = document.getElementById('search-page-input');
        var region = document.getElementById('filter-region');
        var year = document.getElementById('filter-year');
        var type = document.getElementById('filter-type');
        var category = document.getElementById('filter-category');
        var empty = document.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        if (input) {
            input.value = query;
        }
        function valueOf(element) {
            return element ? element.value.trim().toLowerCase() : '';
        }
        function matches(card, q, r, y, t, c) {
            var haystack = [
                card.dataset.title,
                card.dataset.region,
                card.dataset.year,
                card.dataset.type,
                card.dataset.category,
                card.dataset.genre,
                card.dataset.tags
            ].join(' ').toLowerCase();
            if (q && haystack.indexOf(q) === -1) {
                return false;
            }
            if (r && (card.dataset.region || '').toLowerCase() !== r) {
                return false;
            }
            if (y && (card.dataset.year || '').toLowerCase() !== y) {
                return false;
            }
            if (t && (card.dataset.type || '').toLowerCase() !== t) {
                return false;
            }
            if (c && (card.dataset.category || '').toLowerCase() !== c) {
                return false;
            }
            return true;
        }
        function run() {
            var q = valueOf(input);
            var r = valueOf(region);
            var y = valueOf(year);
            var t = valueOf(type);
            var c = valueOf(category);
            var visible = 0;
            cards.forEach(function (card) {
                var ok = matches(card, q, r, y, t, c);
                card.classList.toggle('is-hidden', !ok);
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }
        [input, region, year, type, category].forEach(function (element) {
            if (element) {
                element.addEventListener('input', run);
                element.addEventListener('change', run);
            }
        });
        run();
    }

    window.initMoviePlayer = function (videoId, buttonId, url) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        if (!video || !button || !url) {
            return;
        }
        var ready = false;
        var hlsInstance = null;
        function prepare() {
            if (ready) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(url);
                hlsInstance.attachMedia(video);
            } else {
                video.src = url;
            }
            ready = true;
        }
        function start() {
            prepare();
            button.classList.add('is-hidden');
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    button.classList.remove('is-hidden');
                });
            }
        }
        button.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHeaderSearch();
        setupHeroCards();
        setupSearchPage();
    });
})();
