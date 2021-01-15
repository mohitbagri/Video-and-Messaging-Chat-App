import React from "react";
import renderer from "react-test-renderer";
import ActivityFeed from "./ActivityFeed.js";
import ChangePassword from "./ChangePassword.js";
import Chat from "./Chat.js";
// import ChatRoom from "./ChatRoom.js";
import DeactivateAccount from "./DeactivateAccount.js";
import Home from "./Home.js";
import Incoming from "./Incoming.js";
import Login from "./Login.js";
import Main from "./Main.js";
import MainView from "./MainView.js";
import OnCall from "./OnCall.js";
import Phone from "./Phone.js";
import PostStatus from "./PostStatus.js";
// import Timer from "./Timer.js";
import states from "./twilioStates.js";
import UserSignUp from "./UserSignUp.js";
// import ViewStatus from "./ViewStatus.js";

describe("ActivityFeed.js test", () => {
    it("snapshot test", () => {
        const tree = renderer.create(<ActivityFeed />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});

describe("ChangePassword.js test", () => {
    it("snapshot test", () => {
        const tree = renderer
            .create(<ChangePassword />)
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});

describe("Chat.js test", () => {
    it("snapshot test", () => {
        const tree = renderer
            .create(<Chat />)
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});

// describe("ChatRoom.js test", () => {
//     it("snapshot test", () => {
//         const tree = renderer
//             .create(<ChatRoom />)
//             .toJSON();
//         expect(tree).toMatchSnapshot();
//     });
// });

describe("DeactivateAccount.js test", () => {
    it("snapshot test", () => {
        const tree = renderer
            .create(<DeactivateAccount />)
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});

describe("Home.js test", () => {
    it("snapshot test", () => {
        const tree = renderer
            .create(<Home />)
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});

describe("Incoming.js test", () => {
    it("snapshot test", () => {
        const tree = renderer
            .create(<Incoming />)
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});

describe("Login.js test", () => {
    it("snapshot test", () => {
        let wrapper = <Login.WrappedComponent />;
        expect(wrapper).toMatchSnapshot();
    });
});

describe("Main.js test", () => {
    it("snapshot test", () => {
        let wrapper = <Main.WrappedComponent />;
        expect(wrapper).toMatchSnapshot();
    });
});

describe("MainView.js test", () => {
    it("snapshot test", () => {
        let wrapper = <MainView.WrappedComponent />;
        expect(wrapper).toMatchSnapshot();
    });
});

describe("OnCall.js test", () => {
    it("snapshot test", () => {
        const tree = renderer
            .create(<OnCall />)
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});

describe("Phone.js test", () => {
    it("snapshot test", () => {
        const tree = renderer
            .create(<Phone />)
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});

describe("PostStatus.js test", () => {
    it("snapshot test", () => {
        let wrapper = <PostStatus.WrappedComponent />;
        expect(wrapper).toMatchSnapshot();
    });
});

// describe("Timer.js test", () => {
//     it("snapshot test", () => {
//         const tree = renderer
//             .create(<Timer />)
//             .toJSON();
//         expect(tree).toMatchSnapshot();
//     });
// });

describe("twilioStates.js test", () => {
    it("snapshot test", () => {
        let wrapper = <states />;
        expect(wrapper).toMatchSnapshot();
    });
});


describe("UserSignUp.js test", () => {
    it("snapshot test", () => {
        let wrapper = <UserSignUp.WrappedComponent />;
        expect(wrapper).toMatchSnapshot();
    });
});

// describe("ViewStatus.js test", () => {
//     it("snapshot test", () => {
//         const tree = renderer
//             .create(<ViewStatus />)
//             .toJSON();
//         expect(tree).toMatchSnapshot();
//     });
// });
