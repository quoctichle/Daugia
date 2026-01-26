export default defineEventHandler(() => {
  console.log('API called')
  return { status: 'ok' }
})