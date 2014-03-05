var chatId = document.getElementById('chat-id'), iframe = document.createElement("iframe");
iframe.setAttribute("src", "http://localhost/chat");
iframe.style.width = 640+"px";
iframe.style.height = 480+"px";
chatId.appendChild(iframe);