import re
import uvicorn
import datetime
import numpy as np
import pandas as pd
from hashlib import md5
from typing import Optional, Union
from fastapi import FastAPI, Cookie, Query, Body
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware

from sql_utils import sql2pd
from token_utils import create_token, check_token

app = FastAPI()

origins = ["http://0.0.0.0:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def main(token: Optional[str] = Cookie(None)):
    try:
        name = check_token(token)["name"]
        return f"Hello, {name}! You've already logged in!"
    except:
        return tokenVerifyFailure()


@app.get("/userinfo")
def userinfo(token: Optional[str] = Cookie(None)):
    try:
        uid = check_token(token)["uid"]
    except:
        return tokenVerifyFailure()

    query = """
        select name, mail, coin, level, xp, upgrade_xp
        from users 
        where id = %s
    """
    res = sql2pd(query, [uid])
    assert res is not None
    res = res.to_dict('records')[0]
    return JSONResponse(res)


@app.get("/register")
def register(name: str, mail: str, pwd: str):
    # 注册账户
    # http://0.0.0.0:8000/register?name=xzzzzzz&mail=819923&pwd=456
    pwdMD5 = md5(pwd.encode("utf8")).hexdigest()
    try:
        sql2pd(f"""
            insert into users (name, mail, password) values
            (%s, %s, %s);
        """, [name, mail, pwdMD5])
        return HTMLResponse("success")
    except Exception as e:
        # user name or mail repeats
        errorMsg = re.search(r"Key.+?\.", e.args[0]).group(0)
        errorParam, errorParamValue = re.findall(
            r"\((.+?)\)", errorMsg)
        return JSONResponse(
            {"detail": [{"loc": ["query", errorParam],
                         "msg": f"{errorParam} '{errorParamValue}' already exists.",
                         "type": "value_error.duplicating"}]},
            status_code=422
        )


@app.get("/login")
def login(mail: str, pwd: str):
    # 登陆 cookies
    # http://0.0.0.0:8000/login?mail=123&pwd=456
    pwdMD5 = md5(pwd.encode("utf8")).hexdigest()
    try:
        user = sql2pd("""
            select id, name from users
            where mail = %s
            and password = %s;
        """, [mail, pwdMD5])
    except Exception as e:
        return e.__class__.__name__, e.args

    if user is None:
        response = {"detail": [{"loc": ["query", "mail", "pwd"],
                                "msg": f"Mail or password is wrong!",
                                "type": "login.failure"}]}
        response = JSONResponse(response, 401)
        response.set_cookie(key="token", value=None)
        return response

    user = user.squeeze()
    name = user["name"]
    uid = user["id"]

    token = create_token({"name": str(name), "uid": str(uid)})
    response = JSONResponse({"token": token, "msg": "success"})
    response.set_cookie(key="token", value=token)
    return response


@app.get("/addtask")
def addtask(
    name: str,
    task_level: int,
    parent_id: Optional[int] = None,
    content: Optional[str] = None,
    ddl: Optional[datetime.datetime] = None,
    is_finished: Optional[bool] = False,
    label: Optional[str] = None,
    token: Optional[str] = Cookie(None),
):
    # 添加任务
    try:
        uid = check_token(token)["uid"]
    except:
        return tokenVerifyFailure()

    update_time = datetime.datetime.now()
    vars = {"uid": uid, "parent_id": parent_id, "name": name,
            "content": content, "update_time": update_time,
            "is_finished": is_finished,
            "ddl": ddl, "task_level": task_level}

    varsNonNull = {k: v for k, v in vars.items() if v is not None}
    varNames = ",".join(varsNonNull.keys())
    varValues = varsNonNull.values()
    varValuesPlaceHolders = ",".join(["%s" for _ in varsNonNull.keys()])

    query = f'insert into tasks ({varNames}) values ({varValuesPlaceHolders});'
    sql2pd(query=query, vars=varValues)

    if label:
        label = label.split(",")
        for s in label:
            query = '''
                insert into task_labels(task_id, label)
                VALUES ((select max(id) from tasks), %s);
            '''
            sql2pd(query, [s])

    return HTMLResponse('success')

# 移除任务


def calcTaskXP(level, finishedCount):
    dailyXP = level ** 0.5 * 1000
    coef = 2 ** (1 - (finishedCount//3))
    xp = dailyXP / 9 * coef
    return round(xp, 0)


def calcUpgradeXP(level):
    dailyXP = level ** 0.5 * 1000
    upgradeDays = level ** 1.2 * 0.002 + 0.1
    return round(dailyXP * upgradeDays)


def getUserGameInfo(uid):
    query = """
        select xp, level, upgrade_xp, coin
        from users 
        where id = %s
    """
    res = sql2pd(query, [uid])
    assert res is not None
    res = res.squeeze()
    return [int(_) for _ in [res.xp, res.level, res.upgrade_xp, res.coin]]


def addXP(uid, xp):
    xp_now, level, upgrade_xp, _ = getUserGameInfo(uid)
    old_level = level
    xp_now += xp
    while xp_now > upgrade_xp:
        xp_now -= upgrade_xp
        level += 1
        upgrade_xp = calcUpgradeXP(level)

    query = """
        update users set 
        xp=%s, level=%s, upgrade_xp=%s
        where id = %s
    """
    sql2pd(query, [xp_now, level, upgrade_xp, uid])
    return {"upgrade": level-old_level, "xp": xp}


@app.get("/finishtask")
def finishtask(task_id: int, token: Optional[str] = Cookie(None)):
    # 完成任务
    # finish task, add xp, check upgrade
    # info needs: uid, level, xp, upgrade xp, 今日完成的第几个task

    try:
        uid = check_token(token)["uid"]
    except:
        return tokenVerifyFailure()

    # TODO: Don't finish finished task
    is_finished = sql2pd(
        'select is_finished from tasks where id = %s', [task_id])
    is_finished = is_finished.squeeze()
    print(is_finished)
    if is_finished:
        return JSONResponse({"detail": [{"msg": "Task already finished!"}]}, 422)

    # change task status in table
    query = """
        update tasks set
        is_finished = true, finish_time = now()
        where id = %s and uid = %s
    """
    sql2pd(query, [task_id, uid])

    # 增加经验
    query = '''
        with finish_count_today as (
            select 1 from tasks
            where uid = %s
            and date(finish_time) = date(now())
        ), c as (
            select count(1) count
            from finish_count_today
        )
        select level, count
        from users, c
        where id = %s
    '''
    res = sql2pd(query, [uid, uid]).squeeze()
    level, count = res[["level", "count"]]
    xp = calcTaskXP(level, count)
    res = addXP(uid, xp)

    return JSONResponse(res)


@app.get("/changetask")
def changetask(
    task_id: int,
    name: Optional[str] = None,
    task_level: Optional[Union[int, str]] = None,
    parent_id: Optional[Union[int, str]] = None,
    content: Optional[str] = None,
    ddl: Optional[Union[datetime.datetime, str]] = None,
    update_time: Optional[Union[datetime.datetime, str]] = None,
    is_finished: Optional[Union[bool, str]] = None,
    finish_time: Optional[Union[datetime.datetime, str]] = None,
    label: Optional[str] = None,
    token: Optional[str] = Cookie(None),
):
    # 修改任务
    try:
        uid = check_token(token)["uid"]
    except:
        return tokenVerifyFailure()

    vars = {"parent_id": parent_id, "name": name,
            "content": content, "update_time": update_time,
            "is_finished": is_finished, "finish_time": finish_time,
            "ddl": ddl, "task_level": task_level}

    varsNonNull = {k: v for k, v in vars.items() if v is not None}
    varsNonNull = {k: v if v != "" else None for k, v in varsNonNull.items()}
    print(varsNonNull)
    queryBody = ",".join([f"{k} = %s" for k, v in varsNonNull.items()])
    varValues = varsNonNull.values()

    query = f'''update tasks set
                {queryBody}
                where uid={uid} and id={task_id}'''
    print(query, varValues)
    sql2pd(query=query, vars=varValues)

    if label is not None:
        sql2pd(f'delete from task_labels where task_id = %s', [task_id])
        label = label.split(",")
        for s in label:
            query = '''
                insert into task_labels(task_id, label)
                VALUES (%s, %s);
            '''
            sql2pd(query, [task_id, s])

    return HTMLResponse('success')


@ app.get("/gettask")
def gettask(token: Optional[str] = Cookie(None)):
    # 获取任务
    # http://0.0.0.0:8000/gettask
    try:
        uid = check_token(token)["uid"]
    except:
        return tokenVerifyFailure()

    res = sql2pd(f"""
        with t as (
            select * from tasks
            where uid=%s
        ), aggTaskLabel as (
            select task_id, STRING_AGG(label, ',') as label
            from task_labels
            group by task_id
        )

        select t.*, l.label from t
        left join aggTaskLabel l 
        on t.id = l.task_id
    """, [uid])

    if res is None:
        return []

    res["update_time"] = pd.to_datetime(
        res["update_time"]).dt.strftime('%Y-%m-%d %X')
    res["ddl"] = pd.to_datetime(res["ddl"]).dt.strftime('%Y-%m-%d %X')
    res["finish_time"] = pd.to_datetime(
        res["finish_time"]).dt.strftime('%Y-%m-%d %X')

    res = res.replace({np.nan: None})
    response = JSONResponse(res.to_dict('records'))
    return response


# 添加奖励

# 修改奖励

# 抽奖

# 完成每日任务


def tokenVerifyFailure():
    response = {"detail": [{"loc": ["token"],
                            "msg": f"Token times out.",
                            "type": "token.failure"}]}
    response = JSONResponse(response, 401)
    response.set_cookie(key="token", value=None)
    return response


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, )
