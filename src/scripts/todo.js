// 程式碼寫在這裡
import Alpine from "alpinejs";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';

const SERVER = "https://todoo.5xcamp.us";
const HEADERS = {
  headers: {
    accept: "application/json",
    'Content-Type': 'application/json'
  }
}

Alpine.data("navBar", () => ({
  showSignUp() {
    this.$dispatch("from-nav",{status: "showSignUp"});
  },
  showLogin() {
    this.$dispatch("from-nav",{status: "showLogin"});
  }
}))

Alpine.data("flashMessage", () => ({
  showFlash: false,
  content: "",
  bgColor: "", 

  handleNotice({detail}) {
    const {message, type} = detail;
    this.bgColor = type === "error" ? "bg-red-500" : "bg-green-500";
    this.openFlash(message);
    setTimeout(() => { 
      this.closeFlash();
    },5000);
  },
  openFlash(message="something wrong") {
    this.showFlash = true;
    this.content = message;
  },
  closeFlash() {
    this.showFlash = false;
    this.content = "";
  }
}))

Alpine.data("user", () => ({
  status: "login",
  email: "",
  nickname: "",
  password: "",

  async init() {
    const token = localStorage.getItem("token");
    if (token) {
      HEADERS["headers"]["Authorization"] = token;
      try {
        const res = await axios.get(`${SERVER}/todos`,HEADERS);
        this.showInput();
      } catch (err) {
        console.log(err);
        // this.$dispatch("notice", {message: "can't login", type: "error"});
      }
    }
  },
  showSignUp() {
    this.status = "signUp";
  },
  showLogin() {
    this.status = "login";
  },
  async signUp() {
    const params = {
      user: {
        email: this.email,
        nickname: this.nickname,
        password: this.password
      }
    }
    try {
      const res = await axios.post(`${SERVER}/users`,params,HEADERS);
      this.showLogin();
      this.clear();
      this.$dispatch("notice",{
        message: "successfully signed up, now login to use the app",
        type: "success"
      })
    } catch ({response}) {
      const errors = response.data.error;
      const message = errors.join(" / ");
      this.$dispatch("notice", {message, type: "error"});
    }
  },
  async login() {
    const params = {
      "user": {
        "email": this.email,
        "password": this.password
      }
    }

    try {
      const { headers } = await axios.post(`${SERVER}/users/sign_in`,params,HEADERS);
      localStorage.setItem("token",headers.authorization);
      this.$dispatch("notice", {
        message: "sucessfully logged in, now enjoy the app!!",
        type: "success"
      })
      this.showInput();
    } catch (err) {
      this.$dispatch("notice", {message: "can't login", type: "error"});
    }
  }, 
  clear() {
    this.email = "";
    this.nickname = "";
    this.password = "";
  },
  handleChange({detail}) {
    if (detail.status === "showSignUp") {
      this.showSignUp();
    } else {
      this.showLogin();
    }
  },
  showInput() {
    this.clear();
    this.status = "";
    this.$dispatch("show-input");
  }
}));

Alpine.data("taskInput", () => ({
  showInput: false,
  inputText: "",

  handleShow() {
    this.status = "";
    this.showInput = true;
  },
  addTask() {
    if (this.inputText.trim().length > 1) {
      this.$dispatch("new-task",{text: this.inputText.trim()});
    }
  }
}))

Alpine.data("todoList", () => ({
  showList: true,
  tasks: [{text: "hehe", id: 1}],
  checked: false,

  handleAddTask({detail}) {
    this.tasks.unshift({text: detail.text, id: this.generateId()});
  },
  generateId() {
    return uuidv4();
  },
  closeTask(id) {
    this.tasks = this.tasks.filter(ele => {
      return ele.id != id;
    })
  }
}))


Alpine.start();
