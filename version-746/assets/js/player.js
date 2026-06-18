(function () {
  function setupPlayer(options) {
    var video = document.querySelector(options.videoSelector);
    var button = document.querySelector(options.buttonSelector);
    var shell = document.querySelector(options.shellSelector);
    var hlsInstance = null;
    var attached = false;

    if (!video || !button || !options.stream) {
      return;
    }

    function attach() {
      if (attached) {
        return;
      }
      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = options.stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(options.stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = options.stream;
      }
    }

    function start() {
      attach();
      if (shell) {
        shell.classList.add('is-playing');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (shell) {
            shell.classList.remove('is-playing');
          }
        });
      }
    }

    button.addEventListener('click', start);
    video.addEventListener('play', function () {
      if (shell) {
        shell.classList.add('is-playing');
      }
    });
    video.addEventListener('pause', function () {
      if (video.currentTime === 0 && shell) {
        shell.classList.remove('is-playing');
      }
    });
    video.addEventListener('ended', function () {
      if (shell) {
        shell.classList.remove('is-playing');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  window.setupPlayer = setupPlayer;
})();
