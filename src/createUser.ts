import { pseudoRandomText } from './pseudoRandomText'
import { work } from './work'
import { pair as createPair } from './pair'
import { encrypt } from './encrypt'
import { signGraph } from './sign'

export async function createUser(chaingun: any, alias: string, password: string) {
  const aliasSoul = `~@${alias}`

  // "pseudo-randomly create a salt, then use PBKDF2 function to extend the password with it."
  const salt = pseudoRandomText(64)
  const proof = await work(password, salt)
  const pair = await createPair()
  const { pub, priv, epub, epriv } = pair
  const pubSoul = `~${pub}`

  // "to keep the private key safe, we AES encrypt it with the proof of work!"
  const ek = await encrypt(JSON.stringify({ priv, epriv }), proof, {
    raw: true
  })
  const auth = JSON.stringify({ ek, s: salt })
  const data = {
    alias,
    epub,
    auth,
    pub
  }

  const now = new Date().getTime()

  const graph = await signGraph(
    {
      [pubSoul]: {
        _: {
          '#': pubSoul,
          '>': Object.keys(data).reduce(
            (state, key) => {
              state[key] = now
              return state
            },
            {} as { [key: string]: number }
          )
        },
        ...data
      }
    },
    { pub, priv }
  )

  await new Promise(ok => chaingun.get(aliasSoul).put(graph, ok))

  return {
    ...data,
    pub,
    priv,
    epriv
  }
}
