import os
from datetime import datetime, timedelta
from typing import Any, Union, Optional
from jose import jwt
from fastapi import Header
from dotenv import load_dotenv

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7   # one week

load_dotenv()

def create_token(
    content: dict, expires_delta: timedelta = None
) -> str:
    """
    # 生成token
    :param subject: 保存到token的值
    :param expires_delta: 过期时间
    :return:
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode = {"exp": expire, **content}
    encoded_jwt = jwt.encode(to_encode, os.environ.get("SECRET_KEY"), algorithm=ALGORITHM)
    return encoded_jwt


def check_token(
     token: Optional[str] = Header(...)
) -> Union[str, Any]:
    """
    解析验证 headers中为token的值 当然也可以用 Header(..., alias="Authentication") 或者 alias="X-token"
    :param token:
    :return:
    """

    try:
        payload = jwt.decode(
            token,
            os.environ.get("SECRET_KEY"), 
            algorithms=[ALGORITHM]
        )
        return payload
    except (jwt.JWTError, jwt.ExpiredSignatureError, AttributeError):
        # 抛出自定义异常， 然后捕获统一响应
        raise Exception("Access Token Failed.")

if __name__ =="__main__":
    t = create_token("xzz")
    print(t)
    res = check_token(t)
    print(res)



