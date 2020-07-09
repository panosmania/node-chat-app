const socket = io();

//Elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
/* $messages -- //we have the location we want to render the template up above with both of those in place */
const $messages = document.querySelector("#messages");

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate = document.querySelector(
  "#location-message-template"
).innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// Options
/* το location.search ουσιαστικα σου δινει τα στοιχεια που εχει πανω το url λινκ δηλαδη οτι εχει μετα το ? ?username=panos&room=greece -- http://localhost:3000/chat.html?username=panos&room=greece */
//{ignoreQueryPrefix: true} βγαζει το ? απο το location.search
//μολις τα παρω θελω να τα στειλω στον server
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild;

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  //console.log(newMessageMargin);

  // Visible height
  const visibleHeight = $messages.offsetHeight;

  // Height of messages container
  const containerHeight = $messages.scrollHeight;

  // How far have I scrolled?
  const scrollOfset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOfset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

//server (emit) -> client (receive) --acknowledgement--> server
//client (emit) -> server (receive) --acknowledgement--> client

//receive the event that the server is sending to us
socket.on("message", (message) => {
  //console.log(message);
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("k:mm a"),
  });
  //This allows us to insert other html adjacent to the element we've selected
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("locationMessage", (message) => {
  console.log(message);
  const html = Mustache.render(locationMessageTemplate, {
    username: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format("k:mm a"),
  });
  //This allows us to insert other html adjacent to the element we've selected
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll;
});

socket.on("roomData", ({ room, users }) => {
  // console.log(room);
  // console.log(users);

  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

//client send some data to the server
$messageForm.addEventListener("submit", (event) => {
  event.preventDefault();

  //disable button after submit -- πρωτο disabled ειναι το ονομα του atribute και το δευτερο αυτο που θελει να κανεις
  $messageFormButton.setAttribute("disabled", "disabled");
  const message = event.target.elements.message.value;
  socket.emit("sendMessage", message, (error) => {
    //enable button after delivered the message - εκανε remove το atribute με ονομα disabled
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();
    if (error) {
      return console.log(error);
    }

    console.log("Message delivered!");
  });
});

$sendLocationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }

  $sendLocationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        $sendLocationButton.removeAttribute("disabled");
        console.log("Location shared");
      }
    );
  });
});

//send data απο το location.search username και room
socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
