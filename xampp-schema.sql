-- ------------------------------------------------------------
-- Create Database
-- ------------------------------------------------------------


-- ------------------------------------------------------------
-- 1. Users (authentication & roles)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id          VARCHAR(64) PRIMARY KEY,
    username    VARCHAR(64) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    role        ENUM('admin', 'teacher', 'student') NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 2. Courses
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS courses (
    id          VARCHAR(64) PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    code        VARCHAR(20) NOT NULL UNIQUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 3. Teachers (profile)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS teachers (
    id          VARCHAR(64) PRIMARY KEY,
    user_id     VARCHAR(64) NOT NULL UNIQUE,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(255) NOT NULL,
    department  VARCHAR(100),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_teacher_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 4. Students (profile)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS students (
    id                  VARCHAR(64) PRIMARY KEY,
    user_id             VARCHAR(64) NOT NULL UNIQUE,
    first_name          VARCHAR(50) NOT NULL,
    middle_name         VARCHAR(50),
    last_name           VARCHAR(50) NOT NULL,
    extension           VARCHAR(10),
    email               VARCHAR(255) NOT NULL,
    date_of_birth       DATE,
    place_of_birth      VARCHAR(100),
    current_address     VARCHAR(255),
    marital_status      ENUM('Single','Married','Widowed','Separated'),
    elementary          VARCHAR(100),
    high_school         VARCHAR(100),
    senior_high_school  VARCHAR(100),
    department          VARCHAR(150),
    course_id           VARCHAR(64),
    year_level          ENUM('1st Year','2nd Year','3rd Year','4th Year'),
    status              ENUM('Active','Pending','Inactive') DEFAULT 'Pending',
    guardian_name       VARCHAR(100),
    guardian_contact    VARCHAR(20),
    contact             VARCHAR(20),
    teacher_id          VARCHAR(64),
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL,
    INDEX idx_student_email (email),
    INDEX idx_student_course (course_id),
    INDEX idx_student_teacher (teacher_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 5. Subjects
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subjects (
    id          VARCHAR(64) PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    code        VARCHAR(20) NOT NULL UNIQUE,
    units       TINYINT UNSIGNED NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 6. Teacher ↔ Subject (many‑to‑many)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS teacher_subject (
    teacher_id  VARCHAR(64) NOT NULL,
    subject_id  VARCHAR(64) NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (teacher_id, subject_id),
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 7. Grades
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS grades (
    id          VARCHAR(64) PRIMARY KEY,
    student_id  VARCHAR(64) NOT NULL,
    subject_id  VARCHAR(64) NOT NULL,
    teacher_id  VARCHAR(64) NOT NULL,
    grade       TINYINT UNSIGNED NOT NULL CHECK (grade BETWEEN 0 AND 100),
    decision    ENUM('Pass','Fail') NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    UNIQUE KEY uk_student_subject (student_id, subject_id),
    INDEX idx_grade_teacher (teacher_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 8. State snapshots (for UI's "workspace_state" compatibility)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workspace_state (
    id          VARCHAR(64) PRIMARY KEY,
    state       JSON NOT NULL,
    version     INT UNSIGNED NOT NULL DEFAULT 1,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_workspace_state_updated (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS workspace_state_history (
    history_id  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    state_id    VARCHAR(64) NOT NULL,
    version     INT UNSIGNED NOT NULL,
    state       JSON NOT NULL,
    saved_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_state_version (state_id, version),
    INDEX idx_history_state_id (state_id),
    INDEX idx_history_saved_at (saved_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 9. Demo Data
-- ------------------------------------------------------------
INSERT IGNORE INTO users (id, username, password, email, role) VALUES
    ('u-admin', 'admin', 'admin123', 'admin@school.test', 'admin'),
    ('u-teacher', 'teacher', 'teacher123', 'teacher@school.test', 'teacher'),
    ('u-teacher-2', 'taylor', 'teacher123', 'taylor@school.test', 'teacher'),
    ('u-student-1', 'ST-001', 'student123', 'juan@student.test', 'student'),
    ('u-student', 'ST-002', 'student123', 'student@school.test', 'student'),
    ('u-student-3', 'ST-003', 'student123', 'pedro@student.test', 'student');

INSERT IGNORE INTO courses (id, name, code) VALUES
    ('C-001', 'Information Systems', 'BSIS'),
    ('C-002', 'Computer Science', 'BSCS');

INSERT IGNORE INTO teachers (id, user_id, name, email, department) VALUES
    ('T-001', 'u-teacher', 'Jordan Lee', 'teacher@school.test', 'Information Systems'),
    ('T-002', 'u-teacher-2', 'Taylor Cruz', 'taylor@school.test', 'Computer Science');

INSERT IGNORE INTO subjects (id, name, code, units) VALUES
    ('SUB-001', 'Web Systems', 'IS 201', 3),
    ('SUB-002', 'Database Management', 'IS 202', 3),
    ('SUB-003', 'Data Structures', 'CS 203', 3);

INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) VALUES
    ('T-001', 'SUB-001'),
    ('T-001', 'SUB-002'),
    ('T-002', 'SUB-003');

INSERT IGNORE INTO students (id, user_id, first_name, last_name, email, course_id, year_level, status, guardian_name, guardian_contact, contact, teacher_id) VALUES
    ('ST-001', 'u-student-1', 'Juan', 'Dela Cruz', 'juan@student.test', 'C-001', '1st Year', 'Active', 'Rosa Dela Cruz', '0917 555 0101', '0917 555 0102', 'T-001'),
    ('ST-002', 'u-student', 'Maria', 'Santos', 'maria@student.test', 'C-001', '1st Year', 'Active', 'Elena Santos', '0917 555 0103', '0917 555 0104', 'T-001'),
    ('ST-003', 'u-student-3', 'Pedro', 'Reyes', 'pedro@student.test', 'C-002', '2nd Year', 'Active', 'Ramon Reyes', '0917 555 0105', '0917 555 0106', 'T-002');

INSERT IGNORE INTO grades (id, student_id, subject_id, teacher_id, grade, decision) VALUES
    ('G-001', 'ST-001', 'SUB-001', 'T-001', 91, 'Pass'),
    ('G-002', 'ST-002', 'SUB-001', 'T-001', 88, 'Pass'),
    ('G-003', 'ST-002', 'SUB-002', 'T-001', 84, 'Pass');

-- Initialize workspace_state for compatibility
INSERT INTO workspace_state (id, state, version) 
SELECT 'main', 
    JSON_OBJECT(
        'users', (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', id, 'username', username, 'email', email, 'role', role)) FROM users),
        'students', (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', id, 'name', CONCAT_WS(' ', first_name, middle_name, last_name), 'email', email, 'course', (SELECT name FROM courses WHERE id = course_id), 'year', year_level, 'status', status, 'teacherId', teacher_id)) FROM students),
        'teachers', (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', id, 'name', name, 'email', email, 'department', department)) FROM teachers),
        'subjects', (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', id, 'name', name, 'code', code, 'units', units)) FROM subjects),
        'courses', (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', id, 'name', name, 'code', code)) FROM courses),
        'grades', (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', id, 'studentId', student_id, 'subjectId', subject_id, 'teacherId', teacher_id, 'grade', grade, 'decision', decision)) FROM grades)
    ),
    1
ON DUPLICATE KEY UPDATE 
    state = VALUES(state),
    version = version + 1,
    updated_at = CURRENT_TIMESTAMP;