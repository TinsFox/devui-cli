import { FC } from 'react'

const container: FC<any> = (prop) => {
  return <div>{prop.children}</div>
}
export default container
