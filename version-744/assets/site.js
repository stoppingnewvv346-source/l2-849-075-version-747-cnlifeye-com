(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('open');
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
        if (!slides.length || !dots.length) {
            return;
        }

        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                stop();
                show(index);
                start();
            });
        });

        show(0);
        start();
    }

    function fillSelect(select, values) {
        if (!select) {
            return;
        }

        values.sort(function (a, b) {
            return String(b).localeCompare(String(a), 'zh-Hans-CN');
        });

        values.forEach(function (value) {
            if (!value) {
                return;
            }
            var option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function initFilters() {
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
        var searchInput = document.querySelector('[data-card-search]');
        if (!cards.length || !searchInput) {
            return;
        }

        var regionFilter = document.querySelector('[data-region-filter]');
        var typeFilter = document.querySelector('[data-type-filter]');
        var yearFilter = document.querySelector('[data-year-filter]');
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q') || '';

        var regions = [];
        var types = [];
        var years = [];

        cards.forEach(function (card) {
            var region = card.getAttribute('data-region') || '';
            var type = card.getAttribute('data-type') || '';
            var year = card.getAttribute('data-year') || '';
            if (region && regions.indexOf(region) === -1) {
                regions.push(region);
            }
            if (type && types.indexOf(type) === -1) {
                types.push(type);
            }
            if (year && years.indexOf(year) === -1) {
                years.push(year);
            }
        });

        fillSelect(regionFilter, regions);
        fillSelect(typeFilter, types);
        fillSelect(yearFilter, years);

        if (q) {
            searchInput.value = q;
        }

        function apply() {
            var query = searchInput.value.trim().toLowerCase();
            var region = regionFilter ? regionFilter.value : '';
            var type = typeFilter ? typeFilter.value : '';
            var year = yearFilter ? yearFilter.value : '';

            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-category'),
                    card.getAttribute('data-tags')
                ].join(' ').toLowerCase();

                var matched = (!query || text.indexOf(query) !== -1) &&
                    (!region || card.getAttribute('data-region') === region) &&
                    (!type || card.getAttribute('data-type') === type) &&
                    (!year || card.getAttribute('data-year') === year);

                card.hidden = !matched;
            });
        }

        [searchInput, regionFilter, typeFilter, yearFilter].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });

        apply();
    }

    function initPlayer() {
        var video = document.querySelector('[data-video-player]');
        var trigger = document.querySelector('[data-player-trigger]');
        var overlay = document.querySelector('[data-player-overlay]');
        if (!video || !trigger) {
            return;
        }

        var stream = video.getAttribute('data-stream');
        var ready = false;
        var hlsInstance = null;

        function prepare() {
            if (ready || !stream) {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else {
                video.src = stream;
            }

            ready = true;
        }

        function play() {
            prepare();
            if (overlay) {
                overlay.classList.add('hide');
            }
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove('hide');
                    }
                });
            }
        }

        trigger.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('hide');
            }
        });
        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    initHero();
    initFilters();
    initPlayer();
})();
