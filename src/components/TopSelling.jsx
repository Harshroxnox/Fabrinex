import React from 'react'
import Showcase from './showcase/showcase'
import { features } from './features/topselling'


function TopSelling() {
  return (
    <div>
      <Showcase features={features} title={"TOP SELLING"} toshow={true} />
    </div>
  )
}

export default TopSelling