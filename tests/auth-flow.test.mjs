import test from 'node:test'
import assert from 'node:assert/strict'

const baseUrl = process.env.TEST_BASE_URL ?? 'http://localhost:3000'

test('landing auth links point to working auth pages', async () => {
  const landing = await fetch(baseUrl)
  assert.equal(landing.status, 200)
  const html = await landing.text()
  assert.match(html, /href="\/sign-in"[^>]*>Log in/)
  assert.match(html, /href="\/sign-up"[^>]*>Get started/)

  const [signIn, signUp] = await Promise.all([fetch(`${baseUrl}/sign-in`), fetch(`${baseUrl}/sign-up`)])
  assert.equal(signIn.status, 200)
  assert.equal(signUp.status, 200)
  assert.match(await signIn.text(), /Welcome back\./)
  assert.match(await signUp.text(), /Start your report\./)
})

test('new account creation returns a session', async () => {
  const email = `functional-${Date.now()}@example.com`
  const response = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: baseUrl },
    body: JSON.stringify({ name: 'Functional Test User', email, password: 'FunctionalTestPassword123!' }),
  })
  const body = await response.text()
  assert.equal(response.status, 200, body)
  assert.match(response.headers.get('set-cookie') ?? '', /better-auth|session/i)
  assert.match(body, /user|token/i)
})
