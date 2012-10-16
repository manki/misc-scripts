(function() {
var loadingGif = 'https://lh3.googleusercontent.com/-FiCzyOK4Mew/T4aAj2uVJKI/AAAAAAAAPaY/x23tjGIH7ls/s32/ajax-loader.gif';
var olderPostsLink = '';
var loadMoreDiv = null;
var postContainerSelector = 'div.blog-posts';
var loading = false;

function loadDisqusScript(domain) {
  var bloggerjs = document.createElement('script');
  bloggerjs.type = 'text/javascript';
  bloggerjs.async = true;
  bloggerjs.src = 'http://' + domain + '.disqus.com/blogger_index.js';
  (document.getElementsByTagName('head')[0] ||
   document.getElementsByTagName('body')[0]).
      appendChild(bloggerjs);
}

function loadMore() {
  if (loading) {
    return;
  }
  loading = true;

  if (!olderPostsLink) {
    loadMoreDiv.hide();
    return;
  }

  loadMoreDiv.find('a').hide();
  loadMoreDiv.find('img').show();
  $.get(olderPostsLink, null, function(html) {
    // Loaded more posts successfully.  Register this pageview with
    // Google Analytics.
    if (window._gaq) {
      window._gaq.push(['_trackPageview', olderPostsLink]);
    }

    var newDom = $(html);
    var newLink = newDom.find('a.blog-pager-older-link');
    if (newLink) {
      olderPostsLink = newLink.attr('href');
    } else {
      olderPostsLink = '';
      loadMoreDiv.hide();
    }

    var newPosts = newDom.find(postContainerSelector + '>*');
    $(postContainerSelector).append(newPosts);

    // Render +1 buttons.
    if (window.gapi && window.gapi.plusone && window.gapi.plusone.go) {
      window.gapi.plusone.go();
    }
    // Render Disqus comments.
    if (window.disqus_shortname) {
      loadDisqusScript(window.disqus_shortname);
    }
    // Render Facebook buttons.
    if (window.FB && window.FB.XFBML && window.FB.XFBML.parse) {
      window.FB.XFBML.parse();
    }

    loadMoreDiv.find('img').hide();
    loadMoreDiv.find('a').show();

    loading = false;
  });
}

function handleScroll() {
  var height = document.body.scrollHeight;
  var pos = $(window).scrollTop() + $(window).height();
  if (height - pos < 150) {
    loadMore();
  }
}

function init() {
  if (_WidgetManager._GetAllData().blog.pageType == 'item') {
    return;
  }

  olderPostsLink = $('a.blog-pager-older-link').attr('href');
  if (!olderPostsLink) {
    return;
  }

  var link = $('<a href="javascript:;">Load more posts</a>');
  link.click(loadMore);
  var img = $('<img src="' + loadingGif + '" style="display: none;">');

  $(window).scroll(handleScroll);

  loadMoreDiv = $('<div style="text-align: center; font-size: 150%;"></div>');
  loadMoreDiv.append(link);
  loadMoreDiv.append(img);
  loadMoreDiv.insertBefore($('#blog-pager'));
  $('#blog-pager').hide();
}

$(document).ready(init);

})();
