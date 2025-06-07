export async function GET() {
  return Response.json({
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET?.slice(0,8) + '…',
    NODE_ENV: process.env.NODE_ENV,
  })
}