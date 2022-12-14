import type Connect from 'connect'
import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler<any>(async (event) => {
  const req = event.req as Connect.IncomingMessage
  const body = req.method === 'POST' ? await readBody(event) : {}

  const data = {
    url: req.url,
    method: req.method,
    body,
  }
  // eslint-disable-next-line no-console
  console.log(data)
  return data
})
