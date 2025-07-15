document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {
        const formData = new URLSearchParams();
        formData.append("topicSubject", "");
        formData.append("replyMes", ":+jam+:");
        formData.append("submitTitle", "Add!");
        formData.append("selectedFlag", "26");
        formData.append("uno-type", "1");
        formData.append("uno-players", "3");
        formData.append("uno-entryFee", "0");
        formData.append("uno-joiners", "1");
        formData.append("addPoints", "");
        formData.append("replyTo", "659518"); // Change this to target a different topic
        formData.append("editIt", "x");

        fetch("https://www.bootleggers.us/forum_new/view.php?forum=1&id=659518", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: formData.toString(),
            credentials: "include"
        }).then(response => {
            if (response.ok) {
                console.log("Post submitted successfully.");
            } else {
                console.error("Failed to post.");
            }
        }).catch(error => {
            console.error("Error:", error);
        });
    });
});