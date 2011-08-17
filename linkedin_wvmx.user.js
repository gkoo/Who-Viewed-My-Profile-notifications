// ==UserScript==
// @name           LinkedIn WVMX Notifications
// @namespace      http://www.linkedin.com
// @include        http://www.linkedin.com/
// @include        http://www.linkedin.com/
// @require        https://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js
// ==/UserScript==

// include jquery
// http://erikvold.com/blog/index.cfm/2010/6/14/using-jquery-with-a-user-script

addJQuery = function (callback) {
  var script = document.createElement("script");
  script.setAttribute("src", "https://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js");
  script.addEventListener('load', function() {
    var script = document.createElement("script");
    script.textContent = "(" + callback.toString() + ")();";
    document.body.appendChild(script);
  }, false);
  document.body.appendChild(script);
},

// This function is called after jquery is initialized.
addJQuery(function() {
  var wvmpModule = $('#extra').children('.stats.profile'),
      link = $('<a>').text('Get notifications when someone views your profile!')
                     .attr('href', '#'),
      lastDate = (new Date()).getTime(),
      WVMX_TIME_INTERVAL = 10000;




  showNotification = function(logo, headline, body) {
    if (window.webkitNotifications.checkPermission() !== 0) {
      window.webkitNotifications.requestPermission();
    }
    else {
      window.webkitNotifications.createNotification(logo, headline, body).show();
    }
  },





  handleView = function(view, lastDate) {
    var view = $(view),
        time = parseInt(view.find('timestamp').text(), 10),
        privacyType, viewer, name;

    if (time < lastDate) {
      return;
    }
    // new view!
    privacyType = view.find('privacy-type').find('code').text();

    if (privacyType === 'public') {
      viewer = view.find('viewer');
      name = [view.find('first-name').text(), view.find('last-name').text()].join(' ');
    }
    else {
      name = 'Someone';
    }
    showNotification('', [name, 'viewed your profile!'].join(' '), 'Go check \'em out!');
  };






  link.click(function(evt) {
    if (window.webkitNotifications.checkPermission() !== 0) {
      window.webkitNotifications.requestPermission();
    }
    evt.preventDefault();
  });

  // append <p><a>Get notifications...views your profile!</a></p>
  wvmpModule.children('.content').append($('<p>').append(link));

  setInterval(function() {
    $.get('http://www.linkedin.com/v1/people/~/profile-statistics/profile-views', function(data) {
      var views = $(data).find('profile-view');

      views.each(function(i, view) {
        handleView(view, lastDate);
      });

      lastDate = (new Date()).getTime();
    });
  }, WVMX_TIME_INTERVAL);

});
