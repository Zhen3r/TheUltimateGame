drop table if exists daily_tasks;
drop table if exists finished_tasks;
drop table if exists task_labels;
drop table if exists rewards;
drop table if exists tasks;
drop table if exists users;

-- users

create table users(
    id serial PRIMARY KEY, 
    name text not null unique,
    mail text unique,
    password text not null,
    coin integer default 0 not null,
    level integer default 1 not null,
    xp int default 0 not null,
    upgrade_xp int default 100 not null
);

insert into users (name,mail,password,coin,xp) values
('csw', 'csw@163.com', 'cswcsw123345', '10','50');



select * from users;

-- tasks

create table tasks(
    id serial primary key , 
    uid integer references users(id), 
    parent_id integer,
    name text,
    content text,
    update_time timestamp,
    is_finished boolean,
    finish_time TIMESTAMP,
    ddl timestamp,
    task_level integer not null
);

insert into tasks(uid,task_level) VALUES
(1, 2);

select * from tasks;

-- delete from tasks;

-- rewards
create table rewards(
    id serial primary key,
    uid int references users(id),
    reward_level integer not null,
    title text,
    detail text,
    repeat_times integer default 9999
);

insert into rewards(uid,reward_level) VALUES
(1,3);

select * from rewards;

-- task_labels ...

create table task_labels(
    id serial primary key,
    task_id int references tasks(id) not null,
    label text not null
);

insert into task_labels(task_id, label) VALUES
(1, 'working');

select * from task_labels;

-- finished tasks

-- create table finished_tasks(
--     id serial primary key,
--     uid integer references users(id) not null, 
--     task_id int references tasks(id) not null,
--     finish_time TIMESTAMP not null
-- );

-- insert into finished_tasks(task_id, uid, finish_time) VALUES
-- (1, 1, '2020-10-10 21:00:00');

-- select * from finished_tasks;

-- daily_tasks

create table daily_tasks(
    task_name text not null,
    uid int references users(id),
    finish_time TIMESTAMP
);

insert into daily_tasks VALUES
('check in', 1, '2021-10-10');

select * from daily_tasks;


with finish_count_today as (
    select 1 from tasks
    where uid = 2
    and date(finish_time) = date(now())
), c as (
    select count(1) count
    from finish_count_today
)
select level, count
from users, c
where id = 2
