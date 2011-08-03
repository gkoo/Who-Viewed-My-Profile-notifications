// ==UserScript==
// @name           LinkedIn WVMX
// @namespace      http://www.linkedin.com
// @include        http://www.linkedin.com/
// @require        https://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js
// ==/UserScript==

// include jquery
// http://erikvold.com/blog/index.cfm/2010/6/14/using-jquery-with-a-user-script
function addJQuery(callback) {
  var script = document.createElement("script");
  script.setAttribute("src", "http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js");
  script.addEventListener('load', function() {
    var script = document.createElement("script");
    script.textContent = "(" + callback.toString() + ")();";
    document.body.appendChild(script);
  }, false);
  document.body.appendChild(script);
}

addJQuery(function() {
  var wvmpModule = $('#extra').children('.stats.profile'),
      link = $('<a>').text('Get notifications when someone views your profile!')
                     .attr('href', '#'),
      lastDate = (new Date()).getTime(),
      count = 0;

  link.click(function(evt) {
    if (window.webkitNotifications.checkPermission() !== 0) {
      window.webkitNotifications.requestPermission();
    }
    evt.preventDefault();
  });

  // append <p><a>Get notifications...views your profile!</a></p>
  wvmpModule.children('.content').append($('<p>').append(link));

  setInterval(function() {
    window.webkitNotifications.createNotification('', 'New profile views!', 'new profile view!');
    $.get('http://www.linkedin.com/v1/people/~/profile-statistics/profile-views:%28id,timestamp%29', function(data) {
      var views = $(data).find('profile-view');
      views.each(function(i, view) {
        if (view.timestamp && view.timestamp > lastDate) {
          ++count;
        }
      });
      if (window.webkitNotifications.checkPermission() !== 0) {
        window.webkitNotifications.requestPermission();
      }
      else if (count > 0) {
        alert('count is > 0');
        window.webkitNotifications.createNotification('', 'New profile views!', 'new profile view!');
        //window.webkitNotifications.createNotification('', 'New profile views!', count + ' new ' + (count === 1 ? 'person' : 'people') + ' have viewed your profile!').show();
      }
      else {
        window.webkitNotifications.createNotification('', 'no profile views!', 'no profile views!');
      }
      lastDate = (new Date()).getTime();
    });
  }, 5000);

});
