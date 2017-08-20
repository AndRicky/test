var bridgeVersion = 0;
var initialized = false;

function initialize(config) {
  if (initialized) { return; }
  initialized = true;

  bridgeVersion = config.bridgeVersion;

  if (config.bridgeVersion >= 1) {
    enableRemoteVideos();
  }
  // version 2 was never released
  if (config.bridgeVersion >= 3) {
    findInlineVideos();
  }
}

function enableRemoteVideos() {
  var matches = document.querySelectorAll('.embed-video-container');

  var i;
  for (i = 0; i < matches.length; i++) {
    var el = matches[i];

    var videoId;
    var img = el.querySelector('img[rel]');
    if (img) {
      videoId = img.getAttribute('rel');
    }

    if (videoId) {
      el.addEventListener('click', (function(videoId) {
          return function(event) {
            // only call this if we don't support inline videos
            if (bridgeVersion < 3) {
              playRemoteVideo(videoId);
            }
          }
        })(videoId));
      el.className = el.className + " supported";
    }
  }
}

function findInlineVideos() {
  var matches = document.querySelectorAll('.embed-video-container');

    var i;
    for (i = 0; i < matches.length; i++) {
      var el = matches[i];

      var videoId;
      var img = el.querySelector('img[rel]');
      if (img) {
        videoId = img.getAttribute('rel');
        imageSrc = img.getAttribute('src');
      }

      if (videoId && imageSrc) {
        var rect = img.getBoundingClientRect();
        var x = rect.left * window.devicePixelRatio;
        var y = rect.top * window.devicePixelRatio;
        var h = img.offsetHeight * window.devicePixelRatio;
        var w = img.offsetWidth * window.devicePixelRatio;

        addInlineVideos(x, y, w, h, videoId, imageSrc);
        el.className = el.className + " inline";
      }
    }
}

function playRemoteVideo(videoId) {
  bridgeApplicationFunction('playRemoteVideo', ['videoId', videoId]);
}

function addInlineVideos(x, y, w, h, videoId, imageSrc) {
  bridgeApplicationFunction('addInlineVideos', [
    'x', x,
    'y', y,
    'w', w,
    'h', h,
    'videoId', videoId,
    'imageSrc', imageSrc
  ]);
}

function bridgeApplicationFunction(functionName, paramsArray) {
  var path = './bridge/' + functionName + '?';
  for (var i = 0; i < paramsArray.length; ) {
    if (i > 0) {
      path = path + '&';
    }
    path = path + encodeURIComponent(paramsArray[i++]) + '=' + encodeURIComponent(paramsArray[i++]);
  }
  console.log(path);

  var xhr = new XMLHttpRequest();
  try {
    xhr.open('get', path, false);
    xhr.send();
  } catch (e) {
    console.error(e);
  }
}
