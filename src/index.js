

let start = false;
let algorithm = null;

$(document).ready(function () {
    $("#start").click(function () {
        start = true;
        algorithm = $("#algorithm").val() - 1;
        console.log(algorithm);
        $(".menu").css("display", "none");
    });
});