import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from './Utils.js';

const ActivityFeed = () => {
    const loadStatus = async () => {
        console.log("do we get in the func")
        var username = localStorage.getItem("username");
        // /FETCHUSERCONTACTS 
        const contacts = await axios.post(API_URL + '/fetchUserContacts', {username})
        const data = "username=" + username + "&contacts=" + '...';
        const result = await axios.post(
            API_URL + '/activityFeed',
            data
        );
    };

    return (
        <div>
            <h1>Activity Feed View</h1>
            <h4>View Your Friends' Statuses</h4>
            <form>
                <button onClick={() => loadStatus()}>Click to load statuses</button>
            </form>
        </div>
    );
};

export default ActivityFeed;
