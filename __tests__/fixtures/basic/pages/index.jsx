import { introData } from './docs/intro.mdx'
import { advancedData } from './docs/advanced.mdx'

export default () => {
  return (
    <>
      <ul>
        <li>{introData.title}</li>
        <li>{advancedData.title}</li>
      </ul>
    </>
  )
}
