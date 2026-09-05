<script setup>
import { computed, ref } from 'vue'
import { login, getDashboardData } from './api'

const username = ref('admin')
const password = ref('admin123')
const error = ref('')
const loading = ref(false)
const session = ref(null)
const dashboard = ref(null)

const stats = computed(() => dashboard.value?.stats ?? [])
const students = computed(() => dashboard.value?.students ?? [])
const teachers = computed(() => dashboard.value?.teachers ?? [])
const recentGrades = computed(() => dashboard.value?.gradeFeed ?? [])
const alerts = computed(() => dashboard.value?.alertList ?? [])
const attendance = computed(() => {
  const items = students.value
  if (!items.length) return 0
  const total = items.reduce((sum, student) => sum + Number(student.avg || 0), 0)
  return Math.round(total / items.length)
})

async function handleLogin() {
  loading.value = true
  error.value = ''

  try {
    const result = await login(username.value, password.value)
    session.value = result.user
    dashboard.value = await getDashboardData(result.user)
  } catch (err) {
    error.value = err.message || 'Login failed.'
    dashboard.value = null
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page-wrap">
    <div v-if="!session" class="login-panel">
      <div class="login-card">
        <p class="eyebrow">Secure access</p>
        <h1>Student monitoring system</h1>
        <p class="login-copy">Use your role-based credentials to access the dashboard.</p>

        <label>
          <span>Username</span>
          <input v-model="username" type="text" placeholder="admin or teacher or ST-002" />
        </label>

        <label>
          <span>Password</span>
          <input v-model="password" type="password" placeholder="Password" />
        </label>

        <button class="primary-btn" :disabled="loading" @click="handleLogin">
          {{ loading ? 'Signing in...' : 'Sign in' }}
        </button>

        <p v-if="error" class="error-message">{{ error }}</p>

        <div class="demo-box">
          <strong>Demo accounts</strong>
          <small>admin / admin123</small>
          <small>teacher / teacher123</small>
          <small>ST-002 / student123</small>
        </div>
      </div>
    </div>

    <div v-else class="app-shell">
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-mark">SM</div>
          <div>
            <strong>Student</strong>
            <span>Monitoring</span>
          </div>
        </div>

        <nav class="nav">
          <button class="nav-item active">Overview</button>
          <button class="nav-item">Students</button>
          <button class="nav-item">Teachers</button>
          <button class="nav-item">Grades</button>
          <button class="nav-item">Reports</button>
        </nav>

        <div class="sidebar-card">
          <p class="label">System security</p>
          <strong>Protected</strong>
          <span>Role-based access enabled</span>
        </div>
      </aside>

      <main class="main-panel">
        <header class="topbar">
          <div>
            <p class="eyebrow">{{ dashboard?.summary }}</p>
            <h1>Academic overview</h1>
          </div>

          <div class="topbar-actions">
            <button class="ghost-btn">Export</button>
            <button class="primary-btn">Add student</button>
          </div>
        </header>

        <section class="stats-grid">
          <article v-for="stat in stats" :key="stat.label" class="stat-card">
            <p>{{ stat.label }}</p>
            <strong>{{ stat.value }}</strong>
          </article>
        </section>

        <section class="content-grid">
          <article class="panel students-panel">
            <div class="panel-header">
              <div>
                <p class="eyebrow">Students</p>
                <h2>Recent records</h2>
              </div>
              <button class="chip-btn">View all</button>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>ID</th>
                  <th>Year</th>
                  <th>Status</th>
                  <th>Avg</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="student in students" :key="student.id">
                  <td>{{ student.name }}</td>
                  <td>{{ student.id }}</td>
                  <td>{{ student.year }}</td>
                  <td>
                    <span class="status" :class="student.status.toLowerCase().replace(/\s+/g, '-')">
                      {{ student.status }}
                    </span>
                  </td>
                  <td>{{ student.avg }}%</td>
                </tr>
              </tbody>
            </table>
          </article>

          <article class="panel side-panel">
            <div class="panel-header">
              <div>
                <p class="eyebrow">Faculty</p>
                <h2>Teacher load</h2>
              </div>
            </div>

            <ul class="teacher-list">
              <li v-for="teacher in teachers" :key="teacher.name">
                <div>
                  <strong>{{ teacher.name }}</strong>
                  <span>{{ teacher.dept }}</span>
                </div>
                <em>{{ teacher.load }}</em>
              </li>
            </ul>
          </article>
        </section>

        <section class="bottom-grid">
          <article class="panel">
            <div class="panel-header">
              <div>
                <p class="eyebrow">Performance</p>
                <h2>Grade snapshot</h2>
              </div>
            </div>

            <div class="grade-list">
              <div v-for="item in recentGrades" :key="`${item.subject}-${item.student}`" class="grade-row">
                <div>
                  <strong>{{ item.subject }}</strong>
                  <span>{{ item.student }}</span>
                </div>
                <div class="grade-meta">
                  <span class="grade-badge">{{ item.grade }}</span>
                  <small>{{ item.date }}</small>
                </div>
              </div>
            </div>
          </article>

          <article class="panel summary-panel">
            <p class="eyebrow">Attendance trend</p>
            <h2>{{ attendance }}%</h2>
            <p class="muted">Average student engagement this week.</p>

            <ul class="alert-list">
              <li v-for="alert in alerts" :key="alert">{{ alert }}</li>
            </ul>

            <div class="mini-bars">
              <span style="height: 40%"></span>
              <span style="height: 57%"></span>
              <span style="height: 65%"></span>
              <span style="height: 70%"></span>
              <span style="height: 82%"></span>
              <span style="height: 90%"></span>
            </div>
          </article>
        </section>
      </main>
    </div>
  </div>
</template>
