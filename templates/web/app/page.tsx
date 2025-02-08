import React from 'react'
import {client} from '@repo/db/client'
const Main = async () => {
  const user = await client.user.findFirst()
  return (
    <div>
      {user?.username}
      {user?.password}
    </div>
  )
}

export default Main