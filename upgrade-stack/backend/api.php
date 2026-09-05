<?php

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function jsonResponse($status, $payload): void {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

$action = $_GET['action'] ?? '';
$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    $input = [];
}

$users = [
    ['id' => 'u-admin', 'username' => 'admin', 'password' => 'admin123', 'role' => 'admin', 'name' => 'Alex Morgan'],
    ['id' => 'u-teacher', 'username' => 'teacher', 'password' => 'teacher123', 'role' => 'teacher', 'name' => 'Jordan Lee'],
    ['id' => 'u-student', 'username' => 'ST-002', 'password' => 'student123', 'role' => 'student', 'name' => 'Maria Santos'],
];

if ($action === 'login') {
    $username = trim((string)($input['username'] ?? $_POST['username'] ?? ''));
    $password = (string)($input['password'] ?? $_POST['password'] ?? '');

    if ($username === '' || $password === '') {
        jsonResponse(400, ['error' => 'Username and password are required.']);
    }

    $user = null;
    foreach ($users as $account) {
        if (strcasecmp($account['username'], $username) === 0 && $account['password'] === $password) {
            $user = $account;
            break;
        }
    }

    if (!$user) {
        jsonResponse(401, ['error' => 'Invalid username or password.']);
    }

    jsonResponse(200, [
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'name' => $user['name'],
            'role' => $user['role'],
        ],
        'token' => 'demo-token-' . time(),
    ]);
}

if ($action === 'dashboard') {
    $role = strtolower(trim((string)($input['role'] ?? $_GET['role'] ?? $_POST['role'] ?? 'admin')));
    if ($role === '') {
        $role = 'admin';
    }

    $statsByRole = [
        'admin' => [
            ['label' => 'Active students', 'value' => '1,284'],
            ['label' => 'Teachers', 'value' => '86'],
            ['label' => 'Subjects', 'value' => '42'],
            ['label' => 'At risk', 'value' => '19'],
        ],
        'teacher' => [
            ['label' => 'Assigned students', 'value' => '46'],
            ['label' => 'Passing rate', 'value' => '89%'],
            ['label' => 'Pending grades', 'value' => '12'],
            ['label' => 'Class load', 'value' => '6'],
        ],
        'student' => [
            ['label' => 'Attendance', 'value' => '96%'],
            ['label' => 'Current GPA', 'value' => '3.7'],
            ['label' => 'Completed units', 'value' => '24'],
            ['label' => 'Alerts', 'value' => '2'],
        ],
    ];

    $students = [
        ['id' => 'ST-001', 'name' => 'Juan Dela Cruz', 'year' => '1st Year', 'status' => 'Active', 'avg' => 88],
        ['id' => 'ST-002', 'name' => 'Maria Santos', 'year' => '1st Year', 'status' => 'Active', 'avg' => 92],
        ['id' => 'ST-003', 'name' => 'Pedro Reyes', 'year' => '2nd Year', 'status' => 'Monitoring', 'avg' => 74],
        ['id' => 'ST-014', 'name' => 'Ariana Lim', 'year' => '3rd Year', 'status' => 'At Risk', 'avg' => 68],
    ];

    $teachers = [
        ['name' => 'Jordan Lee', 'dept' => 'Information Systems', 'load' => '6 classes'],
        ['name' => 'Taylor Cruz', 'dept' => 'Computer Science', 'load' => '5 classes'],
        ['name' => 'Rhea Gomez', 'dept' => 'General Education', 'load' => '4 classes'],
    ];

    $roleData = [
        'admin' => [
            'summary' => 'Administrative overview',
            'students' => $students,
            'teachers' => $teachers,
            'alertList' => ['Budget review due on Friday', 'Two student records need follow-up'],
            'gradeFeed' => [
                ['subject' => 'Web Systems', 'student' => 'Maria Santos', 'grade' => 'A', 'date' => 'Today'],
                ['subject' => 'Database Mgmt', 'student' => 'Juan Dela Cruz', 'grade' => 'A-', 'date' => 'Today'],
            ],
        ],
        'teacher' => [
            'summary' => 'Class monitoring',
            'students' => array_slice($students, 0, 3),
            'teachers' => array_slice($teachers, 0, 2),
            'alertList' => ['Three students require tutoring', 'One assignment is still pending'],
            'gradeFeed' => [
                ['subject' => 'Web Systems', 'student' => 'Maria Santos', 'grade' => '92', 'date' => 'Today'],
                ['subject' => 'Database Mgmt', 'student' => 'Juan Dela Cruz', 'grade' => '88', 'date' => 'Today'],
            ],
        ],
        'student' => [
            'summary' => 'Your academic snapshot',
            'students' => [['id' => 'ST-002', 'name' => 'Maria Santos', 'year' => '1st Year', 'status' => 'Active', 'avg' => 92]],
            'teachers' => [array_slice($teachers, 0, 1)[0]],
            'alertList' => ['One assignment requires review', 'Mentor check-in reminder'],
            'gradeFeed' => [
                ['subject' => 'Web Systems', 'student' => 'Maria Santos', 'grade' => 'A', 'date' => 'Today'],
                ['subject' => 'Database Mgmt', 'student' => 'Maria Santos', 'grade' => 'A-', 'date' => 'Today'],
            ],
        ],
    ];

    $payload = $roleData[$role] ?? $roleData['admin'];
    $payload['stats'] = $statsByRole[$role] ?? $statsByRole['admin'];

    jsonResponse(200, $payload);
}

jsonResponse(404, ['error' => 'Endpoint not found.']);
