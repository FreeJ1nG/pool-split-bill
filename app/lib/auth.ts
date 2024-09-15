import jwt from 'jsonwebtoken'

export async function issueJwt(email: string): Promise<string> {
  return jwt.sign({ sub: email }, process.env.JWT_SECRET!, {
    expiresIn: '30 days',
  })
}
