let webapp = require("./index");

const request = require("supertest");
const RandomUserGenerator = require("random-user-generator");

const testUsername = "testUser" + Date.now();

// /*

// This is the demo API and demo test //Small tweak
describe("TestExpress endpoint", () => {
    test("test endpoint response type and content", () => {
        return request(webapp)
            .get("/testExpress")
            .then((response) => {
                expect(response.text).toMatch(/API is working well. Test now/);
            });
    });
});

describe("Test /addUser", () => {
    test("shortPasswordError", () => {
        return request(webapp)
            .post("/addUser")
            .send("username=testuser&password=pass")
            .expect(405)
            .then((response) => {
                expect(JSON.parse(response.text)).toStrictEqual({
                    message: "Failure",
                    error: "Password is less than 6 characters",
                });
            });
    });

    // Matching issues
    test("properUsernameAndPassword", () => {
        return request(webapp)
            .post("/addUser")
            .send(`username=${testUsername}&password=password123!`)
            .expect(200)
            .then((response) => {
                expect(JSON.parse(response.text).message).toStrictEqual(
                    "Success"
                );
            });
    });

    test("usernameConflict", () => {
        return request(webapp)
            .post("/addUser")
            .send(`username=girri&password=password123!`)
            .expect(400)
            .then((response) => {
                expect(JSON.parse(response.text)).toStrictEqual({
                    message: "Failure",
                    error: "Sorry, this username has been taken",
                });
            });
    });
});

describe("Test /loginUser", () => {
    test("userNotPresent", () => {
        return request(webapp)
            .post("/loginUser")
            .send("username=girri123112312343234")
            .then((response) => {
                expect(JSON.parse(response.text)).toStrictEqual({
                    message: "Failure",
                    error: "This user does not exist. Please sign up",
                });
            });
    });

    test("correctCredentials", () => {
        const expectedResult = {
            message: "Success",
            data: {
                username: testUsername,
            },
        };

        return request(webapp)
            .post("/loginUser")
            .send(`username=${testUsername}&password=password123!`)
            .then((response) => {
                expect(JSON.parse(response.text)).toStrictEqual(expectedResult);
            });
    });
});

describe("Test /profileDetails", () => {
    test("usernameNotPresent", () => {
        const randomUsername = "constitutionavenueroadphiladelphiaroad12342";
        return request(webapp)
            .get("/profileDetails")
            .send(`username=${randomUsername}`)
            .expect(200)
            .then((response) => {
                expect(JSON.parse(response.text).message).toStrictEqual(
                    "Failure"
                );
            });
    });

    test("usernamePresent", () => {
        const actualUser = "hellomindy";
        return request(webapp)
            .get("/profileDetails")
            .send(`username=${actualUser}`)
            .expect(200)
            .then((response) => {
                expect(JSON.parse(response.text).message).toStrictEqual(
                    "Failure"
                );
            });
    });
});

describe("Test /getChatMessages", () => {
    test("chatRoomPresent", () => {
        const chatRoom = "hellomindy$username1";
        return request(webapp)
            .get("/getChatMessages")
            .send(`chatRoomName=${chatRoom}`)
            .expect(200)
            .then((response) => {
                expect(JSON.parse(response.text).message).toStrictEqual(
                    "Success"
                );
            });
    });

    test("chatRoomNotPresent", () => {
        const chatRoom = "yyyyyyyy$zzzzzzajsajdadadajdajdjadjajdad";
        return request(webapp)
            .get("/getChatMessages")
            .send(`chatRoomName=${chatRoom}`)
            .expect(200)
            .then((response) => {
                expect(JSON.parse(response.text).data).toStrictEqual([]);
            });
    });
});

describe("Test /checkConversationsTable", () => {
    test("conversationTablePresent", () => {
        const chatRoom = "hellomindy$username1";
        return request(webapp)
            .post("/checkConversationsTable")
            .send(`tablename=${chatRoom}`)
            .expect(200)
            .then((response) => {
                expect(JSON.parse(response.text).data).toStrictEqual(1); //
            });
    });

    test("conversationTableNotPresent", () => {
        const chatRoom = "hhhhhhhhellomindy$username111111";
        return request(webapp)
            .post("/checkConversationsTable")
            .send(`tablename=${chatRoom}`)
            .expect(200)
            .then((response) => {
                expect(JSON.parse(response.text).data).toStrictEqual(0);
            });
    });
});

describe("Test /addMessage", () => {
    test("add proper Message", () => {
        const chatRoom = "hellomindy$username1";
        const senderUsername = "hellomindy";
        const receiverUsername = "username1";
        const body = "This is from index.test.js btw ! :) ";
        const messageInput = `tablename=${chatRoom}&sender=${senderUsername}&receiver=${receiverUsername}&message=${body}`;

        return request(webapp)
            .post("/addMessage")
            .send(messageInput)
            .expect(200)
            .then((response) => {
                expect(JSON.parse(response.text).message).toStrictEqual(
                    "Success"
                );
            });
    });
});

describe("Test /updateProfilePic", () => {
    test("usernameNotPresent", () => {
        const randomUsername = "constitutionavenueroadphiladelphiaroad12342";
        return request(webapp)
            .post("/updateProfilePic")
            .send(`username=${randomUsername}`)
            .expect(200)
            .then((response) => {
                expect(JSON.parse(response.text).message).toStrictEqual(
                    "Failure"
                );
            });
    });

    // test("usernamePresent", () => {
    //     const actualUser = "xyz123";
    //     const profileLink = "https://www.equityvp.com/images/placeholder-images/placeholder_profile_photo.png";
    //     return request(webapp)
    //         .get("/updateProfilePic")
    //         .send(`username=${actualUser}&profileLink=${profileLink}`)
    //         .expect(200)
    //         .then((response) => {
    //             expect(JSON.parse(response.text).message).toStrictEqual(
    //                 "Success"
    //             );
    //         });
    // });
});

describe("Test /postImageStatus", () => {
    test("add improper image status", () => {
        const formData = new FormData();
        formData.append(
            "image",
            "https://upload.wikimedia.org/wikipedia/commons/a/a7/LeBron_James_Lakers.jpg"
        );
        formData.append("username", "hellomindy");

        const config = {
            headers: {
                "content-type": "multipart/form-data",
            },
        };
        return request(webapp)
            .post("/postImageStatus")
            .send(formData, config)
            .expect(200);
        // .then((response) => {
        //     expect(JSON.parse(response.text).message).toStrictEqual(
        //         "Success"
        //     );
        // });
    });
});

describe("Test /getActivityFeed", () => {
    test("activity feed test", () => {
        return request(webapp)
            .get("/getActivityFeed")
            .send("username=username1")
            .expect(200);
    });
});

describe("Test /saveImage", () => {
    test("save invalid image format", () => {
        const formData = new FormData();
        formData.append(
            "image",
            "https://upload.wikimedia.org/wikipedia/commons/a/a7/LeBron_James_Lakers.jpg"
        );
        formData.append("username", "hellomindy");

        const config = {
            headers: {
                "content-type": "multipart/form-data",
            },
        };
        return request(webapp)
            .post("/saveImage")
            .send(formData, config)
            .expect(200);
    });
});

describe("Test /saveAudio", () => {
    test("save invalid audio", () => {
        const formData = new FormData();
        formData.append("image", "./covid.jpeg");
        formData.append("username", "hellomindy");

        const config = {
            headers: {
                "content-type": "multipart/form-data",
            },
        };
        return request(webapp)
            .post("/saveAudio")
            .send(formData, config)
            .expect(200);
    });
});

describe("Test /saveVideo", () => {
    test("save invalid video", () => {
        const formData = new FormData();
        formData.append("image", "./covid.jpeg");
        formData.append("username", "hellomindy");

        const config = {
            headers: {
                "content-type": "multipart/form-data",
            },
        };
        return request(webapp)
            .post("/saveVideo")
            .send(formData, config)
            .expect(200);
    });
});
// */
describe("Test /updatePassword", () => {
    test("usernameNotPresent", () => {
        const randomUsername = "constitutionavenueroadphiladelphiaroad12342";
        let originalPassword = "thisistheog";
        let newPassword = "short";
        return request(webapp)
            .post("/updatePassword")
            .send(
                `username=${randomUsername}&originalPassword=${originalPassword}&newPassword=${newPassword}`
            )
            .expect(411)
            .then((response) => {
                expect(JSON.parse(response.text).message).toStrictEqual(
                    "Failure"
                );
            });
    });

    test("usernamePresent valid pass", () => {
        const actualUser = "abcd";
        let originalPassword = "nottheOriginal";
        let newPassword = "attemptToChange";
        return request(webapp)
            .post("/updatePassword")
            .send(
                `username=${actualUser}&originalPassword=${originalPassword}&newPassword=${newPassword}`
            )
            .expect(200)
            .then((response) => {
                expect(JSON.parse(response.text).message).toStrictEqual(
                    "Success"
                );
            });
    });

    test("usernamePresent changing password to be itself", () => {
        const actualUser = "username1";
        let originalPassword = "Mohit123";
        let newPassword = "Mohit123";
        return request(webapp)
            .post("/updatePassword")
            .send(
                `username=${actualUser}&originalPassword=${originalPassword}&newPassword=${newPassword}`
            )
            .expect(200)
            .then((response) => {
                expect(JSON.parse(response.text).message).toStrictEqual(
                    "Success"
                );
            });
    });

});

describe("Test /postStatus", () => {
    test("test proper user status", () => {
        const username = "username1";
        const status = "testing our status!";
        return request(webapp)
            .post("/postStatus")
            .send(`username=${username}&status=${status}`)
            .expect(200);
    });

    test("test username doesn't exist", () => {
        const username = "asdklhfjansdfkhasdnfjkhasifjkhasiuf";
        const status = "testing our status!";
        return request(webapp)
            .post("/postStatus")
            .send(`username=${username}&status=${status}`)
            .expect(200);
    });
});

describe("Test /FetchUserContacts", () => {
    test("test username does exist", () => {
        const username = "username1";
        return request(webapp)
            .post("/FetchUserContacts")
            .send(`username=${username}`)
            .expect(200);
    });
});

describe("Test /FetchUserRemovedContacts", () => {
    test("test username does exist", () => {
        const username = "username1";
        return request(webapp)
            .post("/FetchUserRemovedContacts")
            .send(`username=${username}`)
            .expect(200);
    });
});

describe("Test /changeUserContactRemoveStatus", () => {
    test("test tablename does exist", () => {
        const tablename = "username1$hellomindy";
        return request(webapp)
            .post("/changeUserContactRemoveStatus")
            .send(`tablename=${tablename}`)
            .expect(200);
    });
});

describe("Test /FetchAllOtherContacts", () => {
    test("test contacts exist", () => {
        const contacts = "username1,hellomindy";
        return request(webapp)
            .post("/FetchAllOtherContacts")
            .send(`contacts=${contacts}`)
            .expect(200);
    });
});

describe("Test /retrieveContacts", () => {
    test("test username exist", () => {
        const contacts = "username1";
        return request(webapp)
            .get("/retrieveContacts")
            .send(`contacts=${contacts}`)
            .expect(200);
    });
});

describe("Test /validateSecurityQuestion", () => {
    test("userNotPresent", () => {
        const username = "thisusernamedoesnotexist1234";
        const SecurityQuestion = "Mary";
        return request(webapp)
            .post("/validateSecurityQuestion")
            .send(`username=${username}&SecurityQuestion=${SecurityQuestion}`)
            .expect(200)
    });

    test("user present", () => {
        const username = "username1";
        const SecurityQuestion = "Mary";
        return request(webapp)
            .post("/validateSecurityQuestion")
            .send(`username=${username}&SecurityQuestion=${SecurityQuestion}`)
            .expect(200)
    });
});

describe("Test /deleteMessage", () => {
    test("message ID invalid", () => {
        const tablename = "username1$hellomindy";
        const messageId = "12asdfahdfj345";
        return request(webapp)
            .post("/deleteMessage")
            .send(`tablename=${tablename}&messageId=${messageId}`)
            .expect(200)
    });

    test("table invalid", () => {
        const tablename = "notareal$name";
        const messageId = "12asdfahdfj345";
        return request(webapp)
            .post("/deleteMessage")
            .send(`tablename=${tablename}&messageId=${messageId}`)
            .expect(200)
    });
});

describe("Test /deleteConversation", () => {
    test("table invalid", () => {
        const tablename = "notareal$name";
        return request(webapp)
            .post("/deleteMessage")
            .send(`tablename=${tablename}`)
            .expect(200)
    });
});

describe("Test /getAccountStatus", () => {
    test("test proper account", () => {
        const username = "username1";
        return request(webapp)
            .post("/getAccountStatus")
            .send(`username=${username}`)
            .expect(200);
    });

    test("test improper account", () => {
        const username = "dsalfjaldksfj";
        return request(webapp)
            .post("/getAccountStatus")
            .send(`username=${username}`)
            .expect(500);
    });
});

describe("Test /GetUserContactArray", () => {
    // test("test proper account", () => {
    //     const username = "username1";
    //     return request(webapp)
    //         .post("/GetUserContactArray")
    //         .send(`username=${username}`)
    //         .expect(["hellomindy","square1234","testUser1607708599265","Mohit970","temp2","bigtiger","xyz123","Mohit1","whereMelissa","girri","bigtiger123","johnisalwayshere","mohit","sarah"]);
    // });

    test("test improper account", () => {
        const username = "dsalfjaldksfj";
        return request(webapp)
            .post("/GetUserContactArray")
            .send(`username=${username}`)
            .expect('[]');
    });
});

describe("Test /GetStatusList", () => {
    // test("test proper account", () => {
    //     const username = "username1";
    //     return request(webapp)
    //         .post("/GetUserContactArray")
    //         .send(`username=${username}`)
    //         .expect(["hellomindy","square1234","testUser1607708599265","Mohit970","temp2","bigtiger","xyz123","Mohit1","whereMelissa","girri","bigtiger123","johnisalwayshere","mohit","sarah"]);
    // });

    test("test improper account", () => {
        const username = "dsalfjaldksfj";
        return request(webapp)
            .get("/GetStatusList")
            .send(`username=${username}`)
            .expect(200);
    });
});

describe("Test /trackViewedStatus", () => {
    test("test proper account invalid status", () => {
        const username = "username1";
        const statusId = "12asdfahdfj345";
        return request(webapp)
            .post("/trackViewedStatus")
            .send(`username=${username}statusId=${statusId}`)
            .expect(200);
    });

    test("test improper account", () => {
        const username = "dsalfjaldksfj";
        const statusId = "12asdfahdfj345";
        return request(webapp)
            .get("/trackViewedStatus")
            .send(`username=${username}statusId=${statusId}`)
            .expect(404);
    });
});