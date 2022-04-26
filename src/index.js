import React, { useState, } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Login from "./login";
import * as MyUtils from "./utils"


function Navbar() {
    return (
        <div className="nav bg-dark text-white">
            <h1>
                <a href="#1">TUG</a>
            </h1>
            <button className="no-button">
                <i className="fa-solid fa-gear fs-2"></i>
            </button>
        </div>
    )
}

function CardContainer(props) {
    return (
        <div className="h-100 border shadow-sm p-1 pt-0 rounded">
            {props.children}
        </div>
    )
}

function Player() {
    // const level = 5;
    return (
        <CardContainer>
            <div className="d-flex flex-column h-100">
                <div>player</div>
                <div className="flex-grow-1" id="player-img"></div>
            </div>
            {/* <p>Level: {level}</p> */}
            {/* <p>Buff: null</p> */}
        </CardContainer>
    )
}

class Stat extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            level: "...",
            xp: "...",
            upgrade_xp: "...",
            coin: "..."
        };
        this.updateUserData();
    }

    updateUserData = () => {
        MyUtils.getUserData((data) => {
            this.setState({
                level: data.level,
                xp: data.xp,
                coin: data.coin,
                upgrade_xp: data.upgrade_xp,
            })
        });
    }


    render() {
        return (
            <CardContainer>
                <div>stats</div>
                <div><b>Level: </b> {this.state.level} </div>
                <div><b>Coin: </b> {this.state.coin} </div>
                <div><b>XP: </b> {this.state.xp} / {this.state.upgrade_xp} </div>
            </CardContainer>
        )
    }
}

function DailyTask() {
    return (
        <CardContainer>
            <div>daily tasks</div>
        </CardContainer>
    )
}


function Rewards() {
    return (
        <CardContainer>
            <div>rewards</div>
        </CardContainer>
    )
}

class OneTask extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <li className={"list-group-item " + (this.props.data.is_finished ? "finished-task" : "")}>
                <div className="d-flex justify-content-between">
                    {this.props.data.is_finished ?
                        <del>{this.props.data.name}</del> :
                        <b>{this.props.data.name}</b>
                    }
                    <small>{this.props.data.update_time}</small>
                </div>
                <p>{this.props.data.content}</p>
                <div className="d-flex justify-content-between">
                    <small>DDL: {this.props.data.ddl}</small>
                    <div>
                        {this.props.data.label.split(",").map(l => {
                            return <span className="badge text-secondary border ms-1 border-secondary">{l}</span>
                        })}
                    </div>
                </div>
            </li>
        )
    }
}

class AddTask extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
}

class Tasks extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            taskData: [
                {
                    "id": 2,
                    "uid": 2,
                    "parent_id": null,
                    "name": "This is a finished Project",
                    "content": "This is a content",
                    "update_time": "2022-04-25 00:06:53",
                    "is_finished": true,
                    "finish_time": "2022-04-25 12:14:38",
                    "ddl": "2022-05-01 09:00:00",
                    "task_level": 1,
                    "label": "label1,label2"
                },
                {
                    "id": 3,
                    "uid": 2,
                    "parent_id": null,
                    "name": "This is an unfinished Project",
                    "content": "Another Content",
                    "update_time": "2022-04-25 00:06:53",
                    "is_finished": false,
                    "finish_time": "2022-04-25 12:14:38",
                    "ddl": "2022-05-01 09:00:00",
                    "task_level": 1,
                    "label": "label1,label2,label3"
                },
            ],
        }
        this.getTask();
    }

    getTask() {
        MyUtils.getTasks((data) => {
            // this.setState({ taskData: data });
        })
    }

    render() {
        return (
            <CardContainer>
                <div>
                    tasks
                </div>
                <ul>
                    {this.state.taskData.map(data => <OneTask data={data} />)}
                </ul>
            </CardContainer>
        )
    }

}

function App() {
    return (
        <div className="d-flex flex-row h-100">
            <Navbar />
            <div className="container-fluid flex-grow-1">
                <div className="row row-upper">
                    <div className="col-md-3  card-container">
                        <Player />
                    </div>
                    <div className="col-md-9  card-container">
                        <Stat />
                    </div>
                </div>
                <div className="row row-lower">
                    <div className="col-md-3">
                        <div className="bottom-left-upper card-container">
                            <DailyTask />
                        </div>
                        <div className="bottom-left-lower card-container">
                            <Rewards />
                        </div>
                    </div>
                    <div className="col-md-9 card-container">
                        <Tasks />
                    </div>
                </div>
            </div>
        </div>
    )
}



// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));

let renderApp = () => {
    console.log('Successfully logged in!')
    root.render(<App />)
};

let renderLogin = () => {
    console.log('Token times out! Please log in!')
    MyUtils.setCookie('token', null, 0)
    root.render(<Login />)
};

MyUtils.checkToken(renderApp, renderLogin)


