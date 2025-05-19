var isIllegalLuggage = 1;
var rounds = Math.floor(Math.random() * 7) + 7;
var currentLuggage = Math.floor(Math.random() * 10) + 1;
var currentRound = 1;
var score = 0;

var clicked = false;

function showLuggage() {
  clicked = false;
  isIllegalLuggage = Math.floor(Math.random() * 2)
  $("#score").text(`Your Score : ${score}`);
  $("#remaining").text(`Remaining luggages : ${rounds - currentRound}`)
  if (currentRound >= rounds) {
    
    if (score >= 40){
          var coupons = localStorage.getItem("kazandiginKuponlar");
    if (coupons != null)
    {
      coupons = JSON.parse(coupons);
      coupons.push(score);
      localStorage.setItem("kazandiginKuponlar", JSON.stringify(coupons));
      $("#feedback").text("You EARNED A COUPON!");
      $("#feedback").append(`<span class="red-text">Disclaimer! Coupons can only be redeemed 3 days from today. </span>`);
    }else {
      coupons = [score];
      localStorage.setItem("kazandiginKuponlar", JSON.stringify(coupons));
    }
    }
    $("#luggage").hide();
    $("#controls").hide();
    return;
  }
  $("#luggage").attr("src", `../images/gameAssets/luggages${currentLuggage}.png`).css({ left: 0 }).show();
  $("#feedback").text("");
  animateLuggage();
  currentRound++;
}

function animateLuggage() {
  $("#luggage").css({ left: 0 }).animate({ left: "300px" }, 1250, function () {
    if (isIllegalLuggage)
       $("#luggage").attr("src", `../images/gameAssets/luggages${currentLuggage}s.png`);
  });

  $("#luggage").css({ left: 0 }).animate({ left: "700px" }, 750, function () {
    if (isIllegalLuggage)
       $("#feedback").text("A luggage with illegal content avoided the scan!");
    currentLuggage = Math.floor(Math.random() * 10) + 1;
    setScore(-10);
    showLuggage();
    });
}

function checkAnswer(isDispose) {
  if (!clicked){
        const correct = isIllegalLuggage === isDispose;
    $("#luggage").stop().hide();
    $("#feedback").text(correct ? "Correct!" : "Wrong!");
    setScore(correct ? 30 : -10);
    currentLuggage = Math.floor(Math.random() * 10) + 1;
    setTimeout(showLuggage, 1000);
    clicked = true;
  }
}



$(document).ready(function () {
  $("#disposeBtn").click(() => checkAnswer(1));
  $("#passBtn").click(() => checkAnswer(0));
  const startButton = $("#startBtn");
  startButton.click(() => {showLuggage(); startButton.hide()});

});

function setScore(points){
  if (score + points < 0)
    score = 0;
  else
    score += points;
}