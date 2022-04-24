import os
import pandas as pd
from pandas.io.sql import DatabaseError

# import psycopg2
from sqlalchemy import create_engine
from dotenv import load_dotenv

load_dotenv()

host = os.environ.get("PG_HOST")
port = os.environ.get("PG_PORT")
database = os.environ.get("PG_DB")
user = os.environ.get("PG_USER")
password = os.environ.get("PG_PWD")

conn = create_engine(
    f'postgresql://{user}:{password}@{host}:{port}/{database}')


def sql2pd(query: str, vars: list):
    try:
        res = pd.read_sql(query, conn, params=vars)
    except DatabaseError as e:
        raise Exception(e.__class__.__name__, e.args)
    return res


if __name__ == "__main__":
    sql2pd(
        """
        select * from users;
    """
    )
