// setting

// 获取数据
let apikey = localStorage.getItem("apikey");
let modeltype = localStorage.getItem("modeltype");
// console.log(apikey)

if (localStorage.getItem("messagesinner")) {
  document.getElementById("messages").innerHTML =
    localStorage.getItem("messagesinner");
}

if (localStorage.getItem("questions")) {
  document.getElementById("questions").innerHTML =
    localStorage.getItem("questions");
}

function showOverlay() {
  var overlay = document.getElementById("overlay");
  overlay.classList.remove("hidden");
  document.getElementById("apikey").value = apikey;
  if (modeltype) document.getElementById("gptVersions").value = modeltype;
}

function hideOverlay() {
  var overlay = document.getElementById("overlay");
  overlay.classList.add("hidden");
}

document.getElementById("setting").addEventListener("click", function () {
  showOverlay();
});
document.getElementById("setkey").addEventListener("click", function () {
  apikey = document.getElementById("apikey").value;
  modeltype = document.getElementById("gptVersions").value;
  // 存储数据
  localStorage.setItem("apikey", apikey);
  localStorage.setItem("modeltype", modeltype);

  hideOverlay();
});

// prompt list
const prompts = document.querySelectorAll(".prompt");

prompts.forEach((prompt) => {
  prompt.addEventListener("click", () => {
    const content = prompt.textContent;
    // console.log(content);
    document.getElementById("input").value = content;
  });
});

// hide prompt list
var instruction = document.getElementById("instruction");
var promptlist = document.getElementById("promptlist");
instruction.onclick = function () {
  if (promptlist.classList.contains("hidden")) {
    promptlist.classList.remove("hidden");
  } else {
    promptlist.classList.add("hidden");
  }
};

var input = document.getElementById("input");
/*将“input_id”更改为相应输入标签的id*/

input.addEventListener("keydown", function (event) {
  if (event.keyCode === 13) {
    // 回车键的键值为13
    event.preventDefault();
    // 防止标准的回车键行为发生，比如提交表单
    document.getElementById("chat").click();
  }
});

// var msgright = document.getElementById("messageshead");
// msgright.onmouseover = function () {
//   // this.style.fontWeight = "lighter";
//   this.style.fontSize = "16px";
// };

// msgright.onmouseout = function () {
//   // this.style.fontWeight = "normal";
//   this.style.fontSize = "14px";
// };

// Add click event listeners to the buttons
document.getElementById("copy").addEventListener("click", function () {
  // 获取要复制的文本内容
  const textToCopy = document.getElementById("messages").innerText;

  // 创建一个文本输入框元素
  const input = document.createElement("input");
  // 设置文本内容
  input.value = textToCopy;
  // 添加到文档中
  document.body.appendChild(input);
  // 选中文本
  input.select();
  // 执行复制命令
  document.execCommand("copy");
  // 从文档中移除文本输入框元素
  document.body.removeChild(input);
});

// Add click event listeners to the buttons
document.getElementById("chat").addEventListener("click", function () {
  let question = document.getElementById("input").value;

  if (apikey === null || apikey === "") {
    showOverlay();
    return;
  } else {
    if (question == "") return;

    document.getElementById("questions").innerHTML = question;
    document.getElementById("messages").innerHTML = "正在分析...";
    document.getElementById("input").value = "";

    chatgpt(question);
    instruction.click();
  }
});

let history = [];
async function chatgpt(question) {
  // const OPENAI_API_KEY = '
  const OPENAI_API_KEY = apikey;

  // const modeltype = document.getElementById("gptVersions").value;
  console.log(modeltype);

  const messages = [
    {
      role: "system",
      content: "你是一名AI助理，请用中文回答用户的问题，输出内容格式美观",
    },
  ];
  if (history.length > 0) {
    for (const [question, answer] of history) {
      messages.push({ role: "user", content: question });
      messages.push({ role: "assistant", content: answer });
    }
  }
  messages.push({ role: "user", content: question });

  const payload = {
    model: modeltype,
    messages: messages,
    stream: true,
  };

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${OPENAI_API_KEY}`,
  };

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  document.getElementById("messages").innerHTML = "";

  if (!response.body) return;
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();

  localStorage.setItem(
    "questions",
    document.getElementById("questions").innerHTML,
  );
  while (true) {
    var { value, done } = await reader.read();

    // console.log(done);
    // if (done) break;

    const lines = value
      .toString()
      .split("\n\n")
      .filter((line) => line.trim() !== "");
    let chunk = "";
    for (const line of lines) {
      const message = line.replace("data: ", "");
      if (message === "[DONE]") {
        history.push([question, document.getElementById("messages").innerHTML]);
        return;
      }

      chunk += JSON.parse(message).choices[0].delta.content;
    }

    document.getElementById("messages").innerHTML += chunk;
    localStorage.setItem(
      "messagesinner",
      document.getElementById("messages").innerHTML,
    );
  }
}
