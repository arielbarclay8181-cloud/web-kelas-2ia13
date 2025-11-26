import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js'
import * as kv from './kv_store.tsx'

const app = new Hono()

app.use('*', cors())
app.use('*', logger(console.log))

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const bucketName = 'make-d50695a3-materials'

// Initialize storage bucket
async function initializeBucket() {
  const { data: buckets } = await supabase.storage.listBuckets()
  const bucketExists = buckets?.some(bucket => bucket.name === bucketName)
  if (!bucketExists) {
    await supabase.storage.createBucket(bucketName, { public: false })
    console.log(`Created bucket: ${bucketName}`)
  }
}

initializeBucket().catch(console.error)

// Schedule endpoints
app.get('/make-server-d50695a3/schedules', async (c) => {
  try {
    const schedules = await kv.get('schedules') || []
    return c.json({ schedules })
  } catch (error) {
    console.log(`Error fetching schedules: ${error}`)
    return c.json({ error: 'Failed to fetch schedules' }, 500)
  }
})

app.post('/make-server-d50695a3/schedules', async (c) => {
  try {
    const schedule = await c.req.json()
    const schedules = await kv.get('schedules') || []
    const newSchedule = { ...schedule, id: Date.now().toString() }
    schedules.push(newSchedule)
    await kv.set('schedules', schedules)
    return c.json({ schedule: newSchedule })
  } catch (error) {
    console.log(`Error creating schedule: ${error}`)
    return c.json({ error: 'Failed to create schedule' }, 500)
  }
})

app.put('/make-server-d50695a3/schedules/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const updates = await c.req.json()
    const schedules = await kv.get('schedules') || []
    const index = schedules.findIndex((s: any) => s.id === id)
    if (index === -1) {
      return c.json({ error: 'Schedule not found' }, 404)
    }
    
    const oldSchedule = schedules[index]
    schedules[index] = { ...schedules[index], ...updates }
    await kv.set('schedules', schedules)
    
    // Auto-create activity announcement if method changed
    if (updates.method && oldSchedule.method !== updates.method) {
      const announcements = await kv.get('announcements') || []
      const activityAnnouncement = {
        id: `activity_${Date.now()}`,
        message: `📢 ${oldSchedule.subject} minggu ini ${updates.method}`,
        date: new Date().toISOString(),
        type: 'activity'
      }
      announcements.unshift(activityAnnouncement)
      await kv.set('announcements', announcements)
    }
    
    return c.json({ schedule: schedules[index] })
  } catch (error) {
    console.log(`Error updating schedule: ${error}`)
    return c.json({ error: 'Failed to update schedule' }, 500)
  }
})

app.delete('/make-server-d50695a3/schedules/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const schedules = await kv.get('schedules') || []
    const filtered = schedules.filter((s: any) => s.id !== id)
    await kv.set('schedules', filtered)
    return c.json({ success: true })
  } catch (error) {
    console.log(`Error deleting schedule: ${error}`)
    return c.json({ error: 'Failed to delete schedule' }, 500)
  }
})

// Announcements endpoints
app.get('/make-server-d50695a3/announcements', async (c) => {
  try {
    const announcements = await kv.get('announcements') || []
    return c.json({ announcements })
  } catch (error) {
    console.log(`Error fetching announcements: ${error}`)
    return c.json({ error: 'Failed to fetch announcements' }, 500)
  }
})

app.post('/make-server-d50695a3/announcements', async (c) => {
  try {
    const announcement = await c.req.json()
    const announcements = await kv.get('announcements') || []
    const newAnnouncement = { 
      ...announcement, 
      id: Date.now().toString(),
      date: new Date().toISOString()
    }
    announcements.unshift(newAnnouncement)
    await kv.set('announcements', announcements)
    return c.json({ announcement: newAnnouncement })
  } catch (error) {
    console.log(`Error creating announcement: ${error}`)
    return c.json({ error: 'Failed to create announcement' }, 500)
  }
})

app.delete('/make-server-d50695a3/announcements/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const announcements = await kv.get('announcements') || []
    const filtered = announcements.filter((a: any) => a.id !== id)
    await kv.set('announcements', filtered)
    return c.json({ success: true })
  } catch (error) {
    console.log(`Error deleting announcement: ${error}`)
    return c.json({ error: 'Failed to delete announcement' }, 500)
  }
})

// Semesters endpoints
app.get('/make-server-d50695a3/semesters', async (c) => {
  try {
    const semesters = await kv.get('semesters') || []
    return c.json({ semesters })
  } catch (error) {
    console.log(`Error fetching semesters: ${error}`)
    return c.json({ error: 'Failed to fetch semesters' }, 500)
  }
})

app.post('/make-server-d50695a3/semesters', async (c) => {
  try {
    const semester = await c.req.json()
    const semesters = await kv.get('semesters') || []
    const newSemester = { 
      ...semester, 
      id: Date.now().toString(),
      courses: []
    }
    semesters.push(newSemester)
    await kv.set('semesters', semesters)
    return c.json({ semester: newSemester })
  } catch (error) {
    console.log(`Error creating semester: ${error}`)
    return c.json({ error: 'Failed to create semester' }, 500)
  }
})

app.post('/make-server-d50695a3/semesters/:semesterId/courses', async (c) => {
  try {
    const semesterId = c.req.param('semesterId')
    const course = await c.req.json()
    const semesters = await kv.get('semesters') || []
    const semesterIndex = semesters.findIndex((s: any) => s.id === semesterId)
    if (semesterIndex === -1) {
      return c.json({ error: 'Semester not found' }, 404)
    }
    const newCourse = { 
      ...course, 
      id: Date.now().toString(),
      files: []
    }
    semesters[semesterIndex].courses.push(newCourse)
    await kv.set('semesters', semesters)
    return c.json({ course: newCourse })
  } catch (error) {
    console.log(`Error creating course: ${error}`)
    return c.json({ error: 'Failed to create course' }, 500)
  }
})

// File upload endpoint
app.post('/make-server-d50695a3/semesters/:semesterId/courses/:courseId/files', async (c) => {
  try {
    const semesterId = c.req.param('semesterId')
    const courseId = c.req.param('courseId')
    const formData = await c.req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400)
    }

    const fileName = `${semesterId}/${courseId}/${Date.now()}_${file.name}`
    const fileBuffer = await file.arrayBuffer()
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.log(`Error uploading file: ${uploadError}`)
      return c.json({ error: 'Failed to upload file' }, 500)
    }

    const { data: signedUrlData } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 60 * 60 * 24 * 365) // 1 year

    const semesters = await kv.get('semesters') || []
    const semesterIndex = semesters.findIndex((s: any) => s.id === semesterId)
    if (semesterIndex === -1) {
      return c.json({ error: 'Semester not found' }, 404)
    }
    
    const courseIndex = semesters[semesterIndex].courses.findIndex((c: any) => c.id === courseId)
    if (courseIndex === -1) {
      return c.json({ error: 'Course not found' }, 404)
    }

    const newFile = {
      id: Date.now().toString(),
      name: file.name,
      type: file.type,
      path: fileName,
      uploadedAt: new Date().toISOString()
    }

    semesters[semesterIndex].courses[courseIndex].files.push(newFile)
    await kv.set('semesters', semesters)

    return c.json({ file: newFile })
  } catch (error) {
    console.log(`Error uploading file: ${error}`)
    return c.json({ error: 'Failed to upload file' }, 500)
  }
})

// Get signed URL for file download
app.get('/make-server-d50695a3/files/:path', async (c) => {
  try {
    const path = c.req.param('path')
    const { data: signedUrlData, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(decodeURIComponent(path), 60 * 60) // 1 hour

    if (error) {
      console.log(`Error creating signed URL: ${error}`)
      return c.json({ error: 'Failed to create download URL' }, 500)
    }

    return c.json({ url: signedUrlData.signedUrl })
  } catch (error) {
    console.log(`Error getting file URL: ${error}`)
    return c.json({ error: 'Failed to get file URL' }, 500)
  }
})

// Delete file endpoint
app.delete('/make-server-d50695a3/semesters/:semesterId/courses/:courseId/files/:fileId', async (c) => {
  try {
    const semesterId = c.req.param('semesterId')
    const courseId = c.req.param('courseId')
    const fileId = c.req.param('fileId')

    const semesters = await kv.get('semesters') || []
    const semesterIndex = semesters.findIndex((s: any) => s.id === semesterId)
    if (semesterIndex === -1) {
      return c.json({ error: 'Semester not found' }, 404)
    }
    
    const courseIndex = semesters[semesterIndex].courses.findIndex((c: any) => c.id === courseId)
    if (courseIndex === -1) {
      return c.json({ error: 'Course not found' }, 404)
    }

    const fileIndex = semesters[semesterIndex].courses[courseIndex].files.findIndex((f: any) => f.id === fileId)
    if (fileIndex === -1) {
      return c.json({ error: 'File not found' }, 404)
    }

    const file = semesters[semesterIndex].courses[courseIndex].files[fileIndex]
    
    // Delete from storage
    await supabase.storage.from(bucketName).remove([file.path])

    // Remove from data
    semesters[semesterIndex].courses[courseIndex].files.splice(fileIndex, 1)
    await kv.set('semesters', semesters)

    return c.json({ success: true })
  } catch (error) {
    console.log(`Error deleting file: ${error}`)
    return c.json({ error: 'Failed to delete file' }, 500)
  }
})

// Assignments endpoints
app.get('/make-server-d50695a3/assignments', async (c) => {
  try {
    const assignments = await kv.get('assignments') || []
    return c.json({ assignments })
  } catch (error) {
    console.log(`Error fetching assignments: ${error}`)
    return c.json({ error: 'Failed to fetch assignments' }, 500)
  }
})

app.post('/make-server-d50695a3/assignments', async (c) => {
  try {
    const assignment = await c.req.json()
    const assignments = await kv.get('assignments') || []
    const newAssignment = { 
      ...assignment, 
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    assignments.push(newAssignment)
    await kv.set('assignments', assignments)
    
    // Auto-create activity announcement
    const announcements = await kv.get('announcements') || []
    const activityAnnouncement = {
      id: `activity_${Date.now()}`,
      message: `🎯 Tugas Baru: ${assignment.subject}`,
      date: new Date().toISOString(),
      type: 'activity'
    }
    announcements.unshift(activityAnnouncement)
    await kv.set('announcements', announcements)
    
    return c.json({ assignment: newAssignment })
  } catch (error) {
    console.log(`Error creating assignment: ${error}`)
    return c.json({ error: 'Failed to create assignment' }, 500)
  }
})

app.put('/make-server-d50695a3/assignments/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const updates = await c.req.json()
    const assignments = await kv.get('assignments') || []
    const index = assignments.findIndex((a: any) => a.id === id)
    if (index === -1) {
      return c.json({ error: 'Assignment not found' }, 404)
    }
    assignments[index] = { ...assignments[index], ...updates }
    await kv.set('assignments', assignments)
    return c.json({ assignment: assignments[index] })
  } catch (error) {
    console.log(`Error updating assignment: ${error}`)
    return c.json({ error: 'Failed to update assignment' }, 500)
  }
})

app.delete('/make-server-d50695a3/assignments/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const assignments = await kv.get('assignments') || []
    const filtered = assignments.filter((a: any) => a.id !== id)
    await kv.set('assignments', filtered)
    return c.json({ success: true })
  } catch (error) {
    console.log(`Error deleting assignment: ${error}`)
    return c.json({ error: 'Failed to delete assignment' }, 500)
  }
})

// Admin authentication endpoints
app.post('/make-server-d50695a3/admin/login', async (c) => {
  try {
    const { username, password } = await c.req.json()
    
    // Get admin credentials from KV store or use default
    let adminCreds = await kv.get('admin_credentials')
    if (!adminCreds) {
      adminCreds = { username: 'sayaadmin', password: '2IA13' }
      await kv.set('admin_credentials', adminCreds)
    }
    
    if (username === adminCreds.username && password === adminCreds.password) {
      const token = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      await kv.set(`session_${token}`, { username, loginAt: new Date().toISOString() })
      return c.json({ success: true, token, username })
    }
    
    return c.json({ success: false, error: 'Invalid credentials' }, 401)
  } catch (error) {
    console.log(`Error during admin login: ${error}`)
    return c.json({ error: 'Failed to login' }, 500)
  }
})

app.post('/make-server-d50695a3/admin/verify', async (c) => {
  try {
    const { token } = await c.req.json()
    const session = await kv.get(`session_${token}`)
    
    if (session) {
      return c.json({ valid: true, username: session.username })
    }
    
    return c.json({ valid: false }, 401)
  } catch (error) {
    console.log(`Error verifying admin token: ${error}`)
    return c.json({ error: 'Failed to verify token' }, 500)
  }
})

app.post('/make-server-d50695a3/admin/logout', async (c) => {
  try {
    const { token } = await c.req.json()
    await kv.del(`session_${token}`)
    return c.json({ success: true })
  } catch (error) {
    console.log(`Error during admin logout: ${error}`)
    return c.json({ error: 'Failed to logout' }, 500)
  }
})

// Students endpoints
app.get('/make-server-d50695a3/students', async (c) => {
  try {
    const students = await kv.get('students') || []
    return c.json({ students })
  } catch (error) {
    console.log(`Error fetching students: ${error}`)
    return c.json({ error: 'Failed to fetch students' }, 500)
  }
})

app.post('/make-server-d50695a3/students', async (c) => {
  try {
    const student = await c.req.json()
    const students = await kv.get('students') || []
    const newStudent = { 
      ...student, 
      id: Date.now().toString()
    }
    students.push(newStudent)
    await kv.set('students', students)
    return c.json({ student: newStudent })
  } catch (error) {
    console.log(`Error creating student: ${error}`)
    return c.json({ error: 'Failed to create student' }, 500)
  }
})

app.put('/make-server-d50695a3/students/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const updates = await c.req.json()
    const students = await kv.get('students') || []
    const index = students.findIndex((s: any) => s.id === id)
    if (index === -1) {
      return c.json({ error: 'Student not found' }, 404)
    }
    students[index] = { ...students[index], ...updates }
    await kv.set('students', students)
    return c.json({ student: students[index] })
  } catch (error) {
    console.log(`Error updating student: ${error}`)
    return c.json({ error: 'Failed to update student' }, 500)
  }
})

app.delete('/make-server-d50695a3/students/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const students = await kv.get('students') || []
    const filtered = students.filter((s: any) => s.id !== id)
    await kv.set('students', filtered)
    return c.json({ success: true })
  } catch (error) {
    console.log(`Error deleting student: ${error}`)
    return c.json({ error: 'Failed to delete student' }, 500)
  }
})

// Groups endpoints
app.get('/make-server-d50695a3/groups', async (c) => {
  try {
    const groups = await kv.get('groups') || []
    return c.json({ groups })
  } catch (error) {
    console.log(`Error fetching groups: ${error}`)
    return c.json({ error: 'Failed to fetch groups' }, 500)
  }
})

app.post('/make-server-d50695a3/groups', async (c) => {
  try {
    const group = await c.req.json()
    const groups = await kv.get('groups') || []
    const newGroup = { 
      ...group, 
      id: Date.now().toString(),
      teams: []
    }
    groups.push(newGroup)
    await kv.set('groups', groups)
    return c.json({ group: newGroup })
  } catch (error) {
    console.log(`Error creating group: ${error}`)
    return c.json({ error: 'Failed to create group' }, 500)
  }
})

app.post('/make-server-d50695a3/groups/:groupId/teams', async (c) => {
  try {
    const groupId = c.req.param('groupId')
    const team = await c.req.json()
    const groups = await kv.get('groups') || []
    const groupIndex = groups.findIndex((g: any) => g.id === groupId)
    if (groupIndex === -1) {
      return c.json({ error: 'Group not found' }, 404)
    }
    const newTeam = { 
      ...team, 
      id: Date.now().toString(),
      members: []
    }
    groups[groupIndex].teams.push(newTeam)
    await kv.set('groups', groups)
    return c.json({ team: newTeam })
  } catch (error) {
    console.log(`Error creating team: ${error}`)
    return c.json({ error: 'Failed to create team' }, 500)
  }
})

app.post('/make-server-d50695a3/groups/:groupId/teams/:teamId/members', async (c) => {
  try {
    const groupId = c.req.param('groupId')
    const teamId = c.req.param('teamId')
    const member = await c.req.json()
    const groups = await kv.get('groups') || []
    const groupIndex = groups.findIndex((g: any) => g.id === groupId)
    if (groupIndex === -1) {
      return c.json({ error: 'Group not found' }, 404)
    }
    const teamIndex = groups[groupIndex].teams.findIndex((t: any) => t.id === teamId)
    if (teamIndex === -1) {
      return c.json({ error: 'Team not found' }, 404)
    }
    const newMember = { 
      ...member, 
      id: Date.now().toString()
    }
    groups[groupIndex].teams[teamIndex].members.push(newMember)
    await kv.set('groups', groups)
    return c.json({ member: newMember })
  } catch (error) {
    console.log(`Error adding member: ${error}`)
    return c.json({ error: 'Failed to add member' }, 500)
  }
})

app.delete('/make-server-d50695a3/groups/:groupId', async (c) => {
  try {
    const groupId = c.req.param('groupId')
    const groups = await kv.get('groups') || []
    const filtered = groups.filter((g: any) => g.id !== groupId)
    await kv.set('groups', filtered)
    return c.json({ success: true })
  } catch (error) {
    console.log(`Error deleting group: ${error}`)
    return c.json({ error: 'Failed to delete group' }, 500)
  }
})

app.delete('/make-server-d50695a3/groups/:groupId/teams/:teamId', async (c) => {
  try {
    const groupId = c.req.param('groupId')
    const teamId = c.req.param('teamId')
    const groups = await kv.get('groups') || []
    const groupIndex = groups.findIndex((g: any) => g.id === groupId)
    if (groupIndex === -1) {
      return c.json({ error: 'Group not found' }, 404)
    }
    groups[groupIndex].teams = groups[groupIndex].teams.filter((t: any) => t.id !== teamId)
    await kv.set('groups', groups)
    return c.json({ success: true })
  } catch (error) {
    console.log(`Error deleting team: ${error}`)
    return c.json({ error: 'Failed to delete team' }, 500)
  }
})

app.delete('/make-server-d50695a3/groups/:groupId/teams/:teamId/members/:memberId', async (c) => {
  try {
    const groupId = c.req.param('groupId')
    const teamId = c.req.param('teamId')
    const memberId = c.req.param('memberId')
    const groups = await kv.get('groups') || []
    const groupIndex = groups.findIndex((g: any) => g.id === groupId)
    if (groupIndex === -1) {
      return c.json({ error: 'Group not found' }, 404)
    }
    const teamIndex = groups[groupIndex].teams.findIndex((t: any) => t.id === teamId)
    if (teamIndex === -1) {
      return c.json({ error: 'Team not found' }, 404)
    }
    groups[groupIndex].teams[teamIndex].members = groups[groupIndex].teams[teamIndex].members.filter((m: any) => m.id !== memberId)
    await kv.set('groups', groups)
    return c.json({ success: true })
  } catch (error) {
    console.log(`Error deleting member: ${error}`)
    return c.json({ error: 'Failed to delete member' }, 500)
  }
})

// Exam schedules endpoints
app.get('/make-server-d50695a3/exams', async (c) => {
  try {
    const exams = await kv.get('exams') || []
    return c.json({ exams })
  } catch (error) {
    console.log(`Error fetching exams: ${error}`)
    return c.json({ error: 'Failed to fetch exams' }, 500)
  }
})

app.post('/make-server-d50695a3/exams', async (c) => {
  try {
    const exam = await c.req.json()
    const exams = await kv.get('exams') || []
    const newExam = { 
      ...exam, 
      id: Date.now().toString()
    }
    exams.push(newExam)
    await kv.set('exams', exams)
    return c.json({ exam: newExam })
  } catch (error) {
    console.log(`Error creating exam: ${error}`)
    return c.json({ error: 'Failed to create exam' }, 500)
  }
})

app.put('/make-server-d50695a3/exams/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const updates = await c.req.json()
    const exams = await kv.get('exams') || []
    const index = exams.findIndex((e: any) => e.id === id)
    if (index === -1) {
      return c.json({ error: 'Exam not found' }, 404)
    }
    exams[index] = { ...exams[index], ...updates }
    await kv.set('exams', exams)
    return c.json({ exam: exams[index] })
  } catch (error) {
    console.log(`Error updating exam: ${error}`)
    return c.json({ error: 'Failed to update exam' }, 500)
  }
})

app.delete('/make-server-d50695a3/exams/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const exams = await kv.get('exams') || []
    const filtered = exams.filter((e: any) => e.id !== id)
    await kv.set('exams', filtered)
    return c.json({ success: true })
  } catch (error) {
    console.log(`Error deleting exam: ${error}`)
    return c.json({ error: 'Failed to delete exam' }, 500)
  }
})

// Moments endpoints (all users can CRUD)
app.get('/make-server-d50695a3/moments', async (c) => {
  try {
    const moments = await kv.get('moments') || []
    return c.json({ moments })
  } catch (error) {
    console.log(`Error fetching moments: ${error}`)
    return c.json({ error: 'Failed to fetch moments' }, 500)
  }
})

app.post('/make-server-d50695a3/moments', async (c) => {
  try {
    const formData = await c.req.formData()
    const text = formData.get('text') as string
    const author = formData.get('author') as string
    const file = formData.get('image') as File | null
    
    let imagePath = null
    if (file) {
      const fileName = `moments/${Date.now()}_${file.name}`
      const fileBuffer = await file.arrayBuffer()
      
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, fileBuffer, {
          contentType: file.type,
          upsert: false
        })

      if (!uploadError) {
        imagePath = fileName
      }
    }

    const moments = await kv.get('moments') || []
    const newMoment = {
      id: Date.now().toString(),
      text: text || '',
      author: author || 'Anonymous',
      imagePath,
      createdAt: new Date().toISOString()
    }
    moments.unshift(newMoment)
    await kv.set('moments', moments)
    
    return c.json({ moment: newMoment })
  } catch (error) {
    console.log(`Error creating moment: ${error}`)
    return c.json({ error: 'Failed to create moment' }, 500)
  }
})

app.delete('/make-server-d50695a3/moments/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const moments = await kv.get('moments') || []
    const moment = moments.find((m: any) => m.id === id)
    
    if (moment && moment.imagePath) {
      await supabase.storage.from(bucketName).remove([moment.imagePath])
    }
    
    const filtered = moments.filter((m: any) => m.id !== id)
    await kv.set('moments', filtered)
    return c.json({ success: true })
  } catch (error) {
    console.log(`Error deleting moment: ${error}`)
    return c.json({ error: 'Failed to delete moment' }, 500)
  }
})

Deno.serve(app.fetch)