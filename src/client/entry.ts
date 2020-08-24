import MesaClient from "mesa-js-client";
import Controller from "./Controller";
import { InitMessage } from "./defs";

const client = new MesaClient(`${window.isSecureContext ? 'wss' : 'ws'}://${location.host}/api/ws`);
const nameInput = document.getElementById("name") as HTMLInputElement;
const submitBtn = document.getElementById("submit") as HTMLInputElement;
const errorMsg = document.getElementById("errorMsg") as HTMLDivElement;
const startScreen = document.getElementById("startScreen-wrap") as HTMLDivElement;

if (localStorage.name) nameInput.value = localStorage.name;

nameInput.onkeypress = e => {
  if (e.key == "Enter")
    submitName();
};

submitBtn.onclick = submitName;

function submitName() {
  const name = nameInput.value;
  if (!validateName(name)) return;
  localStorage.name = name;

  client.send(0, { name }, "NAME_REQUEST");

  client.onMessage = ({ data, type }) => {
    console.log("[NAME CHOOSING]", name, data, type);

    switch (type) {
      case "INVALID_NAME":
        nameInput.classList.add("invalidInput");
        showErrorMsg(data.reason || "Unknown error has occurred.");
        break;

      case "GAME_ROOM_IS_FULL":
        showErrorMsg("Currently, there are no available seats to join this room. Please try again later.");
        break;

      case "JOIN":
        startScreen.style.display = "none";
        startGame(data as InitMessage);
        break;

      default:
        console.error("Unexpected message from server", data, type);
        break;
    }
  };
}

nameInput.onblur = () => {
  if (!nameInput.value.length) return;
  validateName(nameInput.value);
};

function startGame(data: InitMessage) {
  console.log("[JOIN]", data);
  const controller = new Controller(client);
  controller.setup(data);
  document.onkeydown = ({ key }) => controller.move(key);
}

function validateName(name: string) {
  const validationResult = nameValidator(name);
  if (validationResult[0]) {
    nameInput.classList.remove("invalidInput");
    hideErrorMsg();
    return true;
  }
  nameInput.classList.add("invalidInput");
  showErrorMsg(validationResult[1]);
  return false;
}

function nameValidator(name: string): [boolean, string] {
  if (name.length > 15) return [false, "Name cannot be longer than 15 characters."];
  if (!/^[0-9A-Za-z ]*$/.test(name)) return [false, "Name can only contain numbers and Latin characters."];
  if (name.replace(/\s/g, "") === "") return [false, "Name must contain at least one displayable character."];
  return [true, ""];
}

function showErrorMsg(errorText: string) {
  errorMsg.style.width = "100%";
  errorMsg.style.height = "100%";
  errorMsg.innerText = errorText;
}

function hideErrorMsg() {
  errorMsg.style.removeProperty("width");
  errorMsg.style.removeProperty("height");
}
