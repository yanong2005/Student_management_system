USE student_monitoring;

ALTER TABLE students
    ADD COLUMN department VARCHAR(150) NULL AFTER senior_high_school;