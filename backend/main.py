import re
import uvicorn
from hashlib import md5
from typing import Optional
from fastapi import FastAPI, Cookie
from fastapi.responses import JSONResponse, HTMLResponse

from sql_utils import sql2pd
from token_utils import create_token, check_token

app = FastAPI()


@app.get("/")
def main(token: Optional[str] = Cookie(None)):
    try:
        name = check_token(token)["name"]
        return f"Hello, {name}! You've already logged in!"
    except:
        return HTMLResponse("Please <a href='setname?name=xzz'>log in!</a>", 401)


@app.get("/setname")
def setname(name: str, uid: Optional[int] = 1):
    response = JSONResponse({"Hello": name})
    token = create_token({"name": name, "uid": uid})
    response.set_cookie(key="token", value=token)
    return response

# 注册账户


@app.get("/register")
def register(name: str, mail: str, pwd: str):
    # http://0.0.0.0:8000/register?name=xzzz&mail=123&pwd=456
    pwdMD5 = md5(pwd.encode("utf8")).hexdigest()
    try:
        sql2pd(f"""
            insert into users (name, mail, password) values
            (%s, %s, %s);
        """, [name, mail, pwdMD5])
        return {}
    except Exception as e:
        errorMsg = re.search(r"Key.+?\.", e.args[0]).group(0)
        errorParam, errorParamValue = re.findall(
            r"\((.+?)\)", errorMsg)
        return JSONResponse(
            {"detail": [{"loc": ["query", errorParam],
                         "msg": f"{errorParam} '{errorParamValue}' already exists.",
                         "type": "value_error.duplicating"}]},
            status_code=422
        )

# 登陆 cookies

# 添加任务

# 完成任务

# 移除任务

# 修改任务

# 获取任务


@app.get("/gettask")
def gettask(token: Optional[str] = Cookie(None)):
    # http://0.0.0.0:8000/setname?name=xzz&id=1
    # http://0.0.0.0:8000/gettask
    try:
        uid = check_token(token)["uid"]
    except:
        return HTMLResponse("Please <a href='setname?name=xzz'>log in!</a>", 401)

    res = execSQL(f"""
        select * from tasks
        where uid=%s
    """, [uid])
    return res if res else 'success'


# 添加奖励

# 修改奖励

# 抽奖

# 完成每日任务
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, )
