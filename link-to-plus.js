var LTP = LTP || {};

LTP.apiKey = 'AIzaSyDjaMokeJbmngmARMKj-QVYWADsDIfFCJI';
LTP.authorId = '101330919111492138881';
LTP.fields = 'items(actor/id,object(url,replies/totalItems))';
LTP.className = 'link-to-plus';
LTP.callbacks = [];

LTP.createCallback_ = function(elt) {
  return function(data) {
    LTP.processResults_(elt, data);
  };
};

LTP.link = function() {
  if (document.readyState != 'loaded' &&
      document.readyState != 'complete') {
    return;
  }

  var elts = document.getElementsByClassName(LTP.className);
  for (var i = 0, len = elts.length; i < len; ++i) {
    var elt = elts[i];
    LTP.callbacks.push(LTP.createCallback_(elt));
    LTP.addScript_(LTP.searchScriptUrl_(elt.getAttribute('data-post-url'),
        LTP.authorId,
        'LTP.callbacks[' + (LTP.callbacks.length - 1) + ']'));
  }
};

LTP.addScript_ = function(scriptUrl) {
  var script = document.createElement('script');
  script.async = true;
  script.type = 'text/javascript';
  script.src = scriptUrl;
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(script, s);
};

LTP.searchScriptUrl_ = function(postUrl, authorId, callbackName) {
  return 'https://www.googleapis.com/plus/v1/activities' +
      '?key=' + encodeURI(LTP.apiKey) +
      '&query=' + encodeURI(postUrl + ' ' + authorId) +
      '&fields=' + encodeURI(LTP.fields) +
      '&callback=' + encodeURI(callbackName);
};

LTP.processResults_ = function(anchor, data) {
  for (var i = 0, len = data.items.length; i < len; ++i) {
    var it = data.items[i];
    if (it.actor.id == LTP.authorId) {
      var numComments = it.object.replies.totalItems;
      anchor.href = it.object.url;
      var text = '';
      if (numComments == 0) {
        text = 'Discuss on Google+';
      } else if (numComments == 1) {
        text = '1 comment on Google+';
      } else {
        text = numComments + ' comments on Google+';
      }
      anchor.innerHTML = text;
      break;
    }
  }
};

document.addEventListener('readystatechange', LTP.link, false);
