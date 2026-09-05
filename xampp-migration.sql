use student_monitoring;

alter table workspace_state
    add column version int unsigned not null default 1 after state,
    add column created_at timestamp not null default current_timestamp after version;

create table if not exists workspace_state_history (
    history_id bigint unsigned auto_increment primary key,
    state_id varchar(64) not null,
    version int unsigned not null,
    state json not null,
    saved_at timestamp not null default current_timestamp,
    index idx_state_history_state_id (state_id),
    index idx_state_history_saved_at (saved_at),
    unique key uq_state_history_version (state_id, version)
);

insert ignore into workspace_state_history (state_id, version, state)
select id, version, state from workspace_state;
