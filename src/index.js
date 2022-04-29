import React, { setState, useRef } from "react";
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

function Loading(props) {
    let height = props.display ? "3rem" : "0"
    let opacity = props.display ? "inherit" : "0"
    let style = { height, opacity };
    return (
        <div className="w-100 d-flex justify-content-center spinner-loading" style={style}>
            <div className="spinner-border text-dark mt-2 mb-2" role="status" >
                {/* style={{ display: props.display ? "inherit" : "none" }} */}
            </div>
        </div>
    )
}


function CardContainer(props) {
    return (
        <div className="h-100 border d-flex flex-column shadow-sm p-1 pt-0 rounded position-relative card-container-component">
            <div className="bg-light mb-1" style={{ margin: "0 -0.25rem", padding: "0 0.25rem" }}>{props.name}</div>
            {props.children}
        </div>
    )
}

function Player() {
    // const level = 5;
    return (
        <CardContainer name="Player">
            <div className="d-flex flex-column h-100 ">
                <div className="flex-grow-1" id="player-img"></div>
            </div>
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
            coin: "...",
            loading: true
        };
        this.updateUserData = this.updateUserData.bind(this);
        this.updateUserData();
    }

    updateUserData = () => {
        this.setState({ loading: true });
        MyUtils.getUserData((data) => {
            this.setState({
                level: data.level,
                xp: data.xp,
                coin: data.coin,
                upgrade_xp: data.upgrade_xp,
                loading: false,
            })
        });
    }


    render() {
        return (
            <CardContainer name="Stats">
                <Loading display={this.state.loading} />
                <div><b>Level: </b> {this.state.level} </div>
                <div><b>Coin: </b> {this.state.coin} </div>
                <div><b>XP: </b> {this.state.xp} / {this.state.upgrade_xp} </div>
            </CardContainer>
        )
    }
}

function DailyTask() {
    return (
        <CardContainer name="Daily Tasks">
        </CardContainer>
    )
}

function Rewards() {
    return (
        <CardContainer name="Rewards">
        </CardContainer>
    )
}

class OneTask extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.deleteTask = this.deleteTask.bind(this);
        this.finishTask = this.finishTask.bind(this);
    }

    finishTask() {
        this.props.refs.task.current.setState({ loading: true });
        let tid = this.props.data.id;
        MyUtils.finishTask(tid, () => {
            console.log("Finish Task Succeeded!")
            this.props.refs.task.current.getTask()
            this.props.refs.stat.current.updateUserData()
        }, (e) => {
            console.error(e);
            console.error("Finish task failed!")
        });
    }

    deleteTask() {
        this.props.refs.task.current.setState({ loading: true });
        let tid = this.props.data.id;
        MyUtils.delTask(tid, () => {
            console.log("Delete Task Succeeded!")
            this.props.refs.task.current.getTask()
        }, (e) => {
            console.error(e);
            console.error("Delete task failed!")
        });
    }

    render() {
        return (
            <li className={"list-group-item ps-2 " + (this.props.data.is_finished ? "finished-task" : "")}>
                <div className="d-flex">
                    <div className="d-flex flex-column me-2 mt-0 ms-0">
                        <button className="btn flex-grow-1 mb-2 border p-0 ps-2 pe-2" onClick={this.finishTask}><i className="fas fa-check"></i></button>
                        <button className="btn flex-grow-1 mb-2 border p-0 ps-2 pe-2" onClick={this.deleteTask}><i className="fas fa-xmark"></i></button>
                    </div>
                    <div className="flex-grow-1">
                        <div className="d-flex justify-content-between">
                            {this.props.data.is_finished ?
                                <del>{this.props.data.name}</del> :
                                <b>{this.props.data.name}</b>
                            }
                            <small>{this.props.data.update_time}</small>
                        </div>
                        <div className="d-flex justify-content-between">
                            <p>{this.props.data.content} </p>
                            <span className="badge text-secondary border ms-1 border-secondary">Level{this.props.data.task_level}</span>
                        </div>
                        <div className="d-flex justify-content-between">
                            {this.props.data.ddl ? <small>DDL: {this.props.data.ddl}</small> : <small>No DDL</small>}
                            <div>
                                {!this.props.data.label || this.props.data.label.split(",").map(l => {
                                    return <span key={l} className="badge text-secondary border ms-1 border-secondary">{l}</span>
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </li>
        )
    }
}

function AddModalInput(props) {
    let type = props.type || "text";
    return (
        <div className="mb-3 row">
            <label htmlFor={props.id} className="col-sm-3 col-form-label">{props.name}</label>
            <div className="col-sm-9">
                <input type={type} className="form-control" id={props.id}
                    placeholder={props.placeholder} onChange={props.onChange} required={props.required} />
            </div>
        </div>
    )
}

class AddTaskPopup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            content: "",
            ddl: null,
            parent_id: "",
            label: "",
            task_level: 1,
        };
        this.closerBtn = undefined;
        this.refresTaskBtn = undefined;
    }

    submitTask = (e) => {
        // alert("!")
        e.preventDefault();
        this.resetInput();
        this.props.refs.task.current.setState({ loading: true });

        MyUtils.addTask(this.state, () => {
            console.log("Update Task Succeeded!")
            this.props.refs.task.current.getTask();
        }, (e) => {
            console.error(e);
            console.error("Add task failed!")
        })

        this.closerBtn = this.closerBtn || document.querySelector("#add-task-close");
        this.closerBtn.click();
    }

    resetInput() {

    }


    render() {
        return (
            <div className="modal fade" id="add-task-modal" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <form action="" autoComplete="off" onSubmit={this.submitTask}>
                            <div className="modal-header">
                                <h5 className="modal-title" >Add Task</h5>
                                <button type="button" id="add-task-close" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <AddModalInput id="add-task-name" placeholder="What do you want to finish?" name="Task Name *"
                                    onChange={(e) => { this.setState({ name: e.target.value }) }} required />
                                <div className="row">
                                    <label className="col-sm-3 col-form-label">Task Level</label>
                                    <div className="col-sm-9 mb-3">
                                        <input type="radio" className="btn-check" checked={this.state.task_level === 1} onChange={() => { }} />
                                        <label className="btn btn-outline-secondary me-2" onClick={(e) => {
                                            this.setState({ task_level: 1 });
                                            e.preventDefault();
                                        }}>Easy</label>

                                        <input type="radio" className="btn-check" checked={this.state.task_level === 2} onChange={() => { }} />
                                        <label className="btn btn-outline-secondary me-2" onClick={(e) => {
                                            this.setState({ task_level: 2 });
                                            e.preventDefault();
                                        }}> Medium </label>

                                        <input type="radio" className="btn-check" checked={this.state.task_level === 3} onChange={() => { }} />
                                        <label className="btn btn-outline-secondary me-2" onClick={(e) => {
                                            this.setState({ task_level: 3 });
                                            e.preventDefault();
                                        }}>Hard</label>
                                    </div>
                                </div>
                                <AddModalInput id="add-task-content" placeholder="Details..." name="Content"
                                    onChange={(e) => { this.setState({ content: e.target.value }) }} />
                                <AddModalInput id="add-task-content" placeholder="" name="DDL" type="date"
                                    onChange={(e) => { this.setState({ ddl: e.target.value }) }} />
                                <AddModalInput id="add-task-content" placeholder="" name="ParentId"
                                    onChange={(e) => { this.setState({ parent_id: e.target.value }) }} />
                                <AddModalInput id="add-task-content" placeholder="Split by ','" name="Label"
                                    onChange={(e) => { this.setState({ label: e.target.value }) }} />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                <button type="submit" className="btn btn-primary">Submit</button>
                            </div>
                        </form>

                    </div>
                </div>
            </div>
        )
    }
}

function AddTaskBtn(props) {
    return (
        <button id="add-task-button" className="btn btn-secondary"
            data-bs-toggle="modal" data-bs-target="#add-task-modal" >
            <i className="fas fa-plus"></i>
        </button>
    )
}

class Tasks extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            taskData: [],
            loading: true,
        }
        this.getTask = this.getTask.bind(this);
        this.getTask();
    }

    getTask() {
        this.setState({ loading: true })
        MyUtils.getTasks((data) => {
            this.setState({ taskData: data, loading: false });
            console.log(data)
        })
    }

    render() {
        return (
            <CardContainer name="Tasks">
                <div className="h-100 overflow-auto">
                    <Loading display={this.state.loading} />
                    <ul className="task-ul">
                        <button id="task-refresh" onClick={this.getTask} style={{ display: "none" }} />
                        {this.state.taskData.map(data => <OneTask key={data.id} data={data} refs={this.props.refs} />)}
                    </ul>
                </div>

                <AddTaskBtn />
                <AddTaskPopup refs={this.props.refs} />
            </CardContainer>
        )
    }

}

function App() {
    const stat = useRef();
    const task = useRef();
    const dailyTask = useRef();
    const rewards = useRef();
    const player = useRef();
    const refs = { stat, task, dailyTask, rewards, player };
    return (
        <div className="d-flex flex-row h-100">
            <Navbar />
            <div className="container-fluid flex-grow-1 h-100">
                <div className="row row-upper">
                    <div className="col-md-3  card-container">
                        <Player ref={player} refs={refs} />
                    </div>
                    <div className="col-md-9  card-container">
                        <Stat ref={stat} refs={refs} />
                    </div>
                </div>
                <div className="row row-lower">
                    <div className="col-md-3">
                        <div className="bottom-left-upper card-container">
                            <DailyTask ref={dailyTask} refs={refs} />
                        </div>
                        <div className="bottom-left-lower card-container">
                            <Rewards ref={rewards} refs={refs} />
                        </div>
                    </div>
                    <div className="col-md-9 card-container h-100">
                        <Tasks ref={task} refs={refs} />
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


