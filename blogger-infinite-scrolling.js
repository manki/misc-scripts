(function() {
var loadingGif = 'https://lh3.googleusercontent.com/-FiCzyOK4Mew/T4aAj2uVJKI/AAAAAAAAPaY/x23tjGIH7ls/s32/ajax-loader.gif';
var olderPostsLink = '';
var loadMoreDiv = null;
var postContainerSelector = 'div.blog-posts';
var loading = false;

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
    if (window.gapi && window.gapi.plusone && window.gapi.plusone.go) {
      window.gapi.plusone.go();
    }
    loadMoreDiv.find('img').hide();
    loadMoreDiv.find('a').show();

    loading = false;
  });
}

function handleScroll() {
  var height = document.body.scrollHeight;
  var pos = $(window).scrollTop() + $(window).height();
  if (height - pos < 100) {
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

if (document.readyState == 'complete' || document.readyState == 'loaded') {
  init();
} else {
  $(document).ready(init);
}

})();
