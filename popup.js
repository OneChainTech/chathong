// setting

// 获取数据
let apikey = localStorage.getItem('apikey');
// console.log(apikey)

if (localStorage.getItem('messagesinner')) {
  document.getElementById('messages').innerHTML = localStorage.getItem('messagesinner');
}

if (localStorage.getItem('questions')) {
  document.getElementById('questions').innerHTML = localStorage.getItem('questions');
}

function showOverlay() {
  var overlay = document.getElementById('overlay');
  overlay.classList.remove('hidden');
  document.getElementById('apikey').value = apikey;
}

function hideOverlay() {
  var overlay = document.getElementById('overlay');
  overlay.classList.add('hidden');
}

document.getElementById('setting').addEventListener('click', function() {
  showOverlay();
});
document.getElementById('setkey').addEventListener('click', function() {
  apikey = document.getElementById('apikey').value;
  // 存储数据
  localStorage.setItem('apikey', apikey);

  hideOverlay();
});


// prompt list
const prompts = document.querySelectorAll('.prompt');

prompts.forEach((prompt) => {
  prompt.addEventListener('click', () => {
    const content = prompt.textContent;
    console.log(content);
    document.getElementById('input').value = content;
  });
});

// Add click event listeners to the buttons
document.getElementById('copy').addEventListener('click', function() {
  // 获取要复制的文本内容
  const textToCopy = document.getElementById('messages').innerText;

  // 创建一个文本输入框元素
  const input = document.createElement('input');
  // 设置文本内容
  input.value = textToCopy;
  // 添加到文档中
  document.body.appendChild(input);
  // 选中文本
  input.select();
  // 执行复制命令
  document.execCommand('copy');
  // 从文档中移除文本输入框元素
  document.body.removeChild(input);
});


// Add click event listeners to the buttons
document.getElementById('chat').addEventListener('click', function() {

  let question = document.getElementById('input').value;

  if (apikey === null || apikey === '') {

    showOverlay();
    return;

  } else {

    if (question == '') return;

    document.getElementById('questions').innerHTML = question;
    document.getElementById('messages').innerHTML = '正在分析...';
    document.getElementById('input').value = '';

    chatgpt(question);
    // flowise({ "question": question + "请用中文回答问题，如果不知道答案，请回复不太清楚" });

  }

});

async function chatgpt(question) {
  // const OPENAI_API_KEY = '
  const OPENAI_API_KEY = apikey;

  const payload = {
    model: 'gpt-4',
    messages: [
      { role: 'system', content: '你是一名AI助理，请用中文回答用户的问题，输出内容格式美观' },
      { role: 'user', content: question }
    ],
    stream: true
  };

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${OPENAI_API_KEY}`
  };

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  document.getElementById('messages').innerHTML = "";

  if (!response.body) return;
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();

  
  localStorage.setItem('questions', document.getElementById('questions').innerHTML);
  while (true) {
    var { value, done } = await reader.read();
    if (done) break;

    const lines = value.toString().split("\n\n").filter((line) => line.trim() !== "");
    let chunk = "";
    for (const line of lines) {
      const message = line.replace("data: ", "");
      if (message === "[DONE]") return;
      chunk += JSON.parse(message).choices[0].delta.content;
    }

    document.getElementById('messages').innerHTML += chunk;
    localStorage.setItem('messagesinner', document.getElementById('messages').innerHTML);
  }
}

async function flowise(data) {
  const response = await fetch(
    "http://20.232.191.232:3000/api/v1/prediction/fc40f213-5a99-4832-ba88-9bff822b3f25",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    }
  );


  document.getElementById('messages').innerHTML = "";

  if (!response.body) return;
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  while (true) {
    var { value, done } = await reader.read();
    if (done) break;

    const lines = value.toString().split("\n\n").filter((line) => line.trim() !== "");
    let chunk = "";
    for (const line of lines) {
      const message = line.replace("data: ", "");
      if (message === "[DONE]") return;
      chunk += JSON.parse(message);
    }

    document.getElementById('messages').innerHTML += chunk;
  }

  // const result = await response.json();
  // return result;
}












