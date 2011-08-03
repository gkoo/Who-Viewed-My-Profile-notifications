// ==UserScript==
// @name           LinkedIn WVMX
// @namespace      http://www.linkedin.com
// @include        http://www.linkedin.com/
// @include        http://www.linkedin.com/
// @require        https://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js
// ==/UserScript==

// include jquery
// http://erikvold.com/blog/index.cfm/2010/6/14/using-jquery-with-a-user-script
function addJQuery(callback) {
  var script = document.createElement("script");
  script.setAttribute("src", "https://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js");
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
    $.get('http://www.linkedin.com/v1/people/~/profile-statistics/profile-views:(id,timestamp)', function(data) {
      var timestamps = $(data).find('timestamp');

      timestamps.each(function(i, timestamp) {
        var time = parseInt($(timestamp).text(), 10);
        if (time > lastDate) {
          ++count;
        }
      });
      if (window.webkitNotifications.checkPermission() !== 0) {
        window.webkitNotifications.requestPermission();
      }
      else if (count > 0) {
        //window.webkitNotifications.createNotification('', 'New profile views!', 'new profile view!').show();
        window.webkitNotifications.createNotification('', 'New profile views!', count + ' new ' + (count === 1 ? 'person has' : 'people have') + ' viewed your profile!').show();
        count = 0;
      }
      lastDate = (new Date()).getTime();
    });
  }, 30000);

});
