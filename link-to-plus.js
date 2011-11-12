/*
 * To use, you have to override LTP.apiKey and LTP.authorId with your own
 * API key and profile ID.  Include something like this in your HTML:
 * <script type='text/javascript'>
 * var LTP = {};
 * LTP.apiKey = 'YOUR_API_KEY';
 * LTP.authorId = 'YOUR_PROFILE_ID';
 * </script>
 * <script type='text/javascript' src='https://code.google.com/...'>
 * </script>
 */

// Namespace.
var LTP = LTP || {};

// Google+ API key to use.
if (!LTP.apiKey) {
  LTP.apiKey = 'AIzaSyDjaMokeJbmngmARMKj-QVYWADsDIfFCJI';
}

// Author's Google+ profile ID.
if (!LTP.authorId) {
  LTP.authorId = '101330919111492138881';
}

// We only make use of these fields in search results.
LTP.fields_ = 'items(actor/id,object(url,replies/totalItems))';

// CSS class name of <a> tags this script would process.
LTP.className_ = 'link-to-plus';

// Name of the <a> element's attribute that holds the blog post URL we should
// be searching for.
LTP.postUrlAttr_ = 'data-post-url';

// JSONP requires passing the name of the callback along with search query.
// Since we create several callbacks dynamically, we keep them all in this
// array and pass something like "LTP.callbacks_[1]" as callback name to the
// API servers.
LTP.callbacks_ = [];

// Walks the document's DOM and sets href and inner text of all <a> elements
// that have class specified in LTP.className_.
LTP.link = function() {
  if (document.readyState != 'loaded' &&
      document.readyState != 'complete') {
    return;
  }

  var elts = document.getElementsByClassName(LTP.className_);
  for (var i = 0, len = elts.length; i < len; ++i) {
    var elt = elts[i];
    var postUrl = elt.getAttribute(LTP.postUrlAttr_);
    if (!postUrl) {
      continue;
    }

    LTP.callbacks_.push(LTP.createCallback_(elt));
    LTP.addScript_(LTP.searchScriptUrl_(postUrl, LTP.authorId,
        'LTP.callbacks_[' + (LTP.callbacks_.length - 1) + ']'));
  }
};

// Creates a JSONP callback.  When called, the callback would set the href and
// inner text of elt based on search result argument it's passed.
LTP.createCallback_ = function(elt) {
  return function(data) {
    LTP.processResults_(elt, data);
  };
};

// Adds a <script> element to document with its src set to scriptUrl.
LTP.addScript_ = function(scriptUrl) {
  var script = document.createElement('script');
  script.async = true;
  script.type = 'text/javascript';
  script.src = scriptUrl;
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(script, s);
};

// Returns JSONP search URL that searches for postUrl in Google+.
LTP.searchScriptUrl_ = function(postUrl, authorId, callbackName) {
  return 'https://www.googleapis.com/plus/v1/activities' +
      '?key=' + encodeURI(LTP.apiKey) +
      '&query=' + encodeURI(postUrl + ' ' + authorId) +
      '&fields=' + encodeURI(LTP.fields_) +
      '&callback=' + encodeURI(callbackName) +
      '&pp=0';
};

// Based on search results in data, modify the attributes of anchor.
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

// If the document has loaded already, start linking.  Otherwise register to
// be notified for document's ready state change events.
if (document.readyState == 'loaded' || document.readyState == 'complete') {
  LTP.link();
} else {
  document.addEventListener('readystatechange', LTP.link, false);
}
