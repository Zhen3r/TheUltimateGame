import React, { useState, useSyncExternalStore } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";


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
        <div className="h-100 border shadow-sm ps-1 pe-1">
            {props.children}
        </div>
    )
}

function Player() {
    const level = 5;
    return (
        <CardContainer>
            <b>player</b>
            <div style={{ height: '70%', background: '#ddd' }}></div>
            <p>Level: {level}</p>
            <p>Buff: null</p>

        </CardContainer>
    )
}

function Stat() {
    return (
        <CardContainer>
            <div>stats</div>
        </CardContainer>
    )
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


function Tasks(props) {
    let tasks = [
        { name: 't1', subTask: null },
        { name: 't2', subTask: null },
        {
            name: 't3', subTask: [
                {
                    name: 't31', subTask: [{ name: 't1', subTask: null },
                    { name: 't2', subTask: null },]
                },
                { name: 't31', subTask: null },
                { name: 't31', subTask: null },
            ]
        },
        { name: 't4', subTask: null },
        { name: 't5', subTask: null },
    ];


    const taskToHtml = (tasks) => {
        let li = [];
        tasks.forEach((task, i) => {
            li.push(<li key={i}>{task.name}</li>)
            if (task.subTask) {
                li.push(taskToHtml(task.subTask));
            }
        })
        return <ul>{li}</ul>
    }

    const [ul, setUl] = useState(taskToHtml(tasks));
    // setUl(taskToHtml(tasks));

    return (
        <CardContainer>
            <div>
                tasks
                <button className="btn btn-secondary" onClick={() => { setUl(<ul></ul>) }}>Clear</button>
            </div>
            {ul}
        </CardContainer>
    )
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
root.render(<App />);