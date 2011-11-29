function login() {
  $("#username").val();
  $("#password").val();
  $.post("/login",
        { "username" : $("#username").val(), "password" : $("#password").val() },
        function(response) {
          if (response == "true") {
            window.location.href = "piano";
          } else {
            $("#error").show();
          }
        }
  );
}