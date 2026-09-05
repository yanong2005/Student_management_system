<?php
declare(strict_types=1);
namespace Pilot\Infrastructure\Persistence;
use PDO;
use PDOStatement;
final class WorkspaceStore
{
    public function __construct(private readonly PDO $pdo)
    {
    }
    public function connection(): PDO
    {
        return $this->pdo;
    }
    /** @return list<array<string, mixed>> */
    public function fetchUsers(): array
    {
        $stmt = $this->pdo->query("SELECT u.id, u.username, u.email, u.password, u.role, s.id as studentId, COALESCE(NULLIF(t.name, ''), NULLIF(CONCAT_WS(' ', s.first_name, NULLIF(s.middle_name, ''), s.last_name, NULLIF(s.extension, '')), ''), CASE WHEN u.role = 'admin' THEN 'Administrator' ELSE u.username END) as name FROM users u LEFT JOIN students s ON s.user_id = u.id LEFT JOIN teachers t ON t.user_id = u.id");
        return $stmt->fetchAll();
    }
    /** @return list<array<string, mixed>> */
    public function fetchStudents(): array
    {
        $stmt = $this->pdo->query("
            SELECT s.id, s.user_id, CONCAT_WS(' ', s.first_name, NULLIF(s.middle_name, ''), s.last_name, NULLIF(s.extension, '')) as name,
                s.first_name as firstName, s.middle_name as middleName, s.last_name as lastName, s.extension,
                s.email, s.date_of_birth as dateOfBirth, s.place_of_birth as placeOfBirth,
                s.current_address as currentAddress, s.marital_status as maritalStatus,
                s.elementary, s.high_school as highSchool, s.senior_high_school as seniorHighSchool,
                s.department,
                c.name as course, s.year_level as year, s.status, s.guardian_name as guardian,
                s.guardian_contact as guardianContact, s.contact, s.teacher_id as teacherId,
                s.course_id
            FROM students s 
            LEFT JOIN courses c ON s.course_id = c.id 
            LEFT JOIN teachers t ON s.teacher_id = t.id
        ");
        return $stmt->fetchAll();
    }
    /** @return list<array<string, mixed>> */
    public function fetchTeachers(): array
    {
        $stmt = $this->pdo->query("
            SELECT t.id, t.user_id, t.name, t.email, t.department,
                   GROUP_CONCAT(s.subject_id) as subject_ids 
            FROM teachers t 
            LEFT JOIN teacher_subject s ON t.id = s.teacher_id 
            GROUP BY t.id
        ");
        return $stmt->fetchAll();
    }
    /** @return list<array<string, mixed>> */
    public function fetchSubjects(): array
    {
        $stmt = $this->pdo->query("SELECT * FROM subjects");
        return $stmt->fetchAll();
    }
    /** @return list<array<string, mixed>> */
    public function fetchCourses(): array
    {
        $stmt = $this->pdo->query("
            SELECT c.id, c.name, c.code, COUNT(s.id) as students 
            FROM courses c 
            LEFT JOIN students s ON c.id = s.course_id 
            GROUP BY c.id
        ");
        return $stmt->fetchAll();
    }
    /** @return list<array<string, mixed>> */
    public function fetchGrades(): array
    {
        $stmt = $this->pdo->query("SELECT id, student_id as studentId, subject_id as subjectId, teacher_id as teacherId, grade, decision FROM grades");
        return $stmt->fetchAll();
    }
    /** @return array<string, mixed>|false */
    public function findWorkspace(string $id): array|false
    {
        $stmt = $this->pdo->prepare("SELECT state, version, updated_at FROM workspace_state WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }
    public function insertWorkspace(string $id, string $encodedState): void
    {
        $stmt = $this->pdo->prepare("INSERT INTO workspace_state (id, state, version) VALUES (?, ?, 1)");
        $stmt->execute([$id, $encodedState]);
    }
    /** @return array<string, mixed>|false */
    public function lockWorkspace(string $id): array|false
    {
        $current = $this->pdo->prepare('SELECT version FROM workspace_state WHERE id = ? FOR UPDATE');
        $current->execute([$id]);
        return $current->fetch();
    }
    public function wipeNormalizedTables(): void
    {
        $this->pdo->exec('DELETE FROM grades');
        $this->pdo->exec('DELETE FROM teacher_subject');
        $this->pdo->exec('DELETE FROM students');
        $this->pdo->exec('DELETE FROM teachers');
        $this->pdo->exec('DELETE FROM subjects');
        $this->pdo->exec('DELETE FROM courses');
        $this->pdo->exec('DELETE FROM users');
    }
    public function prepareUserInsert(): PDOStatement
    {
        return $this->pdo->prepare('INSERT INTO users (id, username, password, email, role) VALUES (?, ?, ?, ?, ?)');
    }
    public function prepareCourseInsert(): PDOStatement
    {
        return $this->pdo->prepare('INSERT INTO courses (id, name, code) VALUES (?, ?, ?)');
    }
    public function prepareTeacherInsert(): PDOStatement
    {
        return $this->pdo->prepare('INSERT INTO teachers (id, user_id, name, email, department) VALUES (?, ?, ?, ?, ?)');
    }
    public function prepareSubjectInsert(): PDOStatement
    {
        return $this->pdo->prepare('INSERT INTO subjects (id, name, code, units) VALUES (?, ?, ?, ?)');
    }
    public function prepareStudentInsert(): PDOStatement
    {
        return $this->pdo->prepare('INSERT INTO students (id, user_id, first_name, middle_name, last_name, extension, email, date_of_birth, place_of_birth, current_address, marital_status, elementary, high_school, senior_high_school, department, course_id, year_level, status, guardian_name, guardian_contact, contact, teacher_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    }
    public function prepareTeacherSubjectInsert(): PDOStatement
    {
        return $this->pdo->prepare('INSERT INTO teacher_subject (teacher_id, subject_id) VALUES (?, ?)');
    }
    public function prepareGradeInsert(): PDOStatement
    {
        return $this->pdo->prepare('INSERT INTO grades (id, student_id, subject_id, teacher_id, grade, decision) VALUES (?, ?, ?, ?, ?, ?)');
    }
    public function upsertWorkspaceState(string $id, string $encodedState, int $version): void
    {
        $save = $this->pdo->prepare('INSERT INTO workspace_state (id, state, version) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE state = VALUES(state), version = VALUES(version), updated_at = CURRENT_TIMESTAMP');
        $save->execute([$id, $encodedState, $version]);
    }
    public function insertHistory(string $id, int $version, string $encodedState): void
    {
        $history = $this->pdo->prepare('INSERT INTO workspace_state_history (state_id, version, state) VALUES (?, ?, ?)');
        $history->execute([$id, $version, $encodedState]);
    }
}