const promptInput = document.getElementById("promptInput");

let conversationHistory = [];
const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");
myHeaders.append("Accept", "application/json");

function checkForApiKey() {
    const storedApiKey = localStorage.getItem("chatGptApiKey");
    if (storedApiKey) {
        myHeaders.append("Authorization", `Bearer ${storedApiKey}`);
        document.getElementById("loginScreen").style.display = "none";
        document.getElementById("chatScreen").style.display = "flex";
    } else {
        document.getElementById("loginScreen").style.display = "flex";
        document.getElementById("chatScreen").style.display = "none";
    }
}

document.getElementById("loginButton").addEventListener("click", function () {
    const apiKey = document.getElementById("apiKeyInput").value;
    if (apiKey) {
        // Store API Key and switch screens
        localStorage.setItem("chatGptApiKey", apiKey);
        myHeaders.append("Authorization", `Bearer ${apiKey}`);
        document.getElementById("loginScreen").style.display = "none";
        document.getElementById("chatScreen").style.display = "block";
    } else {
        alert("Please enter an API Key");
    }
});

document
    .getElementById("sendPromptButton")
    .addEventListener("click", function () {
        const prompt = promptInput.value;
        if (prompt) {
            sendChatGptPrompt(prompt);
        } else {
            alert("Please enter a prompt");
        }
    });

// document.getElementById("copyButton").addEventListener("click", function () {
//     const response = document.getElementById("responseOutput").innerText;
//     navigator.clipboard.writeText(response).then(() => {
//         alert("Response copied to clipboard");
//     });
// });

function updateConversationHistory(prompt, response) {
    // Add the user's prompt and ChatGPT's response to the history
    conversationHistory.push({ role: "user", content: prompt });
    conversationHistory.push({ role: "assistant", content: response });
}

function displayConversationHistory() {
    const chatContainer = document.getElementById("responseOutput");
    chatContainer.innerHTML = ""; // Clear existing content

    // Display each message in the conversation history
    conversationHistory.forEach((message) => {
        const messageContainer = document.createElement("div");
        const messageDiv = document.createElement("div");
        const messageRole = document.createElement("h6");
        messageRole.textContent = message.role;
        messageContainer.append(messageRole, messageDiv);
        messageContainer.className = message.role + "-wrapper";
        messageDiv.className = message.role;
        messageDiv.textContent = message.content;
        chatContainer.appendChild(messageContainer);
        appendConversationActions(messageContainer);
    });
}

function appendConversationActions(el) {
    if (el.className.includes("assistant")) {
        const actionsContainer = document.createElement("div");
        const actionsInner = document.createElement("div");
        actionsContainer.className = "actions-container";
        const copyAction = document.createElement("button");
        copyAction.innerHTML = "copy";
        const insertAction = document.createElement("button");
        insertAction.innerHTML = "insert";

        actionsContainer.appendChild(actionsInner);
        actionsInner.append(copyAction, insertAction);
        el.appendChild(actionsContainer);
    }
}

function sendChatGptPrompt(prompt) {
    const apiKey = localStorage.getItem("chatGptApiKey");
    if (!apiKey) {
        alert("API Key is missing");
        return;
    }

    // Add the user's message to the conversation history
    conversationHistory.push({ role: "user", content: prompt });

    // Construct the payload dynamically
    var raw = JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: conversationHistory,
        temperature: 1,
        top_p: 1,
        n: 1,
        stream: false,
        max_tokens: 250,
        presence_penalty: 0,
        frequency_penalty: 0
    });

    var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    // Show loading indicator
    showLoadingIndicator(true);

    fetch("https://api.openai.com/v1/chat/completions", requestOptions)
        .then((response) => response.json())
        .then((result) => {
            console.log(result);
            document.getElementById("responseOutput").style.display = "block";
            const latestResponse = result.choices[0].message.content;
            // Add the assistant's response to the conversation history
            conversationHistory.push(result.choices[0].message);
            displayConversationHistory();
            promptInput.value = "";
            showLoadingIndicator(false);
        })
        .catch((error) => {
            console.error("Error:", error);
            showLoadingIndicator(false);
            alert("Failed to fetch response from ChatGPT");
        });
}

promptInput.addEventListener("keydown", function (event) {
    // Check if the Enter key was pressed
    if (event.key === "Enter" && event.shiftKey === false) {
        // Prevent the default action to avoid submitting the form (if any)
        event.preventDefault();

        // Get the value of the prompt input
        const prompt = promptInput.value;

        // Check if the prompt is not empty
        if (prompt) {
            // Call the sendChatGptPrompt function with the prompt
            sendChatGptPrompt(prompt);
        } else {
            alert("Please enter a prompt");
        }
    }
});

function showLoadingIndicator(show) {
    const loadingIndicator = document.getElementById("loadingIndicator");
    if (show) {
        document
            .getElementById("sendPromptButton")
            .setAttribute("disabled", "");
        loadingIndicator.style.display = "block"; // or another display value used for showing it
    } else {
        document.getElementById("sendPromptButton").removeAttribute("disabled");
        loadingIndicator.style.display = "none";
    }
}

checkForApiKey();
