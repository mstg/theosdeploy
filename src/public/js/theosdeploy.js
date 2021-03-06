var tmp = $(".deploybtn").attr('href');
$(".deploybtn").attr("disabled", true);

$("li.device").click(function() {
    var previous = $(this).closest(".list-group").children(".active-device");
    previous.removeClass('active-device');
    $("#install").attr('checked', false);

    $(this).addClass('active-device');
    $(".deploybtn").attr('href', tmp + '/' + $(this).text() + "/no");
    $(".deploybtn").attr("disabled", false);
    $("#install").attr('disabled', false);
});

$("#install").on('change', function() {
    $(".deploybtn").attr('href', $(".deploybtn").attr('href').replace('no', 'yes'));
});

if (isBuildPage) {
    var socket = io.connect('http://localhost:5050');
    socket.on('ssh', function(data) {
        $("#ssh-log").append("[TheosDeploy] " + data["response"] + "\n");
    });
}
