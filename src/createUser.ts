import { psuedoRandomText } from './psuedoRandomText'
import { work } from './work'
import { pair as createPair } from './pair'
import { encrypt } from './encrypt'

export async function createUser(chaingun: any, alias: string, password: string) {
  const aliasSoul = `~@${alias}`

  // "pseudo-randomly create a salt, then use PBKDF2 function to extend the password with it."
  const salt = psuedoRandomText(64)
  const proof = await work(password, salt)
  const pair = await createPair()
  const { pub, priv, epub, epriv } = pair
  const pubSoul = `~${pub}`

  // "to keep the private key safe, we AES encrypt it with the proof of work!"
  const ek = await encrypt(epriv, proof, { raw: true })
  const auth = JSON.stringify({ ek, s: salt })
  const data = {
    alias,
    pub,
    epub,
    auth
  }

  // TODO: clean this up
  chaingun.get(pubSoul).put(data)
  chaingun.get(aliasSoul).set({ '#': pubSoul })

  return {
    ...data,
    priv,
    epriv
  }
}
