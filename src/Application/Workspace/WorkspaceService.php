<?php

declare(strict_types=1);

namespace Pilot\Application\Workspace;

use Exception;
use Pilot\Config\AppConfig;
use Pilot\Infrastructure\Persistence\WorkspaceStore;
use Pilot\Support\Text;
use RuntimeException;

final class WorkspaceService
{
    public function __construct(private readonly WorkspaceStore $store)
    {
    }

    public function load(string $id): array
    {
        $workspace = $this->store->findWorkspace($id);
        if ($workspace !== false) {
            $state = json_decode((string) $workspace['state'], true, 512, JSON_THROW_ON_ERROR);
            return ['state' => $this->normalizeState($state), 'version' => (int) $workspace['version'], 'updated_at' => $workspace['updated_at'] ?? null];
        }
        return ['state' => $this->readNormalizedState(), 'version' => 0, 'updated_at' => null];
    }

    public function save(array $payload): array
    {
        $id = (string) ($payload['id'] ?? 'main');
        $state = $this->normalizeState($payload['state'] ?? null);
        $expectedVersion = (int) ($payload['expected_version'] ?? 0);
        $encodedState = json_encode($state, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
        $pdo = $this->store->connection();
        $pdo->beginTransaction();
        try {
            $current = $this->store->lockWorkspace($id);
            if ($current === false) {
                if ($expectedVersion !== 0) {
                    throw new RuntimeException('Workspace does not exist. Refresh and try again.', 409);
                }
                $this->store->insertWorkspace($id, $encodedState);
                $version = 1;
            } else {
                $version = (int) $current['version'];
                if ($version !== $expectedVersion) {
                    throw new RuntimeException('Workspace changed. Refresh and try again.', 409);
                }
                $version++;
                $this->store->upsertWorkspaceState($id, $encodedState, $version);
            }
            $this->store->wipeNormalizedTables();
            $this->writeNormalizedState($state);
            $this->store->insertHistory($id, $version, $encodedState);
            $pdo->commit();
            return ['ok' => true, 'version' => $version];
        } catch (Exception $error) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw $error;
        }
    }

    private function readNormalizedState(): array
    {
        return ['users' => $this->store->fetchUsers(), 'students' => $this->store->fetchStudents(), 'teachers' => $this->store->fetchTeachers(), 'subjects' => $this->store->fetchSubjects(), 'courses' => $this->store->fetchCourses(), 'grades' => $this->store->fetchGrades()];
    }

    private function normalizeState(mixed $state): array
    {
        if (!is_array($state)) {
            throw new RuntimeException('Invalid workspace state.', 400);
        }
        $normalized = [];
        foreach (AppConfig::COLLECTIONS as $collection) {
            if (!isset($state[$collection]) || !is_array($state[$collection])) {
                throw new RuntimeException("Invalid workspace collection: {$collection}.", 400);
            }
            $normalized[$collection] = array_values(array_filter($state[$collection], static fn (mixed $item): bool => is_array($item)));
        }
        foreach ($normalized['students'] as &$student) {
            $academicYear = (string) ($student['academicYear'] ?? AppConfig::CURRENT_ACADEMIC_YEAR);
            $firstEnrolled = (bool) ($student['firstSemesterEnrolled'] ?? true);
            $secondEnrolled = (bool) ($student['secondSemesterEnrolled'] ?? true);
            $student['academicYear'] = $academicYear;
            $student['firstSemesterEnrolled'] = $firstEnrolled;
            $student['secondSemesterEnrolled'] = $secondEnrolled;
            $student['status'] = $academicYear !== AppConfig::CURRENT_ACADEMIC_YEAR ? 'Inactive' : (AppConfig::CURRENT_SEMESTER === '1st Semester' ? ($firstEnrolled ? 'Active' : 'Inactive') : ($secondEnrolled ? 'Active' : 'Inactive'));
        }
        unset($student);
        return $normalized;
    }

    private function writeNormalizedState(array $state): void
    {
        $existingUserIds = [];
        $userIdByEmail = [];
        $userIdByUsername = [];
        $userInsert = $this->store->prepareUserInsert();
        foreach ($state['users'] as $user) {
            if (!isset($user['id'], $user['username'], $user['email'], $user['role'])) {
                throw new Exception('Invalid user data: missing required fields', 400);
            }
            $usernameKey = strtolower(trim((string) $user['username']));
            if ($usernameKey === '') {
                throw new Exception('Username cannot be empty.', 400);
            }
            if (isset($userIdByUsername[$usernameKey])) {
                throw new RuntimeException('Username already exists in the submitted data: ' . $user['username'], 409);
            }
            $userInsert->execute([$user['id'], $user['username'], $user['password'] ?? '', $user['email'], $user['role']]);
            $existingUserIds[] = $user['id'];
            $userIdByUsername[$usernameKey] = $user['id'];
            $userIdByEmail[strtolower((string) $user['email'])] = $user['id'];
        }
        $courseInsert = $this->store->prepareCourseInsert();
        foreach ($state['courses'] as $course) {
            if (!isset($course['id'], $course['name'])) {
                throw new Exception('Invalid course data: missing required fields', 400);
            }
            $courseInsert->execute([$course['id'], $course['name'], $course['code'] ?? $course['id']]);
        }
        $teacherInsert = $this->store->prepareTeacherInsert();
        foreach ($state['teachers'] as $teacher) {
            if (!isset($teacher['id'], $teacher['name'], $teacher['email'])) {
                throw new Exception('Invalid teacher data: missing required fields', 400);
            }
            $userId = $teacher['user_id'] ?? ($userIdByEmail[strtolower((string) $teacher['email'])] ?? 'user-' . $teacher['id']);
            if (!in_array($userId, $existingUserIds, true)) {
                $userInsert->execute([$userId, $teacher['username'] ?? $userId, $teacher['password'] ?? '', $teacher['email'], 'teacher']);
                $existingUserIds[] = $userId;
            }
            $teacherInsert->execute([$teacher['id'], $userId, $teacher['name'], $teacher['email'], $teacher['department'] ?? null]);
        }
        $subjectInsert = $this->store->prepareSubjectInsert();
        foreach ($state['subjects'] as $subject) {
            if (!isset($subject['id'], $subject['name'], $subject['code'])) {
                throw new Exception('Invalid subject data: missing required fields', 400);
            }
            $subjectInsert->execute([$subject['id'], $subject['name'], $subject['code'], (int) ($subject['units'] ?? 3)]);
        }
        $courseIds = [];
        foreach ($state['courses'] as $course) {
            $courseIds[strtolower((string) $course['name'])] = $course['id'];
        }
        $studentInsert = $this->store->prepareStudentInsert();
        foreach ($state['students'] as $student) {
            if (!isset($student['id'])) {
                throw new Exception('Invalid student data: missing id', 400);
            }
            $parts = preg_split('/\s+/', trim((string) ($student['name'] ?? ''))) ?: [];
            $userId = $student['user_id'] ?? null;
            if (!$userId) {
                foreach ($state['users'] as $user) {
                    if (($user['studentId'] ?? null) === $student['id'] || ($user['username'] ?? null) === ($student['username'] ?? $student['id'])) {
                        $userId = $user['id'];
                        break;
                    }
                }
            }
            $userId ??= 'user-' . $student['id'];
            if (!in_array($userId, $existingUserIds, true)) {
                $userInsert->execute([$userId, $student['username'] ?? $student['id'], $student['password'] ?? '', $student['email'] ?? $student['id'] . '@local.test', 'student']);
                $existingUserIds[] = $userId;
            }
            $academicYear = (string) ($student['academicYear'] ?? AppConfig::CURRENT_ACADEMIC_YEAR);
            if (!preg_match('/^\d{4}-\d{4}$/', $academicYear)) {
                throw new Exception('Academic year must use YYYY-YYYY format.', 400);
            }
            $firstEnrolled = (bool) ($student['firstSemesterEnrolled'] ?? true);
            $secondEnrolled = (bool) ($student['secondSemesterEnrolled'] ?? true);
            $status = $academicYear !== AppConfig::CURRENT_ACADEMIC_YEAR ? 'Inactive' : (AppConfig::CURRENT_SEMESTER === '1st Semester' ? ($firstEnrolled ? 'Active' : 'Inactive') : ($secondEnrolled ? 'Active' : 'Inactive'));
            $student['academicYear'] = $academicYear;
            $student['firstSemesterEnrolled'] = $firstEnrolled;
            $student['secondSemesterEnrolled'] = $secondEnrolled;
            $student['status'] = $status;
            $studentInsert->execute([$student['id'], $userId, $student['firstName'] ?? ($parts[0] ?? 'Unknown'), Text::nullable($student['middleName'] ?? null), $student['lastName'] ?? (count($parts) > 1 ? end($parts) : 'Student'), Text::nullable($student['extension'] ?? null), $student['email'] ?? '', Text::nullable($student['dateOfBirth'] ?? null), Text::nullable($student['placeOfBirth'] ?? null), Text::nullable($student['currentAddress'] ?? null), Text::nullable($student['maritalStatus'] ?? null), Text::nullable($student['elementary'] ?? null), Text::nullable($student['highSchool'] ?? null), Text::nullable($student['seniorHighSchool'] ?? null), Text::nullable($student['department'] ?? null), $courseIds[strtolower((string) ($student['course'] ?? ''))] ?? null, Text::nullable($student['year'] ?? null), $status, Text::nullable($student['guardian'] ?? null), Text::nullable($student['guardianContact'] ?? null), Text::nullable($student['contact'] ?? null), Text::nullable($student['teacherId'] ?? null)]);
        }
        $teacherSubjectInsert = $this->store->prepareTeacherSubjectInsert();
        foreach ($state['teachers'] as $teacher) {
            $subjects = $teacher['subjects'] ?? ($teacher['subject_ids'] ?? []);
            $subjects = is_string($subjects) ? ($subjects === '' ? [] : explode(',', $subjects)) : $subjects;
            foreach ($subjects as $subjectId) {
                if ($subjectId !== '') {
                    $teacherSubjectInsert->execute([$teacher['id'], trim((string) $subjectId)]);
                }
            }
        }
        $gradeInsert = $this->store->prepareGradeInsert();
        foreach ($state['grades'] as $grade) {
            if (!isset($grade['id'], $grade['studentId'], $grade['subjectId'], $grade['teacherId'], $grade['grade'])) {
                throw new Exception('Invalid grade data: missing required fields', 400);
            }
            $gradeValue = (int) $grade['grade'];
            if ($gradeValue < 0 || $gradeValue > 100) {
                throw new Exception('Grade must be between 0 and 100.', 400);
            }
            $decision = $gradeValue >= AppConfig::PASSING_GRADE ? 'Pass' : 'Fail';
            $gradeInsert->execute([$grade['id'], $grade['studentId'], $grade['subjectId'], $grade['teacherId'], $gradeValue, $decision]);
        }
    }
}
