function login() {
  var username = $("#username").val();
  var password = $("#password").val();
  $.post("/login",
        { "username" : username, "password" : password },
        function(response) {
          if (response == "true") {
            $.cookie("evernote_username", username);
            window.location.href = "piano";
          } else {
            $("#error").show();
          }
        }
  );
}