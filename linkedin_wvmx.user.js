// ==UserScript==
// @name           LinkedIn WVMX Notifications
// @namespace      http://www.linkedin.com
// @match          http://www.linkedin.com/
// @match          http://www.linkedin.com/?*
// @match          http://www.linkedin.com/home*
// @require        https://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js
// ==/UserScript==

// include jquery
// http://erikvold.com/blog/index.cfm/2010/6/14/using-jquery-with-a-user-script
//
// get a profile using PAL API
// http://www.linkedin.com/v1/people/id=14997818:(first-name,last-name,headline,picture-url)

var addJQuery = function (callback) {
  var script = document.createElement("script");
  script.setAttribute("src", "https://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js");
  script.addEventListener('load', function() {
    var script = document.createElement("script");
    script.textContent = "(" + callback.toString() + ")();";
    document.body.appendChild(script);
  }, false);
  document.body.appendChild(script);
};

// This function is called after jquery is initialized.
addJQuery(function() {

  var wvmpModule  = $('#extra').children('.stats.profile'),
      wvmpSetting = $('<p>').css('padding-top', '10px'),
      wvmpCheck   = $('<input>').attr({ 'type': 'checkbox',
                                        'name': 'wvmpCheck',
                                        'id': 'wvmpCheck' })
                                .css('float', 'left'),
      lastDate    = (new Date()).getTime(),
      doNotify    = false,

      LI_API_PREFIX = 'http://www.linkedin.com/v1/people/',
      WVMX_TIME_INTERVAL = 30000,




  showNotification = function(logoUrl, name, profileUrl) {
    var url;
    if (window.webkitNotifications.checkPermission() !== 0) {
      window.webkitNotifications.requestPermission();
    }
    else {
      profileUrl = encodeURIComponent(profileUrl);
      logoUrl = encodeURIComponent(logoUrl);
      name = encodeURIComponent(name);
      url = ['http://koo.no.de/wvmx', name];
      if (profileUrl) { url.push(encodeURIComponent(profileUrl)); }
      if (logoUrl) { url.push(encodeURIComponent(logoUrl)); }

      window.webkitNotifications.createHTMLNotification(url.join('/')).show();
    }
  },





  handleView = function(view, lastDate) {
    var time, privacyType, viewer, name, pictureUrl, profileUrl;

    view = $(view);
    time = parseInt(view.find('timestamp').text(), 10);

    if (time < lastDate) {
      // old view, discard.
      // comment out this return statement if you just want to
      // see example notifications.
      return;
    }
    // new view!
    privacyType = view.find('privacy-type').find('code').text();

    if (privacyType === 'public') {
      viewer = view.find('viewer');
      name = [view.find('first-name').text(), view.find('last-name').text()].join(' ');
      id = viewer.find('id');
      if (id && id.length) {
        // make a call to get the picture url
        id = id.text();
        $.get([LI_API_PREFIX, 'id=', parseInt(id, 10), ':(picture-urls::(40x40),site-standard-profile-request)'].join(''), function(data) {
          pictureUrl = $(data).find('picture-url');
          profileUrl = $(data).find('site-standard-profile-request');

          // PICTURE URL
          if (pictureUrl && pictureUrl.length) {
            // we have a picture
            pictureUrl = pictureUrl.text();
          }
          else {
            // no picture
            pictureUrl = '';
          }

          // PROFILE URL
          if (profileUrl && profileUrl.length && profileUrl.find('url').length) {
            profileUrl = profileUrl.find('url');
            if (profileUrl && profileUrl.length) {
              profileUrl = profileUrl.text();
            }
          }
          else {
            profileUrl = 'http://www.linkedin.com/profile/view?id=' + id;
          }
          showNotification(pictureUrl, name, profileUrl);
          // we're done!
        });
        return; // we're waiting for pictureUrl to come back asynchronously, return for now.
      }
    }
    else if (privacyType === 'obfuscated') {
      // OBFUSCATED
      name = view.find('viewer-headline').text();
    }
    else {
      // HIDDEN
      name = 'Someone';
    }
    showNotification('', name, '');
  };






  wvmpSetting.prepend(wvmpCheck)
             .append($('<label>').text('Get notifications when someone views my profile')
                                 .attr('for', 'wvmpCheck')
                                 .css({'font-size': '13px',
                                       'padding-left': '20px',
                                       'display': 'block' }));

  wvmpCheck.change(function(evt) {
    if (wvmpCheck.attr('checked') === 'checked') {
      if (window.webkitNotifications.checkPermission() !== 0) {
        window.webkitNotifications.requestPermission();
      }
      doNotify = true;
    }
    else {
      doNotify = false;
    }
    evt.preventDefault();
  });

  if (window.webkitNotifications.checkPermission() === 0) {
    // user has allowed us
    wvmpCheck.attr('checked', 'checked');
    doNotify = true;
  }

  // append <p><a>Get notifications...views your profile!</a></p>
  wvmpModule.children('.content').append(wvmpSetting);

  //showNotification('http://static02.linkedin.com/scds/common/u/img/icon/icon_no_photo_40x40.png', 'Gordon Koo', 'http://www.linkedin.com/profile/view?id=34439388&trk=tab_pro');

  setInterval(function() {
    if (!doNotify || window.webkitNotifications.checkPermission() !== 0) { return; }
    $.get(LI_API_PREFIX + '~/profile-statistics/profile-views', function(data) {
      var views = $(data).find('profile-view');

      views.each(function(i, view) {
        handleView(view, lastDate);
      });

      lastDate = (new Date()).getTime();
    });
  }, WVMX_TIME_INTERVAL);

});
