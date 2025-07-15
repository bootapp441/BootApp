document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {
        const messages = [
            "Can I join?",
            "Please invite me to your Organized Crime",
            "I can be WE.",
            "I can drive, no Gloves.",
            "I can drive, got Gloves."
        ];

        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        const formData = new URLSearchParams();
        formData.append("sendTo", "CrazyMoFo");
        formData.append("sendMessage", randomMessage);
        formData.append("replyId", "0");

        fetch("https://www.bootleggers.us/send.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: formData.toString(),
            credentials: "include"
        }).then(response => {
            if (response.ok) {
                console.log("Message sent successfully.");
            } else {
                console.error("Failed to send message.");
            }
        }).catch(error => {
            console.error("Error:", error);
        });
    });
});
